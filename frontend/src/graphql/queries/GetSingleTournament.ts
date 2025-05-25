import { gql } from '@apollo/client';

export const GET_TOURNAMENT = gql`
  query GetTournament($id: ID!) {
    tournament(id: $id) {
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
      password
      createdBy {
        userId
        uuid
        name
        email
        phone
      }
      participants {
        edges {
          node {
            participantId
            userId {
              userId
              uuid
              name
              email
              phone
            }
            teamId {
              teamId
              name
            }
          }
        }
      }
      matchSet {
        edges {
          node {
            matchId
            startDate
            endDate
            score1
            score2
            status
            court
            seed
            round
          }
        }
      }
    }
  }
`;

