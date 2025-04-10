/**
 * インターフェースと実装の一致を検証するためのユーティリティ
 * テスト実行前に使用して、リポジトリインターフェースとモック実装の不一致を検出します。
 */

/**
 * 実装がインターフェースのメソッドをすべて実装しているかチェックする関数
 * @param implementation 実装オブジェクト
 * @param interfaceMethods インターフェースのメソッド名の配列
 * @returns エラーメッセージの配列。エラーがなければ空配列
 */
export function checkImplementation(implementation: any, interfaceMethods: string[]): string[] {
  const errors: string[] = [];

  // インターフェースで定義されたすべてのメソッドが実装されているかチェック
  for (const methodName of interfaceMethods) {
    if (!(methodName in implementation)) {
      errors.push(`実装に ${methodName} メソッドがありません`);
    } else if (typeof implementation[methodName] !== 'function') {
      errors.push(`${methodName} はメソッドではありません`);
    }
  }

  return errors;
}

/**
 * モックリポジトリがリポジトリインターフェースと一致しているかチェックする関数
 * @param mockRepository モックリポジトリ
 * @param repositoryInterface リポジトリインターフェース
 */
export function checkRepositoryImplementation(
  mockName: string,
  mockRepository: any,
  methodsToCheck: string[]
): void {
  const errors = checkImplementation(mockRepository, methodsToCheck);

  if (errors.length > 0) {
    console.error(`${mockName} がインターフェースと一致していません:`);
    errors.forEach((error) => console.error(`- ${error}`));
    throw new Error(`${mockName} の実装が不完全です`);
  }
}

/**
 * リポジトリインターフェースの検証クラス
 * テスト用モックリポジトリがインターフェースを正しく実装しているかを検証します
 */
import { TournamentRepository } from '../../../../app/api/core/domain/repositories/TournamentRepository';
import { ParticipantRepository } from '../../../../app/api/core/domain/repositories/ParticipantRepository';
import { TeamRepository } from '../../../../app/api/core/domain/repositories/TeamRepository';
import { DraftRepository } from '../../../../app/api/core/domain/repositories/DraftRepository';

export class RepositoryInterfaceChecker {
  /**
   * 全てのリポジトリインターフェースの実装を検証
   *
   * @param tournamentRepository トーナメントリポジトリ
   * @param participantRepository 参加者リポジトリ
   * @param teamRepository チームリポジトリ
   * @param draftRepository ドラフトリポジトリ
   */
  static checkAllRepositories(
    tournamentRepository: TournamentRepository,
    participantRepository: ParticipantRepository,
    teamRepository: TeamRepository,
    draftRepository: DraftRepository
  ): void {
    this.checkTournamentRepository(tournamentRepository);
    this.checkParticipantRepository(participantRepository);
    this.checkTeamRepository(teamRepository);
    this.checkDraftRepository(draftRepository);
  }

  /**
   * TournamentRepositoryインターフェースの実装を検証
   *
   * @param repository 検証対象のリポジトリ
   */
  static checkTournamentRepository(repository: TournamentRepository): void {
    this.checkRequiredMethod(repository, 'save', 'TournamentRepository');
    this.checkRequiredMethod(repository, 'findById', 'TournamentRepository');
    this.checkRequiredMethod(repository, 'findAll', 'TournamentRepository');
    this.checkRequiredMethod(repository, 'delete', 'TournamentRepository');
  }

  /**
   * ParticipantRepositoryインターフェースの実装を検証
   *
   * @param repository 検証対象のリポジトリ
   */
  static checkParticipantRepository(repository: ParticipantRepository): void {
    this.checkRequiredMethod(repository, 'save', 'ParticipantRepository');
    this.checkRequiredMethod(repository, 'findById', 'ParticipantRepository');
    this.checkRequiredMethod(repository, 'findByTournamentId', 'ParticipantRepository');
    this.checkRequiredMethod(repository, 'delete', 'ParticipantRepository');
  }

  /**
   * TeamRepositoryインターフェースの実装を検証
   *
   * @param repository 検証対象のリポジトリ
   */
  static checkTeamRepository(repository: TeamRepository): void {
    this.checkRequiredMethod(repository, 'save', 'TeamRepository');
    this.checkRequiredMethod(repository, 'findById', 'TeamRepository');
    this.checkRequiredMethod(repository, 'findByTournamentId', 'TeamRepository');
    this.checkRequiredMethod(repository, 'delete', 'TeamRepository');
  }

  /**
   * DraftRepositoryインターフェースの実装を検証
   *
   * @param repository 検証対象のリポジトリ
   */
  static checkDraftRepository(repository: DraftRepository): void {
    this.checkRequiredMethod(repository, 'save', 'DraftRepository');
    this.checkRequiredMethod(repository, 'findByTournamentId', 'DraftRepository');
    this.checkRequiredMethod(repository, 'update', 'DraftRepository');
  }

  /**
   * オブジェクトが指定されたメソッドを実装しているかチェック
   *
   * @param obj チェック対象のオブジェクト
   * @param methodName メソッド名
   * @param interfaceName インターフェース名（エラーメッセージ用）
   */
  private static checkRequiredMethod(obj: any, methodName: string, interfaceName: string): void {
    if (typeof obj[methodName] !== 'function') {
      throw new Error(
        `${interfaceName} インターフェースの実装エラー: ${methodName} メソッドが実装されていません`
      );
    }
  }
}
