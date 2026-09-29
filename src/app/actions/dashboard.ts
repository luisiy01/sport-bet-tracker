'use server';

import { prisma } from '@/lib/prisma';
import { calculateProfit } from '@/lib/utils/odds';

export async function getDashboardStats(userId: string) {
  const bets = await prisma.bet.findMany({
    where: { userId },
    orderBy: { placedAt: 'desc' },
  });

  const totalBets = bets.length;
  const wonBets = bets.filter((b) => b.status === 'WON');
  const lostBets = bets.filter((b) => b.status === 'LOST');
  const pendingBets = bets.filter((b) => b.status === 'PENDING');

  // Unidades / Monto apostado total (solo apuestas resueltas)
  const totalStaked = bets
    .filter((b) => b.status === 'WON' || b.status === 'LOST')
    .reduce((acc, b) => acc + Number(b.stake), 0);

  // Calculamos Profit / Loss total
  let netProfit = 0;

  bets.forEach((bet) => {
    const stake = Number(bet.stake);
    const odds = Number(bet.odds);

    if (bet.status === 'WON') {
      netProfit += calculateProfit(odds, stake);
    } else if (bet.status === 'LOST') {
      netProfit -= stake;
    }
  });

  // Win Rate %
  const settledCount = wonBets.length + lostBets.length;
  const winRate = settledCount > 0 ? (wonBets.length / settledCount) * 100 : 0;

  // ROI %
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;

  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: 'demo@sportstracker.com',
        name: 'Usuario Demo',
        initialBankroll: 100,
      },
    });
  }

  console.log(user)

  return {
    initialBankroll: Number(user.initialBankroll),
    totalBets,
    pendingBets: pendingBets.length,
    wonBets: wonBets.length,
    lostBets: lostBets.length,
    totalStaked,
    netProfit,
    winRate,
    roi,
    recentBets: bets.slice(0, 5),
  };
}