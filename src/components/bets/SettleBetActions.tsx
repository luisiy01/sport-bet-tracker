'use client';

import { settleBet } from '@/app/actions/bets';
import { BetStatus } from '@prisma/client';
import { Check, X, RefreshCw } from 'lucide-react';
import { useTransition } from 'react';

interface SettleBetActionsProps {
  betId: string;
  currentStatus: BetStatus;
}

export function SettleBetActions({ betId, currentStatus }: SettleBetActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (currentStatus !== 'PENDING') {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          currentStatus === 'WON'
            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
            : currentStatus === 'LOST'
            ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
        }`}
      >
        {currentStatus}
      </span>
    );
  }

  const handleSettle = (status: BetStatus) => {
    startTransition(async () => {
      await settleBet(betId, status);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleSettle(BetStatus.WON)}
        disabled={isPending}
        title="Marcar como Ganada"
        className="flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-1 text-xs font-medium text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900 transition disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Ganada</span>
      </button>

      <button
        onClick={() => handleSettle(BetStatus.LOST)}
        disabled={isPending}
        title="Marcar como Perdida"
        className="flex items-center gap-1 rounded bg-rose-950/80 px-2 py-1 text-xs font-medium text-rose-400 border border-rose-800/60 hover:bg-rose-900 transition disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Perdida</span>
      </button>

      <button
        onClick={() => handleSettle(BetStatus.VOID)}
        disabled={isPending}
        title="Marcar como Anulada / Push"
        className="flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-1 text-xs font-medium text-zinc-400 border border-zinc-700 hover:bg-zinc-700 transition disabled:opacity-50"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Push</span>
      </button>
    </div>
  );
}