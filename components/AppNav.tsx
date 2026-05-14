import Link from "next/link";

export default function AppNav() {
  return (
    <nav className="flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white/80 p-2 text-sm font-medium shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30">
      <Link
        href="/"
        className="rounded-full px-4 py-2 text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-800"
      >
        Home
      </Link>
      <Link
        href="/fridge"
        className="rounded-full px-4 py-2 text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-800"
      >
        Fridge
      </Link>
      <Link
        href="/shopping"
        className="rounded-full px-4 py-2 text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-800"
      >
        Shopping
      </Link>
    </nav>
  );
}
