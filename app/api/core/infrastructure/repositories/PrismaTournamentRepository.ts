import { Tournament } from '../../domain/entities/Tournament';
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

  /**
   * プリズマのデータをドメインエンティティに変換する
   * @param tournamentData プリズマから取得したトーナメントデータ
   * @returns ドメインエンティティ
   */
  private mapToDomainEntity(tournamentData: any): Tournament {
    return Tournament.reconstruct(
      tournamentData.id,
      tournamentData.name,
      tournamentData.createdAt,
      DraftStatus.reconstruct(
        tournamentData.draftStatus.round,
        tournamentData.draftStatus.turn,
        tournamentData.draftStatus.isActive
      )
    );
  }

  async findAll(): Promise<Tournament[]> {
    const tournaments = await this.prismaClient.tournament.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return tournaments.map((t) => this.mapToDomainEntity(t));
  }

  async findById(id: TournamentId): Promise<Tournament | null> {
    const tournamentData = await this.prismaClient.tournament.findUnique({
      where: { id: id.value },
      include: {
        participations: true,
        teams: true,
        draftStatus: true,
      },
    });

    if (!tournamentData) {
      return null;
    }

    return this.mapToDomainEntity(tournamentData);
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
      const draftStatus = tournament.draftStatus;

      await this.prismaClient.draftStatus.upsert({
        where: { tournamentId: tournament.id.value },
        update: {
          round: draftStatus.round,
          turn: draftStatus.turn,
          isActive: draftStatus.isActive,
        },
        create: {
          tournamentId: tournament.id.value,
          round: draftStatus.round,
          turn: draftStatus.turn,
          isActive: draftStatus.isActive,
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
