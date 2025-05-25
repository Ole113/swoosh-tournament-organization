import { gql } from '@apollo/client';

export const UPDATE_EMAIL = gql`
  mutation UpdateEmail($uuid: UUID!, $newEmail: String!) {
    updateEmail(uuid: $uuid, newEmail: $newEmail) {
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
