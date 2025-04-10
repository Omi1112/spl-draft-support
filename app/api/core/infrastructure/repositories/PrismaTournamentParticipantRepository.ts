// filepath: /workspace/app/api/core/infrastructure/repositories/PrismaTournamentParticipantRepository.ts
import { TournamentParticipantRepository } from '../../domain/repositories/TournamentParticipantRepository';
import { prisma } from '../persistence/prisma/client';

export class PrismaTournamentParticipantRepository implements TournamentParticipantRepository {
  async findByTournamentAndParticipant(tournamentId: string, participantId: string) {
    const tournamentParticipant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_participantId: {
          tournamentId,
          participantId,
        },
      },
    });

    if (!tournamentParticipant) {
      return null;
    }

    return {
      id: tournamentParticipant.id,
      tournamentId: tournamentParticipant.tournamentId,
      participantId: tournamentParticipant.participantId,
      createdAt: tournamentParticipant.createdAt,
      isCaptain: tournamentParticipant.isCaptain,
    };
  }

  async create(input: { tournamentId: string; participantId: string; isCaptain: boolean }) {
    const tournamentParticipant = await prisma.tournamentParticipant.create({
      data: {
        tournamentId: input.tournamentId,
        participantId: input.participantId,
        isCaptain: input.isCaptain,
        createdAt: new Date(),
      },
    });

    return {
      id: tournamentParticipant.id,
      tournamentId: tournamentParticipant.tournamentId,
      participantId: tournamentParticipant.participantId,
      createdAt: tournamentParticipant.createdAt,
      isCaptain: tournamentParticipant.isCaptain,
    };
  }

  async update(tournamentId: string, participantId: string, data: { isCaptain?: boolean }) {
    const tournamentParticipant = await prisma.tournamentParticipant.update({
      where: {
        tournamentId_participantId: {
          tournamentId,
          participantId,
        },
      },
      data,
    });

    return {
      id: tournamentParticipant.id,
      tournamentId: tournamentParticipant.tournamentId,
      participantId: tournamentParticipant.participantId,
      createdAt: tournamentParticipant.createdAt,
      isCaptain: tournamentParticipant.isCaptain,
    };
  }

  async updateCaptainFlag(tournamentId: string, participantId: string, isCaptain: boolean) {
    // 既存のupdateメソッドを活用
    return this.update(tournamentId, participantId, { isCaptain });
  }
}
