"use client";

export function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
          role="status"
        ></div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">ロード中...</p>
      </div>
    </div>
  );
}