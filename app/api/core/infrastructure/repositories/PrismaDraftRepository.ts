import { Draft } from '../../domain/entities/Draft';
import { DraftRepository } from '../../domain/repositories/DraftRepository';
import { DraftId } from '../../domain/valueObjects/DraftId';
import { ParticipantId } from '../../domain/valueObjects/ParticipantId';
import { TournamentId } from '../../domain/valueObjects/TournamentId';
import { prisma } from '../persistence/prisma/client';
import { Draft as PrismaDraft, Participant, Prisma } from '@prisma/client';

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
   * トーナメントのドラフト関連データをすべてリセット（削除して初期状態に戻す）
   * @param tournamentId リセット対象のトーナメントID
   * @returns リセット成功したかどうか
   */
  async reset(tournamentId: TournamentId): Promise<boolean> {
    try {
      // トランザクションを使用して複数の操作を原子的に実行
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. チームメンバーを削除（先に削除しないと外部キー制約に引っかかる）
        const teams = await tx.team.findMany({
          where: { tournamentId: tournamentId.value },
          select: { id: true },
        });

        const teamIds = teams.map((team: { id: string }) => team.id);

        if (teamIds.length > 0) {
          await tx.teamMember.deleteMany({
            where: { teamId: { in: teamIds } },
          });
        }

        // 2. チームを削除
        await tx.team.deleteMany({
          where: { tournamentId: tournamentId.value },
        });

        // 3. TournamentParticipantの参照をクリア
        await tx.tournamentParticipant.updateMany({
          where: { tournamentId: tournamentId.value },
          data: { teamId: null },
        });

        // 4. ドラフト履歴を削除
        await tx.draft.deleteMany({
          where: { tournamentId: tournamentId.value },
        });

        // 5. 既存のドラフトステータスを削除
        await tx.draftStatus.deleteMany({
          where: { tournamentId: tournamentId.value },
        });

        // 6. 新しいドラフトステータスを初期状態で作成
        await tx.draftStatus.create({
          data: {
            tournamentId: tournamentId.value,
            round: 1,
            turn: 1,
            isActive: true,
          },
        });
      });

      return true;
    } catch (error) {
      console.error('ドラフトリセットエラー:', error);
      throw new Error('ドラフトのリセットに失敗しました');
    }
  }

  /**
   * Prismaモデルをドメインエンティティに変換
   * @param prismaModel
   * @returns
   */
  private toDomainEntity(
    prismaModel: PrismaDraft & {
      captain?: Participant;
      participant?: Participant;
    }
  ): Draft {
    return new Draft(
      new DraftId(prismaModel.id),
      new TournamentId(prismaModel.tournamentId),
      new ParticipantId(prismaModel.captainId),
      new ParticipantId(prismaModel.participantId),
      prismaModel.round,
      prismaModel.turn,
      prismaModel.status,
      prismaModel.createdAt
    );
  }
}
