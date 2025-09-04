export function getApiKey(): string | null {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY || null;
}