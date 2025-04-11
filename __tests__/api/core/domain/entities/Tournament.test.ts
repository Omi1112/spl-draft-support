import { Tournament } from '../../../../../app/api/core/domain/entities/Tournament';
import { TournamentId } from '../../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../../app/api/core/domain/valueObjects/ParticipantId';
import { DraftStatus } from '../../../../../app/api/core/domain/valueObjects/DraftStatus';
import {
  createTestParticipant,
  createTestTeam,
  createTestDraftStatus,
} from '../../testHelpers/factoryHelpers';
import {
  TestContext,
  createTestContext,
  expectErrorWithMessage,
  cleanupMocks,
} from '../../testHelpers/testBestPractices';

describe('Tournament Entity', () => {
  // 各テスト用の独立したコンテキストを作成
  const createContext = createTestContext<Tournament>(() => {
    const tournamentId = new TournamentId('test-tournament-id');
    const createdAt = new Date();
    const tournament = new Tournament(tournamentId, 'テストトーナメント', createdAt, [], []);

    return {
      sut: tournament,
      dependencies: {
        tournamentId,
        createdAt,
      },
    };
  });

  // モックを保存するための配列
  let mocks: jest.SpyInstance[] = [];

  // 各テスト後にモックをリストア
  afterEach(() => {
    cleanupMocks(mocks);
    mocks = [];
  });

  describe('基本的なプロパティ', () => {
    it('トーナメントが正しく生成されるべき', () => {
      // 毎回新しいコンテキストを取得
      const { sut, dependencies } = createContext();

      expect(sut.id.value).toBe('test-tournament-id');
      expect(sut.name).toBe('テストトーナメント');
      expect(sut.createdAt).toBe(dependencies.createdAt);
      expect(sut.participants).toEqual([]);
      expect(sut.teams).toEqual([]);
      expect(sut.draftStatus).toBeUndefined();
    });
  });

  describe('addParticipant', () => {
    it('参加者を追加できるべき', () => {
      const { sut } = createContext();
      const participant = createTestParticipant({ id: 'test-participant-id', name: 'テスト太郎' });

      sut.addParticipant(participant);

      expect(sut.participants.length).toBe(1);
      expect(sut.participants[0].id.value).toBe('test-participant-id');
      expect(sut.participants[0].name).toBe('テスト太郎');
    });

    it('同じIDの参加者を追加するとエラーになるべき', () => {
      const { sut } = createContext();
      const participant = createTestParticipant({ id: 'test-participant-id' });

      sut.addParticipant(participant);

      const duplicateParticipant = createTestParticipant({ id: 'test-participant-id' });

      expectErrorWithMessage(
        () => sut.addParticipant(duplicateParticipant),
        '参加者ID test-participant-id はすでに登録されています'
      );
    });
  });

  describe('removeParticipant', () => {
    it('参加者を削除できるべき', () => {
      const { sut } = createContext();
      // 各テストで必要な参加者を追加
      const participant1 = createTestParticipant({ id: 'participant-1' });
      const participant2 = createTestParticipant({ id: 'participant-2' });
      sut.addParticipant(participant1);
      sut.addParticipant(participant2);

      expect(sut.participants.length).toBe(2);

      sut.removeParticipant('participant-1');

      expect(sut.participants.length).toBe(1);
      expect(sut.participants[0].id.value).toBe('participant-2');
    });

    it('チームに所属している参加者を削除しようとするとエラーになるべき', () => {
      const { sut } = createContext();

      // テスト用の参加者とチームをセットアップ
      const participant = createTestParticipant({ id: 'participant-1' });
      const captain = createTestParticipant({ id: 'captain-id', isCaptain: true });

      sut.addParticipant(participant);
      sut.addParticipant(captain);

      // チームの作成
      const team = createTestTeam({
        id: 'team-id',
        name: 'テストチーム',
        captainId: 'captain-id',
        memberIds: ['participant-1'],
      });

      sut.addTeam(team);

      // チームのメンバーになっている参加者を削除しようとするとエラーになる
      expectErrorWithMessage(
        () => sut.removeParticipant('participant-1'),
        'このユーザーはチームに所属しているため削除できません'
      );
    });
  });

  describe('toggleCaptain', () => {
    it('参加者のキャプテン状態をトグルできるべき', () => {
      const { sut } = createContext();
      const participant = createTestParticipant({ id: 'participant-id', isCaptain: false });
      sut.addParticipant(participant);

      const updated = sut.toggleCaptain(new ParticipantId('participant-id'));
      expect(updated.isCaptain).toBe(true);

      const toggledAgain = sut.toggleCaptain(new ParticipantId('participant-id'));
      expect(toggledAgain.isCaptain).toBe(false);
    });

    it('存在しない参加者IDでトグルしようとするとエラーになるべき', () => {
      const { sut } = createContext();

      expectErrorWithMessage(
        () => sut.toggleCaptain(new ParticipantId('non-existent-id')),
        '参加者ID non-existent-id が見つかりません'
      );
    });
  });

  describe('addTeam', () => {
    it('チームを追加できるべき', () => {
      const { sut } = createContext();
      // キャプテンとして設定する参加者を追加
      const captain = createTestParticipant({ id: 'captain-id', isCaptain: true });
      sut.addParticipant(captain);

      const team = createTestTeam({
        id: 'team-id',
        name: 'テストチーム',
        captainId: 'captain-id',
      });

      sut.addTeam(team);

      expect(sut.teams.length).toBe(1);
      expect(sut.teams[0].id.value).toBe('team-id');
      expect(sut.teams[0].name).toBe('テストチーム');
    });

    it('キャプテンがトーナメントに存在しない場合はエラーになるべき', () => {
      const { sut } = createContext();

      const team = createTestTeam({
        id: 'team-id',
        name: 'テストチーム',
        captainId: 'non-existent-captain',
      });

      expectErrorWithMessage(
        () => sut.addTeam(team),
        'キャプテンID non-existent-captain はこのトーナメントに登録されていません'
      );
    });

    it('同じIDのチームを追加するとエラーになるべき', () => {
      const { sut } = createContext();
      // キャプテンとして設定する参加者を追加
      const captain = createTestParticipant({ id: 'captain-id', isCaptain: true });
      sut.addParticipant(captain);

      const team = createTestTeam({
        id: 'team-id',
        name: 'テストチーム',
        captainId: 'captain-id',
      });

      sut.addTeam(team);

      const duplicateTeam = createTestTeam({
        id: 'team-id',
        name: 'テストチーム2',
        captainId: 'captain-id',
      });

      expectErrorWithMessage(
        () => sut.addTeam(duplicateTeam),
        'チームID team-id はすでに登録されています'
      );
    });
  });

  describe('updateDraftStatus', () => {
    it('ドラフトステータスを更新できるべき', () => {
      const { sut } = createContext();
      const draftStatus = createTestDraftStatus('not_started');

      sut.updateDraftStatus(draftStatus);

      expect(sut.draftStatus?.status).toBe('not_started');
    });

    it('条件を満たさずにドラフトを開始しようとするとエラーになるべき', () => {
      const { sut } = createContext();
      // in_progressステータスを設定
      const draftStatus = createTestDraftStatus('in_progress');

      expectErrorWithMessage(
        () => sut.updateDraftStatus(draftStatus),
        'ドラフト開始条件を満たしていません'
      );
    });
  });
});
