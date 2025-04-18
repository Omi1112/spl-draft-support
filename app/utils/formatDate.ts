// filepath: /workspace/app/utils/formatDate.ts
/**
 * 日付文字列(YYYY-MM-DD)を日本語表記に変換するユーティリティ
 * @param dateStr ISO8601またはYYYY-MM-DD形式
 * @returns 例: 2023-01-01 → 2023年1月1日
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
