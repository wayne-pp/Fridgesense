export type FoodQuantity = "full" | "half" | "low";

export type FoodCategory =
  | "protein"
  | "veggie"
  | "fruit"
  | "dairy"
  | "pantry"
  | "other";

export type StoreId = "costco" | "walmart" | "target" | "hmart99" | "other";

export type RecipePreference = "balanced" | "fitness" | "low_calorie";

export type FoodItem = {
  id: string;
  name: string;
  nameEn?: string;
  quantity: FoodQuantity;
  category: FoodCategory;
  note?: string;
  createdAt: number;
  updatedAt: number;
};

export type IdentifiedFoodItem = {
  name: string;
  nameEn?: string;
  category: FoodCategory;
  quantity?: FoodQuantity;
  confidence?: number;
  note?: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  nameEn?: string;
  storeId: StoreId;
  checked: boolean;
  sourceFoodId?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
};

export type RecipeSuggestion = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  usedFoodNames?: string[];
  steps?: string[];
  preference?: RecipePreference;
  createdAt: number;
  updatedAt: number;
};

export type IdentifyResponse = {
  items: IdentifiedFoodItem[];
  summary?: string;
};

export type RecipeResponse = {
  recipes: Omit<RecipeSuggestion, "id" | "createdAt" | "updatedAt">[];
  summary?: string;
};
