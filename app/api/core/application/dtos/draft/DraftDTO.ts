/**
 * ドラフトのデータ転送オブジェクト（DTO）
 */
export interface DraftDTO {
  id: string;
  tournamentId: string;
  captainId: string;
  participantId: string;
  round: number;
  turn: number;
  status: string;
  createdAt: string;
  captain?: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
  };
  participant?: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
  };
}
