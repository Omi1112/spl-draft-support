import { ID } from './ID';

export class ParticipantId extends ID<string> {
  constructor(value: string) {
    super(value);
  }
}
