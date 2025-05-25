import { gql } from "@apollo/client";

export const GENERATE_NEXT_ROUND = gql`
  mutation GenerateNextRound($tournamentId: ID!) {
    generateNextRound(tournamentId: $tournamentId) {
      success
      message
    }
  }
`;
