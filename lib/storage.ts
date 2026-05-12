import type { FoodItem, RecipeSuggestion, ShoppingItem } from "@/types";

const storageKeys = {
  foods: "fridgesense:foods",
  shoppingItems: "fridgesense:shopping-items",
  recipes: "fridgesense:recipes",
} as const;

type StorageKey = keyof typeof storageKeys;

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readItems<T>(key: StorageKey): T[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(storageKeys[key]);

  if (!rawValue) {
    return [];
  }

  try {
    return JSON.parse(rawValue) as T[];
  } catch {
    return [];
  }
}

function writeItems<T>(key: StorageKey, items: T[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(storageKeys[key], JSON.stringify(items));
}

export function getFoodItems() {
  return readItems<FoodItem>("foods");
}

export function saveFoodItems(items: FoodItem[]) {
  writeItems("foods", items);
}

export function getShoppingItems() {
  return readItems<ShoppingItem>("shoppingItems");
}

export function saveShoppingItems(items: ShoppingItem[]) {
  writeItems("shoppingItems", items);
}

export function getRecipeSuggestions() {
  return readItems<RecipeSuggestion>("recipes");
}

export function saveRecipeSuggestions(items: RecipeSuggestion[]) {
  writeItems("recipes", items);
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
