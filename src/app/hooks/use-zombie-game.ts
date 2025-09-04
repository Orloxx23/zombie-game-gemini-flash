import { useState, useEffect, use } from 'react';
import type { GameMessage, ConversationMessage, GenerateStoryResponse, GameState, ShopItem, CreativityCheckResponse, StatChanges } from '@/lib/types';
import { getItemById } from '@/lib/shop-items';

export function useZombieGame() {
  const [messages, setMessages] = useState<GameMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    coins: 10,
    inventory: [],
    health: 100,
    hunger: 100,
    thirst: 100,
    energy: 100,
    sanity: 100,
    maxHealth: 100,
    maxHunger: 100,
    maxThirst: 100,
    maxEnergy: 100,
    maxSanity: 100,
    isGameOver: false,
    suggestions: []
  })
  
  useEffect(() => {
    startGame()
  }, [])

  const startGame = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        body: JSON.stringify({ isStart: true })
      })

      if (!response.ok) {
        throw new Error('Failed to generate story')
      }
  
      const data = await response.json() as GenerateStoryResponse

      const messageId = crypto.randomUUID()

      const newMessage: GameMessage = {
        id: messageId,
        role: 'assistant',
        content: data.narrative,
        imageLoading: true
      }

      setMessages([newMessage])
      
      // Actualizar sugerencias si están disponibles
      if (data.suggestions) {
        setGameState(prev => ({ ...prev, suggestions: data.suggestions || [] }))
      }
      
      generateImage(messageId, data.imagePrompt)
    } catch (error) {
      console.error('Error generating story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateImage = async (messageId: string, imagePrompt: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          imagePrompt: imagePrompt
        })
      })
  
      if (!response.ok) {
        throw new Error('Failed to generate image')
      }
  
      const imageData = await response.json()
  
      setMessages(prevMessages => prevMessages.map(message => {
        if (message.id === messageId) {
          return { ...message, image: imageData.image, imageLoading: false }
        }
  
        return message
      }))
    } catch (error) {
      setMessages(prevMessages => prevMessages.map(message => {
        if (message.id === messageId) {
          return { ...message, imageLoading: false }
        }

        return message
      }))
    }
  }

  const checkCreativity = async (userMessage: string, conversationHistory: GameMessage[]): Promise<CreativityCheckResponse> => {
    try {
      const response = await fetch('/api/check-creativity', {
        method: 'POST',
        body: JSON.stringify({
          userMessage,
          conversationHistory: conversationHistory.map(msg => ({ role: msg.role, content: msg.content }))
        })
      });
      
      if (!response.ok) throw new Error('Failed to check creativity');
      return await response.json();
    } catch (error) {
      return { isCreative: false, coinsEarned: 1, reason: 'Error' };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: GameMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    }

    setIsLoading(true)
    const currentInput = input
    setInput('')
    setGameState(prev => ({ ...prev, suggestions: [] }))
    setMessages(prevMessages => [...prevMessages, userMessage])

    try {
      // Evaluar creatividad
      const creativityCheck = await checkCreativity(currentInput, messages);

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: currentInput,
          conversationHistory: messages,
          isStart: false,
          playerStats: gameState
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate story')
      }

      const data = await response.json() as GenerateStoryResponse
      
      // Evaluar cambios de estadísticas
      const statChanges = await evaluateStats(data.narrative, currentInput);
      
      const messageId = crypto.randomUUID()

      const assistantMessage: GameMessage = {
        id: messageId,
        role: 'assistant',
        content: data.narrative,
        imageLoading: true,
        coinsEarned: creativityCheck.coinsEarned
      }

      // Actualizar estadísticas y monedas
      updateGameStats(creativityCheck.coinsEarned, statChanges);
      
      // Actualizar sugerencias si están disponibles
      if (data.suggestions) {
        setGameState(prev => ({ ...prev, suggestions: data.suggestions || [] }))
      }

      setMessages(prevMessages => [...prevMessages, assistantMessage])
      generateImage(messageId, data.imagePrompt)
    } catch (error) {
      console.error('Error generating story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const evaluateStats = async (narrative: string, userAction: string): Promise<StatChanges> => {
    try {
      const response = await fetch('/api/evaluate-stats', {
        method: 'POST',
        body: JSON.stringify({ narrative, userAction })
      });
      
      if (!response.ok) throw new Error('Failed to evaluate stats');
      return await response.json();
    } catch (error) {
      return { health: 0, hunger: -5, thirst: -5, energy: -3, sanity: 0 };
    }
  };

  const updateGameStats = (coinsEarned: number, statChanges: StatChanges) => {
    setGameState(prev => {
      const newStats = {
        ...prev,
        coins: prev.coins + coinsEarned,
        health: Math.max(0, Math.min(prev.maxHealth, prev.health + (statChanges.health || 0))),
        hunger: Math.max(0, Math.min(prev.maxHunger, prev.hunger + (statChanges.hunger || 0))),
        thirst: Math.max(0, Math.min(prev.maxThirst, prev.thirst + (statChanges.thirst || 0))),
        energy: Math.max(0, Math.min(prev.maxEnergy, prev.energy + (statChanges.energy || 0))),
        sanity: Math.max(0, Math.min(prev.maxSanity, prev.sanity + (statChanges.sanity || 0)))
      };
      
      // Verificar condiciones de game over
      if (newStats.health <= 0) {
        newStats.isGameOver = true;
        newStats.health = 0; // Asegurar que no sea negativo
      } else if ((newStats.hunger <= 0 && newStats.health <= 30) || (newStats.thirst <= 0 && newStats.health <= 25)) {
        newStats.isGameOver = true;
        newStats.health = 0;
      }
      
      return newStats;
    });
  };

  const buyItem = (item: ShopItem) => {
    if (gameState.coins >= item.price) {
      setGameState(prev => {
        const newState = {
          ...prev,
          coins: prev.coins - item.price
        };
        
        if (item.consumable) {
          // Aplicar efectos inmediatamente para consumibles
          Object.entries(item.statEffects).forEach(([stat, value]) => {
            if (value && stat in newState) {
              (newState as any)[stat] = Math.min(
                (newState as any)[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`],
                (newState as any)[stat] + value
              );
            }
          });
        } else {
          // Agregar al inventario para items permanentes
          newState.inventory = [...prev.inventory, item];
        }
        
        return newState;
      });
      return true;
    }
    return false;
  };

  const useItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item || !gameState.inventory.find(inv => inv.id === itemId)) return false;
    
    setGameState(prev => {
      const newState = { ...prev };
      
      // Aplicar efectos del item
      Object.entries(item.statEffects).forEach(([stat, value]) => {
        if (value && stat in newState) {
          (newState as any)[stat] = Math.min(
            (newState as any)[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`],
            (newState as any)[stat] + value
          );
        }
      });
      
      // Remover item del inventario si es consumible
      if (item.consumable) {
        const itemIndex = newState.inventory.findIndex(inv => inv.id === itemId);
        if (itemIndex > -1) {
          newState.inventory.splice(itemIndex, 1);
        }
      }
      
      return newState;
    });
    
    return true;
  };

  const restartGame = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setGameState({
      coins: 10,
      inventory: [],
      health: 100,
      hunger: 100,
      thirst: 100,
      energy: 100,
      sanity: 100,
      maxHealth: 100,
      maxHunger: 100,
      maxThirst: 100,
      maxEnergy: 100,
      maxSanity: 100,
      isGameOver: false,
      suggestions: []
    });
    startGame();
  };

  return { messages, input, setInput, isLoading, gameState, startGame, handleSubmit, handleInputChange, buyItem, useItem, restartGame }
}