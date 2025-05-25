import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { TournamentBracket } from './TournamentBracket';
import { MockedProvider } from '@apollo/client/testing';
import { GET_MATCHES_BY_TOURNAMENT } from '@/graphql/queries/GetMatches';

const mockTournamentData = {
  allMatchesByTournamentId: [],
};

const mocks = [
  {
    request: {
      query: GET_MATCHES_BY_TOURNAMENT,
      variables: { tournamentId: '1' },
    },
    result: {
      data: mockTournamentData,
    },
  },
];

describe('TournamentBracket', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <MockedProvider mocks={mocks} addTypename={false}>
            <TournamentBracket id="1" />
          </MockedProvider>
        </MantineProvider>
      </MemoryRouter>
    );
  });
});
