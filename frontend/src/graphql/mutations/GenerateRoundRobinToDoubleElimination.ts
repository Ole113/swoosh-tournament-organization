import { gql } from "@apollo/client";

export const GENERATE_ROUND_ROBIN_TO_DOUBLE_ELIMINATION = gql`
  mutation GenerateRoundRobinToDoubleElimination($tournamentId: ID!) {
    generateRoundRobinToDoubleElimination(tournamentId: $tournamentId) {
      success
      message
      matches {
        matchId
        startDate
        endDate
        status
        court
        bracketType
        round
        seed
        participants(first: 100) {
          edges {
            node {
              teamId {
                name
              }
              teamNumber
            }
          }
        }
      }
    }
  }
`;