export const GAME_PROMPTS = {
  INITIAL_STORY: `Eres el narrador de un juego de aventura conversacional de supervivencia zombie en estilo pixel art. 

Genera la escena inicial del juego donde el jugador se encuentra en el inicio del apocalipsis zombie. Describe la situación de manera inmersiva y dramática en MÁXIMO 2 párrafos cortos.

Sé conciso y directo. Presenta el escenario actual y termina SIEMPRE invitando al jugador a participar activamente preguntándole qué quiere hacer, adónde quiere ir, o qué acción tomar. Usa frases como "¿Qué decides hacer?", "¿Hacia dónde te diriges?", "¿Cómo reaccionas?" para involucrar al jugador.

IMPORTANTE: Al final, SIEMPRE incluye una línea separada que comience EXACTAMENTE con "IMAGEN:" seguida de una descripción breve en inglés para generar una imagen pixel art de la escena inicial (máximo 50 palabras). Esta línea es OBLIGATORIA.`,

  CONTINUE_STORY: (historyText: string, userMessage: string, playerStats?: any) => {
    const statsContext = playerStats ? `

ESTADO ACTUAL DEL JUGADOR:
- Salud: ${playerStats.health}/${playerStats.maxHealth} ${playerStats.health <= 25 ? '(CRÍTICA)' : playerStats.health <= 50 ? '(BAJA)' : ''}
- Hambre: ${playerStats.hunger}/${playerStats.maxHunger} ${playerStats.hunger <= 20 ? '(HAMBRIENTO)' : ''}
- Sed: ${playerStats.thirst}/${playerStats.maxThirst} ${playerStats.thirst <= 15 ? '(SEDIENTO)' : ''}
- Energía: ${playerStats.energy}/${playerStats.maxEnergy} ${playerStats.energy <= 20 ? '(AGOTADO)' : ''}
- Cordura: ${playerStats.sanity}/${playerStats.maxSanity} ${playerStats.sanity <= 30 ? '(INESTABLE)' : ''}
- Inventario: ${playerStats.inventory.map((item: any) => item.name).join(', ') || 'Vacío'}` : '';
    
    return `Eres el narrador de un juego de aventura conversacional de supervivencia zombie en estilo pixel art.

Historial de la conversación:
${historyText}

El jugador acaba de decir: "${userMessage}"${statsContext}

IMPORTANTE - ADAPTA LA NARRATIVA AL ESTADO DEL JUGADOR:
- Si tiene salud baja: menciona debilidad, heridas, dificultad para moverse
- Si tiene hambre/sed: incluye mareos, debilidad, necesidad urgente de recursos
- Si está agotado: describe cansancio, movimientos lentos, necesidad de descanso
- Si tiene baja cordura: añade alucinaciones, paranoia, miedo irracional
- Si tiene items: permite usarlos de manera creativa en la situación

Continúa la historia basándote en la acción del jugador Y su estado físico/mental. Describe las consecuencias de manera dramática e inmersiva en MÁXIMO 2 párrafos cortos.

Sé conciso y directo. Presenta la nueva situación y termina SIEMPRE invitando al jugador a participar activamente preguntándole qué quiere hacer, adónde quiere ir, qué observa, o qué acción tomar.

IMPORTANTE: Al final, SIEMPRE incluye una línea separada que comience EXACTAMENTE con "IMAGEN:" seguida de una descripción breve en inglés para generar una imagen pixel art de la nueva escena (máximo 50 palabras). Esta línea es OBLIGATORIA.`;
  },

  GENERATE_IMAGE: (description: string) => `Generate a pixel art style image in 16:9 aspect ratio: ${description}. Use 8-bit retro gaming aesthetics with limited color palette, blocky pixelated style, and clear definition. The image should be in landscape format (16:9 ratio).`
};