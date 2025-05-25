import { gql } from "@apollo/client";

export const DELETE_TOURNAMENT = gql`
  mutation DeleteTournament($tournamentId: Int!) {
    deleteTournament(tournamentId: $tournamentId){
      success
    }
  }
`;
