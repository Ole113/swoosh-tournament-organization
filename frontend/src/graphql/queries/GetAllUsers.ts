import { gql } from "@apollo/client";

export const GET_All_USERS = gql`
  query GetUser($email: String = "") {
    allUsers(email: $email) {
      edges {
        node {
          name
          email
          phone
        }
      }
    }
}`;
