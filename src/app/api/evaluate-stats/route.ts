import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import type { StatChanges } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { narrative, userAction } = await request.json();

    const prompt = `Eres un sistema experto en evaluar las consecuencias realistas de acciones en un apocalipsis zombie.

Acción del jugador: "${userAction}"
Narrativa resultante: "${narrative}"

Analiza INTELIGENTEMENTE el contexto completo y determina los cambios en estadísticas (rango: -100 a +50):

🧠 ANÁLISIS CONTEXTUAL:
- Lee entre líneas: ¿qué implica realmente esta situación?
- Evalúa el tono de la narrativa: ¿es desesperanzadora, violenta, tranquila?
- Considera las consecuencias lógicas de las acciones del jugador
- Detecta automáticamente situaciones de vida o muerte

⚰️ SITUACIONES MORTALES (aplica daño masivo):
- Cualquier mención de rendición, desesperanza o "no hay escape"
- Ataques directos de zombies, mordidas, ser devorado
- Explosiones, caídas mortales, accidentes graves
- Situaciones donde la narrativa implica muerte inminente

🩸 DAÑO MODERADO A SEVERO:
- Heridas, cortes, golpes descritos en la narrativa
- Estrés extremo, pánico, terror psicológico
- Agotamiento físico por actividades intensas
- Presenciar violencia o muerte

🚶 DESGASTE NATURAL:
- Toda acción consume hambre/sed gradualmente (-3 a -10)
- Actividad física reduce energía (-5 a -20)
- Situaciones estresantes afectan cordura (-5 a -15)

✅ EFECTOS POSITIVOS:
- Encontrar seguridad, comida, agua, descanso
- Resolver problemas exitosamente
- Momentos de esperanza o logros

SÉ INTELIGENTE Y REALISTA: No uses reglas fijas, analiza cada situación única.

Responde SOLO en formato JSON:
{
  "health": número,
  "hunger": número,
  "thirst": número,
  "energy": número,
  "sanity": número
}`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt
    });
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const statChanges: StatChanges = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(statChanges);
  } catch (error) {
    console.error('Error evaluating stats:', error);
    return NextResponse.json({ 
      health: -10, 
      hunger: -5, 
      thirst: -5, 
      energy: -5, 
      sanity: -3 
    });
  }
}