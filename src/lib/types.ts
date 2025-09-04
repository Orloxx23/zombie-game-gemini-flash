export interface GameMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: GeneratedImage;
  imageLoading?: boolean;
  coinsEarned?: number;
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

export interface GameState {
  coins: number;
  inventory: ShopItem[];
  health: number;
  hunger: number;
  thirst: number;
  energy: number;
  sanity: number;
  maxHealth: number;
  maxHunger: number;
  maxThirst: number;
  maxEnergy: number;
  maxSanity: number;
  isGameOver: boolean;
  suggestions: string[];
}

export interface GeneratedImage {
  base64Data: string;
  mediaType: string;
  uint8ArrayData?: Uint8Array;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string
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
  coinsEarned?: number;
  statChanges?: StatChanges;
  suggestions?: string[];
}

export interface StatChanges {
  health?: number;
  hunger?: number;
  thirst?: number;
  energy?: number;
  sanity?: number;
}

export interface CreativityCheckRequest {
  userMessage: string;
  conversationHistory: ConversationMessage[];
}

export interface CreativityCheckResponse {
  isCreative: boolean;
  coinsEarned: number;
  reason: string;
}