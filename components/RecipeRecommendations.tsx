"use client";

import { useState } from "react";

import {
  createId,
  getFoodItems,
  saveRecipeSuggestions,
} from "@/lib/storage";
import type { RecipePreference, RecipeResponse, RecipeSuggestion } from "@/types";

const preferenceOptions: {
  value: RecipePreference;
  label: string;
  description: string;
}[] = [
  {
    value: "balanced",
    label: "均衡",
    description: "日常晚餐",
  },
  {
    value: "fitness",
    label: "健身",
    description: "高蛋白优先",
  },
  {
    value: "low_calorie",
    label: "低卡",
    description: "清爽少负担",
  },
];

export default function RecipeRecommendations() {
  const [preference, setPreference] = useState<RecipePreference>("balanced");
  const [result, setResult] = useState<RecipeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const foods = getFoodItems();

  async function recommendDinner() {
    setIsLoading(true);
    setError(null);
    setSaveMessage(null);
    setResult(null);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foods,
          preference,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "菜谱推荐失败，请稍后再试。");
      }

      setResult(data as RecipeResponse);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "菜谱推荐失败，请稍后再试。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function saveRecipes(recipes: RecipeResponse["recipes"], createdAt: number) {
    const recipeSuggestions: RecipeSuggestion[] = recipes.map((recipe) => ({
      id: createId(),
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      usedFoodNames: recipe.usedFoodNames,
      steps: recipe.steps,
      preference: recipe.preference ?? preference,
      createdAt,
      updatedAt: createdAt,
    }));

    saveRecipeSuggestions(recipeSuggestions);
    setSaveMessage(`已保存 ${recipeSuggestions.length} 道推荐菜。`);
  }

  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30">
        <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
          选择今晚的方向
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {preferenceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setPreference(option.value);
                setResult(null);
                setSaveMessage(null);
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                preference === option.value
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
              }`}
            >
              <span className="block text-base font-semibold">
                {option.label}
              </span>
              <span
                className={`mt-1 block text-sm ${
                  preference === option.value
                    ? "text-emerald-50"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {option.description}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={recommendDinner}
          disabled={isLoading || foods.length === 0}
          className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:disabled:bg-emerald-800"
        >
          {isLoading ? "正在推荐..." : "推荐今晚吃什么"}
        </button>
        {foods.length === 0 ? (
          <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            还没有库存食材。请先在首页识别照片并保存到冰箱。
          </p>
        ) : (
          <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-200">
            当前会参考 {foods.length} 个库存食材。
          </p>
        )}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/80 p-5 dark:border-emerald-800 dark:bg-emerald-900/30">
          <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
            今晚推荐
          </h2>
          {result.summary ? (
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200">
              {result.summary}
            </p>
          ) : null}
          <div className="mt-4 space-y-4">
            {result.recipes.map((recipe, index) => (
              <article
                key={`${recipe.title}-${index}`}
                className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950"
              >
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
                  {recipe.title}
                </h3>
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200">
                  {recipe.description}
                </p>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    需要食材
                  </p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
                    {recipe.ingredients.join("、")}
                  </p>
                </div>
                {recipe.steps && recipe.steps.length > 0 ? (
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-emerald-700 dark:text-emerald-200">
                    {recipe.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                ) : null}
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={() => saveRecipes(result.recipes, new Date().getTime())}
            className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            保存这次推荐
          </button>
          {saveMessage ? (
            <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
              {saveMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
