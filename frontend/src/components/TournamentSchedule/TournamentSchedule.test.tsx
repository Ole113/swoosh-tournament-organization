import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { TournamentSchedule } from "./TournamentSchedule";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";

const mockData = {
  request: {
    query: GET_MATCHES_BY_TOURNAMENT,
    variables: { tournamentId: "1" },
  },
  result: {
    data: {
      allMatchesByTournamentId: [
        {
          matchId: "1",
          startDate: "2025-02-20T12:00:00Z",
          score1: "0",
          score2: "0",
          court: "Court 1",
          participants: {
            edges: [
              { node: { teamId: { name: "Team A" } } },
              { node: { teamId: { name: "Team B" } } },
            ],
          },
        },
      ],
    },
  },
};

test("renders TournamentSchedule component", () => {
  render(
    <MockedProvider mocks={[mockData]} addTypename={false}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <TournamentSchedule id="1" />
        </MantineProvider>
      </MemoryRouter>
    </MockedProvider>
  );
});
