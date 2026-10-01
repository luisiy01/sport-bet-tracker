'use client';

import { DailyStat } from '@/app/actions/dashboard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';

interface DailyPerformanceChartProps {
  data: DailyStat[];
}

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-500">
        Resuelve apuestas para consultar el rendimiento diario.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">Rendimiento Diario (P/L)</h2>
          <p className="text-xs text-zinc-400">
            Ganancia/pérdida neta de cada día y capital de apertura
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="displayDate"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
            />

            <ReferenceLine y={0} stroke="#52525b" strokeWidth={1} />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: DailyStat = payload[0].payload;
                  const isProfit = item.dailyProfit >= 0;

                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-zinc-300">{item.displayDate}</p>
                      <div className="border-t border-zinc-800 pt-1 text-zinc-400">
                        Bankroll Inicio Día:{' '}
                        <span className="font-medium text-white">${item.startBankroll.toFixed(2)}</span>
                      </div>
                      <div className="text-zinc-400">
                        Resultado del Día:{' '}
                        <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}${item.dailyProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-zinc-800 pt-1 text-zinc-400">
                        Bankroll Cierre Día:{' '}
                        <span className="font-semibold text-white">${item.endBankroll.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Apuestas resueltas: {item.betsCount}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar dataKey="dailyProfit" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.dailyProfit >= 0 ? '#10b981' : '#f43f5e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}