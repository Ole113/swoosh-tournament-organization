import { gql } from "@apollo/client";

export const GET_ALL_TOURNAMENTS = gql`
  query GetAllTournaments {
    allTournaments {
      edges {
        node {
          tournamentId
          name
          description
          startDate
          endDate
          format
          teamSize
          maxTeams
          isPrivate
          createdBy {
            userId
            name
          }
          showEmail
          showPhone
        }
      }
    }
  }
`;
