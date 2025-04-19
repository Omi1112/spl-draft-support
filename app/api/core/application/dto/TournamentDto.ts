/**
 * Tournament DTO（データ転送オブジェクト）
 * アプリケーション層とプレゼンテーション層の間でデータをやり取りするためのオブジェクト
 */
export interface TournamentDto {
  id: string;
  name: string;
  createdAt: string;
  draftStatus?: {
    round: number;
    turn: number;
    isActive: boolean;
  };
}

/**
 * 大会作成のためのDTO
 */
export interface CreateTournamentDto {
  name: string;
}
