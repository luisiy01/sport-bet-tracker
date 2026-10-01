'use server';

import { prisma } from '@/lib/prisma';
import { calculateProfit } from '@/lib/utils/odds';

export interface TipsterStats {
  id: string;
  name: string;
  platform: string | null;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStaked: number;
  netProfit: number;
  winRate: number;
  roi: number;
}

export async function getTipsterAnalytics(userId: string): Promise<TipsterStats[]> {
  const bets = await prisma.bet.findMany({
    where: { userId },
    include: {
      tipster: true,
    },
  });

  const tipstersMap = new Map<string, TipsterStats>();

  // Inicializar entrada para "Análisis Propio" (Apuestas sin tipster asignado)
  const ownBetsKey = 'OWN_ANALYSIS';
  tipstersMap.set(ownBetsKey, {
    id: 'NONE',
    name: 'Análisis Propio (Sin Tipster)',
    platform: null,
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    pendingBets: 0,
    totalStaked: 0,
    netProfit: 0,
    winRate: 0,
    roi: 0,
  });

  bets.forEach((bet) => {
    const key = bet.tipsterId || ownBetsKey;

    if (!tipstersMap.has(key) && bet.tipster) {
      tipstersMap.set(key, {
        id: bet.tipster.id,
        name: bet.tipster.name,
        platform: bet.tipster.platform,
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        pendingBets: 0,
        totalStaked: 0,
        netProfit: 0,
        winRate: 0,
        roi: 0,
      });
    }

    const stats = tipstersMap.get(key)!;
    stats.totalBets += 1;

    if (bet.status === 'PENDING') {
      stats.pendingBets += 1;
    } else if (bet.status === 'WON' || bet.status === 'LOST') {
      const stake = Number(bet.stake) || 0;
      const odds = Number(bet.odds) || 0;

      stats.totalStaked += stake;

      if (bet.status === 'WON') {
        stats.wonBets += 1;
        stats.netProfit += calculateProfit(odds, stake);
      } else if (bet.status === 'LOST') {
        stats.lostBets += 1;
        stats.netProfit -= stake;
      }
    }
  });

  // Calcular WinRate % y ROI % para cada Tipster
  const result: TipsterStats[] = [];

  tipstersMap.forEach((stats) => {
    if (stats.totalBets > 0) {
      const settledCount = stats.wonBets + stats.lostBets;
      stats.winRate = settledCount > 0 ? (stats.wonBets / settledCount) * 100 : 0;
      stats.roi = stats.totalStaked > 0 ? (stats.netProfit / stats.totalStaked) * 100 : 0;
      result.push(stats);
    }
  });

  // Ordenar por defecto por mayor Profit
  return result.sort((a, b) => b.netProfit - a.netProfit);
}