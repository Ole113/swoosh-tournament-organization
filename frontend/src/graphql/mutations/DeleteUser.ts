import { gql } from "@apollo/client";

export const DELETE_USER = gql`
  mutation DeleteUser($password: String!, $uuid: String!) {
    deleteUser(password: $password, uuid: $uuid) {
      success
    }
  }
`;
