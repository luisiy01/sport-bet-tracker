'use client';

import { OddsRangePerformance } from '@/app/actions/dashboard';
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

interface OddsRangePerformanceChartProps {
  data: OddsRangePerformance[];
}

export function OddsRangePerformanceChart({ data }: OddsRangePerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-500">
        Sin datos suficientes de rangos de momio.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">Rentabilidad por Momio</h2>
          <p className="text-xs text-zinc-400">
            Resultado neto según el rango del momio americano
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="rangeLabel"
              stroke="#71717a"
              fontSize={10}
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
                  const item: OddsRangePerformance = payload[0].payload;
                  const isProfit = item.netProfit >= 0;

                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-white text-sm">{item.rangeLabel}</p>
                      <div className="text-zinc-400">
                        Profit Neta:{' '}
                        <span
                          className={`font-bold ${
                            isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isProfit ? '+' : ''}${item.netProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-zinc-400">
                        ROI:{' '}
                        <span className="font-semibold text-zinc-200">{item.roi}%</span> | Win
                        Rate:{' '}
                        <span className="font-semibold text-zinc-200">{item.winRate}%</span>
                      </div>
                      <div className="text-zinc-500 text-[10px] pt-1 border-t border-zinc-800">
                        Apuestas: {item.wonBets}G - {item.lostBets}P (Total: {item.totalBets})
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar dataKey="netProfit" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.netProfit >= 0 ? '#10b981' : '#f43f5e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}