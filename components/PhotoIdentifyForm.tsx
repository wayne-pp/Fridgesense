"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { createId, getFoodItems, saveFoodItems } from "@/lib/storage";
import type { FoodItem, IdentifyResponse } from "@/types";

const maxClaudeImageBytes = 4.5 * 1024 * 1024;
const maxImageDimension = 1600;

async function loadImage(file: File) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = document.createElement("img");
    image.src = imageUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function getScaledSize(width: number, height: number) {
  const largestSide = Math.max(width, height);

  if (largestSide <= maxImageDimension) {
    return { width, height };
  }

  const scale = maxImageDimension / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

async function compressImageForClaude(file: File) {
  if (file.size <= maxClaudeImageBytes) {
    return { file, wasCompressed: false };
  }

  const image = await loadImage(file);
  const { width, height } = getScaledSize(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare this image. Please try another photo.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.82, 0.72, 0.62, 0.52]) {
    const blob = await canvasToBlob(canvas, quality);

    if (blob && blob.size <= maxClaudeImageBytes) {
      return {
        file: new File([blob], "fridgesense-fridge-photo.jpg", {
          type: "image/jpeg",
        }),
        wasCompressed: true,
      };
    }
  }

  throw new Error(
    "This photo is still too large after compression. Try taking a closer, simpler photo.",
  );
}

export default function PhotoIdentifyForm() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [imageMessage, setImageMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

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

  function handleImageChange(file: File | undefined) {
    setSelectedImage(file ?? null);
    setResult(null);
    setError(null);
    setSaveMessage(null);
    setImageMessage(
      file && file.size > maxClaudeImageBytes
        ? "Large photo selected. FridgeSense will compress it before sending to Claude."
        : null,
    );
  }

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

    try {
      const { file, wasCompressed } = await compressImageForClaude(selectedImage);
      const formData = new FormData();
      formData.append("image", file);

      if (wasCompressed) {
        setImageMessage("Photo compressed for Claude Vision.");
      }

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
        className="rounded-3xl border border-emerald-200 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-emerald-800 dark:bg-emerald-900/30"
      >
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Add a fridge photo
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
            Take a new photo or upload one from your device.
          </p>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          capture="environment"
          onChange={(event) => handleImageChange(event.target.files?.[0])}
          className="hidden"
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(event) => handleImageChange(event.target.files?.[0])}
          className="hidden"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:hover:border-emerald-500 dark:hover:bg-emerald-900"
          >
            <span className="text-2xl" aria-hidden="true">
              📷
            </span>
            <span className="mt-3 block text-base font-semibold text-emerald-900 dark:text-emerald-50">
              Take photo
            </span>
            <span className="mt-1 block text-sm text-emerald-700 dark:text-emerald-300">
              Best on phone
            </span>
          </button>
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="rounded-2xl border border-emerald-200 bg-white p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/40 dark:hover:border-emerald-500 dark:hover:bg-emerald-900"
          >
            <span className="text-2xl" aria-hidden="true">
              🖼️
            </span>
            <span className="mt-3 block text-base font-semibold text-emerald-900 dark:text-emerald-50">
              Upload photo
            </span>
            <span className="mt-1 block text-sm text-emerald-700 dark:text-emerald-300">
              Choose from files
            </span>
          </button>
        </div>

        {selectedImage ? (
          <p className="mt-4 truncate rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            Selected: {selectedImage.name}
          </p>
        ) : null}

        {imageMessage ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            {imageMessage}
          </p>
        ) : null}

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Selected fridge preview"
            width={800}
            height={450}
            unoptimized
            className="mt-4 max-h-72 w-full rounded-2xl object-cover"
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
                  const now = new Date().getTime();
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
