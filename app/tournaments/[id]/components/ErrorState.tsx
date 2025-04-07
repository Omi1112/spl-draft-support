"use client";

import Link from "next/link";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
          エラー
        </h2>
        <p className="mb-4">{message}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}