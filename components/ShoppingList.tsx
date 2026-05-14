"use client";

import { useState } from "react";

import { getShoppingItems, saveShoppingItems } from "@/lib/storage";
import { getStoreName, stores } from "@/lib/stores";
import type { ShoppingItem, StoreId } from "@/types";

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(() => getShoppingItems());

  function updateItems(nextItems: ShoppingItem[]) {
    setItems(nextItems);
    saveShoppingItems(nextItems);
  }

  function toggleItem(itemId: string, updatedAt: number) {
    updateItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, checked: !item.checked, updatedAt }
          : item,
      ),
    );
  }

  function clearPurchased() {
    updateItems(items.filter((item) => !item.checked));
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-white/80 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/30">
        <p className="text-sm text-emerald-700 dark:text-emerald-200">
          Your shopping list is empty. Mark fridge items as low, then generate a
          shopping list from the fridge page.
        </p>
      </div>
    );
  }

  const itemsByStore = stores.map((store) => ({
    store,
    items: items.filter((item) => item.storeId === store.id),
  }));
  const purchasedCount = items.filter((item) => item.checked).length;

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-emerald-700 dark:text-emerald-200">
            {purchasedCount} of {items.length} purchased
          </p>
          <button
            type="button"
            onClick={clearPurchased}
            disabled={purchasedCount === 0}
            className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900"
          >
            Clear purchased
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {itemsByStore.map(({ store, items: storeItems }) =>
          storeItems.length > 0 ? (
            <section
              key={store.id}
              className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30"
            >
              <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
                {getStoreName(store.id as StoreId)}
              </h2>
              <ul className="mt-3 space-y-2">
                {storeItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id, new Date().getTime())}
                      className="mt-1 h-4 w-4 accent-emerald-600"
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          item.checked
                            ? "text-emerald-500 line-through dark:text-emerald-500"
                            : "text-emerald-900 dark:text-emerald-50"
                        }`}
                      >
                        {item.name}
                        {item.nameEn ? (
                          <span className="font-normal text-emerald-600 dark:text-emerald-300">
                            {" "}
                            / {item.nameEn}
                          </span>
                        ) : null}
                      </p>
                      {item.note ? (
                        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
      </div>
    </div>
  );
}
