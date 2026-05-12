import type { StoreId } from "@/types";

export type StoreConfig = {
  id: StoreId;
  name: string;
  keywords: string[];
};

export const stores: StoreConfig[] = [
  {
    id: "costco",
    name: "Costco",
    keywords: ["bulk", "eggs", "milk", "chicken", "beef", "salmon", "berries"],
  },
  {
    id: "walmart",
    name: "Walmart",
    keywords: ["pantry", "cereal", "snack", "frozen", "sauce", "pasta"],
  },
  {
    id: "target",
    name: "Target",
    keywords: ["coffee", "tea", "yogurt", "bread", "household"],
  },
  {
    id: "hmart99",
    name: "99 Ranch",
    keywords: ["rice", "noodle", "tofu", "bok choy", "soy sauce", "dumpling"],
  },
  {
    id: "other",
    name: "Other",
    keywords: [],
  },
];

export function getStoreName(storeId: StoreId) {
  return stores.find((store) => store.id === storeId)?.name ?? "Other";
}

export function suggestStoreForItem(itemName: string): StoreId {
  const normalizedName = itemName.toLowerCase();

  for (const store of stores) {
    if (store.id === "other") {
      continue;
    }

    const hasKeyword = store.keywords.some((keyword) =>
      normalizedName.includes(keyword),
    );

    if (hasKeyword) {
      return store.id;
    }
  }

  return "other";
}
