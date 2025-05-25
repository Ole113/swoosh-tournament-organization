import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { TournamentNotFound } from "./TournamentNotFound";

test("renders TournamentNotFound component with correct elements", () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MantineProvider>
        <TournamentNotFound />
      </MantineProvider>
    </MemoryRouter>
  );

  // Check if h1 text is present
  expect(screen.getByRole("heading", { level: 1, name: /404 - Tournament Not Found/i })).toBeInTheDocument();
  
  // Check if h2 text is present
  expect(screen.getByRole("heading", { level: 2, name: /The tournament you are looking for does not exist./i })).toBeInTheDocument();

  // Check if button is present
  expect(screen.getByRole("button", { name: /Back to Tournaments/i })).toBeInTheDocument();
});
