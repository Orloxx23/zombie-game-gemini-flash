"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
import { GameInput } from "./componentes/game-input";
import { GameMessage } from "./componentes/game-message";
import { GameShop } from "./componentes/game-shop";
import { GameStats } from "./componentes/game-stats";
import { GameObjective } from "./componentes/game-objective";
import { GameEnding } from "./componentes/game-ending";
import { VirtualConversation } from "./componentes/virtual-conversation";
import { useZombieGame } from "./hooks/use-zombie-game";
import GameBackground from "./componentes/game-background";
import GameSuggestions from "./componentes/game-suggestions";
import { useVisibleMessage } from "./hooks/use-visible-message";
import type { GameMessage as GameMessageType } from "@/lib/types";

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

  const renderMessage = useCallback(
    (message: GameMessageType) => (
      <GameMessage message={message} onObserve={observeMessage} />
    ),
    [observeMessage]
  );

  const handleSuggestionClick = (suggestion: string) => {
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
  };

  return (
    <div className="font-sans h-screen mx-auto overflow-hidden">
      <GameBackground
        image={visibleMessage?.image || messages[messages.length - 1]?.image}
      />

      <div className="flex flex-col lg:flex-row h-full relative">
        {/* Chat area */}
        <div className="flex-1 relative flex flex-col overflow-hidden lg:order-2">
          <VirtualConversation
            messages={messages}
            renderMessage={renderMessage}
            scrollAreaClassName="pb-[27rem] lg:pb-8"
            scrollButtonClassName="bottom-[31rem] lg:bottom-8"
          />
        </div>

        {/* Side / bottom panel */}
        <aside
          className="
            absolute bottom-0 left-0 right-0 px-3 z-10
            lg:static lg:order-1 lg:px-0 lg:w-[26rem] lg:flex-shrink-0
            lg:h-full lg:bg-background/40 lg:backdrop-blur-md lg:border-r lg:border-border/40
          "
        >
          {gameState.isGameOver ? (
            <div className="max-w-2xl w-full mx-auto mb-4 lg:m-4 lg:max-w-none">
              <GameEnding gameState={gameState} onRestart={restartGame} />
            </div>
          ) : (
            <div className="lg:flex lg:flex-col lg:h-full lg:p-4 lg:gap-3 lg:overflow-y-auto">
              <div className="hidden lg:block lg:space-y-2">
                <GameObjective gameState={gameState} isLoading={isLoading} />
              </div>

              <div className="max-w-2xl w-full mx-auto mb-2 lg:mx-0 lg:mb-0 lg:max-w-none lg:mt-auto">
                <GameSuggestions
                  suggestions={gameState.suggestions}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>

              {messages.length > 0 && (
                <div className="max-w-2xl w-full mx-auto mb-2 space-y-2 lg:mx-0 lg:max-w-none">
                  <div className="lg:hidden">
                    <GameObjective gameState={gameState} isLoading={isLoading} />
                  </div>
                  <GameStats gameState={gameState} />
                </div>
              )}

              <div className="max-w-2xl w-full mx-auto pb-4 relative lg:mx-0 lg:max-w-none lg:pb-0">
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
          )}
        </aside>
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
