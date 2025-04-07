// Mutation型の定義

export const mutationTypeDefs = /* GraphQL */ `
  type Mutation {
    createTournament(input: CreateTournamentInput!): Tournament!
    createParticipant(input: CreateParticipantInput!): Participant!
    addParticipantToTournament(
      input: AddParticipantToTournamentInput!
    ): TournamentParticipant!
    setCaptain(input: SetCaptainInput!): TournamentParticipant!
    startDraft(input: StartDraftInput!): [Team!]!
    resetDraft(input: ResetDraftInput!): Boolean!
    nominateParticipant(input: NominateParticipantInput!): Draft!
    updateDraftStatus(input: UpdateDraftStatusInput!): Draft!
    updateDraftRound(input: UpdateDraftRoundInput!): DraftStatus!
  }
`;
