import { gql } from "@apollo/client";

export const CREATE_TOURNAMENT = gql`
  mutation CreateTournament(
    $createdById: String!
    $name: String!
    $startDate: DateTime!
    $endDate: DateTime!
    $description: String
    $format: String!
    $teamSize: Int
    $maxTeams: Int
    $showEmail: Boolean!
    $showPhone: Boolean!
    $inviteLink: String!
    $isPrivate: Boolean!
    $password: String
  ) {
    createTournament(
      createdById: $createdById
      name: $name
      description: $description
      startDate: $startDate
      endDate: $endDate
      format: $format
      teamSize: $teamSize
      maxTeams: $maxTeams
      showEmail: $showEmail
      showPhone: $showPhone
      inviteLink: $inviteLink
      isPrivate: $isPrivate
      password: $password
    ) {
      tournament {
        tournamentId
        description
        endDate
        format
        name
        startDate
        teamSize
        maxTeams
        showEmail
        showPhone
        inviteLink
        isPrivate
        createdBy {
          name
          email
          phone
        }
      }
    }
  }
`;
