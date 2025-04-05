/**
 * 日付文字列を日本語形式でフォーマットする関数
 * @param dateString ISO形式の日付文字列
 * @returns 「YYYY年MM月DD日」形式の日付文字列
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
