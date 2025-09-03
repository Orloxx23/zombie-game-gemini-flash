import type { GameState } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface GameStatsProps {
  gameState: GameState
  onRestart?: () => void
}

interface StatBarProps {
  label: string
  icon: string
  current: number
  max: number
  color: string
  dangerThreshold?: number
}

function StatBar({ label, icon, current, max, color, dangerThreshold = 20 }: StatBarProps) {
  const percentage = Math.max(0, (current / max) * 100)
  const isDanger = current <= dangerThreshold
  
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium truncate">{label}</span>
          <span className={`text-xs ${isDanger ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
            {current}/{max}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isDanger ? 'bg-red-500' : color
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function GameStats({ gameState, onRestart }: GameStatsProps) {
  if (gameState.isGameOver) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">💀</div>
        <div className="text-red-800 dark:text-red-200 font-bold">GAME OVER</div>
        <div className="text-red-600 dark:text-red-400 text-sm mt-1 mb-3">
          No has logrado sobrevivir al apocalipsis zombie
        </div>
        <Button onClick={onRestart} variant="destructive">
          🎮 Jugar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatBar
          label="Salud"
          icon="❤️"
          current={gameState.health}
          max={gameState.maxHealth}
          color="bg-red-500"
          dangerThreshold={25}
        />
        <StatBar
          label="Hambre"
          icon="🍖"
          current={gameState.hunger}
          max={gameState.maxHunger}
          color="bg-orange-500"
          dangerThreshold={20}
        />
        <StatBar
          label="Sed"
          icon="💧"
          current={gameState.thirst}
          max={gameState.maxThirst}
          color="bg-blue-500"
          dangerThreshold={15}
        />
        <StatBar
          label="Energía"
          icon="⚡"
          current={gameState.energy}
          max={gameState.maxEnergy}
          color="bg-yellow-500"
          dangerThreshold={20}
        />
        <StatBar
          label="Cordura"
          icon="🧠"
          current={gameState.sanity}
          max={gameState.maxSanity}
          color="bg-purple-500"
          dangerThreshold={30}
        />
      </div>
    </div>
  )
}