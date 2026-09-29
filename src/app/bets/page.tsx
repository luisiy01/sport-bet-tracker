import { getFilteredBets } from "@/app/actions/bets-history";
import { BetFilters } from "@/components/bets/BetFilters";
import { SettleBetActions } from "@/components/bets/SettleBetActions";
import { formatAmericanOdds } from "@/lib/utils/odds";
import { ArrowLeft, PlusCircle, FilterX } from "lucide-react";
import Link from "next/link";
import { DeleteBetButton } from "@/components/bets/DeleteBetButton";
import { Edit3 } from "lucide-react";

interface BetsPageProps {
  searchParams: Promise<{
    sport?: string;
    status?: string;
    tipsterId?: string;
  }>;
}

export default async function BetsPage({ searchParams }: BetsPageProps) {
  const filters = await searchParams;
  const userId = "user-demo-123";

  const { bets, tipsters } = await getFilteredBets(userId, filters);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Historial de Apuestas
              </h1>
              <p className="text-sm text-zinc-400">
                {bets.length}{" "}
                {bets.length === 1
                  ? "apuesta registrada"
                  : "apuestas registradas"}
              </p>
            </div>
          </div>

          <Link
            href="/bets/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva Apuesta
          </Link>
        </div>

        {/* Componente de Filtros */}
        <BetFilters tipsters={tipsters} />

        {/* Tabla de Resultados */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
          {bets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
              <FilterX className="mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-base font-medium text-zinc-400">
                No se encontraron apuestas con los filtros seleccionados.
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Intenta cambiar o limpiar los criterios de búsqueda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="pb-3 font-semibold">Fecha</th>
                    <th className="pb-3 font-semibold">Evento / Selección</th>
                    <th className="pb-3 font-semibold">Deporte / Liga</th>
                    <th className="pb-3 font-semibold">Tipster</th>
                    <th className="pb-3 font-semibold">Momio</th>
                    <th className="pb-3 font-semibold">Stake</th>
                    <th className="pb-3 font-semibold">Estatus / Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                  {bets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-zinc-800/30">
                      <td className="py-3 text-xs text-zinc-500 whitespace-nowrap">
                        {new Date(bet.placedAt).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 font-medium">
                        <div>{bet.event}</div>
                        <div className="text-xs text-zinc-500">
                          {bet.selection}
                        </div>
                      </td>
                      <td className="py-3 text-zinc-400">
                        <div>{bet.sport}</div>
                        {bet.league && (
                          <div className="text-xs text-zinc-600">
                            {bet.league}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-xs text-zinc-400">
                        {bet.tipster?.name || (
                          <span className="italic text-zinc-600">Propia</span>
                        )}
                      </td>
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
