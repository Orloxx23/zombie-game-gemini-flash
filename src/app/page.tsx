'use client'

import { useState } from 'react';
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/conversation";
import { GameInput } from "./componentes/game-input";
import { GameLoader } from "./componentes/game-loader";
import { GameMessage } from "./componentes/game-message";
import { GameShop } from "./componentes/game-shop";
import { GameStats } from "./componentes/game-stats";
import { useZombieGame } from "./hooks/use-zombie-game";

export default function Home() {
  const { messages, input, isLoading, gameState, startGame, handleSubmit, handleInputChange, buyItem, useItem, restartGame } = useZombieGame()
  const [showShop, setShowShop] = useState(false)

  return (
    <div className="font-sans h-screen mx-auto overflow-hidden ">
      
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent className="max-w-xl mx-auto">
            {
              messages.map(message => (
                <GameMessage key={message.id} message={message} />
              ))
            }
            {isLoading && <GameLoader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="max-w-4xl w-full mx-auto p-4">
          <GameStats gameState={gameState} onRestart={restartGame} />
        </div>
        
        <div className="max-w-2xl w-full mx-auto pb-4">
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
