import { gql } from '@apollo/client';

export const UPDATE_PHONE = gql`
  mutation UpdatePhone($uuid: UUID!, $newPhone: String!) {
    updatePhone(uuid: $uuid, newPhone: $newPhone) {
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