import { gql } from "@apollo/client";

export const GENERATE_ROUND_ROBIN_TO_SINGLE_ELIMINATION = gql`
  mutation GenerateRoundRobinToSingleElimination($tournamentId: ID!) {
    generateRoundRobinToSingleElimination(tournamentId: $tournamentId) {
      success
      message
      matches {
        matchId
        round
        seed
        status
        score1
        score2
        startDate
        endDate
        court
      }
    }
  }
`;
