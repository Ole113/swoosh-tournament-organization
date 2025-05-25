import { gql } from '@apollo/client';

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($uuid: UUID!, $oldPassword: String!, $newPassword: String!) {
    updatePassword(uuid: $uuid, oldPassword: $oldPassword, newPassword: $newPassword) {
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