'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface BankrollChartProps {
  data: Array<{
    date: string;
    bankroll: number;
    profit: number;
  }>;
}

export function BankrollChart({ data }: BankrollChartProps) {
  if (!data || data.length <= 1) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-500">
        Resuelve más apuestas para visualizar el gráfico de rendimiento.
      </div>
    );
  }

  const isPositiveOverall = data[data.length - 1].bankroll >= data[0].bankroll;
  const strokeColor = isPositiveOverall ? '#10b981' : '#f43f5e';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">Evolución del Bankroll</h2>
          <p className="text-xs text-zinc-400">Progreso histórico del capital acumulado</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bankrollGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="date"
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

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 shadow-xl text-xs">
                      <p className="font-medium text-zinc-400">{item.date}</p>
                      <p className="mt-1 font-bold text-white text-sm">
                        Bankroll: ${item.bankroll.toFixed(2)}
                      </p>
                      <p
                        className={`font-semibold ${
                          item.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        Profit acumulado: ${item.profit.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="bankroll"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#bankrollGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}