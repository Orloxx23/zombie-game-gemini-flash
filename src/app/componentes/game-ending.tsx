import type { GameState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { UI_MESSAGES } from "@/lib/consts";

interface GameEndingProps {
  gameState: GameState;
  onRestart: () => void;
}

export function GameEnding({ gameState, onRestart }: GameEndingProps) {
  const endingKey = gameState.ending ?? "ignored";
  const ending = UI_MESSAGES.ENDINGS[endingKey];
  const character = gameState.character;

  return (
    <div className="bg-background/80 backdrop-blur-sm border rounded-xl p-5 text-center space-y-3">
      <div className="text-4xl">{ending.icon}</div>
      <div className="text-lg font-bold">{ending.title}</div>
      <p className="text-sm text-muted-foreground">{ending.description}</p>

      {character && (
        <p className="text-xs text-muted-foreground italic">
          con {character.name}
        </p>
      )}

      {gameState.discoveries.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Descubriste {gameState.discoveries.length}{" "}
          {gameState.discoveries.length === 1 ? "cosa" : "cosas"} de ella
        </div>
      )}

      <Button onClick={onRestart} className="w-full mt-2">
        🌙 Otra noche
      </Button>
    </div>
  );
}
