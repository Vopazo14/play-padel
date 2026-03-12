import { getMatches } from "@/server/queries/match.queries";
import MatchCard from "@/components/matches/MatchCard";
import Link from "next/link";
import { Plus } from "lucide-react";

interface SearchParams {
  city?: string;
  skillLevel?: string;
  page?: string;
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  const data = await getMatches(
    {
      city: params.city,
      skillLevel: params.skillLevel ? parseFloat(params.skillLevel) : undefined,
    },
    page
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partidos disponibles</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data.total} partido{data.total !== 1 ? "s" : ""} abiertos</p>
        </div>
        <Link
          href="/matches/new"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus size={16} />
          <span>Crear</span>
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-2 flex-wrap">
        <input
          name="city"
          defaultValue={params.city}
          placeholder="Filtrar por ciudad..."
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 min-w-40"
        />
        <select
          name="skillLevel"
          defaultValue={params.skillLevel}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos los niveles</option>
          <option value="1.5">Principiante</option>
          <option value="3.0">Intermedio</option>
          <option value="4.5">Avanzado</option>
          <option value="6.0">Profesional</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          Buscar
        </button>
        {(params.city || params.skillLevel) && (
          <Link href="/matches" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
            Limpiar
          </Link>
        )}
      </form>

      {/* Match list */}
      {data.matches.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-2">No hay partidos disponibles</p>
          <Link href="/matches/new" className="text-emerald-600 text-sm font-medium hover:underline">
            ¡Crea el primero!
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/matches?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">Página {page} de {data.totalPages}</span>
          {page < data.totalPages && (
            <Link
              href={`/matches?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
