import AppNav from "@/components/AppNav";
import PhotoIdentifyForm from "@/components/PhotoIdentifyForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_48%,#fff7ed_100%)] px-6 py-12 dark:bg-[linear-gradient(135deg,#052e24_0%,#082f49_52%,#431407_100%)]">
      <main className="flex w-full max-w-3xl flex-col items-center text-center">
        <AppNav />
        <p className="mt-10 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          个人 AI 厨房工作台
        </p>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-7xl">
          FridgeSense
        </h1>
        <p className="mt-6 text-xl text-sky-800 dark:text-sky-100 sm:text-2xl">
          pp厨房
        </p>
        <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-200 sm:text-base">
          上传冰箱照片，识别食材，管理库存和今晚菜单。
        </p>
        <PhotoIdentifyForm />
      </main>
    </div>
  );
}
