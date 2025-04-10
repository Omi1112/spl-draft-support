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
 * トーナメントリポジトリのモッククラス
 */
export class MockTournamentRepository implements TournamentRepository {
  public tournaments: Tournament[] = [];

  async findById(id: TournamentId): Promise<Tournament | null> {
    const tournament = this.tournaments.find((t) => t.id.value === id.value);
    return tournament || null;
  }

  async save(tournament: Tournament): Promise<Tournament> {
    const index = this.tournaments.findIndex((t) => t.id.value === tournament.id.value);
    if (index !== -1) {
      this.tournaments[index] = tournament;
    } else {
      this.tournaments.push(tournament);
    }
    return tournament;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async delete(id: TournamentId): Promise<void> {
    this.tournaments = this.tournaments.filter((t) => t.id.value !== id.value);
  }
}

/**
 * 参加者リポジトリのモッククラス
 */
export class MockParticipantRepository implements ParticipantRepository {
  public participants: Participant[] = [];
  // トーナメントとその参加者の関連を保持するマップ
  private tournamentParticipants: Map<string, ParticipantId[]> = new Map();

  async findById(id: ParticipantId): Promise<Participant | null> {
    const participant = this.participants.find((p) => p.id.value === id.value);
    return participant || null;
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
    const index = this.participants.findIndex((p) => p.id.value === participant.id.value);
    if (index !== -1) {
      this.participants[index] = participant;
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
 * チームリポジトリのモッククラス
 */
export class MockTeamRepository implements TeamRepository {
  public teams: Team[] = [];
  // トーナメントとそのチームの関連を保持するマップ
  private tournamentTeams: Map<string, TeamId[]> = new Map();

  async findById(id: TeamId): Promise<Team | null> {
    const team = this.teams.find((t) => t.id.value === id.value);
    return team || null;
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Team[]> {
    const teamIds = this.tournamentTeams.get(tournamentId.value) || [];
    return this.teams.filter((t) => teamIds.some((id) => id.value === t.id.value));
  }

  async findByCaptainId(captainId: ParticipantId): Promise<Team | null> {
    return this.teams.find((t) => t.captainId.value === captainId.value) || null;
  }

  async save(team: Team): Promise<Team> {
    const index = this.teams.findIndex((t) => t.id.value === team.id.value);
    if (index !== -1) {
      this.teams[index] = team;
    } else {
      this.teams.push(team);
    }
    return team;
  }

  async delete(id: TeamId): Promise<void> {
    this.teams = this.teams.filter((t) => t.id.value !== id.value);
  }
}

/**
 * ドラフトリポジトリのモッククラス
 */
export class MockDraftRepository implements DraftRepository {
  public drafts: Draft[] = [];

  async findById(id: DraftId): Promise<Draft | null> {
    const draft = this.drafts.find((d) => d.id.value === id.value);
    return draft || null;
  }

  async findByTournamentId(tournamentId: TournamentId): Promise<Draft[]> {
    return this.drafts.filter((d) => d.tournamentId.value === tournamentId.value);
  }

  async findByCaptainId(captainId: ParticipantId): Promise<Draft[]> {
    return this.drafts.filter((d) => d.captainId.value === captainId.value);
  }

  async findByTournamentAndCaptain(
    tournamentId: TournamentId,
    captainId: ParticipantId
  ): Promise<Draft[]> {
    return this.drafts.filter(
      (d) => d.tournamentId.value === tournamentId.value && d.captainId.value === captainId.value
    );
  }

  async save(draft: Draft): Promise<Draft> {
    const index = this.drafts.findIndex((d) => d.id.value === draft.id.value);
    if (index !== -1) {
      this.drafts[index] = draft;
    } else {
      this.drafts.push(draft);
    }
    return draft;
  }

  async delete(id: DraftId): Promise<void> {
    this.drafts = this.drafts.filter((d) => d.id.value !== id.value);
  }

  async reset(tournamentId: TournamentId): Promise<boolean> {
    const before = this.drafts.length;
    this.drafts = this.drafts.filter((d) => d.tournamentId.value !== tournamentId.value);
    return before > this.drafts.length;
  }
}
