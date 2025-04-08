// filepath: /workspace/app/api/graphql/resolvers/tournament/draftResolvers.ts
import prisma from "../../utils/prisma";

// 必要な型定義
type Context = Record<string, unknown>;
type WhereClause = {
  tournamentId: string;
  captainId?: string;
};

// 入力型定義
type NominateParticipantInput = {
  tournamentId: string;
  captainId: string;
  participantId: string;
};

type UpdateDraftStatusInput = {
  draftId: string;
  status: "pending" | "confirmed" | "cancelled";
};

type UpdateDraftRoundInput = {
  tournamentId: string;
  round: number;
  turn: number;
};

export const draftResolvers = {
  Query: {
    // 指名一覧を取得するクエリ
    drafts: async (
      _: Context,
      { tournamentId, captainId }: { tournamentId: string; captainId?: string }
    ) => {
      const whereClause: WhereClause = { tournamentId };

      // キャプテンIDがある場合はフィルター追加
      if (captainId) {
        whereClause.captainId = captainId;
      }

      const drafts = await prisma.draft.findMany({
        where: whereClause,
        include: {
          captain: true,
          participant: true,
          tournament: true,
        },
      });

      return drafts.map((draft) => ({
        ...draft,
        createdAt:
          draft.createdAt instanceof Date
            ? draft.createdAt.toISOString()
            : draft.createdAt,
        captain: {
          ...draft.captain,
          createdAt:
            draft.captain.createdAt instanceof Date
              ? draft.captain.createdAt.toISOString()
              : draft.captain.createdAt,
        },
        participant: {
          ...draft.participant,
          createdAt:
            draft.participant.createdAt instanceof Date
              ? draft.participant.createdAt.toISOString()
              : draft.participant.createdAt,
        },
        tournament: {
          ...draft.tournament,
          createdAt:
            draft.tournament.createdAt instanceof Date
              ? draft.tournament.createdAt.toISOString()
              : draft.tournament.createdAt,
        },
      }));
    },
    // ドラフトステータスを取得するクエリ
    draftStatus: async (_: Context, { tournamentId }: { tournamentId: string }) => {
      const status = await prisma.draftStatus.findUnique({
        where: { tournamentId },
        include: { tournament: true },
      });

      if (!status) return null;

      return {
        ...status,
        createdAt:
          status.createdAt instanceof Date
            ? status.createdAt.toISOString()
            : status.createdAt,
        updatedAt:
          status.updatedAt instanceof Date
            ? status.updatedAt.toISOString()
            : status.updatedAt,
      };
    },
  },
  Mutation: {
    // 指名ミューテーション
    nominateParticipant: async (_: Context, { input }: { input: NominateParticipantInput }) => {
      const { tournamentId, captainId, participantId } = input;

      // 既に同じ組み合わせの指名が存在するか確認
      const existingDraft = await prisma.draft.findUnique({
        where: {
          tournamentId_captainId_participantId: {
            tournamentId,
            captainId,
            participantId,
          },
        },
      });

      if (existingDraft) {
        throw new Error("既にこの参加者を指名しています");
      }

      // 現在のDraftStatusを取得して、ラウンドとターンの情報を取得
      const draftStatus = await prisma.draftStatus.findUnique({
        where: { tournamentId },
      });

      if (!draftStatus) {
        throw new Error("ドラフト状態が見つかりません");
      }

      // 指名を作成（現在のラウンドとターンの情報も含める）
      const draft = await prisma.draft.create({
        data: {
          tournamentId,
          captainId,
          participantId,
          status: "pending",
          round: draftStatus.round,
          turn: draftStatus.turn,
          createdAt: new Date(),
        },
        include: {
          captain: true,
          participant: true,
          tournament: true,
        },
      });

      // すべてのキャプテンが指名完了しているか確認
      const allCaptains = await prisma.tournamentParticipant.findMany({
        where: {
          tournamentId,
          isCaptain: true,
        },
        select: {
          participantId: true,
        },
      });

      const captainIds = allCaptains.map((c) => c.participantId);

      // 現在のラウンドの指名状況を確認
      const currentRoundDrafts = await prisma.draft.findMany({
        where: {
          tournamentId,
          status: "pending",
        },
      });

      // キャプテンごとの指名データをグループ化
      const captainDrafts = new Map();
      currentRoundDrafts.forEach((draft) => {
        if (!captainDrafts.has(draft.captainId)) {
          captainDrafts.set(draft.captainId, []);
        }
        captainDrafts.get(draft.captainId).push(draft);
      });

      // すべてのキャプテンが指名を完了しているか確認
      const allCaptainsNominated = captainIds.every(
        (id) => captainDrafts.has(id) && captainDrafts.get(id).length > 0
      );

      // すべてのキャプテンが指名完了した場合の処理
      if (allCaptainsNominated) {
        console.log("全キャプテン指名完了: ドラフト処理を実行します");

        // 参加者ごとの指名状況を集計
        const participantNominations = new Map();
        currentRoundDrafts.forEach((draft) => {
          if (!participantNominations.has(draft.participantId)) {
            participantNominations.set(draft.participantId, []);
          }
          participantNominations.get(draft.participantId).push(draft);
        });

        // 各参加者について、指名の競合を解決
        for (const [
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _participantId,
          drafts,
        ] of participantNominations.entries()) {
          if (drafts.length === 1) {
            // 指名が競合していない場合、その選手をチームに確定
            const selectedDraft = drafts[0];

            // チームを取得
            const team = await prisma.team.findFirst({
              where: {
                tournamentId,
                captainId: selectedDraft.captainId,
              },
            });

            if (team) {
              // チームメンバーとして追加
              await prisma.teamMember.create({
                data: {
                  teamId: team.id,
                  participantId: selectedDraft.participantId,
                },
              });

              // 参加者のtournamentParticipantレコードを更新してチームを関連付け
              await prisma.tournamentParticipant.updateMany({
                where: {
                  tournamentId,
                  participantId: selectedDraft.participantId,
                },
                data: {
                  teamId: team.id,
                },
              });

              // ドラフト状態を確定に更新
              await prisma.draft.update({
                where: { id: selectedDraft.id },
                data: { status: "confirmed" },
              });

              console.log(
                `参加者 ${selectedDraft.participantId} をチーム ${team.id} に確定しました`
              );
            }
          } else {
            // 指名が競合している場合、ランダムに選出
            const randomIndex = Math.floor(Math.random() * drafts.length);
            const selectedDraft = drafts[randomIndex];

            // 選ばれたキャプテンのチームを取得
            const team = await prisma.team.findFirst({
              where: {
                tournamentId,
                captainId: selectedDraft.captainId,
              },
            });

            if (team) {
              // チームメンバーとして追加
              await prisma.teamMember.create({
                data: {
                  teamId: team.id,
                  participantId: selectedDraft.participantId,
                },
              });

              // 参加者のtournamentParticipantレコードを更新してチームを関連付け
              await prisma.tournamentParticipant.updateMany({
                where: {
                  tournamentId,
                  participantId: selectedDraft.participantId,
                },
                data: {
                  teamId: team.id,
                },
              });

              // 選ばれたドラフトを確定に更新
              await prisma.draft.update({
                where: { id: selectedDraft.id },
                data: { status: "confirmed" },
              });

              // 他の競合ドラフトをキャンセルに更新
              for (const otherDraft of drafts) {
                if (otherDraft.id !== selectedDraft.id) {
                  await prisma.draft.update({
                    where: { id: otherDraft.id },
                    data: { status: "cancelled" },
                  });
                }
              }

              console.log(
                `競合: 参加者 ${selectedDraft.participantId} をチーム ${team.id} に確定しました（ランダム選択）`
              );
            }
          }
        }

        // すべての処理が終わったら、ドラフトステータスを更新
        const totalCaptains = captainIds.length;

        // 競合があったかどうかを確認
        const hadConflicts = Array.from(participantNominations.values()).some(
          (drafts) => drafts.length > 1
        );

        if (hadConflicts) {
          // 競合があった場合、ラウンドを進める
          await prisma.draftStatus.update({
            where: { tournamentId },
            data: { round: draftStatus.round + 1 },
          });
          console.log(
            `競合があったためラウンドを更新: ${draftStatus.round + 1}回目`
          );
        } else {
          // 競合がなかった場合、次の順番に進める
          const nextTurn = (draftStatus.turn % totalCaptains) + 1;
          const nextRound =
            nextTurn === 1 ? draftStatus.round + 1 : draftStatus.round;

          await prisma.draftStatus.update({
            where: { tournamentId },
            data: {
              round: nextRound,
              turn: nextTurn,
            },
          });
          console.log(`次のターンを設定: ${nextRound}回目の${nextTurn}人目`);
        }
      }

      return {
        ...draft,
        createdAt: draft.createdAt.toISOString(),
        captain: {
          ...draft.captain,
          createdAt:
            draft.captain.createdAt instanceof Date
              ? draft.captain.createdAt.toISOString()
              : draft.captain.createdAt,
        },
        participant: {
          ...draft.participant,
          createdAt:
            draft.participant.createdAt instanceof Date
              ? draft.participant.createdAt.toISOString()
              : draft.participant.createdAt,
        },
        tournament: {
          ...draft.tournament,
          createdAt:
            draft.tournament.createdAt instanceof Date
              ? draft.tournament.createdAt.toISOString()
              : draft.tournament.createdAt,
        },
      };
    },

    // ドラフトステータス更新ミューテーション
    updateDraftStatus: async (_: Context, { input }: { input: UpdateDraftStatusInput }) => {
      const { draftId, status } = input;

      // 有効なステータス値を確認
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        throw new Error("無効なステータスです");
      }

      // ドラフトを更新
      const updatedDraft = await prisma.draft.update({
        where: { id: draftId },
        data: { status },
        include: {
          captain: true,
          participant: true,
          tournament: true,
        },
      });

      // 確定の場合は、チームメンバーに追加
      if (status === "confirmed") {
        // キャプテンのチームを検索
        const captainTeam = await prisma.team.findFirst({
          where: {
            captainId: updatedDraft.captainId,
            tournamentId: updatedDraft.tournamentId,
          },
        });

        if (captainTeam) {
          // チームに参加者を追加
          try {
            await prisma.teamMember.create({
              data: {
                teamId: captainTeam.id,
                participantId: updatedDraft.participantId,
              },
            });

            // 参加者のtournamentParticipantレコードを更新してチームを関連付け
            await prisma.tournamentParticipant.updateMany({
              where: {
                tournamentId: updatedDraft.tournamentId,
                participantId: updatedDraft.participantId,
              },
              data: {
                teamId: captainTeam.id,
              },
            });
          } catch (error) {
            console.error("チームメンバー追加エラー:", error);
            throw new Error("指名を確定できませんでした");
          }
        }
      }

      return {
        ...updatedDraft,
        createdAt: updatedDraft.createdAt.toISOString(),
        captain: {
          ...updatedDraft.captain,
          createdAt:
            updatedDraft.captain.createdAt instanceof Date
              ? updatedDraft.captain.createdAt.toISOString()
              : updatedDraft.captain.createdAt,
        },
        participant: {
          ...updatedDraft.participant,
          createdAt:
            updatedDraft.participant.createdAt instanceof Date
              ? updatedDraft.participant.createdAt.toISOString()
              : updatedDraft.participant.createdAt,
        },
        tournament: {
          ...updatedDraft.tournament,
          createdAt:
            updatedDraft.tournament.createdAt instanceof Date
              ? updatedDraft.tournament.createdAt.toISOString()
              : updatedDraft.tournament.createdAt,
        },
      };
    },

    // ドラフトラウンド更新ミューテーション
    updateDraftRound: async (_: Context, { input }: { input: UpdateDraftRoundInput }) => {
      const { tournamentId, round, turn } = input;

      // 既存のドラフトステータスを確認
      const existingStatus = await prisma.draftStatus.findUnique({
        where: { tournamentId },
      });

      let draftStatus;

      if (existingStatus) {
        // 既存のステータスを更新
        draftStatus = await prisma.draftStatus.update({
          where: { tournamentId },
          data: { round, turn },
          include: { tournament: true },
        });
      } else {
        // 新しいステータスを作成
        draftStatus = await prisma.draftStatus.create({
          data: {
            tournamentId,
            round,
            turn,
            isActive: true,
          },
          include: { tournament: true },
        });
      }

      return {
        ...draftStatus,
        createdAt:
          draftStatus.createdAt instanceof Date
            ? draftStatus.createdAt.toISOString()
            : draftStatus.createdAt,
        updatedAt:
          draftStatus.updatedAt instanceof Date
            ? draftStatus.updatedAt.toISOString()
            : draftStatus.updatedAt,
      };
    },
  },
};
