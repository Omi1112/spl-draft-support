import { Participant } from '../../domain/entities/Participant';
import { ParticipantRepository } from '../../domain/repositories/ParticipantRepository';
import { ParticipantId } from '../../domain/valueObjects/ParticipantId';
import { TeamId } from '../../domain/valueObjects/TeamId';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { prisma } from '../persistence/prisma/client';

export class PrismaParticipantRepository implements ParticipantRepository {
  /**
   * プリズマのデータをドメインエンティティに変換する
   * @param participantData プリズマから取得した参加者データ
   * @returns ドメインエンティティ
   */
  private mapToDomainEntity(participantData: any): Participant {
    // reconstruct メソッドでエンティティを作成
    return Participant.reconstruct(
      participantData.id,
      participantData.name,
      participantData.weapon,
      participantData.xp,
      participantData.createdAt
    );
  }

  async findById(id: ParticipantId): Promise<Participant | null> {
    const participant = await prisma.participant.findUnique({
      where: { id: id.value },
      include: {
        memberTeams: {
          include: {
            team: true,
          },
        },
        captainTeams: true,
        participations: true,
      },
    });

    if (!participant) {
      return null;
    }

    return this.mapToDomainEntity(participant);
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Participant[]> {
    const participants = await prisma.participant.findMany({
      where: {
        participations: {
          some: {
            tournamentId: tournamentId.value,
          },
        },
      },
      include: {
        memberTeams: {
          include: {
            team: true,
          },
        },
        captainTeams: true,
        participations: {
          where: {
            tournamentId: tournamentId.value,
          },
        },
      },
    });

    return participants.map((p) => this.mapToDomainEntity(p));
  }

  async findCaptains(tournamentId: TournamentId): Promise<Participant[]> {
    const captains = await prisma.participant.findMany({
      where: {
        participations: {
          some: {
            tournamentId: tournamentId.value,
            isCaptain: true,
          },
        },
      },
      include: {
        memberTeams: {
          include: {
            team: true,
          },
        },
        captainTeams: true,
        participations: {
          where: {
            tournamentId: tournamentId.value,
          },
        },
      },
    });

    return captains.map((c) => this.mapToDomainEntity(c));
  }

  async save(participant: Participant): Promise<Participant> {
    // 参加者情報の更新または作成
    await prisma.participant.upsert({
      where: { id: participant.id.value },
      update: {
        name: participant.name,
        weapon: participant.weapon,
        xp: participant.xp,
      },
      create: {
        id: participant.id.value,
        name: participant.name,
        weapon: participant.weapon,
        xp: participant.xp,
        createdAt: participant.createdAt,
      },
    });

    return participant;
  }

  async delete(id: ParticipantId): Promise<void> {
    await prisma.participant.delete({
      where: { id: id.value },
    });
  }
}
