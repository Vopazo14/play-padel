"use client";

import { useState, useEffect } from "react";
import { SKILL_LEVELS } from "@/lib/utils/skillLevel";
import Link from "next/link";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  profile: {
    bio: string | null;
    city: string | null;
    country: string;
    skillLevel: number;
    preferredSide: string;
    ratingScore: number;
    totalMatches: number;
    wins: number;
    losses: number;
  } | null;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((j) => {
      setData(j.user);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      bio: formData.get("bio"),
      city: formData.get("city"),
      skillLevel: parseFloat(formData.get("skillLevel") as string),
      preferredSide: formData.get("preferredSide"),
    };

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const j = await res.json();
      setError(j.error ?? "Error al guardar");
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const profile = data?.profile;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <Link href="/profile/stats" className="text-sm text-emerald-600 font-medium hover:underline">
          Ver estadísticas
        </Link>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{profile?.totalMatches ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Partidos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{profile?.wins ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Victorias</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{profile?.ratingScore?.toFixed(1) ?? "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Reputación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg border border-emerald-100">
            ¡Perfil actualizado correctamente!
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
          <input
            name="name"
            defaultValue={data?.name ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Cuéntanos algo sobre ti..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
          <input
            name="city"
            defaultValue={profile?.city ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Buenos Aires"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nivel de juego</label>
            <select
              name="skillLevel"
              defaultValue={profile?.skillLevel ?? 1.5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SKILL_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Posición preferida</label>
            <select
              name="preferredSide"
              defaultValue={profile?.preferredSide ?? "BOTH"}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="BOTH">Ambos lados</option>
              <option value="DRIVE">Drive (derecha)</option>
              <option value="REVES">Revés (izquierda)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          Email: {data?.email}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 disabled:opacity-60 transition"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
