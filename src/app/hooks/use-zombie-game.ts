import { useState } from "react";
import type {
  GameMessage,
  GameState,
  ShopItem,
  StatChanges,
  GenerateStoryResponse,
} from "@/lib/types";
import { getItemById } from "@/lib/shop-items";
import { extractNarrative, parseFullResponse } from "@/lib/parse-story";

const INITIAL_STATE: GameState = {
  coins: 10,
  inventory: [],
  attraction: 60,
  desire: 10,
  tension: 20,
  stamina: 100,
  chemistry: 50,
  maxAttraction: 100,
  maxDesire: 100,
  maxTension: 100,
  maxStamina: 100,
  maxChemistry: 100,
  isGameOver: false,
  suggestions: [],
  character: null,
  objective: null,
  discoveries: [],
  ending: null,
};

export function useZombieGame() {
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const streamStory = async (
    body: object,
    messageId: string
  ): Promise<GenerateStoryResponse> => {
    const response = await fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to generate story");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      const narrative = extractNarrative(accumulated);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: narrative } : m
        )
      );
    }

    return parseFullResponse(accumulated);
  };

  const startGame = async () => {
    setIsLoading(true);
    const messageId = crypto.randomUUID();

    setMessages([
      {
        id: messageId,
        role: "assistant",
        content: "",
        imageLoading: true,
      },
    ]);

    try {
      const data = await streamStory({ isStart: true }, messageId);

      setGameState((prev) => ({
        ...prev,
        suggestions: data.suggestions,
        character: data.character ?? prev.character,
        objective: data.objective ?? prev.objective,
      }));

      generateImage(messageId, data.imagePrompt);
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async (messageId: string, imagePrompt: string) => {
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageData = await response.json();

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId
            ? { ...message, image: imageData.image, imageLoading: false }
            : message
        )
      );
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId
            ? { ...message, imageLoading: false }
            : message
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || gameState.isGameOver) return;

    const userMessage: GameMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setIsLoading(true);
    const currentInput = input;
    setInput("");
    setGameState((prev) => ({ ...prev, suggestions: [] }));
    const assistantMessageId = crypto.randomUUID();

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        imageLoading: true,
      },
    ]);

    try {
      const data = await streamStory(
        {
          userMessage: currentInput,
          conversationHistory: messages,
          isStart: false,
          playerStats: gameState,
        },
        assistantMessageId
      );

      const previousAct = gameState.objective?.act ?? 1;
      const newAct = data.objective?.act ?? previousAct;
      const actAdvanced = newAct > previousAct;

      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                coinsEarned: data.coinsEarned,
                newDiscoveries: data.newDiscoveries,
                actAdvanced,
                statChanges: data.statChanges,
              }
            : m
        )
      );

      updateGameStats(data);
      generateImage(assistantMessageId, data.imagePrompt);
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const updateGameStats = (data: GenerateStoryResponse) => {
    setGameState((prev) => {
      const newStats: GameState = {
        ...prev,
        coins: prev.coins + (data.coinsEarned || 0),
        attraction: clamp(
          prev.attraction + (data.statChanges.attraction || 0),
          prev.maxAttraction
        ),
        desire: clamp(
          prev.desire + (data.statChanges.desire || 0),
          prev.maxDesire
        ),
        tension: clamp(
          prev.tension + (data.statChanges.tension || 0),
          prev.maxTension
        ),
        stamina: clamp(
          prev.stamina + (data.statChanges.stamina || 0),
          prev.maxStamina
        ),
        chemistry: clamp(
          prev.chemistry + (data.statChanges.chemistry || 0),
          prev.maxChemistry
        ),
        suggestions: data.suggestions,
        objective: data.objective ?? prev.objective,
        discoveries: data.newDiscoveries
          ? Array.from(new Set([...prev.discoveries, ...data.newDiscoveries]))
          : prev.discoveries,
        ending: data.ending ?? prev.ending,
      };

      if (newStats.attraction <= 0) {
        newStats.isGameOver = true;
        newStats.attraction = 0;
        newStats.ending = newStats.ending ?? "ignored";
      }

      if (data.ending) {
        newStats.isGameOver = true;
      }

      return newStats;
    });
  };

  const buyItem = (item: ShopItem) => {
    if (gameState.coins >= item.price) {
      setGameState((prev) => {
        const newState: GameState = {
          ...prev,
          coins: prev.coins - item.price,
        };

        if (item.consumable) {
          Object.entries(item.statEffects).forEach(([stat, value]) => {
            if (value && stat in newState) {
              const key = stat as keyof StatChanges;
              const maxKey = `max${
                key.charAt(0).toUpperCase() + key.slice(1)
              }` as keyof GameState;
              (newState[key] as number) = Math.min(
                newState[maxKey] as number,
                (newState[key] as number) + value
              );
            }
          });
        } else {
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
    if (!item || !gameState.inventory.find((inv) => inv.id === itemId))
      return false;

    setGameState((prev) => {
      const newState: GameState = { ...prev };

      Object.entries(item.statEffects).forEach(([stat, value]) => {
        if (value && stat in newState) {
          const key = stat as keyof StatChanges;
          const maxKey = `max${
            key.charAt(0).toUpperCase() + key.slice(1)
          }` as keyof GameState;
          (newState[key] as number) = Math.min(
            newState[maxKey] as number,
            (newState[key] as number) + value
          );
        }
      });

      if (item.consumable) {
        const itemIndex = newState.inventory.findIndex(
          (inv) => inv.id === itemId
        );
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
    setInput("");
    setIsLoading(false);
    setGameState(INITIAL_STATE);
    startGame();
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    gameState,
    startGame,
    handleSubmit,
    handleInputChange,
    buyItem,
    useItem,
    restartGame,
  };
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}
