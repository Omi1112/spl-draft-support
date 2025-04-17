import { TournamentDataResponse, Participant } from './types';

// GraphQLクエリを実行する関数
export async function fetchTournamentData(
  tournamentId: string,
  captainId: string
): Promise<TournamentDataResponse> {
  const query = `
    query GetTournamentData($tournamentId: ID!, $captainId: ID!) {
      tournament(id: $tournamentId) {
        id
        name
        createdAt
        teams {
          id
          name
          captainId
        }
        draftStatus {
          round
          turn
        }
      }
      participants(tournamentId: $tournamentId) {
        id
        name
        weapon
        xp
        createdAt
        team {
          id
          name
        }
      }
      allDrafts: drafts(tournamentId: $tournamentId) {
        id
        tournamentId
        captainId
        participantId
        status
        createdAt
        captain {
          id
          name
        }
        participant {
          id
          name
          weapon
          xp
        }
      }
      captainDrafts: drafts(tournamentId: $tournamentId, captainId: $captainId) {
        id
        tournamentId
        captainId
        participantId
        status
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
      variables: { tournamentId, captainId },
    }),
  });

  const result = await response.json();

  // エラーチェックを追加
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
  }

  // データの存在を確認
  if (!result.data || !result.data.tournament || !result.data.participants) {
    console.error('Unexpected response structure:', result);
    throw new Error('大会またはキャプテンのデータが見つかりませんでした');
  }

  // キャプテンIDに一致する参加者を検索
  const captain = result.data.participants.find((p: Participant) => p.id === captainId);

  if (!captain) {
    throw new Error('指定されたキャプテンが見つかりませんでした');
  }

  // チームに所属していない参加者だけをフィルタリング
  const unassignedParticipants = result.data.participants.filter(
    (p: Participant) => !p.team && !p.isCaptain
  );

  return {
    tournament: result.data.tournament,
    captain,
    participants: unassignedParticipants,
    drafts: result.data.captainDrafts || [], // このキャプテンの指名データ
    allDrafts: result.data.allDrafts || [], // 大会全体の指名データ
    draftStatus: result.data.tournament.draftStatus,
  };
}

// ドラフトを開始する関数
export async function startDraft(tournamentId: string): Promise<boolean> {
  const mutation = `
    mutation StartDraft($input: StartDraftInput!) {
      startDraft(input: $input)
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
        input: { tournamentId },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'ドラフト開始中にエラーが発生しました');
  }

  // スキーマに合わせて boolean を返すように修正
  return result.data.startDraft;
}

// ドラフトをリセットする関数
export async function resetDraft(tournamentId: string) {
  const mutation = `
    mutation ResetDraft($input: ResetDraftInput!) {
      resetDraft(input: $input)
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
        input: { tournamentId },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'ドラフトリセット中にエラーが発生しました');
  }

  return result.data.resetDraft;
}

// 選手を指名する関数
export async function nominateParticipant(
  tournamentId: string,
  captainId: string,
  participantId: string
) {
  const mutation = `
    mutation NominateParticipant($input: NominateParticipantInput!) {
      nominateParticipant(input: $input) {
        id
        status
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
        input: { tournamentId, captainId, participantId },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || '選手指名中にエラーが発生しました');
  }

  return result.data.nominateParticipant;
}

// 指名ステータス更新する関数
export async function updateDraftStatus(draftId: string, status: string) {
  const mutation = `
    mutation UpdateDraftStatus($input: UpdateDraftStatusInput!) {
      updateDraftStatus(input: $input) {
        id
        status
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
        input: { draftId, status },
      },
    }),
  });

  const result = await response.json();

  // エラーチェック
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || '指名ステータス更新中にエラーが発生しました');
  }

  return result.data.updateDraftStatus;
}
