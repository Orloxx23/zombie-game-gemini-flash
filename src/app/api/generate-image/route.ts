import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

import { type NextRequest, NextResponse } from "next/server";

import { GAME_PROMPTS } from "@/lib/prompts";
import { GAME_CONFIG } from "@/lib/consts";
import { GenerateImageRequest, GenerateStoryRequest } from "@/lib/types";
import { getApiKey } from "@/lib/api-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = getApiKey() || body.apiKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 401 }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const { imagePrompt } = body;

    const prompt = GAME_PROMPTS.GENERATE_IMAGE(imagePrompt);

    const model = google("gemini-2.5-flash-image-preview");

    const { files } = await generateText({
      model,
      prompt,
      providerOptions: {
        google: {
          responseModalities: ["IMAGE"],
        },
      },
    });

    // console.log('Generated images: ', files)

    return NextResponse.json({ image: files[0] || null });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Error generating story" },
      { status: 500 }
    );
  }
}
