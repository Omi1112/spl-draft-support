import { ID } from './ID';

export class TournamentId extends ID<string> {
  constructor(value: string) {
    super(value);
  }
}
