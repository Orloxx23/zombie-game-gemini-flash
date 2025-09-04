import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

import { type NextRequest, NextResponse } from 'next/server';

import { GAME_PROMPTS } from '@/lib/prompts'
import { GAME_CONFIG } from '@/lib/consts'
import { GenerateStoryRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory, isStart, playerStats }: GenerateStoryRequest = await request.json();

    let prompt: string = GAME_PROMPTS.INITIAL_STORY;

    if (!isStart) {
      const historyText = conversationHistory.map(
        (message) => `${message.role}: ${message.content}`
      ).join('\n');

      prompt = GAME_PROMPTS.CONTINUE_STORY(historyText, userMessage, playerStats);
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt
    })

    const parts = text.split(GAME_CONFIG.IMAGE.SEPARATOR);
    const narrative = parts[0];
    const remainingText = parts[1] || '';
    
    const imageParts = remainingText.split(GAME_CONFIG.SUGGESTIONS.SEPARATOR);
    const imagePrompt = imageParts[0]?.trim() || '';
    const suggestionsText = imageParts[1]?.trim() || '';
    
    const suggestions = suggestionsText ? suggestionsText.split('|').map(s => s.trim()).filter(s => s) : [];

    return NextResponse.json({ narrative, imagePrompt, suggestions });
    
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: 'Error generating story' }, { status: 500 });
  }
}