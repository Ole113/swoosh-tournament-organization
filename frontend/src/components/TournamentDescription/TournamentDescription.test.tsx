import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import { TournamentDescription } from './TournamentDescription';

const mockClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:4000/graphql',
});

describe('TournamentDescription', () => {
  test('renders the tournament name and description', () => {
    render(
      <ApolloProvider client={mockClient}>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MantineProvider>
            <TournamentDescription
              name="Test Tournament"
              description="A test tournament"
              startDate={new Date('2025-02-01')}
              tournamentTeams={[]} // mock as empty array or add mock teams
            />
          </MantineProvider>
        </MemoryRouter>
      </ApolloProvider>
    );

    expect(screen.getByText(/Test Tournament/)).toBeInTheDocument();
    expect(screen.getByText(/A test tournament/)).toBeInTheDocument();
  });
});
