import { gql } from "@apollo/client";
  
const GET_USER_BY_UUID = gql`
    query GetUserByUUID($uuid: UUID!) {
    allUsers(uuid: $uuid) {
      edges {
        node {
          userId
        }
      }
    }
  }
`;
  
export default GET_USER_BY_UUID;