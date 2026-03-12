import Link from "next/link";
import { getMatches } from "@/server/queries/match.queries";
import MatchCard from "@/components/matches/MatchCard";
import { ArrowRight, Users, Zap, Star, MapPin } from "lucide-react";

export default async function LandingPage() {
  const { matches } = await getMatches({}, 1, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-emerald-600 text-lg">
            <span>🎾</span>
            <span>Play Padel</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>🚀</span>
            <span>La app que faltaba para el Padel</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Encuentra tu próximo partido de Padel
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Publica un partido, suma jugadores y juega. Sin grupos de WhatsApp, sin llamadas. Todo en un lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition text-sm"
            >
              Empezar gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/matches"
              className="flex items-center justify-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition text-sm"
            >
              Ver partidos disponibles
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Todo lo que necesitás para jugar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Users, title: "Encontrá jugadores", desc: "Unite a partidos con cupos disponibles en tu ciudad" },
              { icon: Zap, title: "Creá tu partido", desc: "Publicá horario y lugar, y los jugadores se suman solos" },
              { icon: MapPin, title: "Reservá cancha", desc: "Link directo a Easy Cancha, Playtomic y más plataformas" },
              { icon: Star, title: "Construí reputación", desc: "Sistema de puntuación entre jugadores para mejores partidos" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live matches */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Partidos disponibles ahora</h2>
              <p className="text-gray-500 text-sm mt-1">Sumate a uno de estos partidos</p>
            </div>
            <Link
              href="/matches"
              className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:underline"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Aún no hay partidos publicados</p>
              <Link
                href="/auth/signup"
                className="text-emerald-600 font-medium hover:underline"
              >
                ¡Sé el primero en crear uno!
              </Link>

            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-emerald-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Querés jugar hoy?</h2>
          <p className="text-emerald-100 mb-8">
            Creá tu cuenta gratis y encontrá tu próximo partido en minutos
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition"
          >
            Empezar gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4 text-center">
        <p className="text-sm text-gray-400">
          © 2026 Play Padel · Hecho para jugadores de Padel
        </p>
      </footer>
    </div>
  );
}
