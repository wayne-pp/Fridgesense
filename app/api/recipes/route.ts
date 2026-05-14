import { recommendRecipesFromFoods } from "@/lib/claude";
import type { FoodItem, RecipePreference } from "@/types";

const recipePreferences: RecipePreference[] = [
  "balanced",
  "fitness",
  "low_calorie",
];

function isRecipePreference(value: unknown): value is RecipePreference {
  return (
    typeof value === "string" &&
    recipePreferences.includes(value as RecipePreference)
  );
}

function isFoodItem(value: unknown): value is FoodItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "quantity" in value &&
    "category" in value
  );
}

function getFriendlyErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "菜谱推荐失败，请稍后再试。";

  if (message.includes("ANTHROPIC_API_KEY")) {
    return "Claude API Key 还没有配置好。";
  }

  if (message.includes("invalid_request_error")) {
    return "Claude 暂时无法处理这次菜谱请求，请换一批库存再试。";
  }

  return message;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      foods?: unknown;
      preference?: unknown;
    };

    const foods = Array.isArray(body.foods) ? body.foods.filter(isFoodItem) : [];
    const preference = isRecipePreference(body.preference)
      ? body.preference
      : "balanced";

    if (foods.length === 0) {
      return Response.json(
        { error: "请先在冰箱库存里保存一些食材。" },
        { status: 400 },
      );
    }

    const result = await recommendRecipesFromFoods({ foods, preference });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: getFriendlyErrorMessage(error) },
      { status: 500 },
    );
  }
}
