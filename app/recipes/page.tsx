import AppNav from "@/components/AppNav";
import RecipeRecommendations from "@/components/RecipeRecommendations";

export default function RecipesPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_48%,#fff7ed_100%)] px-6 py-10 dark:bg-[linear-gradient(135deg,#052e24_0%,#082f49_52%,#431407_100%)]">
      <main className="mx-auto w-full max-w-3xl">
        <AppNav />
        <div className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-5xl">
            今晚做什么菜
          </h1>
          <p className="mt-4 text-base text-sky-800 dark:text-sky-100">
            根据你冰箱里已有的食材，推荐 3 道适合今晚做的菜。
          </p>
        </div>
        <RecipeRecommendations />
      </main>
    </div>
  );
}
