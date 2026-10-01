'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface BetFiltersProps {
  tipsters: Array<{ id: string; name: string }>;
}

export function BetFilters({ tipsters }: BetFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-sm sm:grid-cols-3">
      {/* Filtro por Deporte */}
      <div>
        <label className="block text-xs font-medium text-zinc-400">Deporte</label>
        <select
          value={searchParams.get('sport') || 'ALL'}
          onChange={(e) => handleFilterChange('sport', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Todos los deportes</option>
          <option value="BASEBALL">Béisbol</option>
          <option value="AMERICAN_FOOTBALL">Fútbol Americano</option>
          <option value="SOCCER">Fútbol Soccer</option>
          <option value="TENNIS">Tenis</option>
          <option value="BASKETBALL">Básquetbol</option>
          <option value="OTHER">Otro</option>
        </select>
      </div>

      {/* Filtro por Estatus */}
      <div>
        <label className="block text-xs font-medium text-zinc-400">Estatus</label>
        <select
          value={searchParams.get('status') || 'ALL'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Todos los estatus</option>
          <option value="PENDING">Pendientes</option>
          <option value="WON">Ganadas</option>
          <option value="LOST">Perdidas</option>
          <option value="VOID">Push / Anuladas</option>
        </select>
      </div>

      {/* Filtro por Tipster */}
      <div>
        <label className="block text-xs font-medium text-zinc-400">Tipster</label>
        <select
          value={searchParams.get('tipsterId') || 'ALL'}
          onChange={(e) => handleFilterChange('tipsterId', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Todos los tipsters</option>
          <option value="NONE">Análisis Propio (Sin Tipster)</option>
          {tipsters.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}