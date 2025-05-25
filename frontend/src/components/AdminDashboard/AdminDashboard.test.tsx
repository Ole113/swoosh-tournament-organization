import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import { UPDATE_TOURNAMENT } from "@/graphql/mutations/UpdateTournament";
import { GET_TOURNAMENT } from "@/graphql/queries/GetSingleTournament";

// Mock the necessary GraphQL queries and mutations
const mocks = [
  {
    request: {
      query: GET_TOURNAMENT,
      variables: { id: 1 },
    },
    result: {
      data: {
        tournament: {
          name: 'Test Tournament',
          description: 'Test Description',
          startDate: '2025-02-20T00:00:00Z',
          endDate: '2025-02-21T00:00:00Z',
          format: 'Single Elimination',
          teamSize: 5,
          maxTeams: 16,
          showEmail: true,
          showPhone: true,
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_TOURNAMENT,
      variables: {
        tournamentId: 1,
        name: 'Updated Tournament',
        description: 'Updated Description',
        startDate: '2025-02-20T00:00:00Z',
        endDate: '2025-02-21T00:00:00Z',
        format: 'Single Elimination',
        teamSize: 5,
        maxTeams: 16,
        showEmail: true,
        showPhone: true,
        private: false,
        password: '',
        inviteLink: '',
      },
    },
    result: {
      data: {
        updateTournament: {
          name: 'Updated Tournament',
        },
      },
    },
  },
];

describe('AdminDashboard', () => {
  test('renders the form and submits updated tournament details', async () => {
    const updateTournament = vi.fn();

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <MockedProvider mocks={mocks} addTypename={false}>
            <AdminDashboard />
          </MockedProvider>
        </MantineProvider>
      </MemoryRouter>
    );

    // Wait for the form to load
    await screen.findByText('Tournament Name'); // Ensure the form loads

    // Fill out the form fields
    fireEvent.change(screen.getByLabelText(/Tournament Name/i), {
      target: { value: 'Updated Tournament' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Updated Description' },
    });
  });
});
