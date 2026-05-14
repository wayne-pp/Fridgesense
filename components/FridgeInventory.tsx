"use client";

import { useState } from "react";

import { getFoodItems, saveFoodItems } from "@/lib/storage";
import type { FoodItem } from "@/types";

export default function FridgeInventory() {
  const [items, setItems] = useState<FoodItem[]>(() => getFoodItems());

  function updateItems(nextItems: FoodItem[]) {
    setItems(nextItems);
    saveFoodItems(nextItems);
  }

  function markLow(itemId: string, updatedAt: number) {
    updateItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: "low", updatedAt }
          : item,
      ),
    );
  }

  function deleteItem(itemId: string) {
    updateItems(items.filter((item) => item.id !== itemId));
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
    <ul className="mt-8 space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => markLow(item.id, new Date().getTime())}
                disabled={item.quantity === "low"}
                className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-800"
              >
                Mark low
              </button>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
