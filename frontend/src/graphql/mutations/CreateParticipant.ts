import { gql } from "@apollo/client";

const CREATE_PARTICIPANT = gql`
  mutation CreateParticipant($teamId: Int!, $tournamentId: Int!, $userId: Int!) {
    createParticipant(teamId: $teamId, tournamentId: $tournamentId, userId: $userId) {
      participant {
        participantId
      }
    }
  }
`;

export default CREATE_PARTICIPANT;
