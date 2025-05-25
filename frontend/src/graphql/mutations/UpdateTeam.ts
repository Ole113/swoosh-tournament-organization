import { gql } from "@apollo/client";

const UPDATE_TEAM = gql`
mutation UpdateTeam(
    $teamId: ID!
    $isPrivate: Boolean! 
    $description: String 
    $inviteLink: String
    $name: String 
    $password: String, 
    $record: String) {
    updateTeam(
        isPrivate: $isPrivate
        teamId: $teamId
        description: $description
        inviteLink: $inviteLink
        name: $name
        password: $password
        record: $record
    ) {
    team {
      description
      inviteLink
      isPrivate
      name
      password
      record
    }
  }
}`;

export default UPDATE_TEAM;