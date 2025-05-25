import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSetting } from './ProfileSetting';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

// Mock user data to simulate localStorage content
const mockUserData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  uuid: 'user-uuid',
};

beforeEach(() => {
  // Set the mock user data in localStorage before each test
  localStorage.setItem('user', JSON.stringify(mockUserData));
});

describe('ProfileSetting', () => {
  test('renders user information and toggles tabs', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <MockedProvider>
            <ProfileSetting />
          </MockedProvider>
        </MantineProvider>
      </MemoryRouter>
    );

    // Check if the user's name, email, and phone are displayed
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });

    // Click on Password Setting tab
    const passwordTab = screen.getByText('Password Setting');
    fireEvent.click(passwordTab);
    
    // Check if Change Password title is visible in the password setting tab
    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });
    
    // Check if the Submit button for password change is visible
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
});