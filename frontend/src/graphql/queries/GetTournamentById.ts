import { gql } from "@apollo/client";

const GET_TOURNAMENT_BY_ID = gql`
  query GetTournamentById(
    $id: ID!
    ) {
    tournament(id: $id) {
      name
      inviteLink
      description
      endDate
      format
      maxTeams
      password
      isPrivate
      showEmail
      showPhone
      startDate
      teamSize
      tournamentId
      createdBy {
        email
        phone
        name
        uuid
      }
    }
  }
`;

export default GET_TOURNAMENT_BY_ID;