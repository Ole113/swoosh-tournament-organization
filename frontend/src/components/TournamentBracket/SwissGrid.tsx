import { Badge, Table, Text, Title } from "@mantine/core";

type Match = {
  matchId: string;
  round: number;
  score1: string;
  score2: string;
  status: string;
  bracket_type?: string;
  matchparticipantSet: {
    edges: {
      node: {
        teamNumber: number;
        participantId: {
          participantId: number;
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
};

export function SwissGrid({ matches }: { matches: Match[] }) {
  // Group matches by round
  const roundsMap: Record<number, Match[]> = {};

  // Sort matches by round
  matches
    .filter((match) => match.bracket_type === "swiss" || !match.bracket_type)
    .forEach((match) => {
      const round = match.round;
      if (!roundsMap[round]) {
        roundsMap[round] = [];
      }
      roundsMap[round].push(match);
    });

  // Get unique rounds
  const rounds = Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate team records for display after match results
  // Structure: displayRecords[roundNumber][teamId][matchId] = { wins, losses }
  // We use matchId so we can show the correct record for each specific match
  const displayRecords: Record<
    number,
    Record<number, Record<string, { wins: number; losses: number }>>
  > = {};

  rounds.forEach((round) => {
    displayRecords[round] = {};
  });

  [...rounds]
    .sort((a, b) => a - b)
    .forEach((currentRound) => {
      roundsMap[currentRound].forEach((match) => {
        const team1 = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 1);
        const team2 = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 2);

        if (!team1 || !team2) {
          return;
        }

        const team1Id = team1.node.participantId.teamId.teamId;
        const team2Id = team2.node.participantId.teamId.teamId;

        if (!displayRecords[currentRound][team1Id]) {
          displayRecords[currentRound][team1Id] = {};
        }
        if (!displayRecords[currentRound][team2Id]) {
          displayRecords[currentRound][team2Id] = {};
        }

        let team1Wins = 0;
        let team1Losses = 0;
        let team2Wins = 0;
        let team2Losses = 0;

        for (let prevRound = 1; prevRound < currentRound; prevRound++) {
          if (displayRecords[prevRound] && displayRecords[prevRound][team1Id]) {
            Object.values(displayRecords[prevRound][team1Id]).forEach((record) => {
              team1Wins += record.wins;
              team1Losses += record.losses;
            });
          }

          if (displayRecords[prevRound] && displayRecords[prevRound][team2Id]) {
            Object.values(displayRecords[prevRound][team2Id]).forEach((record) => {
              team2Wins += record.wins;
              team2Losses += record.losses;
            });
          }
        }

        if (match.status === "Completed") {
          const score1 = parseInt(match.score1, 10) || 0;
          const score2 = parseInt(match.score2, 10) || 0;

          // Create record entries for this specific match
          displayRecords[currentRound][team1Id][match.matchId] = {
            wins: team1Wins + (score1 > score2 ? 1 : 0),
            losses: team1Losses + (score2 > score1 ? 1 : 0),
          };

          displayRecords[currentRound][team2Id][match.matchId] = {
            wins: team2Wins + (score2 > score1 ? 1 : 0),
            losses: team2Losses + (score1 > score2 ? 1 : 0),
          };
        } else {
          displayRecords[currentRound][team1Id][match.matchId] = {
            wins: team1Wins,
            losses: team1Losses,
          };

          displayRecords[currentRound][team2Id][match.matchId] = {
            wins: team2Wins,
            losses: team2Losses,
          };
        }
      });
    });

  const tableStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    width: "100%",
    margin: "0 auto",
  };

  const headerStyle = {
    backgroundColor: "#f8f9fa",
    fontWeight: 600,
    padding: "12px 16px",
  };

  const cellStyle = {
    padding: "12px 16px",
  };

  return (
    <div style={{ padding: "0 16px" }}>
      {rounds.map((round) => (
        <div key={`round-${round}`} style={{ marginBottom: "32px" }}>
          <Title order={2} fw={700} ta="center" mb="lg">
            Round {round}
          </Title>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            style={tableStyle}
            verticalSpacing="md"
            horizontalSpacing="lg"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ ...headerStyle }}>Team 1</Table.Th>
                <Table.Th style={{ ...headerStyle, textAlign: "center" }}>Record</Table.Th>
                <Table.Th style={{ ...headerStyle, textAlign: "center", width: "60px" }}>
                  VS
                </Table.Th>
                <Table.Th style={{ ...headerStyle, textAlign: "center" }}>Record</Table.Th>
                <Table.Th style={{ ...headerStyle }}>Team 2</Table.Th>
                <Table.Th style={{ ...headerStyle, textAlign: "center", width: "100px" }}>
                  Score
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {roundsMap[round].map((match) => {
                const team1 = match.matchparticipantSet.edges.find(
                  (edge) => edge.node.teamNumber === 1
                );
                const team2 = match.matchparticipantSet.edges.find(
                  (edge) => edge.node.teamNumber === 2
                );

                if (!team1 || !team2) {
                  return null;
                }

                const team1Name = team1.node.participantId.teamId.name;
                const team2Name = team2.node.participantId.teamId.name;
                const team1Id = team1.node.participantId.teamId.teamId;
                const team2Id = team2.node.participantId.teamId.teamId;

                const team1Record = displayRecords[round]?.[team1Id]?.[match.matchId]
                  ? `${displayRecords[round][team1Id][match.matchId].wins}-${displayRecords[round][team1Id][match.matchId].losses}`
                  : "0-0";

                const team2Record = displayRecords[round]?.[team2Id]?.[match.matchId]
                  ? `${displayRecords[round][team2Id][match.matchId].wins}-${displayRecords[round][team2Id][match.matchId].losses}`
                  : "0-0";

                return (
                  <Table.Tr key={match.matchId}>
                    <Table.Td style={{ ...cellStyle }}>
                      <Text fw={600} size="sm">
                        {team1Name}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ ...cellStyle, textAlign: "center" }}>
                      <Badge color="blue" size="md" radius="sm">
                        {team1Record}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ ...cellStyle, textAlign: "center" }}>
                      <Text fw={700} c="dimmed" size="sm">
                        VS
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ ...cellStyle, textAlign: "center" }}>
                      <Badge color="blue" size="md" radius="sm">
                        {team2Record}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ ...cellStyle }}>
                      <Text fw={600} size="sm">
                        {team2Name}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ ...cellStyle, textAlign: "center" }}>
                      {match.status === "Completed" ? (
                        <Text fw={700} size="sm">
                          {match.score1} - {match.score2}
                        </Text>
                      ) : match.status === "Bye" ? (
                        <Badge color="yellow" size="md" radius="sm">
                          BYE
                        </Badge>
                      ) : (
                        <Badge color="gray" size="md" radius="sm">
                          PENDING
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
      ))}
    </div>
  );
}
