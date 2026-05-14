"use client";

import Link from "next/link";
import { useState } from "react";

import {
  createId,
  getFoodItems,
  getShoppingItems,
  saveFoodItems,
  saveShoppingItems,
} from "@/lib/storage";
import { suggestStoreForItem } from "@/lib/stores";
import type { FoodItem, FoodQuantity, ShoppingItem } from "@/types";

const quantityOptions: FoodQuantity[] = ["full", "half", "low"];

export default function FridgeInventory() {
  const [items, setItems] = useState<FoodItem[]>(() => getFoodItems());
  const [shoppingMessage, setShoppingMessage] = useState<string | null>(null);

  function updateItems(nextItems: FoodItem[]) {
    setItems(nextItems);
    saveFoodItems(nextItems);
  }

  function updateQuantity(
    itemId: string,
    quantity: FoodQuantity,
    updatedAt: number,
  ) {
    updateItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity, updatedAt } : item,
      ),
    );
    setShoppingMessage(null);
  }

  function deleteItem(itemId: string) {
    updateItems(items.filter((item) => item.id !== itemId));
    setShoppingMessage(null);
  }

  function generateShoppingList(createdAt: number) {
    const lowItems = items.filter((item) => item.quantity === "low");
    const existingShoppingItems = getShoppingItems();
    const existingSourceIds = new Set(
      existingShoppingItems
        .map((item) => item.sourceFoodId)
        .filter((sourceFoodId): sourceFoodId is string => Boolean(sourceFoodId)),
    );
    const newShoppingItems: ShoppingItem[] = lowItems
      .filter((item) => !existingSourceIds.has(item.id))
      .map((item) => ({
        id: createId(),
        name: item.name,
        nameEn: item.nameEn,
        storeId: suggestStoreForItem(`${item.name} ${item.nameEn ?? ""}`),
        checked: false,
        sourceFoodId: item.id,
        note: item.note,
        createdAt,
        updatedAt: createdAt,
      }));

    if (lowItems.length === 0) {
      setShoppingMessage("No low items yet. Mark ingredients as low first.");
      return;
    }

    if (newShoppingItems.length === 0) {
      setShoppingMessage("Your low items are already on the shopping list.");
      return;
    }

    saveShoppingItems([...newShoppingItems, ...existingShoppingItems]);
    setShoppingMessage(
      `Added ${newShoppingItems.length} item${newShoppingItems.length === 1 ? "" : "s"} to your shopping list.`,
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-white/80 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/30">
        <p className="text-sm text-emerald-700 dark:text-emerald-200">
          Your fridge is empty. Upload a fridge photo on the home page, then
          save the identified ingredients here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
              Inventory actions
            </h2>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
              Low items become your next shopping list.
            </p>
          </div>
          <button
            type="button"
            onClick={() => generateShoppingList(new Date().getTime())}
            className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Generate shopping list
          </button>
        </div>
        {shoppingMessage ? (
          <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            {shoppingMessage}{" "}
            <Link href="/shopping" className="font-semibold underline">
              View shopping list
            </Link>
          </p>
        ) : null}
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
                  {item.name}
                  {item.nameEn ? (
                    <span className="font-normal text-emerald-600 dark:text-emerald-300">
                      {" "}
                      / {item.nameEn}
                    </span>
                  ) : null}
                </h2>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
                  {item.category} · {item.quantity}
                </p>
                {item.note ? (
                  <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
                    {item.note}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {quantityOptions.map((quantity) => (
                <button
                  key={quantity}
                  type="button"
                  onClick={() =>
                    updateQuantity(item.id, quantity, new Date().getTime())
                  }
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                    item.quantity === quantity
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900"
                  }`}
                >
                  {quantity}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
