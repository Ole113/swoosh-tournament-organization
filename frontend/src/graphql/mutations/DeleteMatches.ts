import { gql } from "@apollo/client";

export const DELETE_MATCHES = gql`
  mutation DeleteMatches($tournamentId: ID!) {
    deleteMatches(tournamentId: $tournamentId) {
      success
      message
    }
  }
`;
