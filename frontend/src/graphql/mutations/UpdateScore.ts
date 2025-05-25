import { gql } from '@apollo/client';

export const UPDATE_MATCH_SCORE = gql`
  mutation UpdateMatchScore($matchId: ID!, $score1: String!, $score2: String!, $verified: Int) {
    updateMatchScore(matchId: $matchId, score1: $score1, score2: $score2, verified: $verified) {
      success
      match {
        matchId
        score1
        score2
        verified
      }
    }
  }
`;
