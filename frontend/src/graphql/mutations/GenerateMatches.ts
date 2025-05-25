import { gql } from "@apollo/client";

export const GENERATE_MATCHES = gql`
  mutation GenerateMatches($tournamentId: ID!) {
    generateMatches(tournamentId: $tournamentId) {
      matches {
        matchId 
        startDate
        endDate
        status
        court
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
    }
  }
`;
