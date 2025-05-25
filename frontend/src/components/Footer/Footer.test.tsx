import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer'; // Adjust the import path based on your project structure

describe('Footer', () => {
  test('renders footer content correctly', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <Footer />
        </MantineProvider>
      </MemoryRouter>
    );

    // Check if specific footer content is rendered
    expect(screen.getByText('© 2025 Swoosh. All rights reserved.')).toBeInTheDocument();
    expect(screen.getByText('Tournaments')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
  });
});
