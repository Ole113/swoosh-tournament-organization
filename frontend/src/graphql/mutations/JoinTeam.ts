import { gql } from "@apollo/client";

export const JOIN_TEAM = gql`
  mutation JoinTeam($teamId: Int!, $tournamentId: Int!, $userId: Int!) {
    createParticipant(teamId: $teamId, tournamentId: $tournamentId, userId: $userId) {
      participant {
        participantId
      }
    }
  }
`;
