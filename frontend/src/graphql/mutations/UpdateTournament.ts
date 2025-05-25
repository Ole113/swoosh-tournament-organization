import { gql } from "@apollo/client";

export const UPDATE_TOURNAMENT = gql`
  mutation UpdateTournament(
    $tournamentId: ID!
    $name: String
    $description: String
    $startDate: DateTime
    $endDate: DateTime
    $format: String
    $teamSize: Int
    $maxTeams: Int
    $showEmail: Boolean
    $showPhone: Boolean
    $inviteLink: String
    $private: Boolean
    $password: String
  ) {
    updateTournament(
      tournamentId: $tournamentId
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
      isPrivate: $private
      password: $password
    ) {
      tournament {
        tournamentId
        name
        description
        startDate
        endDate
        format
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

