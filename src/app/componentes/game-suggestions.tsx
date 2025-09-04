import React from "react";
import { Suggestions, Suggestion } from "@/components/suggestion";

interface GameSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export default function GameSuggestions({ suggestions, onSuggestionClick }: GameSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <Suggestions>
        {suggestions.map((suggestion, index) => (
          <Suggestion
            key={index}
            suggestion={suggestion}
            onClick={onSuggestionClick}
            className="bg-background/50 backdrop-blur-sm"
          />
        ))}
      </Suggestions>
    </div>
  );
}
