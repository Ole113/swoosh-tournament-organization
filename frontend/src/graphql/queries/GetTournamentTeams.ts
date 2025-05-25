import { gql } from "@apollo/client";

export const GET_TOURNAMENT_TEAMS = gql`
  query GetTournamentTeams($tournamentId: String!) {
    allTeams(tournamentId: $tournamentId) {
      edges {
        node {
          name
          description
          record
          teamId
          participantSet {
            edges {
              node {
                userId {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;
