import { createBet } from '@/app/actions/bets';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewBetPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registrar Apuesta</h1>
            <p className="text-sm text-zinc-400">
              Ingresa los detalles de tu nueva jugada.
            </p>
          </div>
        </div>

        <form
          action={createBet}
          className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm"
        >
          {/* Evento y Selección */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Evento / Partido *
              </label>
              <input
                type="text"
                name="event"
                required
                placeholder="Ej. Yankees vs Red Sox"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Selección / Pronóstico *
              </label>
              <input
                type="text"
                name="selection"
                required
                placeholder="Ej. Yankees ML o Over 8.5"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Deporte y Liga */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Deporte *
              </label>
              <select
                name="sport"
                required
                defaultValue="BASEBALL"
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
                placeholder="Ej. MLB, NFL, Premier League"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tipo de Apuesta, Momio y Stake */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Tipo de Apuesta *
              </label>
              <select
                name="betType"
                required
                defaultValue="MONEYLINE"
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
              <label className="block text-xs font-medium text-zinc-400">
                Momio Americano *
              </label>
              <input
                type="number"
                step="1"
                name="odds"
                required
                placeholder="Ej. -110 o 150"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Stake / Importe *
              </label>
              <input
                type="number"
                step="0.01"
                name="stake"
                required
                placeholder="Ej. 100"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Casa de Apuestas y Tipster */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Casa de Apuestas
              </label>
              <input
                type="text"
                name="bookmaker"
                placeholder="Ej. Bet365, Caliente, Pinnacle"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Tipster / Pronosticador
              </label>
              <input
                type="text"
                name="tipsterName"
                placeholder="Ej. Apuesta Propia, Pickster VIP"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-zinc-400">
              Notas Adicionales
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Justificación o anotaciones de la jugada..."
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <PlusCircle className="h-4 w-4" />
            Guardar Apuesta
          </button>
        </form>
      </div>
    </main>
  );
}