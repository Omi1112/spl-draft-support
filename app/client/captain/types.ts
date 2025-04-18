// キャプテン型定義（GraphQLスキーマ参照）
export type TournamentParticipant = {
  id: string;
  tournamentId: string;
  participantId: string;
  isCaptain: boolean;
  createdAt: string;
  participant: {
    id: string;
    name: string;
    weapon: string;
    xp: number;
    createdAt: string;
  };
};
