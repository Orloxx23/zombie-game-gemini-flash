export interface GameMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: GeneratedImage;
  imageLoading?: boolean;
  coinsEarned?: number;
  newDiscoveries?: string[];
  actAdvanced?: boolean;
  statChanges?: StatChanges;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  effect: string;
  statEffects: StatChanges;
  consumable: boolean;
}

export interface CharacterProfile {
  name: string;
  appearance: string;
  personality: string;
  background: string;
  secret: string;
  kink: string;
  dealbreaker: string;
  setting: string;
}

export interface SceneObjective {
  act: 1 | 2 | 3;
  title: string;
  hint: string;
}

export type EndingType =
  | "ignored"
  | "one_night"
  | "romance"
  | "intense"
  | "objective_completed";

export interface GameState {
  coins: number;
  inventory: ShopItem[];
  attraction: number;
  desire: number;
  tension: number;
  stamina: number;
  chemistry: number;
  maxAttraction: number;
  maxDesire: number;
  maxTension: number;
  maxStamina: number;
  maxChemistry: number;
  isGameOver: boolean;
  suggestions: string[];
  character: CharacterProfile | null;
  objective: SceneObjective | null;
  discoveries: string[];
  ending: EndingType | null;
}

export interface GeneratedImage {
  base64Data: string;
  mediaType: string;
  uint8ArrayData?: Uint8Array;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateStoryRequest {
  userMessage: string;
  conversationHistory: ConversationMessage[];
  isStart: boolean;
  playerStats?: GameState;
}

export interface GenerateImageRequest {
  imagePrompt: string;
}

export interface GenerateStoryResponse {
  narrative: string;
  imagePrompt: string;
  coinsEarned: number;
  statChanges: StatChanges;
  suggestions: string[];
  character?: CharacterProfile;
  objective?: SceneObjective;
  newDiscoveries?: string[];
  ending?: EndingType | null;
}

export interface StatChanges {
  attraction?: number;
  desire?: number;
  tension?: number;
  stamina?: number;
  chemistry?: number;
}
