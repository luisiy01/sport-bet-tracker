import { StreaksInfo } from '@/app/actions/dashboard';
import { Zap, Flame, Snowflake } from 'lucide-react';

interface StreaksCardProps {
  streaks: StreaksInfo;
}

export function StreaksCard({ streaks }: StreaksCardProps) {
  const isWinningStreak = streaks.currentStreak.type === 'WON';
  const isLosingStreak = streaks.currentStreak.type === 'LOST';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">Control de Rachas</h2>
          <p className="text-xs text-zinc-400">Racha actual e historial de rachas consecutivas</p>
        </div>
        <Zap className="h-5 w-5 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Racha Actual */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4">
          <span className="text-xs text-zinc-500">Racha Actual</span>
          <div className="mt-1 flex items-center gap-2">
            {isWinningStreak && <Flame className="h-5 w-5 text-emerald-400" />}
            {isLosingStreak && <Snowflake className="h-5 w-5 text-rose-400" />}
            <div
              className={`text-2xl font-bold ${
                isWinningStreak
                  ? 'text-emerald-400'
                  : isLosingStreak
                  ? 'text-rose-400'
                  : 'text-zinc-400'
              }`}
            >
              {streaks.currentStreak.count > 0
                ? `${streaks.currentStreak.count} ${isWinningStreak ? 'G' : 'P'}`
                : 'Sin racha'}
            </div>
          </div>
        </div>

        {/* Máxima Racha Ganadora */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4">
          <span className="text-xs text-zinc-500">Máx. Racha Ganadora</span>
          <div className="mt-1 flex items-center gap-2">
            <Flame className="h-5 w-5 text-emerald-500/80" />
            <div className="text-2xl font-bold text-emerald-400">
              {streaks.maxWinningStreak} Victorias
            </div>
          </div>
        </div>

        {/* Máxima Racha Perdedora */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4">
          <span className="text-xs text-zinc-500">Máx. Racha Perdedora</span>
          <div className="mt-1 flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-rose-500/80" />
            <div className="text-2xl font-bold text-rose-400">
              {streaks.maxLosingStreak} Derrotas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}