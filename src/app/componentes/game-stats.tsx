import type { GameState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GameStatsProps {
  gameState: GameState;
}

interface StatBarProps {
  label: string;
  icon: string;
  current: number;
  max: number;
  color: string;
  dangerThreshold?: number;
  className?: string;
}

function StatBar({
  label,
  icon,
  current,
  max,
  color,
  dangerThreshold = 20,
  className,
}: StatBarProps) {
  const percentage = Math.max(0, (current / max) * 100);
  const isDanger = current <= dangerThreshold;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm leading-none">{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span
          className={`text-[10px] tabular-nums ${
            isDanger ? "text-red-500 font-bold" : "text-muted-foreground"
          }`}
        >
          {current}/{max}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            isDanger ? "bg-red-500" : color
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function GameStats({ gameState }: GameStatsProps) {
  return (
    <div className="bg-background/50 backdrop-blur-sm border rounded-xl p-3 lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:rounded-none lg:p-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1 lg:gap-y-2.5">
        <StatBar
          label="Atracción"
          icon="💖"
          current={gameState.attraction}
          max={gameState.maxAttraction}
          color="bg-pink-500"
          dangerThreshold={25}
        />
        <StatBar
          label="Deseo"
          icon="🔥"
          current={gameState.desire}
          max={gameState.maxDesire}
          color="bg-red-500"
          dangerThreshold={0}
        />
        <StatBar
          label="Tensión"
          icon="⚡"
          current={gameState.tension}
          max={gameState.maxTension}
          color="bg-yellow-500"
          dangerThreshold={0}
        />
        <StatBar
          label="Resistencia"
          icon="💪"
          current={gameState.stamina}
          max={gameState.maxStamina}
          color="bg-green-500"
          dangerThreshold={20}
        />
        <StatBar
          label="Química"
          icon="✨"
          current={gameState.chemistry}
          max={gameState.maxChemistry}
          color="bg-purple-500"
          dangerThreshold={30}
        />
      </div>
    </div>
  );
}
