import { gql } from '@apollo/client';

export const UPDATE_MATCH = gql`
  mutation UpdateMatch (
    $matchId: ID!
    $score1: String
    $score2: String
    $seed: String
    $startDate: DateTime
    $court: String
  ) {
  updateMatch(
    matchId: $matchId
    score1: $score1
    score2: $score2
    seed: $seed
    startDate: $startDate
    court: $court
  ) {
    match {
      score1
      score2
      seed
      startDate
      court
    }
  }
}`;