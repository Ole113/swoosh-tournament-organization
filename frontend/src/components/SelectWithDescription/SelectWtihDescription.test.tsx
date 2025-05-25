import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import SelectWithDescription from './SelectWithDescription'; // Adjust import path as necessary
import Team from '../../types/Team';

describe('SelectWithDescription', () => {
  const setSelectedTeam = vi.fn();
  const tournamentTeams: Partial<Team>[] = [
    {
      name: 'Team A',
      teamId: '1',
      participantSet: [
        { uuid: 'uuid1', participantId: 'p1', name: 'Alice', userId: 'a1', tournamentId: 't1', teamId: '1', email: 'alice@example.com', phone: '1234567890' },
        { uuid: 'uuid2', participantId: 'p2', name: 'Bob', userId: 'b1', tournamentId: 't1', teamId: '1', email: 'bob@example.com', phone: '1234567891' },
      ],
    },
    {
      name: 'Team B',
      teamId: '2',
      participantSet: [
        { uuid: 'uuid3', participantId: 'p3', name: 'Charlie', userId: 'c1', tournamentId: 't2', teamId: '2', email: 'charlie@example.com', phone: '1234567892' },
        { uuid: 'uuid4', participantId: 'p4', name: 'David', userId: 'd1', tournamentId: 't2', teamId: '2', email: 'david@example.com', phone: '1234567893' },
      ],
    },
  ];

  test('renders the component and displays available teams', () => {
    render(
      <MantineProvider>
        <SelectWithDescription
          tournamentTeams={tournamentTeams}
          setSelectedTeam={setSelectedTeam}
        />
      </MantineProvider>
    );

    // Ensure the placeholder and team options are rendered
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  test('selecting a team calls setSelectedTeam with the correct team', () => {
    render(
      <MantineProvider>
        <SelectWithDescription
          tournamentTeams={tournamentTeams}
          setSelectedTeam={setSelectedTeam}
        />
      </MantineProvider>
    );

    // Open the combobox dropdown by clicking the input element
    fireEvent.click(screen.getByRole('button')); // Using button role for combobox target
    
    // Click on the "Team A" option
    fireEvent.click(screen.getByText('Team A'));

    // Ensure setSelectedTeam is called with the correct team
    expect(setSelectedTeam).toHaveBeenCalledWith({
      name: 'Team A',
      teamId: '1',
      participantSet: [
        { uuid: 'uuid1', participantId: 'p1', name: 'Alice', userId: 'a1', tournamentId: 't1', teamId: '1', email: 'alice@example.com', phone: '1234567890' },
        { uuid: 'uuid2', participantId: 'p2', name: 'Bob', userId: 'b1', tournamentId: 't1', teamId: '1', email: 'bob@example.com', phone: '1234567891' },
      ],
    });
  });
});
