import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  IconArrowsJoin,
  IconCalendar,
  IconCheck,
  IconClockHour3,
  IconEdit,
  IconExternalLink,
  IconLink,
  IconList,
  IconPencilPlus,
  IconTrash,
  IconTrophy,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Divider,
  Group,
  Modal,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { DELETE_MATCHES } from "@/graphql/mutations/DeleteMatches";
import { GENERATE_DOUBLE_ELIMINATION_MATCHES } from "@/graphql/mutations/GenerateDoubleEliminationMatches";
import { GENERATE_MATCHES } from "@/graphql/mutations/GenerateMatches";
import { GENERATE_ROUND_ROBIN_MATCHES } from "@/graphql/mutations/GenerateRoundRobinMatches";
import { GENERATE_ROUND_ROBIN_TO_DOUBLE_ELIMINATION } from "@/graphql/mutations/GenerateRoundRobinToDoubleElimination";
import { GENERATE_ROUND_ROBIN_TO_SINGLE_ELIMINATION } from "@/graphql/mutations/GenerateRoundRobinToSingleElimination";
import { GENERATE_SWISS_MATCHES } from "@/graphql/mutations/GenerateSwissMatches";
import { GET_CURRENT_USER } from "@/graphql/queries/GetCurrentUser";
import { GET_TOURNAMENT } from "@/graphql/queries/GetSingleTournament";
import Loading from "../Loading/Loading";
import { TournamentBracket } from "../TournamentBracket/TournamentBracket";
import { TournamentSchedule } from "../TournamentSchedule/TournamentSchedule";
import { TournamentStandings } from "../TournamentStandings/TournamentStandings";
import TournamentTeams from "../TournamentTeams/TournamentTeams";
import eventImg from "./eventImg.png";
import classes from "../MasterStyles.module.css";

interface Participant {
  userName: string;
}

interface TournamentDescriptionProps {
  name?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  format?: string;
  maxTeams?: number;
  teamSize?: number;
  _showEmail?: boolean;
  _showPhone?: boolean;
  _createdByName?: string;
  _createdByPhone?: string;
  _createdByEmail?: string;
  _createdByUserId?: string;
  isPrivate?: boolean;
  inviteLink?: string;
  _password?: string;
  tournamentTeams: any;
  isAdmin?: boolean;
}

