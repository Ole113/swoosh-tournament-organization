import { useQuery } from "@apollo/client";
import { IconArrowLeft, IconCalendar, IconChartBar, IconTournament } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Center,
  Container,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";
import Loading from "../Loading/Loading";
import classes from "../MasterStyles.module.css";

interface TournamentStandingsProps {
  id?: string;
  tournamentName?: string;
}

interface Match {
  matchId: string;
  score1: string;
  score2: string;
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
  tournament: {
    name: string;
  };
  round: number;
  bracketType: string;
  status: string;
}

// Define the structure for team statistics including point differential and teamId
interface TeamStats {
  teamId: number;
  team: string;
  wins: number;
  losses: number;
  pointsScored: number;
  pointsAgainst: number;
  pointDifferential: number;
}

// Helper function to sort groups of tied teams
function sortTieGroup(tiedTeams: TeamStats[], allMatches: Match[]): TeamStats[] {
  const teamIdsInGroup = new Set(tiedTeams.map((t) => t.teamId));
  const headToHeadStats: Record<number, { wins: number }> = {};

  tiedTeams.forEach((t) => {
    headToHeadStats[t.teamId] = { wins: 0 };
  });

  // Filter matches played ONLY between teams in the tied group
  const relevantMatches = allMatches.filter((match) => {
    if (match.status !== "Completed") {
      return false;
    }
    const team1Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 1);
    const team2Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 2);
    if (!team1Data?.node.participantId.teamId || !team2Data?.node.participantId.teamId) {
      return false;
    }

    const team1Id = team1Data.node.participantId.teamId.teamId;
    const team2Id = team2Data.node.participantId.teamId.teamId;

    // Check if BOTH teams are in the current tie group
    return teamIdsInGroup.has(team1Id) && teamIdsInGroup.has(team2Id);
  });

  // Calculate head-to-head wins within the group
  relevantMatches.forEach((match) => {
    const team1Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 1)!;
    const team2Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 2)!;
    const team1Id = team1Data.node.participantId.teamId.teamId;
    const team2Id = team2Data.node.participantId.teamId.teamId;
    const score1 = parseInt(match.score1, 10);
    const score2 = parseInt(match.score2, 10);

    if (isNaN(score1) || isNaN(score2)) {
      return; // Skip if scores invalid
    }

    if (score1 > score2) {
      headToHeadStats[team1Id].wins += 1;
    } else if (score2 > score1) {
      headToHeadStats[team2Id].wins += 1;
    }
  });

  // Sort the group based on tiebreakers
  return [...tiedTeams].sort((a, b) => {
    // 1. Head-to-head wins
    const h2hWinsA = headToHeadStats[a.teamId].wins;
    const h2hWinsB = headToHeadStats[b.teamId].wins;
    if (h2hWinsB !== h2hWinsA) {
      return h2hWinsB - h2hWinsA;
    }

    // 2. Point Differential (overall)
    if (b.pointDifferential !== a.pointDifferential) {
      return b.pointDifferential - a.pointDifferential;
    }

    // 3. Points Scored (overall)
    return b.pointsScored - a.pointsScored;
  });
}

