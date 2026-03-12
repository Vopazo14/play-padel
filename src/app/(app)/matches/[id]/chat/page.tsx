"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { formatRelative } from "@/lib/utils/dates";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
}

interface ChatRoom {
  id: string;
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/chat/${matchId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.room) {
          setRoom(j.room);
          setMessages(j.room.messages ?? []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const res = await fetch(`/api/chat/${matchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });

    if (res.ok) {
      const j = await res.json();
      setMessages((prev) => [...prev, j.message]);
      setInput("");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto h-96 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Chat del partido</h1>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Aún no hay mensajes. ¡Sé el primero en escribir!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-sm font-medium text-emerald-700">
                {msg.author.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-700">{msg.author.name ?? "Anónimo"}</span>
                  <span className="text-xs text-gray-400">{formatRelative(msg.createdAt)}</span>
                </div>
                <div className="bg-gray-50 rounded-xl rounded-tl-none px-3 py-2 mt-0.5">
                  <p className="text-sm text-gray-800">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-3">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí un mensaje..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