export function TournamentDescription({
  name,
  description,
  startDate,
  endDate,
  format,
  maxTeams,
  teamSize,
  _showEmail,
  _showPhone,
  _createdByName,
  _createdByPhone,
  _createdByEmail,
  _createdByUserId,
  isPrivate,
  inviteLink,
  _password,
  tournamentTeams,
}: TournamentDescriptionProps) {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();
  const location = useLocation();

  // Get tab from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const urlTab = queryParams.get("tab");

  // State to track the active tab, initialized from URL or default to "schedule"
  const [activeTab, setActiveTab] = useState<string | null>(urlTab || "schedule");

  // Update URL when active tab changes
  useEffect(() => {
    if (activeTab) {
      const newQueryParams = new URLSearchParams(location.search);
      newQueryParams.set("tab", activeTab);
      navigate({ search: newQueryParams.toString() }, { replace: true });
    }
  }, [activeTab, navigate, location.search]);

  const {
    data: tournamentData,
    loading: _tournamentLoading,
    error: _tournamentError,
    refetch: refetchTournament,
  } = useQuery(GET_TOURNAMENT, {
    variables: { id: tournamentCode },
    fetchPolicy: "network-only", // Don't use cache
    onError: (error) => {
      console.error("Tournament query error:", error);
      toast.error("Error loading tournament data");
    },
  });

  // Add refetch on mount
  useEffect(() => {
    refetchTournament();
  }, [refetchTournament]);

  // Get user data from localStorage as fallback
  const userDataString = localStorage.getItem("user");
  const localUserData = userDataString ? JSON.parse(userDataString) : null;

  const { data: _currentUserData, loading: _userLoading } = useQuery(GET_CURRENT_USER, {
    variables: { uuid: localUserData?.uuid },
    skip: !localUserData?.uuid,
  });

  // console.log("Local User Data:", localUserData);
  // console.log("Raw Current User Data:", currentUserData);
  // console.log("Raw Tournament Data:", tournamentData);
  // console.log("Loading States:", { userLoading, tournamentLoading });

  // Use UUID for comparison instead of userId
  const _currentUserUuid = localUserData?.uuid?.toString();
  const _creatorUuid = tournamentData?.tournament?.createdBy?.uuid?.toString();

  const isCurrentUserParticipant = useMemo(() => {
    // console.log("Participant Check:", {
    //   participants: tournamentData?.tournament?.participants?.edges,
    //   userUuid: localUserData?.uuid,
    //   participantsData: tournamentData?.tournament?.participants?.edges?.map((e: any) => ({
    //     userUuid: e?.node?.userId?.uuid,
    //     teamId: e?.node?.teamId?.teamId,
    //   })),
    // });

    if (!tournamentData?.tournament?.participants?.edges || !localUserData?.uuid) {
      // console.log("Not a participant: missing data");
      return false;
    }

    const isParticipant = tournamentData.tournament.participants.edges.some(
      (edge: any) => edge?.node?.userId?.uuid === localUserData.uuid
    );

    // console.log("Is participant result:", isParticipant);
    return isParticipant;
  }, [tournamentData?.tournament?.participants?.edges, localUserData?.uuid]);

  // Find the user's team
  const userTeam = useMemo(() => {
    if (!tournamentData?.tournament?.participants?.edges || !localUserData?.uuid) {
      return null;
    }

    const userParticipant = tournamentData.tournament.participants.edges.find(
      (edge: any) => edge?.node?.userId?.uuid === localUserData.uuid
    );

    // console.log("Found User Participant:", {
    //   participant: userParticipant,
    //   team: userParticipant?.node?.teamId,
    //   allParticipants: tournamentData.tournament.participants.edges,
    // });

    return userParticipant?.node?.teamId;
  }, [tournamentData?.tournament?.participants?.edges, localUserData?.uuid]);

  const isCurrentUserCreator = useMemo(() => {
    if (!localUserData || !tournamentData?.tournament?.createdBy?.uuid) {
      return false;
    }

    // Compare UUIDs directly for more reliable creator check
    return localUserData.uuid === tournamentData.tournament.createdBy.uuid;
  }, [localUserData, tournamentData]);

  // Add debug logging for security checks
  // console.log("Creator check:", {
  //   currentUserUUID: localUserData?.uuid,
  //   creatorUUID: tournamentData?.tournament?.createdBy?.uuid,
  //   isCreator: localUserData?.uuid === tournamentData?.tournament?.createdBy?.uuid,
  // });

  // // Log creator status for debugging
  // console.log("Is current user the creator?", isCurrentUserCreator);
  // console.log("Creator UUID:", tournamentData?.tournament?.createdBy?.uuid);
  // console.log("Current user UUID:", JSON.parse(localStorage.getItem("user") || "{}")?.uuid);

  // Check if matches exist
  const hasMatches = useMemo(() => {
    // console.log("Matches Check:", {
    //   matches: tournamentData?.tournament?.matchSet,
    //   hasMatches: tournamentData?.tournament?.matchSet?.edges?.length > 0,
    // });
    return tournamentData?.tournament?.matchSet?.edges?.length > 0;
  }, [tournamentData?.tournament?.matchSet?.edges]);

  // Add this after the hasMatches useMemo
  const teamCount = useMemo(() => {
    // First try counting from tournamentTeams prop which comes from a different query
    if (tournamentTeams?.teamsByTournamentId) {
      // Filter out any potentially invalid team entries
      const validTeams = tournamentTeams.teamsByTournamentId.filter(
        (team: any) => team && team.teamId && team.name
      );

      return validTeams.length;
    }

    // Fallback to the original method using participants
    if (!tournamentData?.tournament?.participants?.edges) {
      return 0;
    }

    // Get unique team IDs from participants, ensuring we check for .team_id or .teamId
    const uniqueTeamIds = new Set();

    tournamentData.tournament.participants.edges.forEach((edge: any) => {
      // Only count teams that have valid data
      if (edge?.node?.teamId?.teamId) {
        uniqueTeamIds.add(edge.node.teamId.teamId);
      } else if (edge?.node?.team_id?.team_id) {
        uniqueTeamIds.add(edge.node.team_id.team_id);
      } else if (edge?.node?.teamId?.id) {
        uniqueTeamIds.add(edge.node.teamId.id);
      } else if (edge?.node?.team_id) {
        uniqueTeamIds.add(edge.node.team_id);
      }
    });

    return uniqueTeamIds.size;
  }, [tournamentData?.tournament?.participants?.edges, tournamentTeams]);

  // Add a refetch effect to ensure we have the latest team data
  useEffect(() => {
    // We can't call refetch directly as we don't have access to it
    // But we can trigger a manual refetch whenever the component is mounted
    const refreshInterval = setInterval(() => {
      refetchTournament();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [refetchTournament]);

  // Update delete matches mutation
  const [deleteMatches] = useMutation(DELETE_MATCHES, {
    onCompleted: () => {
      toast.success("Matches deleted successfully!");
      refetchTournament(); // Refetch instead of page reload
    },
    onError: (err) => {
      console.error("Error deleting matches:", err.message);
      toast.error("Failed to delete matches.");
    },
  });

  // Select appropriate mutation based on tournament format
  const getMutationForFormat = () => {
    // For "Round Robin to Single Elimination" just use the dedicated mutation
    // The backend will handle both phases correctly
    if (format === "Round Robin to Single Elimination") {
      return GENERATE_ROUND_ROBIN_TO_SINGLE_ELIMINATION;
    }

    // Add support for Round Robin to Double Elimination
    if (format === "Round Robin to Double Elimination") {
      return GENERATE_ROUND_ROBIN_TO_DOUBLE_ELIMINATION;
    }

    // For other tournament formats
    switch (format) {
      case "Round Robin":
        return GENERATE_ROUND_ROBIN_MATCHES;
      case "Double Elimination":
        return GENERATE_DOUBLE_ELIMINATION_MATCHES;
      case "Swiss System":
        return GENERATE_SWISS_MATCHES;
      default:
        return GENERATE_MATCHES; // Default to single elimination
    }
  };

  // Update generate matches mutation with conditional logic for tournament format
  const [generateMatches, { loading: _generateLoading }] = useMutation(getMutationForFormat(), {
    onCompleted: (data) => {
      // Check for success message from GraphQL
      const successMessage =
        data.generateChainedFormat?.message || "Matches generated successfully!";

      toast.success(successMessage);

      // Navigate to the schedule page after generating matches
      navigate(`/tournament/${tournamentCode}/schedule`);
    },
    onError: (err) => {
      console.error("Error generating matches:", err.message);
      toast.error(`Failed to generate matches: ${err.message}`);
    },
  });

  // Add a new state for the delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <Box
      style={{
        backgroundImage: `url(${eventImg})`,
        backgroundSize: "auto",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        paddingTop: "100px",
        paddingBottom: "200px",
      }}
    >
      <Stack gap="lg" mt={100} mx="auto" maw={1000}>
        {/* Tournament Info */}
        <Card shadow="sm" p="xl" radius="md" withBorder>
          <Stack align="center" gap="md" mt={10}>
            <Title order={1} className={classes.subtitle} ta="center">
              {name} (ID: {tournamentCode})
            </Title>
            <Badge color={isPrivate ? "red" : "green"} size="xl">
              {isPrivate ? "Private Tournament" : "Public Tournament"}
            </Badge>
            <Divider my="sm" />
            <Group align="center" gap="xl" style={{ marginTop: -30 }}>
              <Group gap="xs">
                <IconCalendar size={20} stroke={2} color="var(--mantine-color-gray-6)" />
                <Text size="sm" color="gray">
                  {startDate ? new Date(startDate).toLocaleDateString() : "N/A"} -{" "}
                  {endDate ? new Date(endDate).toLocaleDateString() : "N/A"}
                </Text>
              </Group>
              <Group gap="xs">
                <IconTrophy size={20} stroke={2} color="var(--mantine-color-gray-6)" />
                <Text size="sm" color="gray">
                  {format}
                </Text>
              </Group>
              {(teamSize || maxTeams) && (
                <Group gap="xs">
                  <IconUsers size={20} stroke={2} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" color="gray">
                    Team Size: {teamSize ?? "N/A"} | Max Teams: {maxTeams ?? "N/A"}
                  </Text>
                </Group>
              )}

              {/* Add this new group for team count */}
              <Group gap="xs">
                <IconUsersGroup size={20} stroke={2} color="var(--mantine-color-gray-6)" />
                <Text size="sm" color="gray">
                  Teams: {teamCount} / {maxTeams ?? "∞"}
                </Text>
              </Group>
            </Group>

            <Box maw={800} w="100%" mt="lg" mx="auto">
              <Text size="md" color="dimmed" ta="center">
                {description}
              </Text>
            </Box>

            <Group align="center" mt="xl">
              {/* General User Actions */}
              <Group justify="center" w="100%">
                {/* {console.log("Rendering user actions:", {
                isCurrentUserParticipant,
                isCurrentUserCreator,
                userTeam,
                hasTeam: !!userTeam,
                tournamentCode,
              })} */}

                {/* Show Join Tournament button if not a participant and not a creator */}
                {!isCurrentUserParticipant && !isCurrentUserCreator && localUserData?.uuid && (
                  <Button
                    onClick={() => navigate(`/tournament/${tournamentCode}/join`)}
                    ta="center"
                    variant="filled"
                    color="orange"
                    size="md"
                    radius="xl"
                    maw={200}
                    leftSection={<IconArrowsJoin size={20} stroke={2} />}
                  >
                    Join Tournament
                  </Button>
                )}

                {/* Show My Team button if a participant with a team */}
                {isCurrentUserParticipant && userTeam && (
                  <Button
                    onClick={() => {
                      // console.log("Navigating to team:", {
                      //   tournamentCode,
                      //   teamId: userTeam.teamId,
                      //   userTeam,
                      // });
                      navigate(`/tournament/${tournamentCode}/team/${userTeam.teamId}`);
                    }}
                    ta="center"
                    variant="filled"
                    color="orange"
                    size="md"
                    radius="xl"
                    leftSection={<IconUsersGroup size={20} stroke={2} />}
                  >
                    My Team
                  </Button>
                )}

                {/* Fallback Join button if no other conditions are met and user is logged in
              {!isCurrentUserParticipant &&
                !isCurrentUserCreator &&
                !userTeam &&
                localUserData?.uuid && (
                  <Button
                    onClick={() => navigate(`/tournament/${tournamentCode}/join`)}
                    ta="center"
                    variant="filled"
                    color="blue"
                    size="md"
                    radius="xl"
                    maw={200}
                    leftSection={<IconArrowsJoin size={20} stroke={2} />}
                  >
                    Join Tournament
                  </Button>
                )} */}

                {inviteLink && (
                  <CopyButton
                    value={`${window.location.origin}/tournament/${tournamentCode}?inviteCode=${inviteLink}`}
                  >
                    {({ copied, copy }) => (
                      <Button
                        color={copied ? "teal" : "orange"}
                        onClick={copy}
                        variant="filled"
                        size="md"
                        radius="xl"
                        leftSection={
                          copied ? (
                            <IconCheck size={20} stroke={2} />
                          ) : (
                            <IconLink size={20} stroke={2} />
                          )
                        }
                      >
                        {copied ? "Copied!" : "Invite Players"}
                      </Button>
                    )}
                  </CopyButton>
                )}
              </Group>

              {/* Admin buttons - only show to creator */}
              {isCurrentUserCreator && (
                <Group mt="md" justify="center" w="100%">
                  <Button
                    leftSection={<IconEdit size={16} />}
                    variant="outline"
                    color="orange"
                    onClick={() => navigate(`/admin-dashboard/${tournamentCode}`)}
                  >
                    Edit Tournament
                  </Button>

                  {!hasMatches ? (
                    <Button
                      leftSection={<IconArrowsJoin size={16} />}
                      variant="outline"
                      color="orange"
                      onClick={() => {
                        generateMatches({
                          variables: { tournamentId: tournamentCode },
                          onCompleted: (data) => {
                            refetchTournament();
                            const successMessage =
                              (format === "Round Robin to Single Elimination" ||
                                format === "Round Robin to Double Elimination") &&
                              data.generateChainedFormat
                                ? data.generateChainedFormat.message
                                : "Matches generated successfully!";
                            toast.success(successMessage);
                            navigate(`/tournament/${tournamentCode}/schedule`);
                          },
                        });
                      }}
                    >
                      {format === "Round Robin"
                        ? "Generate Round Robin"
                        : format === "Round Robin to Single Elimination"
                          ? "Generate Initial Matches"
                          : format === "Round Robin to Double Elimination"
                            ? "Generate Initial Matches"
                            : format === "Swiss System"
                              ? "Generate Swiss System"
                              : format === "Double Elimination"
                                ? "Generate Double Elimination"
                                : "Generate Matches"}
                    </Button>
                  ) : (
                    <>
                      {/* Delete confirmation modal */}
                      <Modal
                        opened={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        title={
                          <Text fw={700} size="lg">
                            Confirm Delete
                          </Text>
                        }
                        centered
                      >
                        <Stack>
                          <Text>
                            Are you sure you want to delete all matches? This action cannot be
                            undone.
                          </Text>
                          <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              color="red"
                              onClick={() => {
                                deleteMatches({
                                  variables: { tournamentId: tournamentCode },
                                });
                                setDeleteModalOpen(false);
                              }}
                            >
                              Delete
                            </Button>
                          </Group>
                        </Stack>
                      </Modal>

                      {/* Replace the Delete Matches button with this updated version */}
                      <Button
                        leftSection={<IconTrash size={16} />}
                        variant="outline"
                        color="red"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        Delete Matches
                      </Button>
                      <Button
                        leftSection={<IconPencilPlus size={16} />}
                        variant="outline"
                        color="orange"
                        onClick={() => navigate(`/admin-dashboard/${tournamentCode}/edit-matches`)}
                      >
                        Edit Matches
                      </Button>
                    </>
                  )}
                </Group>
              )}
            </Group>
          </Stack>

          {/* Tournament Tabs (Embedded Schedule, Bracket, Standings) */}
          <Tabs color="orange" value={activeTab} onChange={setActiveTab} mt={100}>
            <Tabs.List style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
              {isCurrentUserCreator || isCurrentUserParticipant ? (
                <Tabs.Tab value="schedule">
                  <Group gap="xs">
                    <IconClockHour3 size={16} />
                    <Text fz="md">Match Schedule</Text>
                  </Group>
                </Tabs.Tab>
              ) : null}
              {isCurrentUserCreator || isCurrentUserParticipant ? (
                <Tabs.Tab value="bracket">
                  <Group gap="xs">
                    <IconTrophy size={16} />
                    <Text fz="md">Bracket</Text>
                  </Group>
                </Tabs.Tab>
              ) : null}
              <Tabs.Tab value="standings">
                <Group gap="xs">
                  <IconList size={16} />
                  <Text fz="md">Standings</Text>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="teams">
                <Group gap="xs">
                  <IconUsers size={16} />
                  <Text fz="md">Teams</Text>
                </Group>
              </Tabs.Tab>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "var(--_tab-padding)",
                  marginLeft: "auto",
                }}
              >
                {activeTab === "schedule" && (
                  <Anchor href={`/tournament/${tournamentCode}/schedule`} size="sm">
                    View Page <IconExternalLink size={16} style={{ verticalAlign: "middle" }} />
                  </Anchor>
                )}
                {activeTab === "bracket" && (
                  <Anchor href={`/tournament/${tournamentCode}/bracket`} size="sm">
                    View Page <IconExternalLink size={16} style={{ verticalAlign: "middle" }} />
                  </Anchor>
                )}
                {activeTab === "standings" && (
                  <Anchor href={`/tournament/${tournamentCode}/standings`} size="sm">
                    View Page <IconExternalLink size={16} style={{ verticalAlign: "middle" }} />
                  </Anchor>
                )}
              </div>
            </Tabs.List>

            {/* Tab Panels */}
            {!hasMatches ? (
              <Text c="dimmed" ta="center" mt="xl">
                No matches have been generated yet.{" "}
                {isCurrentUserCreator &&
                  "Use the Generate Matches button to create the tournament schedule."}
              </Text>
            ) : (
              <div>
                <Tabs.Panel value="schedule" pt="xs">
                  <Title order={3} ta="center" mt="xl" mb="md">
                    {tournamentData?.tournament?.name}'s Schedule
                  </Title>
                  <TournamentSchedule
                    id={tournamentCode}
                    tournamentName={tournamentData?.tournament?.name}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="bracket" pt="xs">
                  <Title order={3} ta="center" mt="xl" mb="md">
                    {tournamentData?.tournament?.name}'s Bracket
                  </Title>
                  <TournamentBracket
                    id={tournamentCode}
                    tournamentName={tournamentData?.tournament?.name}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="standings" pt="xs">
                  <Title order={3} ta="center" mt="xl" mb="md">
                    {tournamentData?.tournament?.name}'s Standings
                  </Title>
                  <TournamentStandings
                    id={tournamentCode}
                    tournamentName={tournamentData?.tournament?.name}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="teams" pt="xs">
                  <Title order={3} ta="center" mt="xl" mb="md">
                    {tournamentData?.tournament?.name}'s Teams
                  </Title>
                  <TournamentTeams
                    tournamentTeams={tournamentTeams}
                    isCreator={isCurrentUserCreator}
                    tournamentId={tournamentCode}
                  />
                </Tabs.Panel>
              </div>
            )}
          </Tabs>
        </Card>
      </Stack>
    </Box>
  );
}
