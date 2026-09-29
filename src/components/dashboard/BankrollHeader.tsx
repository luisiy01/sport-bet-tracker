'use client';

import { updateInitialBankroll } from '@/app/actions/bankroll';
import { DollarSign, Edit2, Check, X } from 'lucide-react';
import { useState, useTransition } from 'react';

interface BankrollHeaderProps {
  userId: string;
  initialBankroll: number;
  netProfit: number;
}

export function BankrollHeader({ userId, initialBankroll, netProfit }: BankrollHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(initialBankroll.toString());
  const [isPending, startTransition] = useTransition();

  const currentBankroll = initialBankroll + netProfit;

  const handleSave = () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) return;

    startTransition(async () => {
      await updateInitialBankroll(userId, parsed);
      setIsEditing(false);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Bankroll Actual Total
          </span>
          <div className="text-3xl font-extrabold tracking-tight text-white">
            ${currentBankroll.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-800 pt-3 sm:border-t-0 sm:pt-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Monto"
            />
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500 disabled:opacity-50"
              title="Guardar"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              title="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-zinc-400">Bank Base Inicial</div>
              <div className="text-sm font-semibold text-zinc-200">
                ${initialBankroll.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Ajustar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}