import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  IconArrowLeft,
  IconBellFilled,
  IconCalendar,
  IconChartBar,
  IconCircleCheckFilled,
  IconTournament,
  IconTrophy,
} from "@tabler/icons-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Center,
  Container,
  Flex,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { BACKEND_URL } from "@/constants";
import { GENERATE_ROUND_ROBIN_TO_DOUBLE_ELIMINATION } from "@/graphql/mutations/GenerateRoundRobinToDoubleElimination";
import { GENERATE_ROUND_ROBIN_TO_SINGLE_ELIMINATION } from "@/graphql/mutations/GenerateRoundRobinToSingleElimination";
import { UPDATE_MATCH_SCORE } from "@/graphql/mutations/UpdateScore";
import { GET_ALL_TOURNAMENTS } from "@/graphql/queries/GetAllTournaments";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";
import GET_USER_BY_UUID from "@/graphql/queries/GetUserByUUID";
import { GENERATE_NEXT_ROUND } from "../../graphql/mutations/GenerateNextRound";
import Loading from "../Loading/Loading";
import classes from "../MasterStyles.module.css";

// Interface used for type definitions in the project
interface Match {
  matchId: string;
  startDate: string;
  score1: string;
  score2: string;
  court: string;
  status: string;
  round: number;
  verified: number; // 0 - not verified, 1 - 1st team entered, 2 - 2nd team entered, 3 - verified
  bracketType: string; // winners, losers, or championship
  matchparticipantSet: {
    edges: {
      node: {
        teamNumber: number;
        participantId: {
          participantId: number;
          userId: {
            userId: number;
            name: string;
            email: string;
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
    tournamentId: string;
    name: string;
    createdBy: {
      userId: string;
      uuid: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

interface TournamentScheduleProps {
  id?: string;
  tournamentName?: string;
  tournamentFormat?: string; // New prop for tournament format
}

export function TournamentSchedule({ id, tournamentName = "Tournament" }: TournamentScheduleProps) {
  const navigate = useNavigate();
  const isEmbedded = !window.location.pathname.includes("/schedule");

  // User data for displaying "your" matches
  // Get the user from localStorage
  const userUUID = JSON.parse(localStorage.getItem("user") || "{}")?.uuid;
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);

  useQuery(GET_USER_BY_UUID, {
    variables: { uuid: userUUID },
    skip: !userUUID,
    onCompleted: (data) => {
      if (data?.allUsers?.edges?.[0]?.node?.userId) {
        setFetchedUserId(String(data.allUsers.edges[0].node.userId));
      }
    },
  });

  // Fetch all tournaments to get the format
  const { data: tournamentsData, loading: tournamentsLoading } = useQuery(GET_ALL_TOURNAMENTS);

  // Find the specific tournament's format
  const tournamentFormat =
    tournamentsData?.allTournaments?.edges.find(
      (tournament: { node: { tournamentId: string } }) => tournament.node.tournamentId === id
    )?.node.format || "Single Elimination";

  // Fetch match schedule
  const { data, loading, error, refetch } = useQuery<{ allMatchesByTournamentId: Match[] }>(
    GET_MATCHES_BY_TOURNAMENT,
    {
      variables: { tournamentId: id },
      fetchPolicy: "network-only",
    }
  );

  // Mutation to update match scores
  const [updateMatchScore] = useMutation(UPDATE_MATCH_SCORE, {
    onCompleted: () => {
      refetch(); // Refresh data after successful mutation
    },
    onError: (error) => {
      console.error("Error updating match score:", error);
    },
  });

  // State to track tournament completion
  const [isTournamentComplete, setIsTournamentComplete] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<string>("");

  const [generateNextRound] = useMutation(GENERATE_NEXT_ROUND, {
    variables: { tournamentId: id },
    onCompleted: async (data) => {
      if (data?.generateNextRound?.success) {
        toast.success(data.generateNextRound.message);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await refetch();
      } else {
        toast.error(data?.generateNextRound?.message || "Failed to generate next round.");
      }
    },
    onError: (_error) => toast.error("Failed to generate next round."),
  });

  // First, extract the tournament node (including current_phase) from tournamentsData:
  const tournamentNode = tournamentsData?.allTournaments?.edges.find(
    (tournament: { node: { tournamentId: string; current_phase?: number } }) =>
      tournament.node.tournamentId === id
  )?.node;

  const currentPhase = tournamentNode?.current_phase;

  // First, add a function to determine the next action based on tournament format and current state
  // Modify the determineNextRoundAction function to mirror native Double Elimination
  const determineNextRoundAction = () => {
    if (tournamentFormat === "Round Robin to Double Elimination") {
      // If already in phase 2, treat as native Double Elimination
      if (currentPhase === 2) {
        return "generateNextRound";
      }

      // Otherwise, use the existing logic for the transition phase
      const hasEliminationMatches = data?.allMatchesByTournamentId?.some(
        (match) => match.round > 1
      );
      const allRoundRobinComplete = !data?.allMatchesByTournamentId?.some(
        (match) => match.round === 1 && match.status === "Scheduled"
      );
      const hasDoubleEliminationBrackets = data?.allMatchesByTournamentId?.some(
        (match) => match.bracketType === "winners" || match.bracketType === "losers"
      );

      if (!hasEliminationMatches && allRoundRobinComplete) {
        return "generateDoubleElimination"; // ready to transition into elimination
      } else if (hasEliminationMatches || hasDoubleEliminationBrackets) {
        return "generateNextRound";
      }
      return "completeCurrentRound";
    } else if (tournamentFormat === "Round Robin to Single Elimination") {
      const hasEliminationMatches = data?.allMatchesByTournamentId?.some(
        (match) => match.round > 1
      );
      const allRoundRobinComplete = !data?.allMatchesByTournamentId?.some(
        (match) => match.round === 1 && match.status === "Scheduled"
      );
      if (!hasEliminationMatches && allRoundRobinComplete) {
        return "generateSingleElimination";
      } else if (hasEliminationMatches) {
        return "generateNextRound";
      }
      return "completeCurrentRound";
    }
    // For all other formats, use standard next round generation.
    return "generateNextRound";
  };

  // Update the handler to check the tournament state and take appropriate action
  const handleGenerateNextRound = () => {
    const nextAction = determineNextRoundAction();

    if (nextAction === "generateSingleElimination") {
      generateSingleElimination();
    } else if (nextAction === "generateDoubleElimination") {
      generateDoubleElimination();
    } else if (nextAction === "generateNextRound") {
      generateNextRound();
    } else {
      toast.warning("Complete all current round matches before generating the next round.");
    }
  };

  // Update the getButtonText function to be more descriptive about the action
  const getButtonText = () => {
    const nextAction = determineNextRoundAction();

    if (nextAction === "generateSingleElimination") {
      return "Generate Single Elimination Stage";
    } else if (nextAction === "generateDoubleElimination") {
      return "Generate Double Elimination Stage";
    } else if (nextAction === "generateNextRound") {
      // Check if we're in a double elimination phase already
      const hasDoubleEliminationBrackets = data?.allMatchesByTournamentId?.some(
        (match) => match.bracketType === "winners" || match.bracketType === "losers"
      );

      if (
        tournamentFormat === "Round Robin to Double Elimination" &&
        hasDoubleEliminationBrackets
      ) {
        return "Generate Next Round";
      }

      return "Generate Next Round";
    }

    return "Generate Next Round";
  };

  // Add a mutation for generating double elimination stage
  const [generateDoubleElimination] = useMutation(GENERATE_ROUND_ROBIN_TO_DOUBLE_ELIMINATION, {
    variables: { tournamentId: id },
    onCompleted: async (data) => {
      if (data?.generateRoundRobinToDoubleElimination?.success) {
        toast.success(data.generateRoundRobinToDoubleElimination.message);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await refetch();
      } else {
        toast.error(
          data?.generateRoundRobinToDoubleElimination?.message ||
            "Failed to generate double elimination stage."
        );
      }
    },
    onError: (_error) => toast.error("Failed to generate double elimination stage."),
  });

  // Rename the existing "generateElimination" to "generateSingleElimination" for clarity
  const [generateSingleElimination] = useMutation(GENERATE_ROUND_ROBIN_TO_SINGLE_ELIMINATION, {
    variables: { tournamentId: id },
    onCompleted: async (data) => {
      if (data?.generateRoundRobinToSingleElimination?.success) {
        toast.success(data.generateRoundRobinToSingleElimination.message);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await refetch();
      } else {
        toast.error(
          data?.generateRoundRobinToSingleElimination?.message ||
            "Failed to generate elimination stage."
        );
      }
    },
    onError: (_error) => toast.error("Failed to generate elimination stage."),
  });

  // Manage selected tab (All Matches vs Your Matches)
  const [activeButton, setActiveButton] = useState<"all" | "mine">("all");

  // State for the selected round filter
  const [selectedRound, setSelectedRound] = useState<string>("all");

  // Manage clicked card index for score update
  const [clickedCardIndex, setClickedCardIndex] = useState<number | null>(null);
  const [scoreInputs, setScoreInputs] = useState<{
    [key: string]: { score1: string; score2: string };
  }>({});

  // Handle input change for scores (Keeps previously entered values)
  const handleScoreChange = (matchId: string, field: "score1" | "score2", value: string) => {
    setScoreInputs((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value },
    }));
  };

  // Handle score submitting by comparing first and second input attempts before updating the actual bracket.
  const handleSubmitScore = async (matchId: string) => {
    const score1 = scoreInputs[matchId]?.score1;
    const score2 = scoreInputs[matchId]?.score2;

    // Get current match
    const match = data?.allMatchesByTournamentId.find((match) => match.matchId === matchId);
    const old_verified = match?.verified;

    // Find which team the user is on (team1 or team2) based on userId
    let team = 0;
    const userTeamData = match?.matchparticipantSet.edges.find(
      (edge) => String(edge.node.participantId.userId.userId) === fetchedUserId
    );

    if (userTeamData) {
      team = userTeamData.node.teamNumber;
    }

    // Set verification
    let verified = 0;
    // Already verified
    if (match?.verified === 3) {
      verified = 3;
    }
    // Admin
    else if (data?.allMatchesByTournamentId[0].tournament.createdBy.userId === fetchedUserId) {
      verified = 3;
    }
    // Team is verifying
    else if ((old_verified === 1 && team === 2) || (old_verified === 2 && team === 1)) {
      if (score1 === match?.score1 && score2 === match.score2) {
        verified = 3;
      } else {
        verified = team;
        toast.info(
          "Scores do not match. Please come to an agreement with the other team or seek an admin."
        );
      }
    }
    // Set verification to most recent
    else {
      verified = team;
    }

    const { data: mutationResult } = await updateMatchScore({
      variables: { matchId, score1, score2, verified },
    });

    if (mutationResult?.updateMatchScore?.success) {
      toast.success("Scores successfully updated!");
      setClickedCardIndex(null); // Close input after submission
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await refetch();

      // TODO: Send email to all participants of the match if verified == 3
      if (verified === 3) {
        // Uncomment this for prod
        const participantEmails = match?.matchparticipantSet.edges
          .map((edge) => edge.node.participantId.userId.email)
          .filter(Boolean);
        console.log(participantEmails);

        // Comment this when not debugging
        // const participantEmails = ["kaden@salemfamily.com"];

        const team1 = match?.matchparticipantSet.edges[0]?.node.participantId.teamId.name;
        const team2 = match?.matchparticipantSet.edges[1]?.node.participantId.teamId.name;

        const emailSubject = `Match ${team1} vs ${team2} Results Verified`;
        const emailContent = `
          <p>The scores for match ${team1} vs ${team2} have been verified.</p>
          <p><strong>Result:</strong> ${team1} (${match?.score1}) - ${team2} (${match?.score2})</p>
        `;

        // // EMAIL COMMENT
        // participantEmails?.forEach((email) => {
        //   sendEmail(email, emailSubject, emailContent);
        // });
      }
    } else {
      toast.error("Error updating scores.");
    }
  };

  // Check if tournament is already complete when data loads
  useEffect(() => {
    if (data?.allMatchesByTournamentId?.length) {
      // Only consider a tournament complete if we have a real championship match
      // For Double Elimination, look for a specific 'championship' bracket type
      if (tournamentFormat === "Double Elimination") {
        const championshipMatches = data.allMatchesByTournamentId.filter(
          (match) => match.bracketType === "championship"
        );

        // Get completed championship matches
        const completedChampionshipMatches = championshipMatches.filter(
          (match) => match.status === "Completed"
        );

        if (completedChampionshipMatches.length === 0) {
          // No completed championship matches yet
          setIsTournamentComplete(false);
          return;
        }

        // Sort championship matches by round number (ascending)
        const sortedChampMatches = completedChampionshipMatches.sort((a, b) => a.round - b.round);
        const lastCompletedChampMatch = sortedChampMatches[sortedChampMatches.length - 1];

        // Check if we need a second championship match (true final)
        // This happens when the losers bracket champion beats the winners bracket champion
        // in their first championship match
        if (sortedChampMatches.length === 1) {
          // We have exactly one completed championship match
          const match = lastCompletedChampMatch;

          // First championship match completed
          // Determine if the losers champion (team 2) beat the winners champion (team 1)
          // If so, we need another championship match
          if (match.score1 && match.score2) {
            const score1 = parseInt(match.score1, 10);
            const score2 = parseInt(match.score2, 10);

            if (score2 > score1) {
              // Losers bracket winner beat the winners bracket winner
              // We need a second championship match (not complete yet)
              setIsTournamentComplete(false);
              return;
            }
          }
        }

        // We've reached the true final championship match
        // or the winners bracket champion won the first championship match
        setIsTournamentComplete(true);

        // Get the final championship match
        const lastMatch = lastCompletedChampMatch;

        // Determine winner from participants
        try {
          if (lastMatch.matchparticipantSet?.edges?.length >= 2) {
            // Find team with team_number 1 and 2
            const team1Data = lastMatch.matchparticipantSet.edges.find(
              (edge) => edge.node.teamNumber === 1
            );
            const team2Data = lastMatch.matchparticipantSet.edges.find(
              (edge) => edge.node.teamNumber === 2
            );

            const team1 = team1Data?.node.participantId.teamId.name;
            const team2 = team2Data?.node.participantId.teamId.name;

            if (lastMatch.score1 && lastMatch.score2 && team1 && team2) {
              const score1 = parseInt(lastMatch.score1, 10);
              const score2 = parseInt(lastMatch.score2, 10);

              if (score1 > score2) {
                setWinnerTeam(team1);
              } else if (score2 > score1) {
                setWinnerTeam(team2);
              }
            }
          }
        } catch (e) {
          console.error("Error determining winner:", e);
        }
      } else if (tournamentFormat === "Round Robin") {
        // For Round Robin, determine completion and winner based on total wins
        const completedMatches = data.allMatchesByTournamentId.filter(
          (match) => match.status === "Completed"
        );

        // Count total number of expected matches in a round robin
        const uniqueTeamIds = new Set();
        data.allMatchesByTournamentId.forEach((match) => {
          match.matchparticipantSet.edges.forEach((edge) => {
            if (edge.node.participantId.teamId.name !== "BYE") {
              uniqueTeamIds.add(edge.node.participantId.teamId.teamId);
            }
          });
        });

        const teamCount = uniqueTeamIds.size;
        const expectedTotalMatches = (teamCount * (teamCount - 1)) / 2; // n(n-1)/2 matches in round robin

        // Tournament is complete if all matches are completed
        if (completedMatches.length >= expectedTotalMatches) {
          setIsTournamentComplete(true);

          // Calculate wins for each team
          const teamWins: Record<string, number> = {};
          const teamNames: Record<string, string> = {};

          completedMatches.forEach((match) => {
            const team1Data = match.matchparticipantSet.edges.find(
              (edge) => edge.node.teamNumber === 1
            );
            const team2Data = match.matchparticipantSet.edges.find(
              (edge) => edge.node.teamNumber === 2
            );

            if (!team1Data || !team2Data) {
              return;
            }

            const team1Id = team1Data.node.participantId.teamId.teamId;
            const team2Id = team2Data.node.participantId.teamId.teamId;
            const team1Name = team1Data.node.participantId.teamId.name;
            const team2Name = team2Data.node.participantId.teamId.name;

            // Store team names for reference
            teamNames[team1Id] = team1Name;
            teamNames[team2Id] = team2Name;

            // Initialize win counts if needed
            if (!teamWins[team1Id]) {
              teamWins[team1Id] = 0;
            }
            if (!teamWins[team2Id]) {
              teamWins[team2Id] = 0;
            }

            // Calculate the winner of this match
            const score1 = parseInt(match.score1, 10) || 0;
            const score2 = parseInt(match.score2, 10) || 0;

            if (score1 > score2) {
              teamWins[team1Id]++;
            } else if (score2 > score1) {
              teamWins[team2Id]++;
            }
          });

          // Find team with most wins
          let maxWins = -1;
          let winningTeamId: string | null = null;

          Object.entries(teamWins).forEach(([teamId, wins]) => {
            if (wins > maxWins) {
              maxWins = wins;
              winningTeamId = teamId;
            }
          });

          // Set the winning team name
          if (winningTeamId && teamNames[winningTeamId]) {
            setWinnerTeam(teamNames[winningTeamId]);
          }
        } else {
          setIsTournamentComplete(false);
        }
      } else if (tournamentFormat === "Round Robin to Double Elimination") {
        // Get all championship matches
        const championshipMatches = data.allMatchesByTournamentId.filter(
          (match) => match.bracketType === "championship"
        );

        // Get completed championship matches
        const completedChampionshipMatches = championshipMatches.filter(
          (match) => match.status === "Completed"
        );

        if (completedChampionshipMatches.length === 0) {
          // No completed championship matches yet
          setIsTournamentComplete(false);
          return;
        }

        // Sort championship matches by round number (ascending)
        const sortedChampMatches = completedChampionshipMatches.sort((a, b) => a.round - b.round);
        const lastCompletedChampMatch = sortedChampMatches[sortedChampMatches.length - 1];

        // Check if we need a second championship match (true final)
        // This happens when the losers bracket champion beats the winners bracket champion
        // in their first championship match
        if (sortedChampMatches.length === 1) {
          // We have exactly one completed championship match
          const match = lastCompletedChampMatch;

          // First championship match completed
          // Determine if the losers champion (team 2) beat the winners champion (team 1)
          // If so, we need another championship match
          if (match.score1 && match.score2) {
            const score1 = parseInt(match.score1, 10);
            const score2 = parseInt(match.score2, 10);

            if (score2 > score1) {
              // Losers bracket winner beat the winners bracket winner
              // We need a second championship match (not complete yet)
              setIsTournamentComplete(false);
              return;
            }
          }
        }

        // We've reached the true final championship match
        // or the winners bracket champion won the first championship match
        setIsTournamentComplete(true);

        // Get the final championship match
        const lastMatch = lastCompletedChampMatch;

        // Determine winner from participants
        try {
          if (lastMatch.matchparticipantSet?.edges?.length >= 2) {
            // Find team with team_number 1 and 2
            const team1Data = lastMatch.matchparticipantSet.edges.find(
              (edge) => edge.node.teamNumber === 1
            );
            const team2Data = lastMatch.matchparticipantSet.edges.find(
              (edge) => edge.node.teamNumber === 2
            );

            const team1 = team1Data?.node.participantId.teamId.name;
            const team2 = team2Data?.node.participantId.teamId.name;

            if (lastMatch.score1 && lastMatch.score2 && team1 && team2) {
              const score1 = parseInt(lastMatch.score1, 10);
              const score2 = parseInt(lastMatch.score2, 10);

              if (score1 > score2) {
                setWinnerTeam(team1);
              } else if (score2 > score1) {
                setWinnerTeam(team2);
              }
            }
          }
        } catch (e) {
          console.error("Error determining winner:", e);
        }
      } else {
        // For Single Elimination
        // First, get the number of teams to determine expected rounds
        const uniqueTeamIds = new Set();

        data.allMatchesByTournamentId.forEach((match) => {
          match.matchparticipantSet.edges.forEach((edge) => {
            uniqueTeamIds.add(edge.node.participantId.teamId.teamId);
          });
        });

        const teamCount = uniqueTeamIds.size;

        let expectedFinalRound;
        if (tournamentFormat === "Round Robin to Single Elimination") {
          // For single elimination, standard formula:
          expectedFinalRound = Math.ceil(Math.log2(teamCount)) + 1;
        } else {
          // Fallback for other formats.
          expectedFinalRound = teamCount <= 1 ? 1 : Math.ceil(Math.log2(teamCount));
        }

        // Find the highest round actually present
        const maxRound = Math.max(...data.allMatchesByTournamentId.map((m) => m.round));

        // Only consider completed if we've reached the expected final round
        // AND the final match in that round is completed
        if (maxRound >= expectedFinalRound) {
          const finalMatches = data.allMatchesByTournamentId.filter(
            (match) => match.round === maxRound && match.status === "Completed"
          );

          if (finalMatches.length > 0) {
            setIsTournamentComplete(true);

            // Get the final match
            const lastMatch = finalMatches[0];

            // Determine winner from participants
            try {
              if (lastMatch.matchparticipantSet?.edges?.length >= 2) {
                // Find team with team_number 1 and 2
                const team1Data = lastMatch.matchparticipantSet.edges.find(
                  (edge) => edge.node.teamNumber === 1
                );
                const team2Data = lastMatch.matchparticipantSet.edges.find(
                  (edge) => edge.node.teamNumber === 2
                );

                const team1 = team1Data?.node.participantId.teamId.name;
                const team2 = team2Data?.node.participantId.teamId.name;

                if (lastMatch.score1 && lastMatch.score2 && team1 && team2) {
                  const score1 = parseInt(lastMatch.score1, 10);
                  const score2 = parseInt(lastMatch.score2, 10);

                  if (score1 > score2) {
                    setWinnerTeam(team1);
                  } else if (score2 > score1) {
                    setWinnerTeam(team2);
                  }
                }
              }
            } catch (e) {
              console.error("Error determining winner:", e);
            }
          } else {
            setIsTournamentComplete(false);
          }
        } else {
          setIsTournamentComplete(false);
        }
      }
    }
  }, [data, tournamentFormat]);

  if (loading || tournamentsLoading) {
    return <Loading />;
  }
  if (error) {
    return <p>Error loading matches</p>;
  }

  // Transform API response into match format
  const matches =
    data?.allMatchesByTournamentId
      ?.map((match) => {
        // Check if this is a bye match
        const isByeMatch = match.status === "Bye";

        // Find participants by team number
        const team1Data = match.matchparticipantSet.edges.find(
          (edge) => edge.node.teamNumber === 1
        );
        const team2Data = match.matchparticipantSet.edges.find(
          (edge) => edge.node.teamNumber === 2
        );

        return {
          team1: team1Data?.node.participantId.teamId.name || "TBD",
          team2: isByeMatch ? null : team2Data?.node.participantId.teamId.name || "TBD",
          time: new Date(match.startDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          court: match.court,
          matchId: match.matchId,
          score1: match.score1,
          score2: match.score2,
          status: match.status,
          isBye: isByeMatch,
          round: match.round,
          verified: match.verified,
        };
      })
      .sort((a, b) => {
        // Sort by round first
        if (a.round !== b.round) {
          return a.round - b.round;
        }
        // Then by matchId
        return Number(a.matchId) - Number(b.matchId);
      }) || [];

  const alertPlayers = async (matchId: string) => {
    // Grab the match
    const match = data?.allMatchesByTournamentId.find((match) => match.matchId === matchId);

    // Uncomment this for prod
    const participantEmails = match?.matchparticipantSet.edges
      .map((edge) => edge.node.participantId.userId.email)
      .filter(Boolean);
    console.log(participantEmails);

    // Comment this when not debugging
    // const participantEmails = ["kaden@salemfamily.com"];

    const team1 = match?.matchparticipantSet.edges[0]?.node.participantId.teamId.name;
    const team2 = match?.matchparticipantSet.edges[1]?.node.participantId.teamId.name;

    const emailSubject = `Upcoming Match: ${team1} vs ${team2}`;
    const emailContent = `
          <p>Match between ${team1} and ${team2} will begin momentarily.</p>
          <p><strong>Please head to ${match?.court}.</strong></p>
        `;

    // EMAIL COMMENT
    participantEmails?.forEach((email) => {
      sendEmail(email, emailSubject, emailContent);
    });

    toast.success(`Sent out emails for match ${team1} vs ${team2}.`);
  };

  const sendEmail = async (to_email: string, subject: string, content: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/send-email/`,
        {
          to_email,
          subject,
          html_content: content,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Email sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleCardClick = (matchId: string) => {
    const match = matches.find((m) => m.matchId === matchId);
    if (match?.isBye) {
      return;
    }

    // Check if user is tournament admin
    if (data?.allMatchesByTournamentId[0].tournament.createdBy.userId === fetchedUserId) {
      // Access allowed - admin
    }
    // Check if scores are locked
    else if (match?.verified === 3) {
      return;
    }
    // Check if user is on the team of the match
    else if (
      data?.allMatchesByTournamentId
        .find((m) => m.matchId === matchId)
        ?.matchparticipantSet.edges.some(
          (edge) => edge.node.participantId.userId?.userId?.toString() === fetchedUserId
        )
    ) {
      // Access allowed - player
    }
    // Don't give access to edit score
    else {
      return;
    }

    setClickedCardIndex(Number(matchId));
    setScoreInputs((prev) => ({
      ...prev,
      [matchId]: {
        score1: prev[matchId]?.score1 ?? (matches.find((m) => m.matchId === matchId)?.score1 || ""),
        score2: prev[matchId]?.score2 ?? (matches.find((m) => m.matchId === matchId)?.score2 || ""),
      },
    }));
  };

  const resetScoreInputs = (matchId: string) => {
    const existingMatch = matches.find((m) => m.matchId === matchId);
    if (!existingMatch) {
      return;
    }

    setScoreInputs((prev) => ({
      ...prev,
      [matchId]: {
        score1: existingMatch.score1 || "", // Restore saved score
        score2: existingMatch.score2 || "",
      },
    }));
  };

  // Filter matches based on user selection and selected round
  const filteredMatches = matches.filter((match) => {
    // Filter by user selection (all vs mine)
    if (activeButton === "mine") {
      const userIsOnTeam = data?.allMatchesByTournamentId
        .find((m) => m.matchId === match.matchId)
        ?.matchparticipantSet.edges.some(
          (edge) => edge.node.participantId.userId?.userId?.toString() === fetchedUserId
        );

      if (!userIsOnTeam) {
        return false;
      }
    }

    // Filter by round if not 'all'
    if (selectedRound !== "all" && match.round !== parseInt(selectedRound, 10)) {
      return false;
    }

    return true;
  });

  // Group matches by status for better display
  const regularMatches = filteredMatches.filter((match) => !match.isBye);

  // Get available rounds for the filter
  const availableRounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

  // Create round filter options
  const roundFilterOptions = [
    { label: "All Rounds", value: "all" },
    ...availableRounds.map((round) => ({ label: `Round ${round}`, value: round.toString() })),
  ];

  return (
    <Center style={{ width: "100%" }}>
      <Container size="sm" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Stack style={{ width: "100%" }}>
          {isTournamentComplete && (
            <Paper p="xl" radius="md" bg="green.1" mb={20}>
              <Group align="center" justify="center">
                <IconTrophy size={32} color="gold" />
                <Title order={3} c="green.9">
                  Tournament Complete!
                </Title>
              </Group>
              {winnerTeam && (
                <Text ta="center" fw={500} size="lg" mt={10}>
                  Winner: {winnerTeam}
                </Text>
              )}
            </Paper>
          )}

          {!isEmbedded && (
            <Group justify="center" mb="md">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(`/tournament/${id}`)}
              >
                Back to Tournament
              </Button>
              <Button variant="filled" color="blue" leftSection={<IconCalendar size={16} />}>
                Schedule
              </Button>
              <Button
                variant="outline"
                color="orange"
                leftSection={<IconTournament size={16} />}
                onClick={() => navigate(`/tournament/${id}/bracket`)}
              >
                View Bracket
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
              {tournamentName} Schedule
            </Title>
          )}

          <Text c="dimmed" ta="left" size="lg" maw={800} mt={0}>
            Match Schedule
          </Text>

          <Group justify="space-between" mb="md">
            <Group>
              <Button
                ta="center"
                variant={activeButton === "all" ? "filled" : "subtle"}
                onClick={() => setActiveButton("all")}
              >
                All Matches
              </Button>
              <Button
                ta="center"
                variant={activeButton === "mine" ? "filled" : "subtle"}
                onClick={() => setActiveButton("mine")}
                disabled={!fetchedUserId}
              >
                Your Matches
              </Button>
            </Group>
            {tournamentFormat !== "Round Robin" &&
              (tournamentFormat !== "Round Robin to Double Elimination" ||
                determineNextRoundAction() !== "completeCurrentRound") &&
              data?.allMatchesByTournamentId?.[0]?.tournament?.createdBy?.userId ===
                fetchedUserId && (
                <Button
                  ta="center"
                  color="green"
                  onClick={handleGenerateNextRound}
                  disabled={
                    isTournamentComplete || determineNextRoundAction() === "completeCurrentRound"
                  }
                >
                  {getButtonText()}
                </Button>
              )}
          </Group>

          {/* Round filter */}
          {availableRounds.length > 1 && (
            <Group mt="sm" mb="md">
              <Text fw={500}>Filter by round:</Text>
              <SegmentedControl
                value={selectedRound}
                onChange={setSelectedRound}
                data={roundFilterOptions}
              />
            </Group>
          )}

          {/* Regular matches */}
          {regularMatches.length > 0 ? (
            <>
              {[...new Set(regularMatches.map((m) => m.round))]
                .sort((a, b) => a - b)
                .map((round) => {
                  const roundMatches = regularMatches.filter((match) => match.round === round);
                  if (roundMatches.length === 0) {
                    return null;
                  }

                  return (
                    <div key={`round-${round}`}>
                      <Text size="lg" fw={600} mt={30} mb={10}>
                        Round {round} Matches
                      </Text>
                      {roundMatches.map((match) => (
                        <Paper
                          key={match.matchId}
                          className={classes.addhover}
                          shadow="xl"
                          p={{ base: "md", sm: "xl" }}
                          maw={600}
                          mb={20}
                          onClick={() => handleCardClick(match.matchId)}
                          style={{ cursor: "pointer" }}
                        >
                          <Group justify="space-between" align="center">
                            <div
                              style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
                            >
                              <Text
                                ta="left"
                                size="lg"
                                style={{
                                  color:
                                    parseInt(match.score1, 10) > parseInt(match.score2, 10)
                                      ? "white"
                                      : "black",
                                  fontWeight:
                                    parseInt(match.score1, 10) > parseInt(match.score2, 10)
                                      ? "bold"
                                      : "normal",
                                  opacity:
                                    parseInt(match.score1, 10) < parseInt(match.score2, 10)
                                      ? 0.5
                                      : 1,
                                  backgroundColor:
                                    parseInt(match.score1, 10) > parseInt(match.score2, 10)
                                      ? "#51cf66"
                                      : "transparent",
                                  borderRadius: "4px",
                                  padding:
                                    parseInt(match.score1, 10) > parseInt(match.score2, 10)
                                      ? "2px 6px"
                                      : "0px",
                                }}
                              >
                                {match.team1}
                              </Text>
                              <Text c="dimmed" ta="left" size="lg" style={{ margin: "0 8px" }}>
                                vs
                              </Text>
                              <Text
                                ta="left"
                                size="lg"
                                style={{
                                  color:
                                    parseInt(match.score2, 10) > parseInt(match.score1, 10)
                                      ? "white"
                                      : "black",
                                  fontWeight:
                                    parseInt(match.score2, 10) > parseInt(match.score1, 10)
                                      ? "bold"
                                      : "normal",
                                  opacity:
                                    parseInt(match.score2, 10) < parseInt(match.score1, 10)
                                      ? 0.5
                                      : 1,
                                  backgroundColor:
                                    parseInt(match.score2, 10) > parseInt(match.score1, 10)
                                      ? "#51cf66"
                                      : "transparent",
                                  borderRadius: "4px",
                                  padding:
                                    parseInt(match.score2, 10) > parseInt(match.score1, 10)
                                      ? "2px 6px"
                                      : "0px",
                                }}
                              >
                                {match.team2}
                              </Text>
                            </div>
                            {data?.allMatchesByTournamentId?.[0]?.tournament?.createdBy?.userId ===
                              fetchedUserId && (
                              <Tooltip label="Alert players of match?" position="top" withArrow>
                                <IconBellFilled
                                  color="gray"
                                  style={{ cursor: "pointer", transition: "color 0.2s" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f59f00")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "gray")}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alertPlayers(match.matchId);
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Group>

                          <Flex align="center">
                            <Text c="dimmed">
                              {match.score1} - {match.score2}
                            </Text>
                            <Tooltip
                              label={
                                match.verified === 3
                                  ? "Verified"
                                  : match.verified === 1 || match.verified === 2
                                    ? "Unverified"
                                    : "Waiting for scores to be put in"
                              }
                            >
                              <IconCircleCheckFilled
                                color={
                                  match.verified === 3
                                    ? "#51cf66"
                                    : match.verified === 1 || match.verified === 2
                                      ? "#f59f00"
                                      : "gray"
                                }
                                style={{ marginLeft: "8px" }}
                              />
                            </Tooltip>
                          </Flex>
                          <Group>
                            <Text c="dimmed" ta="left" size="lg">
                              {match.time} | {match.court}
                            </Text>
                          </Group>

                          {clickedCardIndex === Number(match.matchId) && (
                            <Stack mt={40}>
                              <Text c="dimmed" ta="left" size="sm">
                                Update Score
                              </Text>
                              <Group>
                                <TextInput
                                  size="md"
                                  variant="unstyled"
                                  label={match.team1}
                                  placeholder="0"
                                  value={scoreInputs[match.matchId]?.score1 || ""}
                                  onChange={(e) =>
                                    handleScoreChange(match.matchId, "score1", e.target.value)
                                  }
                                />
                                <TextInput
                                  size="md"
                                  variant="unstyled"
                                  label={match.team2}
                                  placeholder="0"
                                  value={scoreInputs[match.matchId]?.score2 || ""}
                                  onChange={(e) =>
                                    handleScoreChange(match.matchId, "score2", e.target.value)
                                  }
                                />
                              </Group>
                              <Group>
                                <Button
                                  ta="center"
                                  variant="outline"
                                  color="orange"
                                  size="md"
                                  radius="xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetScoreInputs(match.matchId); // Restore last saved score
                                    setClickedCardIndex(null); // Close input
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  ta="center"
                                  variant="filled"
                                  color="orange"
                                  size="md"
                                  radius="xl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubmitScore(match.matchId);
                                  }}
                                >
                                  Submit
                                </Button>
                              </Group>
                            </Stack>
                          )}
                        </Paper>
                      ))}
                    </div>
                  );
                })}
            </>
          ) : (
            <Text c="dimmed" ta="center" size="lg" mt={20}>
              No matches found for the selected filters.
            </Text>
          )}
        </Stack>
      </Container>
    </Center>
  );
}
