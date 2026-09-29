'use server';

import { prisma } from '@/lib/prisma';
import { Sport, BetType, BetStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createBet(formData: FormData) {
  // Por ahora usamos un usuario demo o aseguramos que exista en DB
  const demoEmail = 'demo@sportstracker.com';
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'user-demo-123',
        email: demoEmail,
        name: 'Usuario Demo',
      },
    });
  }

  const sport = formData.get('sport') as Sport;
  const league = formData.get('league') as string;
  const event = formData.get('event') as string;
  const selection = formData.get('selection') as string;
  const betType = formData.get('betType') as BetType;
  const odds = parseFloat(formData.get('odds') as string);
  const stake = parseFloat(formData.get('stake') as string);
  const bookmaker = formData.get('bookmaker') as string;
  const notes = formData.get('notes') as string;
  const tipsterName = formData.get('tipsterName') as string;

  let tipsterId: string | undefined = undefined;

  // Si especificó un Tipster, buscarlo o crearlo
  if (tipsterName && tipsterName.trim() !== '') {
    const cleanName = tipsterName.trim();
    let tipster = await prisma.tipster.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: cleanName,
        },
      },
    });

    if (!tipster) {
      tipster = await prisma.tipster.create({
        data: {
          userId: user.id,
          name: cleanName,
        },
      });
    }
    tipsterId = tipster.id;
  }

  await prisma.bet.create({
    data: {
      userId: user.id,
      sport,
      league: league || null,
      event,
      selection,
      betType,
      odds, // Momio Americano (ej: -110, +150)
      stake,
      bookmaker: bookmaker || null,
      notes: notes || null,
      tipsterId: tipsterId || null,
      status: BetStatus.PENDING,
    },
  });

  revalidatePath('/');
  redirect('/');
}

export async function settleBet(betId: string, status: BetStatus) {
  await prisma.bet.update({
    where: { id: betId },
    data: {
      status,
      settledAt: new Date(),
    },
  });

  revalidatePath('/');
}

// En src/app/actions/bets.ts

export async function deleteBet(betId: string) {
  await prisma.bet.delete({
    where: { id: betId },
  });

  revalidatePath('/');
  revalidatePath('/bets');
}

export async function updateBet(betId: string, formData: FormData) {
  const sport = formData.get('sport') as Sport;
  const league = formData.get('league') as string;
  const event = formData.get('event') as string;
  const selection = formData.get('selection') as string;
  const betType = formData.get('betType') as BetType;
  const odds = parseFloat(formData.get('odds') as string);
  const stake = parseFloat(formData.get('stake') as string);
  const bookmaker = formData.get('bookmaker') as string;
  const notes = formData.get('notes') as string;

  await prisma.bet.update({
    where: { id: betId },
    data: {
      sport,
      league: league || null,
      event,
      selection,
      betType,
      odds,
      stake,
      bookmaker: bookmaker || null,
      notes: notes || null,
    },
  });

  revalidatePath('/');
  revalidatePath('/bets');
  redirect('/bets');
}