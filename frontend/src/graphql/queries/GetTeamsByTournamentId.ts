import { gql } from "@apollo/client";

const GET_TEAMS_BY_TOURNAMENT_ID = gql`
    query GetTeamsByTournamentId($tournamentId: String!) {
      teamsByTournamentId(tournamentId: $tournamentId) {
        name
        description
        record
        teamId
        inviteLink
        isPrivate
        password
        participantSet {
          edges {
            node {
              userId {
                name
                phone
                email
                userId
                uuid
              }
              participantId
            }
          }
        }
        createdByUuid {
          name
          phone
          uuid
          email
          userId
        }
      }
    }
`;

export default GET_TEAMS_BY_TOURNAMENT_ID;