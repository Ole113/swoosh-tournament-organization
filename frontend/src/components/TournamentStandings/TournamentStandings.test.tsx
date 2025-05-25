import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { TournamentStandings } from "./TournamentStandings";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";

const mockTournamentId = "123";

const mockData = {
  allMatchesByTournamentId: [
    {
      matchId: "1",
      score1: "2",
      score2: "1",
      participants: {
        edges: [
          { node: { teamId: { name: "Team A" } } },
          { node: { teamId: { name: "Team B" } } },
        ],
      },
      tournament: { name: "Test Tournament" },
    },
  ],
};

const mocks = [
  {
    request: {
      query: GET_MATCHES_BY_TOURNAMENT,
      variables: { tournamentId: mockTournamentId },
    },
    result: { data: mockData },
  },
];

test("renders error state", async () => {
  const errorMock = [
    {
      request: {
        query: GET_MATCHES_BY_TOURNAMENT,
        variables: { tournamentId: mockTournamentId },
      },
      error: new Error("GraphQL Error"),
    },
  ];

  render(
    <MockedProvider mocks={errorMock} addTypename={false}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <TournamentStandings id={mockTournamentId} />
        </MantineProvider>
      </MemoryRouter>
    </MockedProvider>
  );

  expect(await screen.findByText("Error loading standings")).toBeInTheDocument();
});

