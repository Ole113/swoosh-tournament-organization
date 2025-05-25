import { gql } from "@apollo/client";

export const GENERATE_ROUND_ROBIN_MATCHES = gql`
  mutation GenerateRoundRobinMatches($tournamentId: ID!) {
    generateRoundRobinMatches(tournamentId: $tournamentId) {
      matches {
        matchId
        startDate
        endDate
        status
        court
        participants(first: 100) {
          edges {
            node {
              teamId {
                name
              }
            }
          }
        }
      }
      message
    }
  }
`;
