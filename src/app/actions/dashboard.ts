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

export interface BetTypePerformance {
  betType: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalStaked: number;
  netProfit: number;
  winRate: number;
  roi: number;
}

export interface OddsRangePerformance {
  rangeLabel: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalStaked: number;
  netProfit: number;
  winRate: number;
  roi: number;
}

export interface StreaksInfo {
  currentStreak: { type: "WON" | "LOST" | "NONE"; count: number };
  maxWinningStreak: number;
  maxLosingStreak: number;
}

export interface StakePerformance {
  label: string; // ej. "1 - 50", "51 - 100", "101 - 250", "251+"
  totalBets: number;
  wonBets: number;
  lostBets: number;
  netProfit: number;
  roi: number;
  winRate: number;
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

  const betTypeMap = new Map<
    string,
    {
      wonBets: number;
      lostBets: number;
      totalStaked: number;
      netProfit: number;
      totalBets: number;
    }
  >();

  bets.forEach((bet) => {
    const typeKey = bet.betType;

    if (!betTypeMap.has(typeKey)) {
      betTypeMap.set(typeKey, {
        wonBets: 0,
        lostBets: 0,
        totalStaked: 0,
        netProfit: 0,
        totalBets: 0,
      });
    }

    const typeData = betTypeMap.get(typeKey)!;
    typeData.totalBets += 1;

    if (bet.status === "WON" || bet.status === "LOST") {
      const stake = Number(bet.stake) || 0;
      const odds = Number(bet.odds) || 0;
      const profit =
        bet.status === "WON" ? calculateProfit(odds, stake) : -stake;

      typeData.totalStaked += stake;
      typeData.netProfit += profit;

      if (bet.status === "WON") typeData.wonBets += 1;
      if (bet.status === "LOST") typeData.lostBets += 1;
    }
  });

  const betTypePerformanceStats: BetTypePerformance[] = [];

  betTypeMap.forEach((data, betType) => {
    const settledCount = data.wonBets + data.lostBets;
    const winRate = settledCount > 0 ? (data.wonBets / settledCount) * 100 : 0;
    const roi =
      data.totalStaked > 0 ? (data.netProfit / data.totalStaked) * 100 : 0;

    betTypePerformanceStats.push({
      betType,
      totalBets: data.totalBets,
      wonBets: data.wonBets,
      lostBets: data.lostBets,
      totalStaked: Number(data.totalStaked.toFixed(2)),
      netProfit: Number(data.netProfit.toFixed(2)),
      winRate: Number(winRate.toFixed(1)),
      roi: Number(roi.toFixed(1)),
    });
  });

  betTypePerformanceStats.sort((a, b) => b.netProfit - a.netProfit);

  const RANGES = [
    {
      id: "FAV_HIGH",
      label: "Favoritos (-150 o menos)",
      check: (o: number) => o <= -150,
    },
    {
      id: "FAV_MOD",
      label: "Línea / Tablas (-149 a +110)",
      check: (o: number) => o > -150 && o <= 110,
    },
    {
      id: "DOG_MOD",
      label: "Underdogs (+111 a +200)",
      check: (o: number) => o > 110 && o <= 200,
    },
    {
      id: "DOG_HIGH",
      label: "Underdogs Altos (+201+)",
      check: (o: number) => o > 200,
    },
  ];

  const oddsRangeMap = new Map<
    string,
    {
      label: string;
      wonBets: number;
      lostBets: number;
      totalStaked: number;
      netProfit: number;
      totalBets: number;
    }
  >();

  RANGES.forEach((r) => {
    oddsRangeMap.set(r.id, {
      label: r.label,
      wonBets: 0,
      lostBets: 0,
      totalStaked: 0,
      netProfit: 0,
      totalBets: 0,
    });
  });

  bets.forEach((bet) => {
    const odds = Number(bet.odds) || 0;
    const matchedRange = RANGES.find((r) => r.check(odds)) || RANGES[1];

    const rangeData = oddsRangeMap.get(matchedRange.id)!;
    rangeData.totalBets += 1;

    if (bet.status === "WON" || bet.status === "LOST") {
      const stake = Number(bet.stake) || 0;
      const profit =
        bet.status === "WON" ? calculateProfit(odds, stake) : -stake;

      rangeData.totalStaked += stake;
      rangeData.netProfit += profit;

      if (bet.status === "WON") rangeData.wonBets += 1;
      if (bet.status === "LOST") rangeData.lostBets += 1;
    }
  });

