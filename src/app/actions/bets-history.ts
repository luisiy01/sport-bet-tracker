'use server';

import { prisma } from '@/lib/prisma';
import { Sport, BetStatus } from '@prisma/client';

export interface BetFilters {
  sport?: string;
  status?: string;
  tipsterId?: string;
}

export async function getFilteredBets(userId: string, filters: BetFilters) {
  const whereClause: any = { userId };

  if (filters.sport && filters.sport !== 'ALL') {
    whereClause.sport = filters.sport as Sport;
  }

  if (filters.status && filters.status !== 'ALL') {
    whereClause.status = filters.status as BetStatus;
  }

  if (filters.tipsterId && filters.tipsterId !== 'ALL') {
    if (filters.tipsterId === 'NONE') {
      whereClause.tipsterId = null;
    } else {
      whereClause.tipsterId = filters.tipsterId;
    }
  }

  const bets = await prisma.bet.findMany({
    where: whereClause,
    include: {
      tipster: {
        select: { name: true },
      },
    },
    orderBy: { placedAt: 'desc' },
  });

  // Obtener lista de Tipsters para el selector de filtros
  const tipsters = await prisma.tipster.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return { bets, tipsters };
}