"use client";

import { useState } from "react";

interface ApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export function ApiKeyForm({ onApiKeySubmit }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSubmitting(true);
    onApiKeySubmit(apiKey.trim());
  };

  return (
    <>
      <img src={"/logo.webp"} className="size-72" draggable="false" alt="" />
      <div className="max-w-xl w-full mx-auto mt-6 p-6 bg-background rounded-xl border">
        <p className="text-gray-300 mb-4">
          Para comenzar necesitas una API key de Google AI Studio
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Obtén tu API key aquí:{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            https://aistudio.google.com/apikey
          </a>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ingresa tu API key"
            className="w-full p-3 bg-background border border-gray-600 rounded-lg mb-4 text-white placeholder-gray-400"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!apiKey.trim() || isSubmitting}
            className="w-full cursor-pointer bg-white text-black p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Configurando..." : "Comenzar Juego"}
          </button>
        </form>
      </div>
    </>
  );
}
