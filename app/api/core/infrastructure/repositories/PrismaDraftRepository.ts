
import { Draft } from '../../domain/entities/Draft';
import { DraftRepository } from '../../domain/repositories/DraftRepository';
import { DraftId } from '../../domain/valueObjects/DraftId';
import { ParticipantId } from '../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { prisma } from '../persistence/prisma/client';

/**
 * ドラフトリポジトリのPrisma実装
 */
export class PrismaDraftRepository implements DraftRepository {
  /**
   * IDでドラフトを検索
   * @param id
   * @returns
   */
  async findById(id: DraftId): Promise<Draft | null> {
    const draft = await prisma.draft.findUnique({
      where: { id: id.value },
      include: {
        captain: true,
        participant: true,
      },
    });

    if (!draft) {
      return null;
    }

    return this.toDomainEntity(draft);
  }

  /**
   * トーナメントIDでドラフト一覧を検索
   * @param tournamentId
   * @returns
   */
  async findByTournamentId(tournamentId: TournamentId): Promise<Draft[]> {
    const drafts = await prisma.draft.findMany({
      where: { tournamentId: tournamentId.value },
      orderBy: [{ round: 'asc' }, { turn: 'asc' }, { createdAt: 'asc' }],
      include: {
        captain: true,
        participant: true,
      },
    });

    return drafts.map(this.toDomainEntity);
  }

  /**
   * キャプテンIDでドラフト一覧を検索
   * @param captainId
   * @returns
   */
  async findByCaptainId(captainId: ParticipantId): Promise<Draft[]> {
    const drafts = await prisma.draft.findMany({
      where: { captainId: captainId.value },
      orderBy: [{ round: 'asc' }, { turn: 'asc' }, { createdAt: 'asc' }],
      include: {
        captain: true,
        participant: true,
      },
    });

    return drafts.map(this.toDomainEntity);
  }

  /**
   * トーナメントIDとキャプテンIDでドラフト一覧を検索
   * @param tournamentId
   * @param captainId
   * @returns
   */
  async findByTournamentAndCaptain(
    tournamentId: TournamentId,
    captainId: ParticipantId
  ): Promise<Draft[]> {
    const drafts = await prisma.draft.findMany({
      where: {
        tournamentId: tournamentId.value,
        captainId: captainId.value,
      },
      orderBy: [{ round: 'asc' }, { turn: 'asc' }, { createdAt: 'asc' }],
      include: {
        captain: true,
        participant: true,
      },
    });

    return drafts.map(this.toDomainEntity);
  }

  /**
   * ドラフトを保存
   * @param draft
   * @returns
   */
  async save(draft: Draft): Promise<Draft> {
    const savedDraft = await prisma.draft.upsert({
      where: { id: draft.id.value },
      update: {
        tournamentId: draft.tournamentId.value,
        captainId: draft.captainId.value,
        participantId: draft.participantId.value,
        round: draft.round,
        turn: draft.turn,
        status: draft.status,
      },
      create: {
        id: draft.id.value,
        tournamentId: draft.tournamentId.value,
        captainId: draft.captainId.value,
        participantId: draft.participantId.value,
        round: draft.round,
        turn: draft.turn,
        status: draft.status,
        createdAt: draft.createdAt,
      },
      include: {
        captain: true,
        participant: true,
      },
    });

    return this.toDomainEntity(savedDraft);
  }

  /**
   * ドラフトを削除
   * @param id
   */
  async delete(id: DraftId): Promise<void> {
    await prisma.draft.delete({
      where: { id: id.value },
    });
  }

  /**
   * トーナメントIDに紐づくすべてのドラフトを削除
   * @param tournamentId 対象のトーナメントID
   */
  async deleteByTournamentId(tournamentId: TournamentId): Promise<void> {
    await prisma.draft.deleteMany({
      where: { tournamentId: tournamentId.value },
    });
  }

  /**
   * Prismaのデータをドメインエンティティに変換する
   * @param draft PrismaのDraftデータ
   * @returns Draftエンティティ
   */
  private toDomainEntity(draft: {
    id: string;
    tournamentId: string;
    captainId: string;
    participantId: string;
    round: number;
    turn: number;
    status: string;
    createdAt: Date;
  }): Draft {
    return Draft.reconstruct(
      draft.id,
      draft.tournamentId,
      draft.captainId,
      draft.participantId,
      draft.round,
      draft.turn,
      draft.status,
      draft.createdAt
    );
  }
}
