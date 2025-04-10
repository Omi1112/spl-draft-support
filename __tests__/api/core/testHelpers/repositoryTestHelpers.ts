/**
 * リポジトリモック検証のためのテストヘルパー
 * テスト時にリポジトリインターフェースと実装の一致を確認するための便利関数を提供します
 */
import { TournamentRepository } from '../../../../app/api/core/domain/repositories/TournamentRepository';
import { ParticipantRepository } from '../../../../app/api/core/domain/repositories/ParticipantRepository';
import { TeamRepository } from '../../../../app/api/core/domain/repositories/TeamRepository';
import { DraftRepository } from '../../../../app/api/core/domain/repositories/DraftRepository';

import { RepositoryInterfaceChecker } from './interfaceChecker';

/**
 * モックリポジトリファクトリインターフェース
 */
export interface MockRepositoriesFactory {
  createTournamentRepository(): TournamentRepository;
  createParticipantRepository(): ParticipantRepository;
  createTeamRepository(): TeamRepository;
  createDraftRepository(): DraftRepository;
}

/**
 * テスト用リポジトリコンテキスト
 * テストで使用する全てのリポジトリインスタンスを含みます
 */
export interface RepositoryTestContext {
  tournamentRepository: TournamentRepository;
  participantRepository: ParticipantRepository;
  teamRepository: TeamRepository;
  draftRepository: DraftRepository;
}

/**
 * テスト用にリポジトリをセットアップする関数
 * 全てのリポジトリインスタンスを作成し、インターフェースとの一致を検証します
 *
 * @param factory リポジトリインスタンスを生成するファクトリ
 * @returns テストで使用するリポジトリコンテキスト
 */
export function setupRepositoriesForTest(factory: MockRepositoriesFactory): RepositoryTestContext {
  // リポジトリインスタンスの作成
  const tournamentRepository = factory.createTournamentRepository();
  const participantRepository = factory.createParticipantRepository();
  const teamRepository = factory.createTeamRepository();
  const draftRepository = factory.createDraftRepository();

  // インターフェースとの一致を検証
  RepositoryInterfaceChecker.checkAllRepositories(
    tournamentRepository,
    participantRepository,
    teamRepository,
    draftRepository
  );

  return {
    tournamentRepository,
    participantRepository,
    teamRepository,
    draftRepository,
  };
}

/**
 * テスト用にリポジトリをクリーンアップする関数
 * テスト間の独立性を確保するためにリポジトリの状態をリセットします
 *
 * @param context リポジトリコンテキスト
 */
export function cleanupRepositories(context: RepositoryTestContext): void {
  // リポジトリインスタンスの状態をリセット
  // 具体的なリセット方法はリポジトリの実装に依存します
}

/**
 * 単一リポジトリのテスト用ヘルパー
 * 特定のリポジトリだけを使用するテストのためのヘルパー関数
 */
export class SingleRepositoryTestHelper {
  /**
   * TournamentRepositoryのテスト用セットアップ
   *
   * @param factory リポジトリファクトリ
   * @returns TournamentRepositoryインスタンス
   */
  static setupTournamentRepository(factory: MockRepositoriesFactory): TournamentRepository {
    const repository = factory.createTournamentRepository();
    RepositoryInterfaceChecker.checkTournamentRepository(repository);
    return repository;
  }

  /**
   * ParticipantRepositoryのテスト用セットアップ
   *
   * @param factory リポジトリファクトリ
   * @returns ParticipantRepositoryインスタンス
   */
  static setupParticipantRepository(factory: MockRepositoriesFactory): ParticipantRepository {
    const repository = factory.createParticipantRepository();
    RepositoryInterfaceChecker.checkParticipantRepository(repository);
    return repository;
  }

  /**
   * TeamRepositoryのテスト用セットアップ
   *
   * @param factory リポジトリファクトリ
   * @returns TeamRepositoryインスタンス
   */
  static setupTeamRepository(factory: MockRepositoriesFactory): TeamRepository {
    const repository = factory.createTeamRepository();
    RepositoryInterfaceChecker.checkTeamRepository(repository);
    return repository;
  }

  /**
   * DraftRepositoryのテスト用セットアップ
   *
   * @param factory リポジトリファクトリ
   * @returns DraftRepositoryインスタンス
   */
  static setupDraftRepository(factory: MockRepositoriesFactory): DraftRepository {
    const repository = factory.createDraftRepository();
    RepositoryInterfaceChecker.checkDraftRepository(repository);
    return repository;
  }
}

import { Tournament } from '../../../../app/api/core/domain/entities/Tournament';
import { Participant } from '../../../../app/api/core/domain/entities/Participant';
import { Team } from '../../../../app/api/core/domain/entities/Team';
import { Draft } from '../../../../app/api/core/domain/entities/Draft';
import { TournamentId } from '../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '../../../../app/api/core/domain/valueObjects/TeamId';
import { DraftId } from '../../../../app/api/core/domain/valueObjects/DraftId';

