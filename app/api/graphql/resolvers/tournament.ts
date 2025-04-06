import prisma from "../utils/prisma";

export const resolvers = {
  Query: {
    tournaments: async () => {
      return await prisma.tournament.findMany();
    },
    tournament: async (_: any, { id }: { id: string }) => {
      return await prisma.tournament.findUnique({
        where: { id },
        include: {
          participations: {
            include: {
              participant: true,
            },
          },
        },
      });
    },
    participants: async (
      _: any,
      { tournamentId }: { tournamentId: string }
    ) => {
      const participations = await prisma.tournamentParticipant.findMany({
        where: { tournamentId },
        include: {
          participant: true,
        },
      });

      return participations.map((p) => ({
        ...p.participant,
        isCaptain: p.isCaptain,
      }));
    },
    allParticipants: async () => {
      return await prisma.participant.findMany();
    },
    tournamentCaptain: async (
      _: any,
      { tournamentId }: { tournamentId: string }
    ) => {
      const captainParticipation = await prisma.tournamentParticipant.findFirst(
        {
          where: {
            tournamentId,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      return captainParticipation ? captainParticipation.participant : null;
    },
    tournamentCaptains: async (
      _: any,
      { tournamentId }: { tournamentId: string }
    ) => {
      const captainParticipations = await prisma.tournamentParticipant.findMany(
        {
          where: {
            tournamentId,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      return captainParticipations.map((p) => ({
        ...p.participant,
        createdAt:
          p.participant.createdAt instanceof Date
            ? p.participant.createdAt.toISOString()
            : p.participant.createdAt,
      }));
    },
    teams: async (_: any, { tournamentId }: { tournamentId: string }) => {
      const teams = await prisma.team.findMany({
        where: { tournamentId },
        include: {
          captain: true,
          members: {
            include: {
              participant: true,
            },
          },
        },
      });

      return teams.map((team) => ({
        ...team,
        createdAt:
          team.createdAt instanceof Date
            ? team.createdAt.toISOString()
            : team.createdAt,
        members: team.members.map((member) => ({
          ...member.participant,
          createdAt:
            member.participant.createdAt instanceof Date
              ? member.participant.createdAt.toISOString()
              : member.participant.createdAt,
        })),
      }));
    },
    // 指名一覧を取得するクエリ追加
    drafts: async (
      _: any,
      { tournamentId, captainId }: { tournamentId: string; captainId?: string }
    ) => {
      const whereClause: any = { tournamentId };

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
    // ドラフトステータスを取得するクエリを追加
    draftStatus: async (_: any, { tournamentId }: { tournamentId: string }) => {
      const status = await prisma.draftStatus.findUnique({
        where: { tournamentId },
        include: { tournament: true }
      });

      if (!status) return null;

      return {
        ...status,
        createdAt: status.createdAt instanceof Date ? status.createdAt.toISOString() : status.createdAt,
        updatedAt: status.updatedAt instanceof Date ? status.updatedAt.toISOString() : status.updatedAt,
      };
    }
  },
  Mutation: {
    createTournament: async (_: any, { input }: { input: any }) => {
      const tournament = await prisma.tournament.create({
        data: {
          name: input.name,
          createdAt: new Date(), // 明示的にcreatedAtを設定
        },
      });

      // ISO文字列形式でcreatedAtを返す
      return {
        ...tournament,
        createdAt: tournament.createdAt.toISOString(),
      };
    },
    createParticipant: async (_: any, { input }: { input: any }) => {
      const participant = await prisma.participant.create({
        data: {
          name: input.name,
          weapon: input.weapon,
          xp: parseInt(input.xp, 10),
          createdAt: new Date(),
        },
      });

      return {
        ...participant,
        createdAt: participant.createdAt.toISOString(),
      };
    },
    addParticipantToTournament: async (_: any, { input }: { input: any }) => {
      let participantId = input.participantId;

      // 参加者IDが指定されていない場合は、新しい参加者を作成
      if (!participantId && input.participant) {
        const newParticipant = await prisma.participant.create({
          data: {
            name: input.participant.name,
            weapon: input.participant.weapon,
            xp: parseInt(input.participant.xp, 10),
            createdAt: new Date(),
          },
        });
        participantId = newParticipant.id;
      }

      if (!participantId) {
        throw new Error("参加者IDまたは参加者情報が必要です");
      }

      // 中間テーブルにレコードを作成
      const tournamentParticipant = await prisma.tournamentParticipant.create({
        data: {
          tournamentId: input.tournamentId,
          participantId,
          createdAt: new Date(),
        },
        include: {
          participant: true,
          tournament: true,
        },
      });

      return {
        ...tournamentParticipant,
        createdAt: tournamentParticipant.createdAt.toISOString(),
      };
    },
    setCaptain: async (_: any, { input }: { input: any }) => {
      const { tournamentId, participantId } = input;

      // 現在のキャプテン状態を確認
      const currentParticipation =
        await prisma.tournamentParticipant.findUnique({
          where: {
            tournamentId_participantId: {
              tournamentId,
              participantId,
            },
          },
        });

      // 同じ参加者が既にキャプテンの場合は、キャプテンを解除する
      if (currentParticipation && currentParticipation.isCaptain) {
        const updatedParticipation = await prisma.tournamentParticipant.update({
          where: {
            id: currentParticipation.id,
          },
          data: {
            isCaptain: false,
          },
          include: {
            participant: true,
            tournament: true,
          },
        });

        return {
          ...updatedParticipation,
          createdAt: updatedParticipation.createdAt.toISOString(),
        };
      }

      // キャプテンを追加
      const updatedParticipation = await prisma.tournamentParticipant.update({
        where: {
          tournamentId_participantId: {
            tournamentId,
            participantId,
          },
        },
        data: {
          isCaptain: true,
        },
        include: {
          participant: true,
          tournament: true,
        },
      });

      return {
        ...updatedParticipation,
        createdAt: updatedParticipation.createdAt.toISOString(),
      };
    },
    startDraft: async (
      _: any,
      { input }: { input: { tournamentId: string } }
    ) => {
      const { tournamentId } = input;

      // 既にチームが作成されているか確認
      const existingTeams = await prisma.team.findMany({
        where: { tournamentId },
      });

      if (existingTeams.length > 0) {
        throw new Error("この大会ではすでにドラフトが開始されています");
      }

      // キャプテン（主将）を取得
      const captainParticipations = await prisma.tournamentParticipant.findMany(
        {
          where: {
            tournamentId,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      if (captainParticipations.length === 0) {
        throw new Error(
          "この大会にはキャプテンが登録されていません。まずはキャプテンを設定してください"
        );
      }

      // ドラフトステータスを作成（一人目一回目の設定）
      await prisma.draftStatus.create({
        data: {
          tournamentId,
          round: 1, // 1回目
          turn: 1,  // 1人目
          isActive: true,
        },
      });

      // 各キャプテンにチームを作成（キャプテンだけをメンバーとして追加）
      const createdTeams = [];

      for (const captainParticipation of captainParticipations) {
        const teamName = `${captainParticipation.participant.name}のチーム`;

        // チームを作成
        const team = await prisma.team.create({
          data: {
            name: teamName,
            tournamentId,
            captainId: captainParticipation.participant.id,
          },
          include: {
            captain: true,
          },
        });

        // キャプテン自身をチームメンバーに追加
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            participantId: captainParticipation.participant.id,
          },
        });

        // 作成したチームの情報をフォーマットして配列に追加
        createdTeams.push({
          ...team,
          createdAt: team.createdAt.toISOString(),
          members: [
            {
              ...team.captain,
              createdAt: team.captain.createdAt.toISOString(),
            },
          ],
        });
      }

      // 残りのメンバーはチームに割り振らずに終了
      return createdTeams;
    },
    
    resetDraft: async (
      _: any,
      { input }: { input: { tournamentId: string } }
    ) => {
      const { tournamentId } = input;

      try {
        // トランザクションを使用せず、個別の操作として削除を実行
        // 1. この大会に関連する全てのチームと関連メンバーを取得
        const teams = await prisma.team.findMany({
          where: { tournamentId },
          include: { members: true },
        });

        // 2. 各チームのメンバーを削除（外部キー制約のため）
        for (const team of teams) {
          await prisma.teamMember.deleteMany({
            where: { teamId: team.id },
          });
        }

        // 3. 全てのチームを削除
        await prisma.team.deleteMany({
          where: { tournamentId },
        });

        // 4. この大会の指名データを削除
        await prisma.draft.deleteMany({
          where: { tournamentId },
        });

        // 5. ドラフトステータスを削除
        await prisma.draftStatus.deleteMany({
          where: { tournamentId },
        });

        // 6. 参加者のチーム関連付けをリセット
        await prisma.tournamentParticipant.updateMany({
          where: { tournamentId },
          data: { teamId: null },
        });

        return true;
      } catch (error) {
        console.error("ドラフトリセットエラー:", error);
        return false;
      }
    },
    // 指名ミューテーション追加
    nominateParticipant: async (_: any, { input }: { input: any }) => {
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

      // 指名を作成
      const draft = await prisma.draft.create({
        data: {
          tournamentId,
          captainId,
          participantId,
          status: "pending",
          createdAt: new Date(),
        },
        include: {
          captain: true,
          participant: true,
          tournament: true,
        },
      });

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

    // ドラフトステータス更新ミューテーション追加
    updateDraftStatus: async (_: any, { input }: { input: any }) => {
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
    updateDraftRound: async (_: any, { input }: { input: any }) => {
      const { tournamentId, round, turn } = input;

      // 既存のドラフトステータスを確認
      const existingStatus = await prisma.draftStatus.findUnique({
        where: { tournamentId }
      });

      let draftStatus;
      
      if (existingStatus) {
        // 既存のステータスを更新
        draftStatus = await prisma.draftStatus.update({
          where: { tournamentId },
          data: { round, turn },
          include: { tournament: true }
        });
      } else {
        // 新しいステータスを作成
        draftStatus = await prisma.draftStatus.create({
          data: {
            tournamentId,
            round,
            turn,
            isActive: true
          },
          include: { tournament: true }
        });
      }

      return {
        ...draftStatus,
        createdAt: draftStatus.createdAt instanceof Date ? draftStatus.createdAt.toISOString() : draftStatus.createdAt,
        updatedAt: draftStatus.updatedAt instanceof Date ? draftStatus.updatedAt.toISOString() : draftStatus.updatedAt,
      };
    },
  },
  // Tournamentタイプのリゾルバーを追加して日付のフォーマットを保証
  Tournament: {
    createdAt: (parent: any) => {
      // すでに文字列の場合はそのまま返し、Date型の場合はISOString形式に変換
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      return parent.createdAt;
    },
    participants: async (parent: any) => {
      const participations = await prisma.tournamentParticipant.findMany({
        where: { tournamentId: parent.id },
        include: {
          participant: true,
        },
      });

      return participations.map((p) => ({
        ...p.participant,
        createdAt:
          p.participant.createdAt instanceof Date
            ? p.participant.createdAt.toISOString()
            : p.participant.createdAt,
        isCaptain: p.isCaptain,
      }));
    },
    captain: async (parent: any) => {
      const captainParticipation = await prisma.tournamentParticipant.findFirst(
        {
          where: {
            tournamentId: parent.id,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      return captainParticipation
        ? {
            ...captainParticipation.participant,
            createdAt:
              captainParticipation.participant.createdAt instanceof Date
                ? captainParticipation.participant.createdAt.toISOString()
                : captainParticipation.participant.createdAt,
          }
        : null;
    },
    captains: async (parent: any) => {
      const captainParticipations = await prisma.tournamentParticipant.findMany(
        {
          where: {
            tournamentId: parent.id,
            isCaptain: true,
          },
          include: {
            participant: true,
          },
        }
      );

      return captainParticipations.map((p) => ({
        ...p.participant,
        createdAt:
          p.participant.createdAt instanceof Date
            ? p.participant.createdAt.toISOString()
            : p.participant.createdAt,
      }));
    },
    teams: async (parent: any) => {
      const teams = await prisma.team.findMany({
        where: { tournamentId: parent.id },
        include: {
          captain: true,
          members: {
            include: {
              participant: true,
            },
          },
        },
      });

      return teams.map((team) => ({
        ...team,
        createdAt:
          team.createdAt instanceof Date
            ? team.createdAt.toISOString()
            : team.createdAt,
        members: team.members.map((member) => ({
          ...member.participant,
          createdAt:
            member.participant.createdAt instanceof Date
              ? member.participant.createdAt.toISOString()
              : member.participant.createdAt,
        })),
      }));
    },
    drafts: async (parent: any) => {
      const drafts = await prisma.draft.findMany({
        where: { tournamentId: parent.id },
        include: {
          captain: true,
          participant: true,
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
      }));
    },
    // トーナメントとドラフトステータスのリレーションを解決
    draftStatus: async (parent: any) => {
      const status = await prisma.draftStatus.findUnique({
        where: { tournamentId: parent.id },
      });

      if (!status) return null;

      return {
        ...status,
        createdAt: status.createdAt instanceof Date ? status.createdAt.toISOString() : status.createdAt,
        updatedAt: status.updatedAt instanceof Date ? status.updatedAt.toISOString() : status.updatedAt,
      };
    },
  },
  Participant: {
    createdAt: (parent: any) => {
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      return parent.createdAt;
    },
    tournaments: async (parent: any) => {
      const participations = await prisma.tournamentParticipant.findMany({
        where: { participantId: parent.id },
        include: {
          tournament: true,
        },
      });

      return participations.map((p) => ({
        ...p.tournament,
        createdAt:
          p.tournament.createdAt instanceof Date
            ? p.tournament.createdAt.toISOString()
            : p.tournament.createdAt,
      }));
    },
    isCaptainOf: async (parent: any) => {
      const captainParticipations = await prisma.tournamentParticipant.findMany(
        {
          where: {
            participantId: parent.id,
            isCaptain: true,
          },
          include: {
            tournament: true,
          },
        }
      );

      return captainParticipations.map((p) => ({
        ...p.tournament,
        createdAt:
          p.tournament.createdAt instanceof Date
            ? p.tournament.createdAt.toISOString()
            : p.tournament.createdAt,
      }));
    },
    team: async (parent: any) => {
      const teamMember = await prisma.teamMember.findFirst({
        where: { participantId: parent.id },
        include: { team: true },
      });

      if (!teamMember) return null;

      return {
        ...teamMember.team,
        createdAt:
          teamMember.team.createdAt instanceof Date
            ? teamMember.team.createdAt.toISOString()
            : teamMember.team.createdAt,
      };
    },
    nominatedBy: async (parent: any) => {
      const drafts = await prisma.draft.findMany({
        where: { participantId: parent.id },
        include: {
          captain: true,
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
        tournament: {
          ...draft.tournament,
          createdAt:
            draft.tournament.createdAt instanceof Date
              ? draft.tournament.createdAt.toISOString()
              : draft.tournament.createdAt,
        },
      }));
    },
  },
  Team: {
    captain: async (parent: any) => {
      if (parent.captain) {
        return {
          ...parent.captain,
          createdAt:
            parent.captain.createdAt instanceof Date
              ? parent.captain.createdAt.toISOString()
              : parent.captain.createdAt,
        };
      }

      const team = await prisma.team.findUnique({
        where: { id: parent.id },
        include: { captain: true },
      });

      return {
        ...team.captain,
        createdAt:
          team.captain.createdAt instanceof Date
            ? team.captain.createdAt.toISOString()
            : team.captain.createdAt,
      };
    },

    members: async (parent: any) => {
      if (parent.members) {
        return parent.members;
      }

      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: parent.id },
        include: { participant: true },
      });

      return teamMembers.map((tm) => ({
        ...tm.participant,
        createdAt:
          tm.participant.createdAt instanceof Date
            ? tm.participant.createdAt.toISOString()
            : tm.participant.createdAt,
      }));
    },

    tournament: async (parent: any) => {
      if (parent.tournament) {
        return {
          ...parent.tournament,
          createdAt:
            parent.tournament.createdAt instanceof Date
              ? parent.tournament.createdAt.toISOString()
              : parent.tournament.createdAt,
        };
      }

      const team = await prisma.team.findUnique({
        where: { id: parent.id },
        include: { tournament: true },
      });

      return {
        ...team.tournament,
        createdAt:
          team.tournament.createdAt instanceof Date
            ? team.tournament.createdAt.toISOString()
            : team.tournament.createdAt,
      };
    },
  },
};
