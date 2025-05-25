import { gql } from "@apollo/client";

export const GENERATE_DOUBLE_ELIMINATION_MATCHES = gql`
  mutation GenerateDoubleEliminationMatches($tournamentId: ID!) {
    generateDoubleEliminationMatches(tournamentId: $tournamentId) {
      matches {
        matchId
        startDate
        endDate
        status
        court
        bracketType
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