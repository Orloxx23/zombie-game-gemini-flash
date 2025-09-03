import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import type { CreativityCheckRequest, CreativityCheckResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory }: CreativityCheckRequest = await request.json();

    const historyText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `Evalúa la creatividad de esta acción del jugador en un juego de supervivencia zombie:

Historial: ${historyText}

Acción del jugador: "${userMessage}"

Evalúa si la acción es:
- Creativa/original (15-25 monedas)
- Inteligente/estratégica (8-15 monedas) 
- Básica pero válida (3-8 monedas)
- Muy simple (1-3 monedas)

Responde SOLO en este formato JSON:
{
  "isCreative": true/false,
  "coinsEarned": número,
  "reason": "breve explicación"
}`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt
    });
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const creativityResult: CreativityCheckResponse = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(creativityResult);
  } catch (error) {
    console.error('Error checking creativity:', error);
    return NextResponse.json({ 
      isCreative: false, 
      coinsEarned: 1, 
      reason: 'Error evaluando creatividad' 
    });
  }
}