import AppNav from "@/components/AppNav";
import PhotoIdentifyForm from "@/components/PhotoIdentifyForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-6 py-12 dark:bg-emerald-950">
      <main className="flex w-full max-w-3xl flex-col items-center text-center">
        <AppNav />
        <h1 className="text-5xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50 sm:text-7xl">
          🦞 FridgeSense
        </h1>
        <p className="mt-6 text-xl text-emerald-700 dark:text-emerald-200 sm:text-2xl">
          AI 厨房助手
        </p>
        <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:text-base">
          上传冰箱照片，识别食材，管理库存和今晚菜单。
        </p>
        <PhotoIdentifyForm />
      </main>
    </div>
  );
}
