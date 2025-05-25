import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($uuid: UUID!) {
    allUsers(uuid: $uuid) {
      edges {
        node {
          userId
          name
          email
          phone
          uuid
        }
      }
    }
  }
`;
