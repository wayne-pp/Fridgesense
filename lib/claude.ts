import Anthropic from "@anthropic-ai/sdk";

import type { IdentifyResponse } from "@/types";

export type SupportedImageMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

type IdentifyFoodInput = {
  base64Image: string;
  mediaType: SupportedImageMediaType;
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const identifyPrompt = `
You are helping with FridgeSense, a personal AI kitchen assistant.

Look at this fridge photo and identify visible food ingredients.
Return only valid JSON with this shape:
{
  "items": [
    {
      "name": "中文或常用名称",
      "nameEn": "English name if useful",
      "category": "protein | veggie | fruit | dairy | pantry | other",
      "quantity": "full | half | low",
      "confidence": 0.9,
      "note": "short note if useful"
    }
  ],
  "summary": "one short sentence"
}

Rules:
- Only include food or kitchen ingredients you can reasonably see.
- If unsure, set a lower confidence.
- Do not include nutrition, prices, expiration dates, or shopping suggestions.
`.trim();

function extractTextFromResponse(content: Anthropic.Messages.ContentBlock[]) {
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function parseIdentifyResponse(rawText: string): IdentifyResponse {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch?.[0] ?? rawText;
  const parsed = JSON.parse(jsonText) as IdentifyResponse;

  return {
    items: Array.isArray(parsed.items) ? parsed.items : [],
    summary: parsed.summary,
  };
}

export async function identifyFoodFromImage({
  base64Image,
  mediaType,
}: IdentifyFoodInput): Promise<IdentifyResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: identifyPrompt,
          },
        ],
      },
    ],
  });

  const rawText = extractTextFromResponse(message.content);
  return parseIdentifyResponse(rawText);
}
