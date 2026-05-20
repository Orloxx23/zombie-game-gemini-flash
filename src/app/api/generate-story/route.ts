import { xai } from "@ai-sdk/xai";
import { streamText } from "ai";

import { type NextRequest } from "next/server";

import { GAME_PROMPTS } from "@/lib/prompts";

interface ConversationMessage {
  role: string;
  content: string;
}

const MODEL = "grok-4-fast";

export async function POST(request: NextRequest) {
  const { userMessage, conversationHistory, isStart, playerStats } =
    await request.json();

  let prompt: string = GAME_PROMPTS.INITIAL_STORY;

  if (!isStart) {
    const historyText = (conversationHistory as ConversationMessage[])
      .map(
        (message: ConversationMessage) =>
          `${message.role}: ${message.content}`
      )
      .join("\n");

    prompt = GAME_PROMPTS.CONTINUE_STORY(historyText, userMessage, playerStats);
  }

  const result = streamText({
    model: xai(MODEL),
    prompt,
  });

  return result.toTextStreamResponse();
}
