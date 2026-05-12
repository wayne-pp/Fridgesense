import PhotoIdentifyForm from "@/components/PhotoIdentifyForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-6 py-12 dark:bg-emerald-950">
      <main className="flex w-full flex-col items-center text-center">
        <h1 className="text-5xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50 sm:text-7xl">
          🦞 FridgeSense
        </h1>
        <p className="mt-6 text-xl text-emerald-700 dark:text-emerald-200 sm:text-2xl">
          AI-powered kitchen assistant
        </p>
        <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:text-base">
          Upload a fridge photo to identify ingredients.
        </p>
        <PhotoIdentifyForm />
      </main>
    </div>
  );
}
