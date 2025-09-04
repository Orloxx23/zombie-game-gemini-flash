import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
} from "@/components/prompt-input";
import { UI_MESSAGES } from "@/lib/consts";
import type { GameState } from "@/lib/types";

interface GameInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenShop: () => void;
  isLoading: boolean;
  gameState: GameState;
}

export function GameInput({
  input,
  onInputChange,
  onSubmit,
  onOpenShop,
  isLoading,
  gameState,
}: GameInputProps) {
  const inputTrimmed = input.trim();
  const inputSubmitIsDisabled = isLoading || inputTrimmed === "";

  return (
    <PromptInput
      id="game-input"
      onSubmit={onSubmit}
      className="relative bg-background/50 backdrop-blur-sm"
    >
      <PromptInputTextarea
        placeholder={UI_MESSAGES.PLACEHOLDERS.INPUT}
        value={input}
        onChange={onInputChange}
        disabled={isLoading}
      />
      <PromptInputToolbar className="border-t w-full">
        <PromptInputTools>
          <div className="flex items-center ml-0.5 gap-1 px-2 py-1 rounded-md">
            <span>🪙</span>
            <span className="text-sm font-medium">{gameState.coins}</span>
          </div>
          <PromptInputButton
            onClick={onOpenShop}
            disabled={isLoading}
            className="gap-2"
          >
            <span>🏪</span>
            <span className="text-sm">Tienda</span>
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit disabled={inputSubmitIsDisabled} />
      </PromptInputToolbar>
    </PromptInput>
  );
}
