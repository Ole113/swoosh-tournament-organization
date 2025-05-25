import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import CreateOrJoinTeam from "./CreateOrJoinTeam";

const mockSetCurrentComponent = vi.fn();
const mockTournamentTeams = [
    { name: "Team A", teamId: "1", isPrivate: false, inviteLink: "invite123", participantSet: [] },
    { name: "Team B", teamId: "2", isPrivate: true, inviteLink: "invite456", password: "secret", participantSet: [] },
  ];
  
  it("renders Create or Join Team form and handles button clicks", async () => {
    render(
      <MantineProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CreateOrJoinTeam
            setCurrentComponent={mockSetCurrentComponent}
            tournamentTeams={mockTournamentTeams}
          />
        </MemoryRouter>
      </MantineProvider>
    );
  
    // Check if the form renders correctly
    expect(screen.getByText("Create or Join a Team")).toBeInTheDocument();
    expect(screen.getByText("Create a team")).toBeInTheDocument();
    expect(screen.getByText("Or Join an Existing Team")).toBeInTheDocument();
  
    // Check if "Create" button works
    fireEvent.click(screen.getByText("Create"));
    expect(mockSetCurrentComponent).toHaveBeenCalledWith("CreateTeam");
  });
  