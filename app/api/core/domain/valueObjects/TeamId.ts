import { ID } from './ID';

export class TeamId extends ID<string> {
  constructor(value: string) {
    super(value);
  }
}
