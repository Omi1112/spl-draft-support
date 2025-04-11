import { Tournament } from '../../domain/entities/Tournament';
import { Participant } from '../../domain/entities/Participant';
import { Team } from '../../domain/entities/Team';
import { TournamentRepository } from '../../domain/repositories/TournamentRepository';
import { DraftStatus } from '../../domain/valueObjects/DraftStatus';
import { ParticipantId } from '../../domain/valueObjects/ParticipantId';
import { TeamId } from '../../domain/valueObjects/TeamId';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { prisma } from '../persistence/prisma/client';
import { PrismaClient } from '@prisma/client';

export class PrismaTournamentRepository implements TournamentRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findAll(): Promise<Tournament[]> {
    const tournaments = await this.prismaClient.tournament.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return tournaments.map(
      (t) =>
        new Tournament(
          new TournamentId(t.id),
          t.name,
          t.createdAt,
          [], // 一覧取得時は参加者情報は含めない
          [] // 一覧取得時はチーム情報は含めない
        )
    );
  }

  async findById(id: TournamentId): Promise<Tournament | null> {
    const tournamentData = await this.prismaClient.tournament.findUnique({
      where: { id: id.value },
      include: {
        participations: {
          include: {
            participant: true,
          },
        },
        teams: {
          include: {
            members: {
              include: {
                participant: true,
              },
            },
            captain: true,
          },
        },
        draftStatus: true,
      },
    });

    if (!tournamentData) {
      return null;
    }

    // 参加者の変換
    const participants = tournamentData.participations.map((p) => {
      return new Participant(
        new ParticipantId(p.participant.id),
        p.participant.name,
        p.participant.weapon,
        p.participant.xp,
        p.participant.createdAt,
        p.isCaptain
      );
    });

    // チームの変換
    const teams = tournamentData.teams.map((t) => {
      return new Team(
        new TeamId(t.id),
        t.name,
        new ParticipantId(t.captainId),
        t.members.map((m) => new ParticipantId(m.participant.id))
      );
    });

    // ドラフトステータスの変換
    let draftStatus: DraftStatus | undefined;
    if (tournamentData.draftStatus) {
      draftStatus = new DraftStatus(
        tournamentData.draftStatus.round,
        tournamentData.draftStatus.turn,
        tournamentData.draftStatus.isActive ? 'in_progress' : 'completed'
      );
    }

    // トーナメントエンティティの作成
    return new Tournament(
      new TournamentId(tournamentData.id),
      tournamentData.name,
      tournamentData.createdAt,
      participants,
      teams,
      draftStatus
    );
  }

  async save(tournament: Tournament): Promise<Tournament> {
    // トーナメント情報の更新または作成
    await this.prismaClient.tournament.upsert({
      where: { id: tournament.id.value },
      update: {
        name: tournament.name,
      },
      create: {
        id: tournament.id.value,
        name: tournament.name,
        createdAt: tournament.createdAt,
      },
    });

    // ドラフトステータスの更新または作成
    if (tournament.draftStatus) {
      const isActive = tournament.draftStatus.status === 'in_progress';

      await this.prismaClient.draftStatus.upsert({
        where: { tournamentId: tournament.id.value },
        update: {
          round: tournament.draftStatus.round,
          turn: tournament.draftStatus.turn,
          isActive: isActive,
        },
        create: {
          tournamentId: tournament.id.value,
          round: tournament.draftStatus.round,
          turn: tournament.draftStatus.turn,
          isActive: isActive,
        },
      });
    }

    return tournament;
  }

  async delete(id: TournamentId): Promise<void> {
    // 関連するドラフトステータスも削除される（カスケード設定による）
    await this.prismaClient.tournament.delete({
      where: { id: id.value },
    });
  }
}
