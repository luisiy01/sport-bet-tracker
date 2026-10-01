import { prisma } from '@/lib/prisma';
import { updateBet } from '@/app/actions/bets';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditBetPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBetPage({ params }: EditBetPageProps) {
  const { id } = await params;
  const bet = await prisma.bet.findUnique({ where: { id } });

  if (!bet) {
    notFound();
  }

  const updateBetWithId = updateBet.bind(null, bet.id);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/bets"
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Apuesta</h1>
            <p className="text-sm text-zinc-400">Modifica los campos necesarios.</p>
          </div>
        </div>

        <form
          action={updateBetWithId}
          className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Evento *</label>
              <input
                type="text"
                name="event"
                defaultValue={bet.event}
                required
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Selección *</label>
              <input
                type="text"
                name="selection"
                defaultValue={bet.selection}
                required
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Deporte *</label>
              <select
                name="sport"
                defaultValue={bet.sport}
                required
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="BASEBALL">Béisbol</option>
                <option value="AMERICAN_FOOTBALL">Fútbol Americano</option>
                <option value="SOCCER">Fútbol Soccer</option>
                <option value="TENNIS">Tenis</option>
                <option value="BASKETBALL">Básquetbol</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Liga</label>
              <input
                type="text"
                name="league"
                defaultValue={bet.league || ''}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Tipo *</label>
              <select
                name="betType"
                defaultValue={bet.betType}
                required
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="MONEYLINE">Moneyline</option>
                <option value="SPREAD">Handicap / Línea</option>
                <option value="OVER_UNDER">Altas / Bajas</option>
                <option value="PARLAY">Parlay</option>
                <option value="PROP">Prop / Jugador</option>
                <option value="FUTURE">Futura</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Momio *</label>
              <input
                type="number"
                step="1"
                name="odds"
                defaultValue={Number(bet.odds)}
                required
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">Stake *</label>
              <input
                type="number"
                step="0.01"
                name="stake"
                defaultValue={Number(bet.stake)}
                required
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Casa de Apuestas</label>
              <input
                type="text"
                name="bookmaker"
                defaultValue={bet.bookmaker || ''}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400">Notas</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={bet.notes || ''}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </button>
        </form>
      </div>
    </main>
  );
}