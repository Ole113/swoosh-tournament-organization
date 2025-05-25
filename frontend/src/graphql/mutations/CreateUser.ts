import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation CreateUser(
    $name: String!
    $email: String!
    $phone: String!
    $password: String!
    $uuid: String!
  ) {
    createUser(
      name: $name
      email: $email
      phone: $phone
      password: $password
      uuid: $uuid
    ) {
      user {
        userId
        name
        email
        phone
        uuid
      }
    }
  }
`;
