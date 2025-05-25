import { gql } from "@apollo/client";

const DELETE_TEAM_PARTICIPANT = gql`
mutation DeleteTeamParticipant($participantId: Int!) {
  deleteParticipant(participantId: $participantId) {
    success
  }
}
`;

export default DELETE_TEAM_PARTICIPANT;