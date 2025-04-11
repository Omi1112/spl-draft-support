import { TournamentRepository } from '../../../../app/api/core/domain/repositories/TournamentRepository';
import { ParticipantRepository } from '../../../../app/api/core/domain/repositories/ParticipantRepository';
import { TeamRepository } from '../../../../app/api/core/domain/repositories/TeamRepository';
import { DraftRepository } from '../../../../app/api/core/domain/repositories/DraftRepository';
import { Tournament } from '../../../../app/api/core/domain/entities/Tournament';
import { Participant } from '../../../../app/api/core/domain/entities/Participant';
import { Team } from '../../../../app/api/core/domain/entities/Team';
import { Draft } from '../../../../app/api/core/domain/entities/Draft';
import { TournamentId } from '../../../../app/api/core/domain/valueObjects/TournamentId';
import { ParticipantId } from '../../../../app/api/core/domain/valueObjects/ParticipantId';
import { TeamId } from '../../../../app/api/core/domain/valueObjects/TeamId';
import { DraftId } from '../../../../app/api/core/domain/valueObjects/DraftId';

/**
 * TournamentRepositoryのモック
 */
export class MockTournamentRepository implements TournamentRepository {
  tournaments: Tournament[] = [];

  async findById(id: TournamentId): Promise<Tournament | null> {
    return this.tournaments.find((t) => t.id.value === id.value) || null;
  }

  async findAll(): Promise<Tournament[]> {
    return [...this.tournaments];
  }

  async save(tournament: Tournament): Promise<Tournament> {
    const existingIndex = this.tournaments.findIndex((t) => t.id.value === tournament.id.value);

    if (existingIndex >= 0) {
      this.tournaments[existingIndex] = tournament;
    } else {
      this.tournaments.push(tournament);
    }

    return tournament;
  }

  async delete(id: TournamentId): Promise<void> {
    this.tournaments = this.tournaments.filter((t) => t.id.value !== id.value);
  }
}

/**
 * ParticipantRepositoryのモック
 */
export class MockParticipantRepository implements ParticipantRepository {
  participants: Participant[] = [];
  // トーナメントとその参加者の関連を保持するマップ
  private tournamentParticipants: Map<string, ParticipantId[]> = new Map();

  async findById(id: ParticipantId): Promise<Participant | null> {
    return this.participants.find((p) => p.id.value === id.value) || null;
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Participant[]> {
    const participantIds = this.tournamentParticipants.get(tournamentId.value) || [];
    return this.participants.filter((p) => participantIds.some((id) => id.value === p.id.value));
  }

  async findCaptains(tournamentId: TournamentId): Promise<Participant[]> {
    const participantIds = this.tournamentParticipants.get(tournamentId.value) || [];
    return this.participants.filter(
      (p) => participantIds.some((id) => id.value === p.id.value) && p.isCaptain
    );
  }

  async save(participant: Participant): Promise<Participant> {
    const existingIndex = this.participants.findIndex((p) => p.id.value === participant.id.value);

    if (existingIndex >= 0) {
      this.participants[existingIndex] = participant;
    } else {
      this.participants.push(participant);
    }

    return participant;
  }

  async delete(id: ParticipantId): Promise<void> {
    this.participants = this.participants.filter((p) => p.id.value !== id.value);
  }
}

/**
 * TeamRepositoryのモック
 */
export class MockTeamRepository implements TeamRepository {
  teams: Team[] = [];
  // トーナメントとそのチームの関連を保持するマップ
  private tournamentTeams: Map<string, TeamId[]> = new Map();

  async findById(id: TeamId): Promise<Team | null> {
    return this.teams.find((t) => t.id.value === id.value) || null;
  }

  async findAll(): Promise<Team[]> {
    return [...this.teams];
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Team[]> {
    const teamIds = this.tournamentTeams.get(tournamentId.value) || [];
    return this.teams.filter((t) => teamIds.some((id) => id.value === t.id.value));
  }

  async findByCaptainId(captainId: ParticipantId): Promise<Team | null> {
    return this.teams.find((t) => t.captainId.value === captainId.value) || null;
  }

  async save(team: Team): Promise<Team> {
    const existingIndex = this.teams.findIndex((t) => t.id.value === team.id.value);

    if (existingIndex >= 0) {
      this.teams[existingIndex] = team;
    } else {
      this.teams.push(team);
    }

    return team;
  }

  async delete(id: TeamId): Promise<void> {
    this.teams = this.teams.filter((t) => t.id.value !== id.value);
  }

  /**
   * トーナメントIDに紐づくすべてのチームを削除
   * @param tournamentId 対象のトーナメントID
   */
  async deleteByTournamentId(tournamentId: TournamentId): Promise<void> {
    // トーナメントに関連するチームIDを取得
    const teamIds = this.tournamentTeams.get(tournamentId.value) || [];
    // これらのチームをteams配列から削除
    this.teams = this.teams.filter((t) => !teamIds.some((id) => id.value === t.id.value));
    // トーナメントとチームの関連を削除
    this.tournamentTeams.delete(tournamentId.value);
  }
}

/**
 * DraftRepositoryのモック
 */
export class MockDraftRepository implements DraftRepository {
  drafts: Draft[] = [];

  async findById(id: DraftId): Promise<Draft | null> {
    const found = this.drafts.find((draft) => draft.id.value === id.value);
    return found || null;
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Draft[]> {
    return this.drafts.filter((draft) => draft.tournamentId.value === tournamentId.value);
  }

  async findByCaptainId(captainId: ParticipantId): Promise<Draft[]> {
    return this.drafts.filter((draft) => draft.captainId.value === captainId.value);
  }

  async findByTournamentAndCaptain(
    tournamentId: TournamentId,
    captainId: ParticipantId
  ): Promise<Draft[]> {
    return this.drafts.filter(
      (draft) =>
        draft.tournamentId.value === tournamentId.value && draft.captainId.value === captainId.value
    );
  }

  async save(draft: Draft): Promise<Draft> {
    const existingIndex = this.drafts.findIndex((d) => d.id.value === draft.id.value);

    if (existingIndex >= 0) {
      this.drafts[existingIndex] = draft;
    } else {
      this.drafts.push(draft);
    }

    return draft;
  }

  async delete(id: DraftId): Promise<void> {
    this.drafts = this.drafts.filter((d) => d.id.value !== id.value);
  }

  /**
   * トーナメントIDに紐づくすべてのドラフトを削除
   * @param tournamentId 対象のトーナメントID
   */
  async deleteByTournamentId(tournamentId: TournamentId): Promise<void> {
    this.drafts = this.drafts.filter((draft) => draft.tournamentId.value !== tournamentId.value);
  }

  async reset(tournamentId: TournamentId): Promise<boolean> {
    const initialLength = this.drafts.length;
    this.drafts = this.drafts.filter((draft) => draft.tournamentId.value !== tournamentId.value);
    return initialLength > this.drafts.length;
  }
}
