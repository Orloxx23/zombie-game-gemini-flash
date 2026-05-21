import type { GameState } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface GameObjectiveProps {
  gameState: GameState;
  isLoading?: boolean;
}

export function GameObjective({ gameState, isLoading }: GameObjectiveProps) {
  const { objective, discoveries, character } = gameState;

  if (!objective && !character) {
    if (!isLoading) return null;
    return <GameObjectiveSkeleton />;
  }

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

function GameObjectiveSkeleton() {
  return (
    <div className="bg-background/50 backdrop-blur-sm border rounded-xl p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-sm opacity-50">🎯</span>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <div className="flex gap-1">
              <Skeleton className="h-1 w-6 rounded-full" />
              <Skeleton className="h-1 w-6 rounded-full" />
              <Skeleton className="h-1 w-6 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs opacity-50">💋</span>
        <Skeleton className="h-3 w-2/3" />
      </div>
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
