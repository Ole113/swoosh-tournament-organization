import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { MyTournaments } from "./MyTournaments";
import  GET_USER_BY_UUID  from "@/graphql/queries/GetUserByUUID";
import { GET_ALL_TOURNAMENTS } from "@/graphql/queries/GetAllTournaments";

// Mock data
const userMockData = {
  request: {
    query: GET_USER_BY_UUID,
    variables: { uuid: "1234" },
  },
  result: {
    data: {
      allUsers: {
        edges: [
          {
            node: {
              userId: "user1",
            },
          },
        ],
      },
    },
  },
};

//TODO: test mock data
const tournamentsMockData = {
  request: {
    query: GET_ALL_TOURNAMENTS,
  },
  result: {
    data: {
      allTournaments: {
        edges: [
          {
            node: {
              tournamentId: "1",
              name: "Tournament 1",
              isPrivate: false,
              description: "Test tournament",
              startDate: "2025-01-01",
              endDate: "2025-01-02",
              format: "Single-elimination",
              teamSize: 4,
              maxTeams: 16,
              createdBy: {
                userId: "user1",
              },
            },
          },
        ],
      },
    },
  },
};

test("handles tournament fetch error state", async () => {
  const tournamentsErrorMock = {
    request: {
      query: GET_ALL_TOURNAMENTS,
    },
    error: new Error("Error loading tournaments"),
  };

  render(
    <MockedProvider mocks={[userMockData, tournamentsErrorMock]} addTypename={false}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <MyTournaments />
        </MantineProvider>
      </MemoryRouter>
    </MockedProvider>
  );

  // Verify error state for tournaments loading
  await waitFor(() => screen.getByText(/Error loading tournaments/i));
  expect(screen.getByText(/Error loading tournaments/i)).toBeInTheDocument();
});
