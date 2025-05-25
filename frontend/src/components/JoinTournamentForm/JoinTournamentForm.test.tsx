import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import JoinTournamentForm from "./JoinTournamentForm";

describe("JoinTournamentForm", () => {
  const mockTournamentTeams = [
    { id: 1, name: "Team Alpha", participantSet: [] },
    { id: 2, name: "Team Beta", participantSet: [] },
  ];

  it("renders the CreateOrJoinTeam component initially", () => {
    render(
      <MantineProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MockedProvider>
            <JoinTournamentForm tournamentTeams={mockTournamentTeams} />
          </MockedProvider>
        </MemoryRouter>
      </MantineProvider>
    );

    expect(screen.getByText("Create or Join a Team")).toBeInTheDocument();
  });
});
