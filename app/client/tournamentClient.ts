// トーナメント関連のGraphQLクライアント関数

import { Tournament, TournamentParticipant, Participant } from '../components/tournaments/types';

// GraphQLクエリを実行する関数
export async function fetchTournament(id: string): Promise<Tournament> {
  const query = `
    query GetTournament($id: ID!) {
      tournament(id: $id) {
        id
        name
        createdAt
        tournamentParticipants {
          Participant {
            id
            name
            weapon
            xp
            createdAt
          }
          isCaptain
          createdAt
        }
        captains {
          id
          name
          weapon
          xp
        }
        teams {
          id
          name
          captainId
          captain {
            id
            name
            weapon
            xp
          }
          members {
            id
            name
            weapon
            xp
          }
          createdAt
        }
      }
    }
  `;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { id },
    }),
  });

  const result = await response.json();

  // デバッグログを追加
  console.log('GraphQL Response:', JSON.stringify(result, null, 2));

  // tournamentParticipantsのデータを確認
  if (result.data?.tournament?.tournamentParticipants) {
    console.log(
      'Tournament participants:',
      result.data.tournament.tournamentParticipants.map((tp: any) => ({
        participantId: tp.Participant.id,
        participantName: tp.Participant.name,
        isCaptain: tp.isCaptain,
      }))
    );
  }

  // エラーチェックを追加
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
  }

  // データの存在を確認
  if (!result.data || !result.data.tournament) {
    console.error('Unexpected response structure:', result);
    throw new Error('大会データが見つかりませんでした');
  }

  return result.data.tournament;
}

// トーナメント一覧を取得するための関数
export async function fetchTournaments(): Promise<Tournament[]> {
  const query = `
    query GetTournaments {
      tournaments {
        id
        name
        createdAt
      }
    }
  `;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  });

  const result = await response.json();

  // エラーチェックを追加
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
  }

  // データの存在を確認
  if (!result.data || !result.data.tournaments) {
    console.error('Unexpected response structure:', result);
    throw new Error('トーナメント一覧データが見つかりませんでした');
  }

  return result.data.tournaments;
}

// 参加者を大会に追加するGraphQLミューテーション
export async function addParticipantToTournament(
  tournamentId: string,
  participantData: { name: string; weapon: string; xp: number }
): Promise<TournamentParticipant> {
  const mutation = `
    mutation AddParticipantToTournament($input: AddParticipantToTournamentInput!) {
      addParticipantToTournament(input: $input) {
        id
        tournamentId
        participantId
        createdAt
      }
    }
  `;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          tournamentId,
          participant: participantData,
        },
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message || 'GraphQL error occurred');
  }
  return result.data.addParticipantToTournament;
}

// 主将の設定を切り替えるGraphQLミューテーション
export async function toggleCaptain(
  tournamentId: string,
  participantId: string
): Promise<TournamentParticipant> {
  const mutation = `
    mutation ToggleCaptain($input: ToggleCaptainInput!) {
      toggleCaptain(input: $input) {
        id
        tournamentId
        participantId
        isCaptain
      }
    }
  `;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          tournamentId,
          participantId,
        },
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message || 'GraphQL error occurred');
  }

  return result.data.toggleCaptain;
}

/**
 * ドラフトをリセットするGraphQLミューテーション
 * 指名情報・チーム情報を完全にリセットし、ドラフトを初期状態に戻す
 *
 * @param tournamentId トーナメントID
 * @returns リセット成功したかどうか（true/false）
 */
export async function resetDraft(tournamentId: string): Promise<boolean> {
  const mutation = `
    mutation ResetDraft($input: ResetDraftInput!) {
      resetDraft(input: $input)
    }
  `;

  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            tournamentId,
          },
        },
      }),
    });

    const result = await response.json();
    if (result.errors) {
      console.error('ドラフトリセットエラー:', result.errors);
      throw new Error(result.errors[0].message || 'GraphQL error occurred');
    }

    return result.data.resetDraft;
  } catch (error) {
    console.error('ドラフトリセット実行エラー:', error);
    throw new Error('ドラフトのリセットに失敗しました');
  }
}
