"use server";

import { prisma } from "@/lib/prisma";
import { calculateProfit } from "@/lib/utils/odds";

export interface DailyStat {
  date: string; // Formato 'YYYY-MM-DD'
  displayDate: string; // Formato 'DD Mon'
  startBankroll: number; // Con cuánto empezó el día
  endBankroll: number; // Con cuánto cerró el día
  dailyProfit: number; // Ganancia / Pérdida del día
  betsCount: number;
}

export interface SportPerformance {
  sport: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalStaked: number;
  netProfit: number;
  winRate: number;
  roi: number;
  leagues: Array<{
    name: string;
    netProfit: number;
    totalBets: number;
  }>;
}

// En src/app/actions/dashboard.ts
// Añade el cálculo de la historia del Bankroll dentro de getDashboardStats:

export async function getDashboardStats(userId: string) {
  let user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: "demo@sportstracker.com",
        name: "Usuario Demo",
        initialBankroll: 1000,
      },
    });
  }

  const bets = await prisma.bet.findMany({
    where: { userId },
    orderBy: { placedAt: "asc" }, // Orden cronológico para el gráfico
  });

  const initialBankroll = Number(user.initialBankroll ?? 1000) || 1000;

  // Generar puntos del historial de bankroll
  let currentAccumulated = initialBankroll;

  const bankrollHistory = [
    {
      date: "Inicio",
      bankroll: initialBankroll,
      profit: 0,
    },
  ];

  bets.forEach((bet) => {
    if (bet.status === "WON" || bet.status === "LOST") {
      const stake = Number(bet.stake) || 0;
      const odds = Number(bet.odds) || 0;

      if (bet.status === "WON") {
        currentAccumulated += calculateProfit(odds, stake);
      } else if (bet.status === "LOST") {
        currentAccumulated -= stake;
      }

      const formattedDate = new Date(bet.placedAt).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
      });

      bankrollHistory.push({
        date: formattedDate,
        bankroll: Number(currentAccumulated.toFixed(2)),
        profit: Number((currentAccumulated - initialBankroll).toFixed(2)),
      });
    }
  });

  // Cálculos generales de métricas...
  const totalBets = bets.length;
  const wonBets = bets.filter((b) => b.status === "WON");
  const lostBets = bets.filter((b) => b.status === "LOST");
  const pendingBets = bets.filter((b) => b.status === "PENDING");

  let netProfit = 0;
  bets.forEach((bet) => {
    const stake = Number(bet.stake) || 0;
    const odds = Number(bet.odds) || 0;
    if (bet.status === "WON") netProfit += calculateProfit(odds, stake);
    else if (bet.status === "LOST") netProfit -= stake;
  });

  const totalStaked = bets
    .filter((b) => b.status === "WON" || b.status === "LOST")
    .reduce((acc, b) => acc + (Number(b.stake) || 0), 0);

  const settledCount = wonBets.length + lostBets.length;
  const winRate = settledCount > 0 ? (wonBets.length / settledCount) * 100 : 0;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;

  // Apuestas recientes (últimas 5 descendentes)
  const recentBets = [...bets].reverse().slice(0, 5);

  const dailyMap = new Map<
    string,
    { profit: number; betsCount: number; rawDate: Date }
  >();

  bets.forEach((bet) => {
    if (bet.status === "WON" || bet.status === "LOST") {
      const stake = Number(bet.stake) || 0;
      const odds = Number(bet.odds) || 0;
      const profit =
        bet.status === "WON" ? calculateProfit(odds, stake) : -stake;

      // Usamos la fecha en que se resolvió o colocó la apuesta (YYYY-MM-DD)
      const dateKey = new Date(bet.settledAt || bet.placedAt)
        .toISOString()
        .split("T")[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          profit: 0,
          betsCount: 0,
          rawDate: new Date(bet.settledAt || bet.placedAt),
        });
      }

      const dayData = dailyMap.get(dateKey)!;
      dayData.profit += profit;
      dayData.betsCount += 1;
    }
  });

  // Construir la secuencia cronológica de días con Starting Bankroll
  let runningBankroll = initialBankroll;
  const dailyStats: DailyStat[] = [];

  // Ordenar fechas cronológicamente
  const sortedDates = Array.from(dailyMap.keys()).sort();

  sortedDates.forEach((dateKey) => {
    const dayData = dailyMap.get(dateKey)!;
    const startBank = runningBankroll;
    const dailyProfit = Number(dayData.profit.toFixed(2));
    const endBank = Number((startBank + dailyProfit).toFixed(2));

    runningBankroll = endBank;

    const displayDate = dayData.rawDate.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });

    dailyStats.push({
      date: dateKey,
      displayDate,
      startBankroll: Number(startBank.toFixed(2)),
      endBankroll: endBank,
      dailyProfit,
      betsCount: dayData.betsCount,
    });
  });

  const sportMap = new Map<
    string,
    {
      wonBets: number;
      lostBets: number;
      totalStaked: number;
      netProfit: number;
      totalBets: number;
      leaguesMap: Map<string, { netProfit: number; totalBets: number }>;
    }
  >();

  bets.forEach((bet) => {
    const sportKey = bet.sport;
    const leagueKey = bet.league || "Sin Liga";

    if (!sportMap.has(sportKey)) {
      sportMap.set(sportKey, {
        wonBets: 0,
        lostBets: 0,
        totalStaked: 0,
        netProfit: 0,
        totalBets: 0,
        leaguesMap: new Map(),
      });
    }

    const sportData = sportMap.get(sportKey)!;
    sportData.totalBets += 1;

    if (!sportData.leaguesMap.has(leagueKey)) {
      sportData.leaguesMap.set(leagueKey, { netProfit: 0, totalBets: 0 });
    }
    const leagueData = sportData.leaguesMap.get(leagueKey)!;
    leagueData.totalBets += 1;

    if (bet.status === "WON" || bet.status === "LOST") {
      const stake = Number(bet.stake) || 0;
      const odds = Number(bet.odds) || 0;
      const profit =
        bet.status === "WON" ? calculateProfit(odds, stake) : -stake;

      sportData.totalStaked += stake;
      sportData.netProfit += profit;
      leagueData.netProfit += profit;

      if (bet.status === "WON") sportData.wonBets += 1;
      if (bet.status === "LOST") sportData.lostBets += 1;
    }
  });

  const sportPerformanceStats: SportPerformance[] = [];

  sportMap.forEach((data, sport) => {
    const settledCount = data.wonBets + data.lostBets;
    const winRate = settledCount > 0 ? (data.wonBets / settledCount) * 100 : 0;
    const roi =
      data.totalStaked > 0 ? (data.netProfit / data.totalStaked) * 100 : 0;

    const leagues = Array.from(data.leaguesMap.entries()).map(
      ([name, lData]) => ({
        name,
        netProfit: Number(lData.netProfit.toFixed(2)),
        totalBets: lData.totalBets,
      }),
    );

    sportPerformanceStats.push({
      sport,
      totalBets: data.totalBets,
      wonBets: data.wonBets,
      lostBets: data.lostBets,
      totalStaked: Number(data.totalStaked.toFixed(2)),
      netProfit: Number(data.netProfit.toFixed(2)),
      winRate: Number(winRate.toFixed(1)),
      roi: Number(roi.toFixed(1)),
      leagues,
    });
  });

  // Ordenar por mayor beneficio neto
  sportPerformanceStats.sort((a, b) => b.netProfit - a.netProfit);

  return {
    initialBankroll,
    totalBets,
    pendingBets: pendingBets.length,
    wonBets: wonBets.length,
    lostBets: lostBets.length,
    totalStaked,
    netProfit,
    winRate,
    roi,
    recentBets,
    bankrollHistory,
    dailyStats,
    sportPerformanceStats,
  };
}
