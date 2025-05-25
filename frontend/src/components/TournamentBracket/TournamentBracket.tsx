import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { IconArrowLeft, IconCalendar, IconChartBar, IconTournament } from "@tabler/icons-react";
import { Bracket, IRenderSeedProps, IRoundProps, Seed, SeedItem, SeedTeam } from "react-brackets";
import { useNavigate } from "react-router-dom";
import { Button, Container, Group, SegmentedControl, Stack, Tabs, Title } from "@mantine/core";
import { RoundRobinGrid } from "@/components/TournamentBracket/RoundRobin";
import { SwissGrid } from "@/components/TournamentBracket/SwissGrid";
import { GET_ALL_TOURNAMENTS } from "@/graphql/queries/GetAllTournaments";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";
import Loading from "../Loading/Loading";

interface Team {
  name: string;
  score: number;
}

interface Match {
  matchId: string;
  seed: number;
  round: number;
  score1: string;
  score2: string;
  status: string;
  bracketType?: string;
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
}

interface TournamentData {
  allMatchesByTournamentId: Match[];
}

interface TournamentNode {
  tournamentId: string;
  name: string;
  format: string;
}

interface TournamentsData {
  allTournaments: {
    edges: {
      node: TournamentNode;
    }[];
  };
}

export function TournamentBracket({
  id,
  tournamentName = "Tournament",
}: {
  id?: string;
  tournamentName?: string;
}) {
  const navigate = useNavigate();
  const isEmbedded = !window.location.pathname.includes("/bracket");
  const [format, setFormat] = useState<string>("Single Elimination");
  const [displayName, setDisplayName] = useState<string>(tournamentName);
  const [bracketType, setBracketType] = useState<"winners" | "losers" | "championship">("winners");
  const [viewMode, setViewMode] = useState<"single" | "all">("single");
  const [isChainedFormatElimination, setIsChainedFormatElimination] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("roundRobin");

  // Get tournaments data to find the current tournament
  const {
    loading: tournamentsLoading,
    error: tournamentsError,
    data: tournamentsData,
  } = useQuery<TournamentsData>(GET_ALL_TOURNAMENTS, {
    fetchPolicy: "network-only",
  });

  // Get match data
  const {
    loading: matchesLoading,
    error: matchesError,
    data: matchesData,
  } = useQuery<TournamentData>(GET_MATCHES_BY_TOURNAMENT, {
    variables: { tournamentId: id },
    fetchPolicy: "cache-first",
  });

  // Find the current tournament and set its format
  useEffect(() => {
    if (tournamentsData && id) {
      const tournament = tournamentsData.allTournaments.edges.find(
        (edge) => edge.node.tournamentId === id
      )?.node;

      if (tournament) {
        setFormat(tournament.format);
        setDisplayName(tournament.name);
      }
    }
  }, [tournamentsData, id]);

  // Determine if we should show elimination bracket for chained format
  // and set the default active tab accordingly
  useEffect(() => {
    if (
      (format === "Round Robin to Single Elimination" ||
        format === "Round Robin to Double Elimination") &&
      matchesData?.allMatchesByTournamentId
    ) {
      // Check if any matches in round 2+ exist (elimination stage)
      const eliminationMatches = matchesData.allMatchesByTournamentId.some(
        (match) => match.round >= 2
      );
      setIsChainedFormatElimination(eliminationMatches);

      // Set the default active tab based on the current tournament phase
      if (eliminationMatches) {
        setActiveTab("elimination");
      } else {
        setActiveTab("roundRobin");
      }
    }
  }, [format, matchesData]);

  // If still loading, show a loading indicator
  if (tournamentsLoading || matchesLoading) {
    return <Loading />;
  }

  // If there's an error, log and show an error message
  if (tournamentsError || matchesError) {
    return <p>Error loading tournament data</p>;
  }

  // Generate the appropriate bracket based on format
  let bracketRounds: IRoundProps[] = [];
  let hasMultipleBrackets = false;

  // Filter the matches for round robin display in Chained Format
  // Update roundRobinMatches to filter for Round Robin to Double Elimination too
  const roundRobinMatches =
    matchesData?.allMatchesByTournamentId.filter((match) =>
      format === "Round Robin to Single Elimination" ||
      format === "Round Robin to Double Elimination"
        ? match.round === 1 || match.bracketType === "round_robin"
        : true
    ) || [];

  // Update chainedFormatBracketRounds to include the Double Elimination format
  const chainedFormatBracketRounds = matchesData
    ? generateBracketRounds({
        allMatchesByTournamentId:
          matchesData?.allMatchesByTournamentId.filter((match) =>
            format === "Round Robin to Single Elimination"
              ? match.round >= 2
              : format === "Round Robin to Double Elimination"
                ? match.round >= 2 ||
                  match.bracketType === "winners" ||
                  match.bracketType === "losers" ||
                  match.bracketType === "championship"
                : match.round >= 1
          ) || [],
      })
    : [];

  if (matchesData) {
    if (format === "Round Robin") {
      // Use Round Robin Grid component for round robin format
      // Nothing to generate here as RoundRobinGrid will handle display
    } else if (format === "Swiss System") {
      // Use Swiss Grid component for Swiss format
      // Nothing to generate here as SwissGrid will handle display
    } else if (format === "Double Elimination") {
      // For Double Elimination, we need to handle winners and losers brackets
      hasMultipleBrackets = true;

      bracketRounds = generateBracketRoundsByType(matchesData, bracketType);
    } else if (format === "Round Robin to Single Elimination") {
      // For Chained Format, we'll use the logic in the second useEffect
      // and render with tabs later
    } else {
      // Single Elimination
      bracketRounds = generateBracketRounds(matchesData);
    }
  } else if (!matchesData) {
    // Fallback to stub data if no match data
    bracketRounds = [];
  }

  // Generate all bracket types for the comprehensive view
  const winnersBracketRounds =
    hasMultipleBrackets && viewMode === "all"
      ? generateBracketRoundsByType(matchesData!, "winners")
      : [];

  const losersBracketRounds =
    hasMultipleBrackets && viewMode === "all"
      ? generateBracketRoundsByType(matchesData!, "losers")
      : [];

  const championshipBracketRounds =
    hasMultipleBrackets && viewMode === "all"
      ? generateBracketRoundsByType(matchesData!, "championship")
      : [];

  // Determine if we should show tabs for chained format
  const shouldShowTabs =
    (format === "Round Robin to Single Elimination" ||
      format === "Round Robin to Double Elimination") &&
    isChainedFormatElimination;

  return (
    <Container size="sm" style={{ paddingLeft: 0, paddingRight: 0, width: "100%" }}>
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
            <Button variant="filled" color="orange" leftSection={<IconTournament size={16} />}>
              Bracket
            </Button>
            <Button
              variant="outline"
              color="green"
              leftSection={<IconChartBar size={16} />}
              onClick={() => navigate(`/tournament/${id}/standings`)}
            >
              View Standings
            </Button>
          </Group>
        )}

        {!isEmbedded && (
          <Title ta="center" mb="lg">
            {displayName} {getBracketTitle(format)}
          </Title>
        )}

        {/* Show bracket controls for Double Elimination format */}
        {format === "Double Elimination" && hasMultipleBrackets && (
          <>
            <Group justify="space-between" mb="md">
              {viewMode === "single" && (
                <SegmentedControl
                  value={bracketType}
                  onChange={(value) =>
                    setBracketType(value as "winners" | "losers" | "championship")
                  }
                  data={[
                    { label: "Winners Bracket", value: "winners" },
                    { label: "Losers Bracket", value: "losers" },
                    { label: "Championship", value: "championship" },
                  ]}
                />
              )}
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === "single" ? "all" : "single")}
              >
                {viewMode === "single" ? "View All Brackets" : "View Single Bracket"}
              </Button>
            </Group>
          </>
        )}

        {/* Tabs for Chained Format when elimination stage is active */}
        {shouldShowTabs ? (
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "roundRobin")}>
            <Tabs.List mb="md">
              <Tabs.Tab value="roundRobin">Round Robin Stage</Tabs.Tab>
              <Tabs.Tab value="elimination">Elimination Stage</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="roundRobin">
              <RoundRobinGrid matches={roundRobinMatches} />
            </Tabs.Panel>

            <Tabs.Panel value="elimination">
              {format === "Round Robin to Double Elimination" && matchesData ? (
                <>
                  <Group justify="space-between" mb="md">
                    <SegmentedControl
                      value={bracketType}
                      onChange={(value) =>
                        setBracketType(value as "winners" | "losers" | "championship")
                      }
                      data={[
                        { label: "Winners Bracket", value: "winners" },
                        { label: "Losers Bracket", value: "losers" },
                        { label: "Championship", value: "championship" },
                      ]}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setViewMode(viewMode === "single" ? "all" : "single")}
                    >
                      {viewMode === "single" ? "View All Brackets" : "View Single Bracket"}
                    </Button>
                  </Group>

                  {viewMode === "single" ? (
                    <div style={{ overflowX: "auto", width: "100%" }}>
                      <CustomBracket
                        bracketType={bracketType}
                        rounds={generateBracketRoundsByType(
                          {
                            allMatchesByTournamentId: matchesData.allMatchesByTournamentId.filter(
                              (match) =>
                                match.round >= 2 ||
                                (match.bracketType &&
                                  ["winners", "losers", "championship"].includes(match.bracketType))
                            ),
                          },
                          bracketType
                        )}
                      />
                    </div>
                  ) : (
                    // Comprehensive view with all brackets
                    <Stack gap="xl">
                      <Title order={3} ta="center" mt="xl">
                        Winners Bracket
                      </Title>
                      <div style={{ overflowX: "auto", width: "100%" }}>
                        <CustomBracket bracketType="winners" rounds={winnersBracketRounds} />
                      </div>

                      <Title order={3} ta="center" mt="xl">
                        Losers Bracket
                      </Title>
                      <div style={{ overflowX: "auto", width: "100%" }}>
                        <CustomBracket bracketType="losers" rounds={losersBracketRounds} />
                      </div>

                      <Title order={3} ta="center" mt="xl">
                        Championship
                      </Title>
                      <div style={{ overflowX: "auto", width: "100%" }}>
                        <CustomBracket
                          bracketType="championship"
                          rounds={championshipBracketRounds}
                        />
                      </div>
                    </Stack>
                  )}
                </>
              ) : (
                // For Single Elimination, wrap the bracket
                <div style={{ overflowX: "auto", width: "100%" }}>
                  <Bracket rounds={chainedFormatBracketRounds} renderSeedComponent={CustomSeed} />
                </div>
              )}
            </Tabs.Panel>
          </Tabs>
        ) : (
          // Render the brackets based on the format and view mode
          <>
            {format === "Round Robin" && matchesData ? (
              <RoundRobinGrid matches={matchesData.allMatchesByTournamentId} />
            ) : format === "Swiss System" && matchesData ? (
              <SwissGrid matches={matchesData.allMatchesByTournamentId} />
            ) : format === "Round Robin to Single Elimination" && !isChainedFormatElimination ? (
              <RoundRobinGrid matches={roundRobinMatches} />
            ) : format === "Round Robin to Double Elimination" && !isChainedFormatElimination ? (
              <RoundRobinGrid matches={roundRobinMatches} />
            ) : viewMode === "single" ? (
              format === "Double Elimination" ? (
                <div style={{ overflowX: "auto", width: "100%" }}>
                  <CustomBracket bracketType={bracketType} rounds={bracketRounds} />
                </div>
              ) : (
                <div style={{ overflowX: "auto", width: "100%" }}>
                  <Bracket
                    rounds={bracketRounds}
                    renderSeedComponent={CustomSeed}
                    key={`bracket-${bracketType}`}
                  />
                </div>
              )
            ) : (
              // Comprehensive view with all brackets
              <Stack gap="xl">
                {winnersBracketRounds.length > 0 && (
                  <>
                    <Title order={3} ta="center" mt="xl">
                      Winners Bracket
                    </Title>
                    <div style={{ overflowX: "auto", width: "100%" }}>
                      <CustomBracket bracketType="winners" rounds={winnersBracketRounds} />
                    </div>
                  </>
                )}

                {losersBracketRounds.length > 0 && (
                  <>
                    <Title order={3} ta="center" mt="xl">
                      Losers Bracket
                    </Title>
                    <div style={{ overflowX: "auto", width: "100%" }}>
                      <CustomBracket bracketType="losers" rounds={losersBracketRounds} />
                    </div>
                  </>
                )}

                {championshipBracketRounds.length > 0 && (
                  <>
                    <Title order={3} ta="center" mt="xl">
                      Championship
                    </Title>
                    <div style={{ overflowX: "auto", width: "100%" }}>
                      <CustomBracket
                        bracketType="championship"
                        rounds={championshipBracketRounds}
                      />
                    </div>
                  </>
                )}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

// Custom seed renderer for matches
const CustomSeed = ({ seed, breakpoint }: IRenderSeedProps) => {
  return (
    <Seed mobileBreakpoint={breakpoint}>
      <SeedItem style={{ fontSize: "var(--mantine-font-size-sm)" }}>
        <div>
          <SeedTeam>
            <Group justify="space-between" style={{ width: "100%" }} gap="xs">
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {seed.teams[0]?.name || "TBD"}
              </div>
              <div style={{ flexShrink: 0 }}>{seed.teams[0]?.score ?? "-"}</div>
            </Group>
          </SeedTeam>
          <SeedTeam>
            <Group justify="space-between" style={{ width: "100%" }} gap="xs">
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color:
                    seed.teams[1]?.name === "BYE" ? "var(--mantine-color-yellow-6)" : "inherit",
                }}
              >
                {seed.teams[1]?.name || "TBD"}
              </div>
              <div style={{ flexShrink: 0 }}>{seed.teams[1]?.score ?? "-"}</div>
            </Group>
          </SeedTeam>
        </div>
      </SeedItem>
    </Seed>
  );
};

// Custom bracket component to handle proper bracket structure rendering
const CustomBracket = ({
  bracketType,
  rounds,
}: {
  bracketType: "winners" | "losers" | "championship";
  rounds: IRoundProps[];
}) => {
  // Optimize bracket layout based on the type
  const optimizedRounds = [...rounds];

  // For winners bracket in later rounds, ensure proper lines connect winners
  if (bracketType === "winners" && rounds.length > 1) {
    // The key here is just making sure the rounds and seeds are correctly ordered
    // The library connects them automatically if the order is correct

    for (let i = 1; i < optimizedRounds.length; i++) {
      // Ensure seeds are sorted for connecting lines
      optimizedRounds[i].seeds.sort((a, b) => a.seed - b.seed);
    }
  }

  // For losers bracket, adjust the visual placement
  if (bracketType === "losers" && rounds.length > 1) {
    // Ensure consistent visual progression in the losers bracket
    for (let i = 1; i < optimizedRounds.length; i++) {
      optimizedRounds[i].seeds.sort((a, b) => a.seed - b.seed);
    }
  }

  return <Bracket rounds={optimizedRounds} renderSeedComponent={CustomSeed} />;
};

// Generate bracket rounds for single elimination tournaments
const generateBracketRounds = (data: TournamentData) => {
  const roundsMap: {
    [round: number]: { id: string; teams: Team[]; seed: number; isBye: boolean }[];
  } = {};

  data.allMatchesByTournamentId.forEach((match) => {
    const roundNum = match.round;

    if (!roundsMap[roundNum]) {
      roundsMap[roundNum] = [];
    }

    const isByeMatch = match.status === "Bye";

    const teams: Team[] = match.matchparticipantSet.edges.map((edge) => {
      // Get team_number (1 or 2) to determine which score to use
      const teamNumber = edge.node.teamNumber;
      return {
        name: edge.node.participantId.teamId.name,
        // Use teamNumber to determine which score to associate with this team
        score: teamNumber === 1 ? parseInt(match.score1, 10) || 0 : parseInt(match.score2, 10) || 0,
      };
    });

    if (isByeMatch) {
      teams.push({ name: "BYE", score: 0 });
    }

    roundsMap[roundNum].push({
      id: match.matchId,
      teams,
      seed: match.seed,
      isBye: isByeMatch,
    });
  });

  return Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((roundNum) => ({
      title: `Round ${roundNum}`,
      seeds: roundsMap[roundNum].sort((a, b) => a.seed - b.seed),
    }));
};

// Generate bracket rounds for double elimination tournaments, filtered by bracket type
const generateBracketRoundsByType = (
  data: TournamentData,
  bracketType: "winners" | "losers" | "championship"
) => {
  const roundsMap: {
    [round: number]: {
      id: string;
      teams: Team[];
      seed: number;
      originalSeed: number; // Store original seed for reference
      isBye: boolean;
      bracketType: string;
    }[];
  } = {};

  // Create a Set to track match IDs we've already processed
  // This prevents duplicates when switching between bracket types
  const processedMatchIds = new Set<string>();

  // Filter matches by the selected bracket type
  const filteredMatches = data.allMatchesByTournamentId.filter(
    (match) => match.bracketType === bracketType
  );

  // First, sort matches by round, and then by seed
  // This is crucial to ensure consistent display
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    // First sort by round
    if (a.round !== b.round) {
      return a.round - b.round;
    }
    // Then by seed
    return a.seed - b.seed;
  });

  // Process sorted matches
  sortedMatches.forEach((match) => {
    // Skip if we've already processed this match
    if (processedMatchIds.has(match.matchId)) {
      return;
    }

    // Add to processed set
    processedMatchIds.add(match.matchId);

    const roundNum = match.round;

    if (!roundsMap[roundNum]) {
      roundsMap[roundNum] = [];
    }

    const isByeMatch = match.status === "Bye";

    const teams: Team[] = match.matchparticipantSet.edges.map((edge) => {
      // Get team_number (1 or 2) to determine which score to use
      const teamNumber = edge.node.teamNumber;
      return {
        name: edge.node.participantId.teamId.name,
        // Use teamNumber to determine which score to associate with this team
        score: teamNumber === 1 ? parseInt(match.score1, 10) || 0 : parseInt(match.score2, 10) || 0,
      };
    });

    if (isByeMatch) {
      teams.push({ name: "BYE", score: 0 });
    }

    roundsMap[roundNum].push({
      id: match.matchId,
      teams,
      seed: match.seed,
      originalSeed: match.seed, // Keep track of original seed
      isBye: isByeMatch,
      bracketType: match.bracketType || "winners", // Default to winners if not specified
    });
  });

  // Apply specialized sorting to ensure proper bracket visualization
  Object.keys(roundsMap).forEach((roundKey) => {
    const roundNum = parseInt(roundKey, 10);

    // First sort by the original seed - this maintains the official tournament ordering
    roundsMap[roundNum].sort((a, b) => a.originalSeed - b.originalSeed);

    // For winners bracket, we need special handling to ensure correct visual bracket progression
    if (bracketType === "winners") {
      // Optionally reorder seeds for better visual bracket progression
      // For round 1, we keep original seeding (already sorted above)
      // For subsequent rounds, ensure correct pairing based on bracket progression
      if (roundNum >= 2) {
        // Preserve the original sort order which should follow the tournament structure
        // but we'll adjust the displayed seed to ensure proper bracket visualization
        roundsMap[roundNum].forEach((match, index) => {
          // Update seed based on position in round for visual rendering purposes
          match.seed = index + 1;
        });
      }
    }

    // For losers bracket, special handling is needed
    if (bracketType === "losers") {
      // In standard double elimination, losers bracket has a zigzag pattern
      // For visualization purposes, ensure the proper order
      roundsMap[roundNum].forEach((match, index) => {
        // Update seed for visual rendering
        match.seed = index + 1;
      });
    }
  });

  // Get bracket-appropriate title prefixes
  const titlePrefix =
    bracketType === "winners" ? "Winners" : bracketType === "losers" ? "Losers" : "Championship";

  // For losers bracket, adjust round numbers for display (round 2 becomes round 1, etc.)
  const getAdjustedRoundNumber = (actualRoundNum: number) => {
    if (bracketType === "losers") {
      // Subtract 1 to start losers bracket at Round 1
      return actualRoundNum - 1;
    }
    return actualRoundNum;
  };

  return Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((roundNum) => {
      // Get display round number (adjusted for losers bracket)
      const displayRoundNum = getAdjustedRoundNumber(roundNum);

      // Sort seeds for final display - this is critical for proper bracket rendering
      const sortedSeeds = roundsMap[roundNum].sort((a, b) => a.seed - b.seed);

      return {
        title:
          roundNum === 1 && bracketType !== "championship"
            ? `${titlePrefix} Round ${displayRoundNum}`
            : roundsMap[roundNum].length === 1 && bracketType === "winners"
              ? `${titlePrefix} Final`
              : roundsMap[roundNum].length === 1 && bracketType === "championship"
                ? Object.keys(roundsMap).length > 1 &&
                  roundNum === Math.max(...Object.keys(roundsMap).map(Number))
                  ? "Final Championship Match"
                  : "Championship Match"
                : `${titlePrefix} Round ${displayRoundNum}`,
        seeds: sortedSeeds,
      };
    });
};

// Helper function to get the current bracket title
function getBracketTitle(format: string): string {
  switch (format) {
    case "Round Robin":
      return "Round Robin";
    case "Double Elimination":
      return "Double Elimination Bracket";
    case "Swiss System":
      return "Swiss Format Bracket";
    case "Round Robin to Single Elimination":
      return "Round Robin to Single Elimination";
    case "Round Robin to Double Elimination":
      return "Round Robin to Double Elimination";
    case "Single Elimination":
    default:
      return "Bracket";
  }
}
