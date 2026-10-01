import { getDashboardStats } from "@/app/actions/dashboard";
import { BankrollHeader } from "@/components/dashboard/BankrollHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { BankrollChart } from "@/components/dashboard/BankrollChart";
import { SettleBetActions } from "@/components/bets/SettleBetActions";
import { formatAmericanOdds } from "@/lib/utils/odds";
import {
  TrendingUp,
  Percent,
  Clock,
  DollarSign,
  PlusCircle,
  History,
  ArrowRight,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { DeleteBetButton } from "@/components/bets/DeleteBetButton";
import { Users } from "lucide-react";
import { DailyPerformanceChart } from "@/components/dashboard/DailyPerformanceChart";
import { SportPerformanceChart } from "@/components/dashboard/SportPerformanceChart";

export default async function DashboardPage() {
  const userId = "user-demo-123";
  const stats = await getDashboardStats(userId);

  const isProfitPositive = stats.netProfit >= 0;

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Encabezado Principal */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tracker de Apuestas
            </h1>
            <p className="text-sm text-zinc-400">
              Resumen de rendimiento, métricas y balance general.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bets"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <History className="h-4 w-4" />
              Ver Historial
            </Link>

            <Link
              href="/tipsters"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <Users className="h-4 w-4" />
              Tipsters
            </Link>

            <Link
              href="/bets/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <PlusCircle className="h-4 w-4" />
              Nueva Apuesta
            </Link>
          </div>
        </div>

        {/* Bankroll Header */}
        <BankrollHeader
          userId={userId}
          initialBankroll={stats.initialBankroll}
          netProfit={stats.netProfit}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BankrollChart data={stats.bankrollHistory} />
          <DailyPerformanceChart data={stats.dailyStats} />
          <SportPerformanceChart data={stats.sportPerformanceStats} />
        </div>

        {/* Grid de KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Profit / Loss Total"
            value={`$${stats.netProfit.toFixed(2)}`}
            subtitle={`Monto apostado: $${stats.totalStaked.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={isProfitPositive ? "positive" : "negative"}
          />

          <KpiCard
            title="ROI %"
            value={`${stats.roi.toFixed(2)}%`}
            subtitle="Retorno sobre la inversión"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={stats.roi >= 0 ? "positive" : "negative"}
          />

          <KpiCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            subtitle={`${stats.wonBets}G - ${stats.lostBets}P de ${stats.wonBets + stats.lostBets} resueltas`}
            icon={<Percent className="h-5 w-5" />}
            trend={stats.winRate >= 50 ? "positive" : "neutral"}
          />

          <KpiCard
            title="Apuestas Pendientes"
            value={stats.pendingBets.toString()}
            subtitle={`Total registradas: ${stats.totalBets}`}
            icon={<Clock className="h-5 w-5" />}
            trend="neutral"
          />
        </div>

        {/* Actividad Reciente */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200">
              Últimas Apuestas
            </h2>
            <Link
              href="/bets"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats.recentBets.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Aún no tienes apuestas registradas. Haz clic en "Nueva Apuesta"
              para comenzar.
            </p>
          ) : (
            <div className="divide-y divide-zinc-800/60 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="pb-3 font-semibold">Evento / Selección</th>
                    <th className="pb-3 font-semibold">Deporte</th>
                    <th className="pb-3 font-semibold">Momio</th>
                    <th className="pb-3 font-semibold">Stake</th>
                    <th className="pb-3 font-semibold">Estatus / Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                  {stats.recentBets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-zinc-800/30">
                      <td className="py-3 font-medium">
                        <div>{bet.event}</div>
                        <div className="text-xs text-zinc-500">
                          {bet.selection}
                        </div>
                      </td>
                      <td className="py-3 text-zinc-400">{bet.sport}</td>
                      <td className="py-3 font-mono">
                        {formatAmericanOdds(Number(bet.odds))}
                      </td>
                      <td className="py-3">${Number(bet.stake).toFixed(2)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <SettleBetActions
                            betId={bet.id}
                            currentStatus={bet.status}
                          />

                          <Link
                            href={`/bets/${bet.id}/edit`}
                            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition"
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>

                          <DeleteBetButton betId={bet.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
