"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// GraphQL Mutationを実行する関数
async function createTournament(tournamentData: any) {
  const mutation = `
    mutation CreateTournament($input: CreateTournamentInput!) {
      createTournament(input: $input) {
        id
        name
        createdAt
      }
    }
  `;

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input: tournamentData },
    }),
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message || "GraphQL error occurred");
  }

  return result.data.createTournament;
}

export default function CreateTournament() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // APIを呼び出して大会を作成
      const createdTournament = await createTournament(formData);
      console.log("大会が作成されました:", createdTournament);

      // 作成された大会の詳細ページにリダイレクト
      router.push(`/tournaments/${createdTournament.id}`);
    } catch (error) {
      console.error("大会作成エラー:", error);
      setErrorMessage("大会の作成に失敗しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">大会を作成</h1>
          <p className="text-gray-600 dark:text-gray-300">
            新しい大会名を入力してください
          </p>
        </div>
        <Link
          href="/"
          className="mt-4 sm:mt-0 inline-block px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition"
        >
          ← トップページへ戻る
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6"
      >
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6 text-red-700 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
            >
              大会名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              placeholder="例: 第10回サッカー選手権大会"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "送信中..." : "大会を作成する"}
          </button>
        </div>
      </form>
    </div>
  );
}
