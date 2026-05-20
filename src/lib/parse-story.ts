import { GAME_CONFIG } from "@/lib/consts";
import type {
  CharacterProfile,
  EndingType,
  GenerateStoryResponse,
  SceneObjective,
  StatChanges,
} from "@/lib/types";

const NARRATIVE_END_MARKER = `\n${GAME_CONFIG.IMAGE.SEPARATOR.trim()}`;

export function extractNarrative(accumulated: string): string {
  const idx = accumulated.indexOf(NARRATIVE_END_MARKER);
  if (idx === -1) return accumulated;
  return accumulated.slice(0, idx).trim();
}

function getLineValue(text: string, separator: string): string | undefined {
  const idx = text.indexOf(separator);
  if (idx === -1) return undefined;
  const after = text.slice(idx + separator.length);
  const eol = after.indexOf("\n");
  return (eol === -1 ? after : after.slice(0, eol)).trim();
}

function parseStats(raw: string | undefined): StatChanges {
  if (!raw) return {};
  const result: StatChanges = {};
  const pairs = raw.split(",").map((p) => p.trim());

  for (const pair of pairs) {
    const [key, value] = pair.split(":").map((s) => s.trim());
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) continue;
    if (
      key === "attraction" ||
      key === "desire" ||
      key === "tension" ||
      key === "stamina" ||
      key === "chemistry"
    ) {
      result[key] = num;
    }
  }

  return result;
}

function parseCharacter(raw: string | undefined): CharacterProfile | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed &&
      typeof parsed.name === "string"
    ) {
      return parsed as CharacterProfile;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function parseEnding(raw: string | undefined): EndingType | null {
  if (!raw || raw.toLowerCase() === GAME_CONFIG.ENDING.NONE) return null;
  const valid: EndingType[] = [
    "ignored",
    "one_night",
    "romance",
    "intense",
    "objective_completed",
  ];
  return valid.includes(raw as EndingType) ? (raw as EndingType) : null;
}

function parseAct(raw: string | undefined): 1 | 2 | 3 {
  const n = parseInt(raw ?? "1", 10);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}

export function parseFullResponse(text: string): GenerateStoryResponse {
  const narrative = extractNarrative(text);

  const imagePrompt = getLineValue(text, GAME_CONFIG.IMAGE.SEPARATOR) ?? "";
  const suggestionsRaw = getLineValue(text, GAME_CONFIG.SUGGESTIONS.SEPARATOR);
  const statsRaw = getLineValue(text, GAME_CONFIG.STATS.SEPARATOR);
  const coinsRaw = getLineValue(text, GAME_CONFIG.COINS.SEPARATOR);
  const actRaw = getLineValue(text, GAME_CONFIG.ACT.SEPARATOR);
  const objectiveRaw = getLineValue(text, GAME_CONFIG.OBJECTIVE.SEPARATOR);
  const discoveriesRaw = getLineValue(
    text,
    GAME_CONFIG.DISCOVERIES.SEPARATOR
  );
  const endingRaw = getLineValue(text, GAME_CONFIG.ENDING.SEPARATOR);
  const characterRaw = getLineValue(text, GAME_CONFIG.CHARACTER.SEPARATOR);

  const suggestions = suggestionsRaw
    ? suggestionsRaw
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  const newDiscoveries =
    discoveriesRaw &&
    discoveriesRaw.toLowerCase() !== "ninguno" &&
    discoveriesRaw !== ""
      ? discoveriesRaw
          .split("|")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];

  const act = parseAct(actRaw);
  const objective: SceneObjective | undefined = objectiveRaw
    ? { act, title: objectiveRaw, hint: "" }
    : undefined;

  return {
    narrative,
    imagePrompt,
    suggestions,
    statChanges: parseStats(statsRaw),
    coinsEarned: parseInt(coinsRaw ?? "0", 10) || 0,
    objective,
    character: parseCharacter(characterRaw),
    newDiscoveries,
    ending: parseEnding(endingRaw),
  };
}
