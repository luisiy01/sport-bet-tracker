'use client';

import { deleteBet } from '@/app/actions/bets';
import { Trash2 } from 'lucide-react';
import { useTransition, useState } from 'react';

interface DeleteBetButtonProps {
  betId: string;
}

export function DeleteBetButton({ betId }: DeleteBetButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteBet(betId);
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
        >
          Confirmar
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-400 hover:bg-zinc-700"
        >
          X
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400 transition"
      title="Eliminar apuesta"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}