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
import type {
  FoodCategory,
  FoodItem,
  FoodQuantity,
  ShoppingItem,
} from "@/types";

const quantityOptions: FoodQuantity[] = ["full", "half", "low"];
const quantityLabels: Record<FoodQuantity, string> = {
  full: "充足",
  half: "一半",
  low: "快没了",
};

const categoryOptions: { value: FoodCategory; label: string }[] = [
  { value: "protein", label: "蛋白质" },
  { value: "veggie", label: "蔬菜" },
  { value: "fruit", label: "水果" },
  { value: "dairy", label: "乳制品" },
  { value: "pantry", label: "主食/常温" },
  { value: "other", label: "其他" },
];

function getCategoryLabel(category: FoodCategory) {
  return (
    categoryOptions.find((option) => option.value === category)?.label ?? "其他"
  );
}

export default function FridgeInventory() {
  const [items, setItems] = useState<FoodItem[]>(() => getFoodItems());
  const [shoppingMessage, setShoppingMessage] = useState<string | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualCategory, setManualCategory] =
    useState<FoodCategory>("veggie");
  const [manualQuantity, setManualQuantity] =
    useState<FoodQuantity>("full");
  const [manualNote, setManualNote] = useState("");

  function updateItems(nextItems: FoodItem[]) {
    setItems(nextItems);
    saveFoodItems(nextItems);
  }

  function addManualItem(createdAt: number) {
    const trimmedName = manualName.trim();

    if (!trimmedName) {
      return;
    }

    const newItem: FoodItem = {
      id: createId(),
      name: trimmedName,
      quantity: manualQuantity,
      category: manualCategory,
      note: manualNote.trim() || undefined,
      createdAt,
      updatedAt: createdAt,
    };

    updateItems([newItem, ...items]);
    setManualName("");
    setManualCategory("veggie");
    setManualQuantity("full");
    setManualNote("");
    setShoppingMessage(null);
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
      setShoppingMessage(
        "还没有快没了的食材。请先把需要补货的食材标记为快没了。",
      );
      return;
    }

    if (newShoppingItems.length === 0) {
      setShoppingMessage("快没了的食材已经在购物清单里了。");
      return;
    }

    saveShoppingItems([...newShoppingItems, ...existingShoppingItems]);
    setShoppingMessage(`已添加 ${newShoppingItems.length} 个食材到购物清单。`);
  }

  return (
    <div className="mt-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addManualItem(new Date().getTime());
        }}
        className="rounded-2xl border border-sky-200 bg-white/85 p-4 shadow-lg shadow-sky-900/5 dark:border-sky-800 dark:bg-slate-950/45 dark:shadow-black/20"
      >
        <h2 className="text-lg font-semibold text-sky-950 dark:text-sky-50">
          手动添加食材
        </h2>
        <div className="mt-4 grid gap-3">
          <label className="text-sm font-medium text-sky-950 dark:text-sky-100">
            食材名称
            <input
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="例如：鸡蛋、青菜、牛奶"
              className="mt-2 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 outline-none focus:border-sky-500 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-50"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-sky-950 dark:text-sky-100">
              分类
              <select
                value={manualCategory}
                onChange={(event) =>
                  setManualCategory(event.target.value as FoodCategory)
                }
                className="mt-2 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 outline-none focus:border-sky-500 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-50"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-sky-950 dark:text-sky-100">
              库存状态
              <select
                value={manualQuantity}
                onChange={(event) =>
                  setManualQuantity(event.target.value as FoodQuantity)
                }
                className="mt-2 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 outline-none focus:border-sky-500 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-50"
              >
                {quantityOptions.map((quantity) => (
                  <option key={quantity} value={quantity}>
                    {quantityLabels[quantity]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-sm font-medium text-sky-950 dark:text-sky-100">
            备注（可选）
            <input
              value={manualNote}
              onChange={(event) => setManualNote(event.target.value)}
              placeholder="例如：已经开封、放在门架"
              className="mt-2 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 outline-none focus:border-sky-500 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-50"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={!manualName.trim()}
          className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:disabled:bg-emerald-800"
        >
          添加到冰箱
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-lg shadow-amber-900/5 dark:border-amber-800 dark:bg-amber-950/35 dark:shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-50">
              库存操作
            </h2>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-100">
              标记为“快没了”的食材会进入下一次购物清单。
            </p>
          </div>
          <button
            type="button"
            onClick={() => generateShoppingList(new Date().getTime())}
            className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            生成购物清单
          </button>
        </div>
        {shoppingMessage ? (
          <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
            {shoppingMessage}{" "}
            <Link href="/shopping" className="font-semibold underline">
              查看购物清单
            </Link>
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-sky-200 bg-white/85 p-6 text-center shadow-lg shadow-sky-900/5 dark:border-sky-800 dark:bg-slate-950/45 dark:shadow-black/20">
          <p className="text-sm text-sky-800 dark:text-sky-100">
            冰箱库存还是空的。可以先从首页识别照片，也可以直接手动添加食材。
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-lg shadow-emerald-900/5 dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/20"
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
                    {getCategoryLabel(item.category)} ·{" "}
                    {quantityLabels[item.quantity]}
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
                  删除
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
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      item.quantity === quantity
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900"
                    }`}
                  >
                    {quantityLabels[quantity]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
