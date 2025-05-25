import { Paper, Table, Text } from "@mantine/core";

// Match interface updated to match the GraphQL query structure
interface Match {
  matchparticipantSet: {
    edges: {
      node: {
        teamNumber: number;
        participantId: {
          userId: {
            userId: number;
            name: string;
          };
          teamId: {
            name: string;
            teamId: number;
          };
        };
      };
    }[];
  };
  score1: string;
  score2: string;
}

// Helper function to extract team names from matches
const extractTeams = (matches: Match[]): string[] => {
  const teamSet = new Set<string>();

  matches.forEach((match) => {
    match.matchparticipantSet.edges.forEach((edge) => {
      if (edge.node.participantId.teamId.name !== "BYE") {
        teamSet.add(edge.node.participantId.teamId.name);
      }
    });
  });

  return Array.from(teamSet).sort();
};

// Helper function to generate the round robin grid data
const generateRoundRobinGrid = (matches: Match[], teams: string[]) => {
  // Initialize grid with all undefined (meaning no match played)
  const grid: (0 | 1 | undefined)[][] = Array(teams.length)
    .fill(null)
    .map(() => Array(teams.length).fill(undefined));

  // Track total wins for each team
  const totalWins: number[] = Array(teams.length).fill(0);

  // Fill in the grid based on match results
  matches.forEach((match) => {
    if (match.matchparticipantSet.edges.length !== 2) {
      return;
    }

    // Find participants by team number
    const team1Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 1);
    const team2Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 2);

    if (!team1Data || !team2Data) {
      return;
    }

    const team1Name = team1Data.node.participantId.teamId.name;
    const team2Name = team2Data.node.participantId.teamId.name;

    const team1Index = teams.indexOf(team1Name);
    const team2Index = teams.indexOf(team2Name);

    if (team1Index === -1 || team2Index === -1) {
      return;
    }

    const score1 = parseInt(match.score1, 10) || 0;
    const score2 = parseInt(match.score2, 10) || 0;

    // Set the grid values based on who won
    if (score1 > score2) {
      grid[team1Index][team2Index] = 1;
      grid[team2Index][team1Index] = 0;
      totalWins[team1Index]++;
    } else if (score2 > score1) {
      grid[team1Index][team2Index] = 0;
      grid[team2Index][team1Index] = 1;
      totalWins[team2Index]++;
    }
    // If tie or no scores, leave as undefined
  });

  return { grid, totalWins };
};

// Round Robin Grid Component
export const RoundRobinGrid = ({ matches }: { matches: Match[] }) => {
  const teams = extractTeams(matches);
  const { grid, totalWins } = generateRoundRobinGrid(matches, teams);

  return (
    <Paper p={{ base: "xs", sm: "md" }} withBorder>
      {/* Add a wrapper div for horizontal scrolling */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table striped highlightOnHover style={{ minWidth: `${teams.length * 80 + 150}px` }}>
          {" "}
          {/* Estimate minWidth */}
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Teams</Table.Th>
              {teams.map((team, index) => (
                <Table.Th key={index} style={{ textAlign: "center" }}>
                  {team}
                </Table.Th>
              ))}
              <Table.Th style={{ textAlign: "center" }}>Total Wins</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {teams.map((team, rowIndex) => (
              <Table.Tr key={rowIndex}>
                <Table.Td style={{ fontWeight: "bold" }}>{team}</Table.Td>
                {teams.map((_, colIndex) => (
                  <Table.Td key={colIndex} style={{ textAlign: "center" }}>
                    {rowIndex === colIndex ? (
                      <Text color="dimmed">X</Text>
                    ) : grid[rowIndex][colIndex] === undefined ? (
                      <Text color="dimmed">-</Text>
                    ) : (
                      <Text style={{ fontWeight: "bold" }}>{grid[rowIndex][colIndex]}</Text>
                    )}
                  </Table.Td>
                ))}
                <Table.Td style={{ textAlign: "center", fontWeight: "bold" }}>
                  {totalWins[rowIndex]}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
      <Text size="sm" mt="xs">
        <div>1 : Win</div>
        <div style={{ marginTop: "1rem" }}>0 : Loss</div>
      </Text>
    </Paper>
  );
};
