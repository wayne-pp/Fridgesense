import Anthropic from "@anthropic-ai/sdk";

import type { FoodItem, RecipePreference, RecipeResponse, IdentifyResponse } from "@/types";

export type SupportedImageMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

type IdentifyFoodInput = {
  base64Image: string;
  mediaType: SupportedImageMediaType;
};

type RecommendRecipesInput = {
  foods: FoodItem[];
  preference: RecipePreference;
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const identifyPrompt = `
你正在帮助 FridgeSense，一个个人 AI 厨房助手。

请查看这张冰箱照片，识别能看见的食材。
只返回合法 JSON，格式如下：
{
  "items": [
    {
      "name": "中文食材名",
      "nameEn": "必要时填写英文名",
      "category": "protein | veggie | fruit | dairy | pantry | other",
      "quantity": "full | half | low",
      "confidence": 0.9,
      "note": "简短中文备注"
    }
  ],
  "summary": "一句中文总结"
}

规则：
- 所有用户可见内容必须是中文，品牌名除外。
- 只包含你能合理看见的食物或厨房食材。
- 排除玩具、装饰品、容器、餐具、包装，以及任何不是食物的物品。
- 如果某个物品不是食物，不要返回它。
- 如果不确定，请降低 confidence。
- 不要包含营养分析、价格、过期提醒或购物建议。
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
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  return {
    items: items.filter((item) => {
      const text = `${item.name} ${item.nameEn ?? ""} ${item.note ?? ""}`
        .toLowerCase()
        .trim();

      return !text.includes("not food");
    }),
    summary: parsed.summary,
  };
}

function getPreferenceLabel(preference: RecipePreference) {
  const labels: Record<RecipePreference, string> = {
    balanced: "均衡家常",
    fitness: "健身高蛋白",
    low_calorie: "低卡清爽",
  };

  return labels[preference];
}

function parseRecipeResponse(rawText: string): RecipeResponse {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch?.[0] ?? rawText;
  const parsed = JSON.parse(jsonText) as RecipeResponse;

  return {
    recipes: Array.isArray(parsed.recipes) ? parsed.recipes.slice(0, 3) : [],
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

export async function recommendRecipesFromFoods({
  foods,
  preference,
}: RecommendRecipesInput): Promise<RecipeResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const foodList = foods
    .map(
      (food) =>
        `- ${food.name}${food.nameEn ? ` / ${food.nameEn}` : ""}（${food.category}，${food.quantity}${food.note ? `，备注：${food.note}` : ""}）`,
    )
    .join("\n");

  const prompt = `
你正在帮助 FridgeSense，一个给单身/留学生使用的 AI 厨房助手。

请根据下面的冰箱库存，推荐 3 道“今晚可以做”的菜。
偏好模式：${getPreferenceLabel(preference)}

库存：
${foodList}

只返回合法 JSON，不要 Markdown，不要解释。格式必须是：
{
  "summary": "一句中文总结",
  "recipes": [
    {
      "title": "中文菜名",
      "description": "一句中文说明，说明为什么适合今晚",
      "ingredients": ["需要的食材，优先使用库存"],
      "usedFoodNames": ["实际用到的库存食材名称"],
      "steps": ["步骤 1", "步骤 2", "步骤 3"],
      "preference": "${preference}"
    }
  ]
}

规则：
- 全部内容必须是中文，品牌或商店名除外。
- 只推荐 3 道菜。
- 优先使用库存里已有的食材。
- 可以补充少量常见调料，但不要生成购物清单。
- 不要做营养分析、卡路里计算、价格比较或过期提醒。
- 步骤要短，适合新手照着做。
`.trim();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1600,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawText = extractTextFromResponse(message.content);
  return parseRecipeResponse(rawText);
}