/**
 * リポジトリテスト用ヘルパー関数
 * 各リポジトリの標準的なテストケースを提供します
 */
export class RepositoryTestHelpers {
  /**
   * トーナメントリポジトリの基本機能をテスト
   * @param repository テスト対象のリポジトリ
   * @param createTournament トーナメントオブジェクト生成関数
   */
  static async testTournamentRepository(
    repository: TournamentRepository,
    createTournament: () => Tournament
  ): Promise<void> {
    // 保存と検索のテスト
    const tournament = createTournament();
    await repository.save(tournament);

    const found = await repository.findById(tournament.id);
    expect(found).not.toBeNull();
    expect(found?.id.value).toBe(tournament.id.value);
    expect(found?.name).toBe(tournament.name);

    // 全件取得のテスト
    const allTournaments = await repository.findAll();
    expect(allTournaments.length).toBeGreaterThanOrEqual(1);
    expect(allTournaments.some((t: Tournament) => t.id.value === tournament.id.value)).toBeTruthy();

    // 削除のテスト
    await repository.delete(tournament.id);
    const deleted = await repository.findById(tournament.id);
    expect(deleted).toBeNull();
  }

  /**
   * 参加者リポジトリの基本機能をテスト
   * @param repository テスト対象のリポジトリ
   * @param createParticipant 参加者オブジェクト生成関数
   * @param tournamentId テスト用トーナメントID
   */
  static async testParticipantRepository(
    repository: ParticipantRepository,
    createParticipant: () => Participant,
    tournamentId: TournamentId
  ): Promise<void> {
    const participant = createParticipant();
    // tournamentIdは参加者エンティティの生成時に設定されていると仮定
    await repository.save(participant);

    const found = await repository.findById(participant.id);
    expect(found).not.toBeNull();
    expect(found?.id.value).toBe(participant.id.value);
    expect(found?.name).toBe(participant.name);

    const byTournament = await repository.findByTournamentId(tournamentId);
    expect(byTournament.length).toBeGreaterThanOrEqual(1);
    expect(byTournament.some((p: Participant) => p.id.value === participant.id.value)).toBeTruthy();

    await repository.delete(participant.id);
    const deleted = await repository.findById(participant.id);
    expect(deleted).toBeNull();
  }

  /**
   * チームリポジトリの基本機能をテスト
   * @param repository テスト対象のリポジトリ
   * @param createTeam チームオブジェクト生成関数
   * @param tournamentId テスト用トーナメントID
   */
  static async testTeamRepository(
    repository: TeamRepository,
    createTeam: () => Team,
    tournamentId: TournamentId
  ): Promise<void> {
    const team = createTeam();
    // tournamentIdはチームエンティティの生成時に設定されていると仮定
    await repository.save(team);

    const found = await repository.findById(team.id);
    expect(found).not.toBeNull();
    expect(found?.id.value).toBe(team.id.value);
    expect(found?.name).toBe(team.name);

    const byTournament = await repository.findByTournamentId(tournamentId);
    expect(byTournament.length).toBeGreaterThanOrEqual(1);
    expect(byTournament.some((t: Team) => t.id.value === team.id.value)).toBeTruthy();

    await repository.delete(team.id);
    const deleted = await repository.findById(team.id);
    expect(deleted).toBeNull();
  }

  /**
   * ドラフトリポジトリの基本機能をテスト
   * @param repository テスト対象のリポジトリ
   * @param createDraft ドラフトオブジェクト生成関数
   * @param tournamentId テスト用トーナメントID
   */
  static async testDraftRepository(
    repository: DraftRepository,
    createDraft: () => Draft,
    tournamentId: TournamentId
  ): Promise<void> {
    const draft = createDraft();
    // tournamentIdはドラフトエンティティの生成時に設定されていると仮定
    await repository.save(draft);

    const byTournament = await repository.findByTournamentId(tournamentId);
    expect(byTournament.length).toBeGreaterThanOrEqual(1);

    // ドラフトの更新をテスト
    // イミュータブルなDraftオブジェクトなので、新しいインスタンスを作成
    // 注: 読み取り専用プロパティには直接代入できないため、新しいオブジェクトを作成
    const updatedDraft = new Draft(
      draft.id,
      draft.tournamentId,
      draft.captainId,
      draft.participantId,
      draft.round,
      draft.turn,
      'in_progress', // 更新するステータス
      draft.createdAt
    );
    // 新しいドラフトを保存
    await repository.save(updatedDraft);

    const updatedDrafts = await repository.findByTournamentId(tournamentId);
    const foundUpdated = updatedDrafts.find((d: Draft) => d.id.value === draft.id.value);
    expect(foundUpdated).not.toBeUndefined();
    expect(foundUpdated?.status).toBe('in_progress');
  }
}
