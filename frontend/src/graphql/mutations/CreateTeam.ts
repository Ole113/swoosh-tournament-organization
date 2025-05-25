import { gql } from "@apollo/client";

const CREATE_TEAM = gql`
  mutation CreateTeam(
    $name: String!
    $description: String
    $tournamentId: Int!
    $record: String
    $isPrivate: Boolean!
    $inviteLink: String
    $password: String
    $createdByUuid: String!
  ) {
    createTeam(
      name: $name
      description: $description
      tournamentId: $tournamentId
      record: $record
      isPrivate: $isPrivate
      inviteLink: $inviteLink
      password: $password
      createdByUuid: $createdByUuid
    ) {
      team {
        teamId
        record
        name
        description
        tournamentId {
          tournamentId
        }
      }
    }
  }
`;

export default CREATE_TEAM;
