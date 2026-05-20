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
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium truncate">{label}</span>
          <span
            className={`text-xs ${
              isDanger ? "text-red-500 font-bold" : "text-gray-600"
            }`}
          >
            {current}/{max}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isDanger ? "bg-red-500" : color
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function GameStats({ gameState }: GameStatsProps) {
  return (
    <div className="bg-background/50 backdrop-blur-sm border rounded-xl p-3 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatBar
          label="Atracción"
          icon="💖"
          current={gameState.attraction}
          max={gameState.maxAttraction}
          color="bg-pink-500"
          dangerThreshold={25}
          className="w-full span-col-2 lg:col-span-1"
        />
        <StatBar
          label="Deseo"
          icon="🔥"
          current={gameState.desire}
          max={gameState.maxDesire}
          color="bg-red-500"
          dangerThreshold={0}
          className="w-full col-span-1"
        />
        <StatBar
          label="Tensión"
          icon="⚡"
          current={gameState.tension}
          max={gameState.maxTension}
          color="bg-yellow-500"
          dangerThreshold={0}
          className="w-full col-span-1"
        />
        <StatBar
          label="Resistencia"
          icon="💪"
          current={gameState.stamina}
          max={gameState.maxStamina}
          color="bg-green-500"
          dangerThreshold={20}
          className="w-full col-span-1"
        />
        <StatBar
          label="Química"
          icon="✨"
          current={gameState.chemistry}
          max={gameState.maxChemistry}
          color="bg-purple-500"
          dangerThreshold={30}
          className="w-full col-span-1"
        />
      </div>
    </div>
  );
}
