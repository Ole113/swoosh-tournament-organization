import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { HeaderMenu } from './Header'; // Adjust import based on your project structure

// Mocking the useNavigate hook from react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(), // Mock useNavigate
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock MemoryRouter
}));

describe('HeaderMenu', () => {
  test('navigates to the correct page when a menu item is clicked', () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);

    const links = [
      { link: '/', label: 'Home' },
      { link: '/settings', label: 'Settings' },
      { link: '/login', label: 'Logout' },
    ];

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <HeaderMenu links={links} />
        </MantineProvider>
      </MemoryRouter>
    );

    // Simulate clicking the "Home" link
    fireEvent.click(screen.getByText('Home'));
    expect(navigate).toHaveBeenCalledWith('/');

    // Simulate clicking the "Settings" link
    fireEvent.click(screen.getByText('Settings'));
    expect(navigate).toHaveBeenCalledWith('/settings');
  });
});
