'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateInitialBankroll(userId: string, amount: number) {
  if (amount < 0) return;

  await prisma.user.update({
    where: { id: userId },
    data: { initialBankroll: amount },
  });

  revalidatePath('/');
}