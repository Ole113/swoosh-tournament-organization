import { render, screen } from '@testing-library/react';
import { AdminInviteUsers } from './AdminInviteUsers';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { GET_TOURNAMENT } from '@/graphql/queries/GetSingleTournament';

// Mock the entire react-router-dom module and override useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ tournamentCode: '123' }), // override only useParams
  };
});

// Mock GraphQL query response
const mocks = [
  {
    request: {
      query: GET_TOURNAMENT,
      variables: { id: '123' },
    },
    result: {
      data: {
        tournament: {
          name: 'Test Tournament',
          inviteLink: 'fake-invite',
          createdBy: {
            uuid: 'mock-uuid',
            userId: '789',
          },
        },
      },
    },
  },
];

describe('AdminInviteUsers', () => {
  test('renders the invite users form', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <MockedProvider mocks={mocks} addTypename={false}>
            <AdminInviteUsers />
          </MockedProvider>
        </MantineProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Invite Users')).toBeInTheDocument();
    expect(await screen.findByPlaceholderText('Enter email address')).toBeInTheDocument();
  });
});
