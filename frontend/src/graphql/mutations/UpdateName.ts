import { gql } from '@apollo/client';

export const UPDATE_NAME = gql`
  mutation UpdateName($uuid: UUID!, $newName: String!) {
    updateName(uuid: $uuid, newName: $newName) {
      success
      user {
        uuid
        email
        name
        phone
      }
    }
  }
`;
