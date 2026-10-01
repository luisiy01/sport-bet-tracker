import { getTipsterAnalytics } from '@/app/actions/tipsters';
import { ArrowLeft, Users, TrendingUp, Percent, DollarSign, Award } from 'lucide-react';
import Link from 'next/link';

export default async function TipstersPage() {
  const userId = 'user-demo-123';
  const stats = await getTipsterAnalytics(userId);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rendimiento por Tipster</h1>
            <p className="text-sm text-zinc-400">
              Comparativa de ROI, Win Rate y ganancia neta por pronosticador.
            </p>
          </div>
        </div>

        {/* Grid de Tarjetas de Tipsters */}
        {stats.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-12 text-center text-zinc-500">
            <Users className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
            <p className="text-base font-medium text-zinc-400">No hay datos de Tipsters registrados.</p>
            <p className="mt-1 text-xs text-zinc-600">
              Registra apuestas asignando un Tipster para ver sus métricas aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((t) => {
              const isPositive = t.netProfit >= 0;

              return (
                <div
                  key={t.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm transition hover:border-zinc-700"
                >
                  <div>
                    {/* Cabecera del Card */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">{t.name}</h2>
                        {t.platform && (
                          <span className="text-xs text-zinc-500">{t.platform}</span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isPositive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                        }`}
                      >
                        ROI: {t.roi.toFixed(1)}%
                      </span>
                    </div>

                    {/* Métricas Principales */}
                    <div className="mt-6 grid grid-cols-2 gap-4 border-y border-zinc-800/60 py-4">
                      <div>
                        <span className="text-xs text-zinc-500">Profit Neta</span>
                        <div
                          className={`text-xl font-bold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ${t.netProfit.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-zinc-500">Win Rate</span>
                        <div className="text-xl font-bold text-white">
                          {t.winRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Apuestas */}
                    <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Apuestas Resueltas:</span>
                        <span className="font-semibold text-zinc-200">
                          {t.wonBets}G - {t.lostBets}P
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monto Apostado:</span>
                        <span className="font-semibold text-zinc-200">
                          ${t.totalStaked.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pendientes:</span>
                        <span className="font-semibold text-zinc-200">{t.pendingBets}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón para filtrar sus apuestas en el historial */}
                  <div className="mt-6 pt-2">
                    <Link
                      href={`/bets?tipsterId=${t.id}`}
                      className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 text-center text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                    >
                      Ver Apuestas de este Tipster
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}