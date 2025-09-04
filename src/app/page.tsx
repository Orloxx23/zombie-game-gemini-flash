"use client";

import { useState, useEffect } from "react";
import React from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/conversation";
import { GameInput } from "./componentes/game-input";
import { GameLoader } from "./componentes/game-loader";
import { GameMessage } from "./componentes/game-message";
import { GameShop } from "./componentes/game-shop";
import { GameStats } from "./componentes/game-stats";
import { useZombieGame } from "./hooks/use-zombie-game";
import { useApiKey } from "./hooks/use-api-key";
import { ApiKeyForm } from "./componentes/api-key-form";
import GameBackground from "./componentes/game-background";
import GameSuggestions from "./componentes/game-suggestions";

export default function Home() {
  const { hasApiKey, isLoading: apiKeyLoading, setApiKey } = useApiKey();
  const {
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
  } = useZombieGame();
  const [showShop, setShowShop] = useState(false);

  // Iniciar juego automáticamente si hay API key y no hay mensajes
  useEffect(() => {
    if (hasApiKey && messages.length === 0 && !isLoading) {
      startGame();
    }
  }, [hasApiKey, messages.length, isLoading]);

  const handleApiKeySubmit = async (apiKey: string) => {
    const success = await setApiKey(apiKey);
    if (success) {
      // Iniciar el juego inmediatamente después de configurar la API key
      startGame();
    }
  };

  if (apiKeyLoading) {
    return (
      <div className="font-sans h-screen mx-auto overflow-hidden relative">
        <GameBackground image={messages[messages.length - 1]?.image} />
        <div className="flex flex-col h-full items-center justify-center">
          <img src="/logo.webp" className="size-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans h-screen mx-auto overflow-hidden ">
      <GameBackground image={messages[messages.length - 1]?.image} />
      <div className="flex flex-col h-full">
        {!hasApiKey && (
          <div className="w-full h-screen absolute top-0 left-0 z-20 flex flex-col pt-[5%] items-center">
            <ApiKeyForm onApiKeySubmit={handleApiKeySubmit} />
          </div>
        )}

        <Conversation>
          <ConversationContent className="max-w-xl mx-auto pb-[21rem] lg:pb-[15rem]">
            {messages.map((message) => (
              <GameMessage key={message.id} message={message} />
            ))}
            {isLoading && <GameLoader />}
          </ConversationContent>

          <ConversationScrollButton className="mb-[20rem] lg:mb-[14rem] bg-background/50 backdrop-blur-sm" />

          <div className="absolute bottom-0 w-full px-3">
            {!gameState.isGameOver && (
              <div className="max-w-2xl w-full mx-auto mb-2">
                <GameSuggestions
                  suggestions={gameState.suggestions}
                  onSuggestionClick={(suggestion) => {
                    setInput(suggestion);
                    setTimeout(() => {
                      const form = document.querySelector("#game-input");
                      if (form) {
                        const event = new Event("submit", {
                          bubbles: true,
                          cancelable: true,
                        });
                        form.dispatchEvent(event);
                      }
                    }, 100);
                  }}
                />
              </div>
            )}

            <div className="max-w-2xl w-full mx-auto mb-2">
              <GameStats gameState={gameState} onRestart={restartGame} />
            </div>

            <div className="max-w-2xl w-full mx-auto pb-4 relative">
              <GameInput
                input={input}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onOpenShop={() => setShowShop(true)}
                isLoading={isLoading || gameState.isGameOver}
                gameState={gameState}
              />
            </div>
          </div>
        </Conversation>
      </div>

      {showShop && (
        <GameShop
          gameState={gameState}
          onBuyItem={buyItem}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  );
}
