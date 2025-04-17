'use client';

import { Tournament } from '../../../components/tournaments/types';

/**
 * キャプテン情報をもとにトーナメント参加者データを処理
 * GraphQLスキーマに合わせて適切に処理
 */
export function addCaptainFlagsToParticipants(tournament: Tournament): Tournament {
  // captains配列は今後利用しないため、tournamentParticipantsのisCaptainのみで判定する
  if (tournament.tournamentParticipants) {
    // 参加者情報にisCaptainフラグが含まれている前提でそのまま返す
    return tournament;
  }
  // 旧データ構造などでtournamentParticipantsがない場合は空配列を返す
  return {
    ...tournament,
    tournamentParticipants: [],
  };
}

/**
 * フォームの値を初期化するための関数
 */
export function createEmptyParticipantForm() {
  return {
    name: '',
    weapon: '',
    xp: '',
  };
}

/**
 * 参加者フォームのデータをAPIに送信できる形式に変換
 */
export function createParticipantData(formData: { name: string; weapon: string; xp: string }) {
  return {
    name: formData.name,
    weapon: formData.weapon,
    xp: parseInt(formData.xp, 10),
  };
}
