"use client";

import { useState, useEffect } from "react";
import React from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/conversation";
import { GameInput } from "./componentes/game-input";
import { GameMessage } from "./componentes/game-message";
import { GameShop } from "./componentes/game-shop";
import { GameStats } from "./componentes/game-stats";
import { GameObjective } from "./componentes/game-objective";
import { GameEnding } from "./componentes/game-ending";
import { useZombieGame } from "./hooks/use-zombie-game";
import GameBackground from "./componentes/game-background";
import GameSuggestions from "./componentes/game-suggestions";
import { useVisibleMessage } from "./hooks/use-visible-message";

export default function Home() {
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
  const { visibleMessage, observeMessage } = useVisibleMessage(messages);

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      startGame();
    }
  }, []);

  return (
    <div className="font-sans h-screen mx-auto overflow-hidden ">
      <GameBackground image={visibleMessage?.image || messages[messages.length - 1]?.image} />
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent className="max-w-xl mx-auto pb-[26rem] lg:pb-[22rem]">
            {messages.map((message) => (
              <GameMessage
                key={message.id}
                message={message}
                onObserve={observeMessage}
              />
            ))}
          </ConversationContent>

          <ConversationScrollButton className="mb-[26rem] lg:mb-[19rem] bg-background/50 backdrop-blur-sm" />

          <div className="absolute bottom-0 w-full px-3">
            {gameState.isGameOver ? (
              <div className="max-w-2xl w-full mx-auto mb-4">
                <GameEnding gameState={gameState} onRestart={restartGame} />
              </div>
            ) : (
              <>
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

                {messages.length > 0 && (
                  <div className="max-w-2xl w-full mx-auto mb-2 space-y-2">
                    <GameObjective gameState={gameState} />
                    <GameStats gameState={gameState} />
                  </div>
                )}

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
              </>
            )}
          </div>
        </Conversation>
      </div>

      {showShop && (
        <GameShop
          gameState={gameState}
          onBuyItem={buyItem}
          onClose={() => setShowShop(false)}
          isLocked={isLoading}
        />
      )}
    </div>
  );
}
