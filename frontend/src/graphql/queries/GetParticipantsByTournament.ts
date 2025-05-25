import { gql } from "@apollo/client";

const GET_PARTICIPANTS_BY_TOURNAMENT_ID = gql`
  query GetParticipantsByTournamentId($tournamentId: String!) {
    participantsByTournamentId(tournamentId: $tournamentId) {
      participantId
      userId {
        userId
        name
        email
        phone
        uuid
      }
      teamId {
        teamId
        name
      }
      tournamentId {
        tournamentId
        name
      }
    }
  }
`;

export default GET_PARTICIPANTS_BY_TOURNAMENT_ID;