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
    <PromptInput onSubmit={onSubmit} className="relative">
      <PromptInputTextarea
        placeholder={UI_MESSAGES.PLACEHOLDERS.INPUT}
        value={input}
        onChange={onInputChange}
        disabled={isLoading}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-md">
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
