import { gql } from "@apollo/client";

export const GET_USER_TOURNAMENTS = gql`
  query GetAllTournaments(
    $createdBy: ID! 
    $inviteLink: UUID
    ) {
      allTournaments(
      createdBy: $createdBy
      inviteLink: $inviteLink
      ) {
        edges {
          node {
            name
            description
            endDate
            format
            maxTeams
            showEmail
            showPhone
            startDate
            teamSize
            inviteLink
            isPrivate
            password
            createdBy {
              name
              email
              phone
            }
          }
        }
      }
    }
`;
