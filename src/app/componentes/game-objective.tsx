import type { GameState } from "@/lib/types";

interface GameObjectiveProps {
  gameState: GameState;
}

export function GameObjective({ gameState }: GameObjectiveProps) {
  const { objective, discoveries, character } = gameState;

  if (!objective && !character) return null;

  return (
    <div className="bg-background/50 backdrop-blur-sm border rounded-xl p-3 space-y-2">
      {objective && (
        <div className="flex items-start gap-2">
          <span className="text-sm">🎯</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Acto {objective.act}/3
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1 w-6 rounded-full ${
                      n <= objective.act ? "bg-pink-500" : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm font-medium leading-tight">
              {objective.title}
            </p>
          </div>
        </div>
      )}

      {character && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>💋</span>
          <span className="truncate">
            {character.name}
            {character.background ? ` · ${character.background}` : ""}
          </span>
        </div>
      )}

      {discoveries.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {discoveries.map((d) => (
            <span
              key={d}
              className="text-[10px] uppercase tracking-wide bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded"
            >
              {discoveryLabel(d)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function discoveryLabel(key: string): string {
  const labels: Record<string, string> = {
    secret: "🔓 Secreto revelado",
    kink: "🔥 Fantasía descubierta",
    vulnerability: "💧 Vulnerabilidad",
    trust: "🤝 Confianza",
    boldness: "⚡ Iniciativa",
  };
  return labels[key] ?? `✨ ${key}`;
}
