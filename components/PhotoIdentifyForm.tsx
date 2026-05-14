"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createId, getFoodItems, saveFoodItems } from "@/lib/storage";
import type { FoodItem, IdentifyResponse } from "@/types";

export default function PhotoIdentifyForm() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!selectedImage) {
      return null;
    }

    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedImage) {
      setError("Please choose a fridge photo first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveMessage(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to identify ingredients.");
      }

      setResult(data as IdentifyResponse);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to identify ingredients.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-10 w-full max-w-xl text-left">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-emerald-200 bg-white/80 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30"
      >
        <label
          htmlFor="fridge-photo"
          className="block text-sm font-medium text-emerald-900 dark:text-emerald-100"
        >
          Fridge photo
        </label>
        <input
          id="fridge-photo"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          capture="environment"
          onChange={(event) => {
            setSelectedImage(event.target.files?.[0] ?? null);
            setResult(null);
            setError(null);
            setSaveMessage(null);
          }}
          className="mt-3 block w-full cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 text-sm text-emerald-900 file:mr-4 file:border-0 file:bg-emerald-600 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100"
        />

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Selected fridge preview"
            width={800}
            height={450}
            unoptimized
            className="mt-4 max-h-72 w-full rounded-xl object-cover"
          />
        ) : null}

        <button
          type="submit"
          disabled={isLoading || !selectedImage}
          className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:disabled:bg-emerald-800"
        >
          {isLoading ? "Identifying..." : "Identify ingredients"}
        </button>
    </form>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
  ) : null}

      {result ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/80 p-5 dark:border-emerald-800 dark:bg-emerald-900/30">
          <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-50">
            Identified ingredients
          </h2>
          {result.summary ? (
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200">
              {result.summary}
            </p>
          ) : null}
          {result.items.length > 0 ? (
            <>
              <ul className="mt-4 space-y-3">
                {result.items.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                  >
                    <div className="font-medium">
                      {item.name}
                      {item.nameEn ? (
                        <span className="font-normal text-emerald-600 dark:text-emerald-300">
                          {" "}
                          / {item.nameEn}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
                      {item.category}
                      {item.quantity ? ` · ${item.quantity}` : ""}
                      {typeof item.confidence === "number"
                        ? ` · ${Math.round(item.confidence * 100)}%`
                        : ""}
                    </div>
                    {item.note ? (
                      <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200">
                        {item.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const now = Date.now();
                  const existingItems = getFoodItems();
                  const newItems: FoodItem[] = result.items.map((item) => ({
                    id: createId(),
                    name: item.name,
                    nameEn: item.nameEn,
                    quantity: item.quantity ?? "full",
                    category: item.category,
                    note: item.note,
                    createdAt: now,
                    updatedAt: now,
                  }));

                  saveFoodItems([...newItems, ...existingItems]);
                  setSaveMessage(
                    `Saved ${newItems.length} item${newItems.length === 1 ? "" : "s"} to your fridge.`,
                  );
                }}
                className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Save to fridge
              </button>
              {saveMessage ? (
                <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  {saveMessage}{" "}
                  <Link href="/fridge" className="font-semibold underline">
                    View fridge
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-200">
              No ingredients were identified. Try a clearer photo.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
