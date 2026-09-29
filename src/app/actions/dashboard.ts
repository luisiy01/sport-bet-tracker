'use server';

import { prisma } from '@/lib/prisma';
import { calculateProfit } from '@/lib/utils/odds';

// En src/app/actions/dashboard.ts
// Añade el cálculo de la historia del Bankroll dentro de getDashboardStats:

export async function getDashboardStats(userId: string) {
  let user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: 'demo@sportstracker.com',
        name: 'Usuario Demo',
        initialBankroll: 1000,
      },
    });
  }

  const bets = await prisma.bet.findMany({
    where: { userId },
    orderBy: { placedAt: 'asc' }, // Orden cronológico para el gráfico
  });

  const initialBankroll = Number(user.initialBankroll ?? 1000) || 1000;

  // Generar puntos del historial de bankroll
  let currentAccumulated = initialBankroll;
  
  const bankrollHistory = [
    {
      date: 'Inicio',
      bankroll: initialBankroll,
      profit: 0,
    },
  ];

  bets.forEach((bet) => {
    if (bet.status === 'WON' || bet.status === 'LOST') {
      const stake = Number(bet.stake) || 0;
      const odds = Number(bet.odds) || 0;

      if (bet.status === 'WON') {
        currentAccumulated += calculateProfit(odds, stake);
      } else if (bet.status === 'LOST') {
        currentAccumulated -= stake;
      }

      const formattedDate = new Date(bet.placedAt).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
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
  const wonBets = bets.filter((b) => b.status === 'WON');
  const lostBets = bets.filter((b) => b.status === 'LOST');
  const pendingBets = bets.filter((b) => b.status === 'PENDING');

  let netProfit = 0;
  bets.forEach((bet) => {
    const stake = Number(bet.stake) || 0;
    const odds = Number(bet.odds) || 0;
    if (bet.status === 'WON') netProfit += calculateProfit(odds, stake);
    else if (bet.status === 'LOST') netProfit -= stake;
  });

  const totalStaked = bets
    .filter((b) => b.status === 'WON' || b.status === 'LOST')
    .reduce((acc, b) => acc + (Number(b.stake) || 0), 0);

  const settledCount = wonBets.length + lostBets.length;
  const winRate = settledCount > 0 ? (wonBets.length / settledCount) * 100 : 0;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;

  // Apuestas recientes (últimas 5 descendentes)
  const recentBets = [...bets].reverse().slice(0, 5);

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
  };
}