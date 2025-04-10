// キャプテンページで使用する型定義

// 大会データの型定義
export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
}

// キャプテン（参加者）データの型定義
export interface Captain {
  id: string;
  name: string;
  weapon: string;
  xp: number;
  createdAt: string;
}

// 大会とキャプテンのデータを含む型定義
export interface TournamentWithCaptains extends Tournament {
  participants: Captain[];
}
