import { gql } from "@apollo/client";

export const GET_MATCHES_BY_TOURNAMENT = gql`
  query GetMatchesByTournament($tournamentId: String!) {
    allMatchesByTournamentId(tournamentId: $tournamentId) {
      matchId
      startDate
      endDate
      score1
      score2
      status
      court
      seed
      round
      verified
      bracketType

      tournament {
        tournamentId
        name
        createdBy {
          userId
          uuid
          name
          email
          phone
        }
      }

      # Connect through MatchParticipant to get teamNumber
      matchparticipantSet {
        edges {
          node {
            teamNumber
            participantId {
              participantId
              userId {
                userId
                name
                email
              }
              teamId {
                teamId
                name
              }
            }
          }
        }
      }
    }
  }
`;
