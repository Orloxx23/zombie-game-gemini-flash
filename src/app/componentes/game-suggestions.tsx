import React from "react";
import { Suggestion } from "@/components/suggestion";

interface GameSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export default function GameSuggestions({
  suggestions,
  onSuggestionClick,
}: GameSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 lg:mt-0">
      <div
        className="
          flex flex-row gap-2 overflow-x-auto whitespace-nowrap
          lg:flex-col lg:items-stretch lg:overflow-x-visible lg:whitespace-normal
        "
      >
        {suggestions.map((suggestion, index) => (
          <Suggestion
            key={index}
            suggestion={suggestion}
            onClick={onSuggestionClick}
            className="
              bg-background/50 backdrop-blur-sm shrink-0
              lg:shrink lg:w-full lg:h-auto lg:min-h-10 lg:rounded-lg lg:justify-start lg:text-left lg:whitespace-normal lg:leading-snug lg:py-2.5 lg:px-3
            "
          />
        ))}
      </div>
    </div>
  );
}

