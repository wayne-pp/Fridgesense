import Link from "next/link";

import ShoppingList from "@/components/ShoppingList";

export default function ShoppingPage() {
  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-10 dark:bg-emerald-950">
      <main className="mx-auto w-full max-w-3xl">
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/" className="text-emerald-700 underline dark:text-emerald-200">
            Home
          </Link>
          <Link
            href="/fridge"
            className="text-emerald-700 underline dark:text-emerald-200"
          >
            Fridge
          </Link>
        </div>
        <div className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50 sm:text-5xl">
            Shopping List
          </h1>
          <p className="mt-4 text-base text-emerald-700 dark:text-emerald-200">
            Buy low-stock ingredients, grouped by the store that usually makes
            the most sense.
          </p>
        </div>
        <ShoppingList />
      </main>
    </div>
  );
}
