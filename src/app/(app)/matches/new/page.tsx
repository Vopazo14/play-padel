"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SKILL_LEVELS } from "@/lib/utils/skillLevel";

export default function CreateMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [defaultDate, setDefaultDate] = useState("");

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDefaultDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const scheduledDate = formData.get("scheduledDate") as string;
    const scheduledTime = formData.get("scheduledTime") as string;
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    const body = {
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      scheduledAt,
      durationMinutes: parseInt(formData.get("durationMinutes") as string),
      location: formData.get("location"),
      city: formData.get("city") || undefined,
      courtBookingUrl: formData.get("courtBookingUrl") || undefined,
      skillLevelMin: parseFloat(formData.get("skillLevelMin") as string),
      skillLevelMax: parseFloat(formData.get("skillLevelMax") as string),
      maxPlayers: parseInt(formData.get("maxPlayers") as string),
      format: formData.get("format"),
      isPrivate: formData.get("isPrivate") === "on",
    };

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Error al crear el partido");
      setLoading(false);
      return;
    }

    router.push(`/matches/${json.match.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear partido</h1>
        <p className="text-gray-500 text-sm mt-1">Publica un partido y encuentra compañeros</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Título del partido *</label>
          <input
            name="title"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Ej: Partido de tarde en Palermo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea
            name="description"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            placeholder="Detalles adicionales del partido..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha *</label>
            <input
              name="scheduledDate"
              type="date"
              required
              defaultValue={defaultDate}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora *</label>
            <input
              name="scheduledTime"
              type="time"
              required
              defaultValue="20:00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duración</label>
            <select
              name="durationMinutes"
              defaultValue="90"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">2 horas</option>
              <option value="180">3 horas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Formato</label>
            <select
              name="format"
              defaultValue="DOUBLES"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="DOUBLES">Dobles (4 jugadores)</option>
              <option value="AMERICANO">Americano</option>
              <option value="THREE_PLAYERS">3 Jugadores</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubicación / Club *</label>
          <input
            name="location"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Ej: Club Palermo, Av. del Libertador 3095"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
            <input
              name="city"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Buenos Aires"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jugadores</label>
            <select
              name="maxPlayers"
              defaultValue="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nivel requerido</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mínimo</label>
              <select
                name="skillLevelMin"
                defaultValue="1.0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Máximo</label>
              <select
                name="skillLevelMax"
                defaultValue="7.0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Link de cancha (opcional)</label>
          <input
            name="courtBookingUrl"
            type="url"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="https://easycancha.com/..."
          />
          <p className="text-xs text-gray-400 mt-1">Pega el link de Easy Cancha, Playtomic, u otra plataforma</p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input
            id="isPrivate"
            name="isPrivate"
            type="checkbox"
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded"
          />
          <label htmlFor="isPrivate" className="text-sm text-gray-700">
            Partido privado (solo por invitación)
          </label>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creando partido..." : "Publicar partido"}
          </button>
        </div>
      </form>
    </div>
  );
}
