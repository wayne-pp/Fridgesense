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
      <div className="mt-8 rounded-2xl border border-amber-200 bg-white/85 p-6 text-center shadow-lg shadow-amber-900/5 dark:border-amber-800 dark:bg-slate-950/45 dark:shadow-black/20">
        <p className="text-sm text-amber-800 dark:text-amber-100">
          购物清单还是空的。请先在冰箱页面把食材标记为快没了，然后生成购物清单。
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
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-lg shadow-amber-900/5 dark:border-amber-800 dark:bg-amber-950/35 dark:shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-800 dark:text-amber-100">
            已购买 {purchasedCount} / {items.length}
          </p>
          <button
            type="button"
            onClick={clearPurchased}
            disabled={purchasedCount === 0}
            className="rounded-lg border border-amber-300 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900"
          >
            清除已购买
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {itemsByStore.map(({ store, items: storeItems }) =>
          storeItems.length > 0 ? (
            <section
              key={store.id}
              className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-lg shadow-amber-900/5 dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/20"
            >
              <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
                {getStoreName(store.id as StoreId)}
              </h2>
              <ul className="mt-3 space-y-2">
                {storeItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/50"
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
