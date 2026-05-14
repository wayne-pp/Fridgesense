import Link from "next/link";

import FridgeInventory from "@/components/FridgeInventory";

export default function FridgePage() {
  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-10 dark:bg-emerald-950">
      <main className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 underline dark:text-emerald-200"
        >
          Back home
        </Link>
        <div className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50 sm:text-5xl">
            Fridge Inventory
          </h1>
          <p className="mt-4 text-base text-emerald-700 dark:text-emerald-200">
            Review saved ingredients, mark items that are running low, or remove
            items you no longer have.
          </p>
        </div>
        <FridgeInventory />
      </main>
    </div>
  );
}
