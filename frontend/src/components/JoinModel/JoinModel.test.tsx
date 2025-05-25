import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JoinModel  from './JoinModel';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';

// Mock props data
const mockProps = {
  modelType: 'password', // You can change this to 'invite' or 'invalid' for different tests
  name: 'Summer Tournament',
  eventType: 'tournament',
  opened: true,
  password: 'secret123',
  backClicked: vi.fn(),
  successfulModelAction: vi.fn(),
  buttonLabels: ['Submit', 'Go Back'],
};

describe('JoinModel', () => {
  test('renders password model and checks password functionality', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <JoinModel {...mockProps} />
        </MantineProvider>
      </MemoryRouter>
    );

    // Check if the modal content is rendered
    expect(screen.getByText('This tournament is password protected')).toBeInTheDocument();
    expect(screen.getByText('This tournament is private and needs a password to be joined. If you don\'t know the password ask the tournament creator.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // Simulate typing an incorrect password and submitting
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByText('Submit'));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('The password was incorrect')).toBeInTheDocument();
    });

    // Simulate typing the correct password and submitting
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByText('Submit'));

    // Wait for successful action
    await waitFor(() => {
      expect(mockProps.successfulModelAction).toHaveBeenCalledTimes(1);
    });
  });

  test('renders invite model and checks button functionality', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <JoinModel {...{ ...mockProps, modelType: 'invite' }} />
        </MantineProvider>
      </MemoryRouter>
    );
  
    // Check if the invite content is rendered
    expect(screen.getByText('You have been invited to the tournament Summer Tournament!')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();  // Change 'View' to 'Submit'
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  
    // Simulate clicking the "Submit" button
    fireEvent.click(screen.getByText('Submit'));
  
    // Check if the successful model action was called
    expect(mockProps.successfulModelAction).toHaveBeenCalledTimes(2);
  
    // Simulate clicking the "Go Back" button
    fireEvent.click(screen.getByText('Go Back'));
  
    // Check if backClicked function was called
    expect(mockProps.backClicked).toHaveBeenCalledTimes(1);
  });  
});
