'use client';

import { Tournament } from '../../../components/tournaments/types';

/**
 * キャプテン情報をもとに参加者データに isCaptain フラグを追加
 * APIからのレスポンス構造に合わせて適切に処理
 * すでにisCaptain値が設定されている場合はそれを尊重する
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
  console.log(
    '現在の参加者isCaptain状態: ',
    tournament.participants.map((p) => ({
      id: p.id,
      name: p.name,
      isCaptain: p.isCaptain,
    }))
  );

  const participantsWithCaptainFlag = tournament.participants.map((p) => ({
    ...p,
    // GraphQLから明示的にisCaptain: trueで返ってきた場合はそれを優先
    // そうでない場合はcaptainParticipantIdsに基づいて判定
    isCaptain: p.isCaptain === true ? true : captainParticipantIds.includes(p.id),
  }));

  console.log(
    '更新後の参加者isCaptain状態: ',
    participantsWithCaptainFlag.map((p) => ({
      id: p.id,
      name: p.name,
      isCaptain: p.isCaptain,
    }))
  );

  return {
    ...tournament,
    participants: participantsWithCaptainFlag,
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
