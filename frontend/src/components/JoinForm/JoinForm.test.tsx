import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, useNavigate } from 'react-router-dom'; // Import useNavigate here
import { vi } from 'vitest';
import { JoinForm } from './JoinForm';

// Mocking the useNavigate hook and MemoryRouter explicitly
vi.mock('react-router-dom', () => {
  return {
    useNavigate: vi.fn(), // Mock only the useNavigate hook
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock MemoryRouter
  };
});

describe('JoinForm', () => {
  test('navigates to the correct tournament page when the tournament ID is entered and the link is clicked', () => {
    // Create a mock navigate function
    const navigate = vi.fn();

    // Mock useNavigate to return the mock navigate function
    vi.mocked(useNavigate).mockReturnValue(navigate);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <JoinForm />
        </MantineProvider>
      </MemoryRouter>
    );

    // Simulate entering a tournament ID
    const input = screen.getByPlaceholderText('');
    fireEvent.change(input, { target: { value: '123' } });

    // Simulate clicking the "link" (Anchor component with the icon)
    fireEvent.click(screen.getByRole('link'));

    // Check if navigate was called with the correct URL
    expect(navigate).toHaveBeenCalledWith('/tournament/123');
  });
});
