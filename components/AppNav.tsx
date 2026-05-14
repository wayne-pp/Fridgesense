import Link from "next/link";

export default function AppNav() {
  return (
    <nav className="flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/70 bg-white/75 p-2 text-sm font-medium shadow-lg shadow-emerald-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/20">
      <Link
        href="/"
        className="rounded-full px-4 py-2 text-emerald-800 transition hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-900"
      >
        首页
      </Link>
      <Link
        href="/fridge"
        className="rounded-full px-4 py-2 text-sky-800 transition hover:bg-sky-100 dark:text-sky-100 dark:hover:bg-sky-950"
      >
        冰箱
      </Link>
      <Link
        href="/shopping"
        className="rounded-full px-4 py-2 text-amber-800 transition hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-950"
      >
        购物清单
      </Link>
      <Link
        href="/recipes"
        className="rounded-full px-4 py-2 text-rose-800 transition hover:bg-rose-100 dark:text-rose-100 dark:hover:bg-rose-950"
      >
        今晚吃什么
      </Link>
    </nav>
  );
}
