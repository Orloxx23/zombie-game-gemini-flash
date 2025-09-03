import { Button } from '@/components/ui/button'
import { SHOP_ITEMS } from '@/lib/shop-items'
import type { GameState, ShopItem } from '@/lib/types'

interface GameShopProps {
  gameState: GameState
  onBuyItem: (item: ShopItem) => boolean
  onClose: () => void
}

export function GameShop({ gameState, onBuyItem, onClose }: GameShopProps) {
  const handleBuy = (item: ShopItem) => {
    const success = onBuyItem(item)
    if (!success) {
      alert('No tienes suficientes monedas!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🏪 Tienda</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        
        <div className="flex items-center gap-2 mb-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
          <span>🪙</span>
          <span className="font-medium">{gameState.coins} monedas</span>
        </div>

        {gameState.inventory.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">🎒 Inventario</h3>
            <div className="grid grid-cols-2 gap-2">
              {gameState.inventory.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {SHOP_ITEMS.map((item) => {
            const owned = !item.consumable && gameState.inventory.some(inv => inv.id === item.id)
            const canAfford = gameState.coins >= item.price
            
            return (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    {item.consumable && <span className="text-xs bg-green-100 dark:bg-green-900 px-1 rounded">Consumible</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🪙</span>
                    <span className="text-sm">{item.price}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {item.description}
                </p>
                
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                  Efecto: {item.effect}
                </p>
                
                <Button
                  size="sm"
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford || owned}
                  className="w-full"
                >
                  {owned ? 'Ya tienes este item' : canAfford ? 'Comprar' : 'Sin monedas'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}