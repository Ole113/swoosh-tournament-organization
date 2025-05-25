import { gql } from "@apollo/client";

export const GET_TOURNAMENTS_BY_USER = gql`
  query GetTournamentsByUser {
    allParticipants {
      edges {
        node {
          participantId
          userId {
            userId
            uuid
          }
          tournamentId {
            tournamentId
            name
            description
            startDate
            endDate
            format
            teamSize
            maxTeams
            isPrivate
            createdBy {
              userId
              name
            }
          }
          teamId {
            teamId
            name
          }
        }
      }
    }
  }
`;
