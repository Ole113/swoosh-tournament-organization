import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTournament } from './CreateTournament';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

// Mock user data to simulate localStorage content
const mockUserData = {
  uuid: 'user-uuid',
};

beforeEach(() => {
  // Set the mock user data in localStorage before each test
  localStorage.setItem('user', JSON.stringify(mockUserData));
});

describe('CreateTournament', () => {
  test('renders the form and submits tournament details', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <MockedProvider>
            <CreateTournament />
          </MockedProvider>
        </MantineProvider>
      </MemoryRouter>
    );

    // Check if the "Create a Tournament" title is rendered
    expect(screen.getByText('Create a Tournament')).toBeInTheDocument();

    // Check if the "Name" input field is present using placeholder text
    const nameInput = screen.getByPlaceholderText("The tournament's name");
    expect(nameInput).toBeInTheDocument();

    // Simulate filling in the form
    fireEvent.change(nameInput, { target: { value: 'Test Tournament' } });

    // Simulate form submission
    const submitButton = screen.getByText('Create Tournament');
    fireEvent.click(submitButton);
   
  });
});
