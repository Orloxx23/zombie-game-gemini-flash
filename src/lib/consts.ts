export const UI_MESSAGES = {
  LOADING: {
    STORY: "Escribiendo la escena...",
    IMAGE: "Generando imagen...",
  },
  ERROR: {
    STORY_GENERATION: "Error al generar la escena",
    IMAGE_GENERATION: "Error al generar la imagen",
    MISSING_PROMPT: "Falta el prompt para generar la escena",
  },
  PLACEHOLDERS: {
    INPUT: "¿Qué le dices? ¿Cómo reaccionas? ¿Qué haces ahora?",
  },
  ENDINGS: {
    ignored: {
      title: "Te ignoró",
      icon: "💨",
      description: "Perdió interés y se fue.",
    },
    one_night: {
      title: "Una noche y nada más",
      icon: "🌙",
      description:
        "Tuvieron su momento, pero a la mañana siguiente cada quien por su lado.",
    },
    romance: {
      title: "Algo más que una noche",
      icon: "❤️",
      description: "Construyeron una conexión real. Esto puede ser el inicio.",
    },
    intense: {
      title: "Una experiencia memorable",
      icon: "🔥",
      description:
        "Cruzaron territorios nuevos. Ninguno de los dos lo olvidará.",
    },
    objective_completed: {
      title: "Misión cumplida",
      icon: "🎯",
      description: "Lograste exactamente lo que te propusiste.",
    },
  } as const,
};

export const GAME_CONFIG = {
  IMAGE: {
    DEFAULT_PROMPT:
      "an attractive adult character looking at the viewer, intimate setting, soft lighting, suggestive atmosphere",
    SEPARATOR: "IMAGEN: ",
  },
  SUGGESTIONS: {
    SEPARATOR: "SUGERENCIAS: ",
  },
  STATS: {
    SEPARATOR: "STATS: ",
  },
  COINS: {
    SEPARATOR: "MONEDAS: ",
  },
  ACT: {
    SEPARATOR: "ACTO: ",
  },
  OBJECTIVE: {
    SEPARATOR: "OBJETIVO: ",
  },
  DISCOVERIES: {
    SEPARATOR: "DESCUBRIMIENTOS: ",
  },
  ENDING: {
    SEPARATOR: "FIN: ",
    NONE: "ninguno",
  },
  CHARACTER: {
    SEPARATOR: "PERSONAJE: ",
  },
  META_DELIMITER: "---META---",
  PROGRESSION: {
    NSFW_DESIRE_THRESHOLD: 60,
  },
};
