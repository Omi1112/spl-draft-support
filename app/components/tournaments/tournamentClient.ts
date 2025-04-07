// filepath: /workspace/app/components/tournaments/tournamentClient.ts
// トーナメント関連のGraphQLクライアント関数

import { Tournament, Participant, TournamentParticipant } from "./types";

// GraphQLクエリを実行する関数
export async function fetchTournament(id: string): Promise<Tournament> {
  const query = `
    query GetTournament($id: ID!) {
      tournament(id: $id) {
        id
        name
        createdAt
        participants {
          id
          name
          weapon
          xp
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

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { id },
    }),
  });

  const result = await response.json();

  // エラーチェックを追加
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(result.errors[0]?.message || "GraphQL error occurred");
  }

  // データの存在を確認
  if (!result.data || !result.data.tournament) {
    console.error("Unexpected response structure:", result);
    throw new Error("大会データが見つかりませんでした");
  }

  return result.data.tournament;
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

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    throw new Error(result.errors[0].message || "GraphQL error occurred");
  }
  return result.data.addParticipantToTournament;
}

// 主将を設定するGraphQLミューテーション
export async function setCaptain(
  tournamentId: string,
  participantId: string
): Promise<TournamentParticipant> {
  const mutation = `
    mutation SetCaptain($input: SetCaptainInput!) {
      setCaptain(input: $input) {
        id
        tournamentId
        participantId
        isCaptain
      }
    }
  `;

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    throw new Error(result.errors[0].message || "GraphQL error occurred");
  }
  return result.data.setCaptain;
}
