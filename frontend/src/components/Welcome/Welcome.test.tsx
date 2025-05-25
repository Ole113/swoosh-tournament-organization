import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Welcome } from './Welcome'; // Update with the correct path

test('renders Welcome component and checks its elements', async () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MantineProvider>
        <Welcome />
      </MantineProvider>
    </MemoryRouter>
  );

  // Check if the "I'm a Participant" button is rendered
  expect(await screen.findByText("I'm a Participant")).toBeInTheDocument();

  // Check if the "I'm an Admin" button is rendered
  expect(await screen.findByText("I'm an Admin")).toBeInTheDocument();

  // Check if the 'Why Swoosh?' section exists
  expect(await screen.findByText(/Why Swoosh\?/i)).toBeInTheDocument();

  // Check if team members are displayed (now ordered: Elbel, Qi, Salem, Pham)
  expect(screen.getAllByText(/Alex Elbel/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Alex Qi/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Kaden Salem/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Minh Hai Pham/i).length).toBeGreaterThan(0);
});