export function TournamentStandings({
  id,
  tournamentName = "Tournament",
}: TournamentStandingsProps) {
  const navigate = useNavigate();
  const isEmbedded = !window.location.pathname.includes("/standings");

  const { loading, error, data } = useQuery<{ allMatchesByTournamentId: Match[] }>(
    GET_MATCHES_BY_TOURNAMENT,
    {
      variables: { tournamentId: id },
      fetchPolicy: "network-only", // Ensure fresh data for standings
    }
  );

  if (loading) {
    return <Loading />;
  }
  if (error || !data) {
    return <p>Error loading standings data.</p>;
  }

  // Use the new TeamStats interface
  const teamStats: Record<number, TeamStats> = {}; // Use teamId as key

  // Process match data and calculate wins, losses, points scored/against
  data.allMatchesByTournamentId.forEach((match) => {
    // Only consider completed matches for standings
    if (match.status !== "Completed") {
      return;
    }

    const team1Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 1);
    const team2Data = match.matchparticipantSet.edges.find((edge) => edge.node.teamNumber === 2);

    if (!team1Data?.node.participantId.teamId || !team2Data?.node.participantId.teamId) {
      return; // Skip matches without valid team data
    }

    const team1Id = team1Data.node.participantId.teamId.teamId;
    const team2Id = team2Data.node.participantId.teamId.teamId;
    const team1Name = team1Data.node.participantId.teamId.name;
    const team2Name = team2Data.node.participantId.teamId.name;

    // Skip matches without valid scores
    if (isNaN(parseInt(match.score1, 10)) || isNaN(parseInt(match.score2, 10))) {
      return;
    }

    const score1 = parseInt(match.score1, 10);
    const score2 = parseInt(match.score2, 10);

    // Initialize teams if they don't exist yet
    if (!teamStats[team1Id]) {
      teamStats[team1Id] = {
        teamId: team1Id,
        team: team1Name,
        wins: 0,
        losses: 0,
        pointsScored: 0,
        pointsAgainst: 0,
        pointDifferential: 0,
      };
    }
    if (!teamStats[team2Id]) {
      teamStats[team2Id] = {
        teamId: team2Id,
        team: team2Name,
        wins: 0,
        losses: 0,
        pointsScored: 0,
        pointsAgainst: 0,
        pointDifferential: 0,
      };
    }

    // Update wins/losses
    if (score1 > score2) {
      teamStats[team1Id].wins += 1;
      teamStats[team2Id].losses += 1;
    } else if (score2 > score1) {
      teamStats[team2Id].wins += 1;
      teamStats[team1Id].losses += 1;
    }
    // Ties don't affect win/loss in elimination usually, but handled if needed

    // Update points scored and against
    teamStats[team1Id].pointsScored += score1;
    teamStats[team1Id].pointsAgainst += score2;
    teamStats[team2Id].pointsScored += score2;
    teamStats[team2Id].pointsAgainst += score1;
  });

  // Calculate point differential for each team
  Object.keys(teamStats).forEach((teamIdStr) => {
    const teamId = parseInt(teamIdStr, 10);
    teamStats[teamId].pointDifferential =
      teamStats[teamId].pointsScored - teamStats[teamId].pointsAgainst;
  });

  // Filter out any potential invalid entries (e.g., if a team was somehow added without a valid name)
  const filteredTeams = Object.values(teamStats).filter((team) => team.team && team.team !== "TBD");

  // --- Determine Tournament Winner --- //
  let finalMatch: Match | null = null;
  let highestRound = 0;
  data.allMatchesByTournamentId.forEach((match) => {
    if (match.round > highestRound) {
      highestRound = match.round;
    }
    // Prioritize completed championship matches
    if (match.bracketType === "championship" && match.status === "Completed") {
      finalMatch = match;
    }
  });

  // If no specific championship match, check the last completed match in the highest round
  if (!finalMatch && highestRound > 0) {
    const lastRoundMatches = data.allMatchesByTournamentId
      .filter((match) => match.round === highestRound && match.status === "Completed")
      .sort((a, b) => parseInt(b.matchId, 10) - parseInt(a.matchId, 10)); // Sort by matchId descending
    if (lastRoundMatches.length > 0) {
      finalMatch = lastRoundMatches[0];
    }
  }

  let tournamentWinnerId: number | null = null;
  let tournamentWinnerName: string | null = null;
  if (finalMatch) {
    const score1 = parseInt(finalMatch.score1, 10);
    const score2 = parseInt(finalMatch.score2, 10);
    const team1Data = finalMatch.matchparticipantSet.edges.find(
      (edge) => edge.node.teamNumber === 1
    );
    const team2Data = finalMatch.matchparticipantSet.edges.find(
      (edge) => edge.node.teamNumber === 2
    );

    if (
      !isNaN(score1) &&
      !isNaN(score2) &&
      team1Data?.node.participantId.teamId &&
      team2Data?.node.participantId.teamId
    ) {
      if (score1 > score2) {
        tournamentWinnerId = team1Data.node.participantId.teamId.teamId;
        tournamentWinnerName = team1Data.node.participantId.teamId.name;
      } else if (score2 > score1) {
        tournamentWinnerId = team2Data.node.participantId.teamId.teamId;
        tournamentWinnerName = team2Data.node.participantId.teamId.name;
      }
    }
  }

  // --- Sorting Logic with Tiebreakers --- //

  // 1. Initial sort by Wins (descending)
  const teamsToSort = [...filteredTeams].sort((a, b) => b.wins - a.wins);

  // 2. Iterate and re-sort tied groups using head-to-head
  let finalSortedTeams: TeamStats[] = [];
  let i = 0;
  while (i < teamsToSort.length) {
    const currentWins = teamsToSort[i].wins;
    const tieGroupStartIndex = i;
    // Find the end of the current tie group
    while (i < teamsToSort.length && teamsToSort[i].wins === currentWins) {
      i++;
    }
    const tieGroupEndIndex = i;

    // Extract the tie group
    const currentTieGroup = teamsToSort.slice(tieGroupStartIndex, tieGroupEndIndex);

    // If there's a tie (more than one team), sort the group
    if (currentTieGroup.length > 1) {
      const sortedGroup = sortTieGroup(currentTieGroup, data.allMatchesByTournamentId);
      finalSortedTeams.push(...sortedGroup);
    } else {
      // Otherwise, just add the single team (or empty group)
      finalSortedTeams.push(...currentTieGroup);
    }
  }

  // 3. Prioritize the tournament winner at the very top
  if (tournamentWinnerId !== null) {
    finalSortedTeams = finalSortedTeams.sort((a, b) => {
      if (a.teamId === tournamentWinnerId) {
        return -1; // Winner comes first
      }
      if (b.teamId === tournamentWinnerId) {
        return 1; // Winner comes first
      }
      // For non-winners, maintain the previously established tie-broken order
      return 0;
    });
  }

  // finalSortedTeams now holds the correctly sorted list

  return (
    <Center style={{ width: "100%" }}>
      <Container size={isEmbedded ? "md" : "lg"}>
        <Stack>
          {/* Only show navigation header when not embedded */}
          {!isEmbedded && (
            <Group justify="center" mb="md">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(`/tournament/${id}`)}
              >
                Back to Tournament
              </Button>
              <Button
                variant="outline"
                color="blue"
                leftSection={<IconCalendar size={16} />}
                onClick={() => navigate(`/tournament/${id}/schedule`)}
              >
                View Schedule
              </Button>
              <Button
                variant="outline"
                color="orange"
                leftSection={<IconTournament size={16} />}
                onClick={() => navigate(`/tournament/${id}/bracket`)}
              >
                View Bracket
              </Button>
              <Button variant="filled" color="green" leftSection={<IconChartBar size={16} />}>
                Standings
              </Button>
            </Group>
          )}

          {!isEmbedded && (
            <Title ta="center" mb="lg">
              {tournamentName} Standings
            </Title>
          )}

          <Text c="dimmed" ta="left" size="lg" maw={800} mt={0}>
            Current Standings
            {tournamentWinnerName && ` - Winner: ${tournamentWinnerName}`}
          </Text>
          <Table className={classes.table} verticalSpacing="md" mr={100} fz="lg">
            <thead>
              <tr style={{ backgroundColor: "#fff" }}>
                <th style={{ textAlign: "left" }}>Rank</th>
                <th style={{ textAlign: "left", padding: "12px 15px" }}>Team</th>
                <th style={{ textAlign: "center" }}>Wins</th>
                <th style={{ textAlign: "center" }}>Losses</th>
                <th style={{ textAlign: "center" }}>
                  <Tooltip label="Point Differential">
                    <span>PD</span>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {finalSortedTeams.map((team, index) => (
                <tr key={team.teamId}>
                  <td style={{ padding: "12px 15px" }}>{index + 1}</td>
                  <td style={{ padding: "12px 15px" }}>{team.team}</td>
                  <td style={{ textAlign: "center", padding: "12px 15px" }}>{team.wins}</td>
                  <td style={{ textAlign: "center", padding: "12px 15px" }}>{team.losses}</td>
                  {/* Format Point Differential with +/- sign */}
                  <td style={{ textAlign: "center", padding: "12px 15px" }}>
                    {team.pointDifferential > 0
                      ? `+${team.pointDifferential}`
                      : team.pointDifferential}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Stack>
      </Container>
    </Center>
  );
}
