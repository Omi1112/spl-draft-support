'use client';

import { Tournament } from '../../../components/tournaments/types';

/**
 * キャプテン情報をもとにトーナメント参加者データを処理
 * GraphQLスキーマに合わせて適切に処理
 */
export function addCaptainFlagsToParticipants(tournament: Tournament): Tournament {
  // APIの構造にあわせてキャプテン情報を取得
  // captains配列がある場合はparticipantIdフィールドを使用
  // ない場合は代替の処理を行う
  const captainParticipantIds =
    tournament.captains?.map((captain) => {
      // participantIdフィールドが存在する場合はそれを使用
      if ('participantId' in captain) {
        return captain.participantId;
      }
      // participantIdがない場合はidを使用（APIの構造によって異なる場合がある）
      return captain.id;
    }) || [];

  console.log('キャプテン設定: ', captainParticipantIds);

  // tournamentParticipantsが存在する場合はそのまま使用する
  // GraphQLスキーマに合わせた形式になっているはず
  if (tournament.tournamentParticipants) {
    console.log(
      'トーナメント参加者データ: ',
      tournament.tournamentParticipants.map((tp) => ({
        participantId: tp.Participant.id,
        participantName: tp.Participant.name,
        isCaptain: tp.isCaptain,
      }))
    );

    return tournament;
  }

  // 互換性のために残しているが、tournamentParticipantsが正しく実装されていれば
  // このパスは通らないはず
  console.warn(
    '従来のparticipantsフィールドが使用されています。tournamentParticipantsへの移行を検討してください。'
  );

  return tournament;
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
