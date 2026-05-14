import AppNav from "@/components/AppNav";
import ShoppingList from "@/components/ShoppingList";

export default function ShoppingPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_48%,#fff7ed_100%)] px-6 py-10 dark:bg-[linear-gradient(135deg,#052e24_0%,#082f49_52%,#431407_100%)]">
      <main className="mx-auto w-full max-w-3xl">
        <AppNav />
        <div className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-5xl">
            购物清单
          </h1>
          <p className="mt-4 text-base text-sky-800 dark:text-sky-100">
            根据快没了的食材生成清单，并按常去的商店分类。
          </p>
        </div>
        <ShoppingList />
      </main>
    </div>
  );
}
