import { gql } from "@apollo/client";

export const KICK_TEAM = gql`
  mutation KickTeam($teamId: ID!, $tournamentId: ID!) {
    kickTeam(teamId: $teamId, tournamentId: $tournamentId) {
      success
      message
    }
  }
`; 