  const oddsRangePerformanceStats: OddsRangePerformance[] = [];

  oddsRangeMap.forEach((data) => {
    if (data.totalBets > 0) {
      const settledCount = data.wonBets + data.lostBets;
      const winRate =
        settledCount > 0 ? (data.wonBets / settledCount) * 100 : 0;
      const roi =
        data.totalStaked > 0 ? (data.netProfit / data.totalStaked) * 100 : 0;

      oddsRangePerformanceStats.push({
        rangeLabel: data.label,
        totalBets: data.totalBets,
        wonBets: data.wonBets,
        lostBets: data.lostBets,
        totalStaked: Number(data.totalStaked.toFixed(2)),
        netProfit: Number(data.netProfit.toFixed(2)),
        winRate: Number(winRate.toFixed(1)),
        roi: Number(roi.toFixed(1)),
      });
    }
  });

  // 1. CÁLCULO DE RACHAS (Orden cronológico por settledAt / placedAt)
  const settledBetsChronological = bets
    .filter((b) => b.status === "WON" || b.status === "LOST")
    .sort(
      (a, b) =>
        new Date(a.settledAt || a.placedAt).getTime() -
        new Date(b.settledAt || b.placedAt).getTime(),
    );

  let currentStreakType: "WON" | "LOST" | "NONE" = "NONE";
  let currentStreakCount = 0;
  let maxWinningStreak = 0;
  let maxLosingStreak = 0;

  let tempWinStreak = 0;
  let tempLossStreak = 0;

  settledBetsChronological.forEach((bet) => {
    if (bet.status === "WON") {
      tempWinStreak++;
      tempLossStreak = 0;
      if (tempWinStreak > maxWinningStreak) maxWinningStreak = tempWinStreak;
    } else if (bet.status === "LOST") {
      tempLossStreak++;
      tempWinStreak = 0;
      if (tempLossStreak > maxLosingStreak) maxLosingStreak = tempLossStreak;
    }
  });

  if (settledBetsChronological.length > 0) {
    const lastBet =
      settledBetsChronological[settledBetsChronological.length - 1];
    currentStreakType = lastBet.status as "WON" | "LOST";

    for (let i = settledBetsChronological.length - 1; i >= 0; i--) {
      if (settledBetsChronological[i].status === currentStreakType) {
        currentStreakCount++;
      } else {
        break;
      }
    }
  }

  const streaks: StreaksInfo = {
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    maxWinningStreak,
    maxLosingStreak,
  };

  // 2. RENDIMIENTO POR TAMAÑO DE STAKE
  const STAKE_RANGES = [
    { label: "Bajo ($1 - $50)", check: (s: number) => s <= 50 },
    { label: "Medio ($51 - $150)", check: (s: number) => s > 50 && s <= 150 },
    { label: "Alto ($151 - $300)", check: (s: number) => s > 150 && s <= 300 },
    { label: "Muy Alto ($301+)", check: (s: number) => s > 300 },
  ];

  const stakePerformanceStats: StakePerformance[] = STAKE_RANGES.map(
    (range) => {
      const rangeBets = bets.filter((b) => range.check(Number(b.stake)));
      const won = rangeBets.filter((b) => b.status === "WON");
      const lost = rangeBets.filter((b) => b.status === "LOST");

      let netProfit = 0;
      let totalStaked = 0;

      rangeBets.forEach((bet) => {
        if (bet.status === "WON" || bet.status === "LOST") {
          const stake = Number(bet.stake) || 0;
          const odds = Number(bet.odds) || 0;
          totalStaked += stake;
          netProfit +=
            bet.status === "WON" ? calculateProfit(odds, stake) : -stake;
        }
      });

      const settledCount = won.length + lost.length;
      const winRate = settledCount > 0 ? (won.length / settledCount) * 100 : 0;
      const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;

      return {
        label: range.label,
        totalBets: rangeBets.length,
        wonBets: won.length,
        lostBets: lost.length,
        netProfit: Number(netProfit.toFixed(2)),
        roi: Number(roi.toFixed(1)),
        winRate: Number(winRate.toFixed(1)),
      };
    },
  ).filter((s) => s.totalBets > 0);

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
    betTypePerformanceStats,
    oddsRangePerformanceStats,
    stakePerformanceStats,
    streaks
  };
}
