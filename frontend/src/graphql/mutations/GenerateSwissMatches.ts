import { gql } from "@apollo/client";

export const GENERATE_SWISS_MATCHES = gql`
  mutation GenerateSwissMatches($tournamentId: ID!) {
    generateSwissMatches(tournamentId: $tournamentId) {
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