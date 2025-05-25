import { render, screen, fireEvent } from '@testing-library/react';
import CreateTeam from "./CreateTeam";
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

describe('CreateTeam', () => {
  test('renders the form and submits team details', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <MockedProvider>
            <CreateTeam
              setCurrentComponent={() => {}}
              userInTournament={false} // or true, depending on your test logic
            />
          </MockedProvider>
        </MantineProvider>
      </MemoryRouter>
    );

    // Check if the "Create Your Team" title is rendered
    expect(screen.getByText('Create Your Team')).toBeInTheDocument();

    // Check if the "Name" input field is present using placeholder text
    const nameInput = screen.getByPlaceholderText('Name');
    expect(nameInput).toBeInTheDocument();

    // Check if the "Description" textarea is rendered using placeholder text
    const descriptionInput = screen.getByPlaceholderText('A short description about your team!');
    expect(descriptionInput).toBeInTheDocument();

    // Simulate filling in the form
    fireEvent.change(nameInput, { target: { value: 'Test Team' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test team description' } });

    // Simulate form submission
    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    // Optionally add assertions after submission behavior
  });
});
