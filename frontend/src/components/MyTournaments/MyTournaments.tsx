import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IconCalendar, IconTrophy, IconUsers } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Badge, Button, Card, Group, Stack, Tabs, Text, Title } from "@mantine/core";
import DELETE_TEAM_PARTICIPANT from "@/graphql/mutations/DeleteTeamParticipant";
import { DELETE_TOURNAMENT } from "@/graphql/mutations/DeleteTournament";
import { GET_ALL_TOURNAMENTS } from "@/graphql/queries/GetAllTournaments";
import { GET_TOURNAMENTS_BY_USER } from "@/graphql/queries/GetTournamentsByUser";
import GET_USER_BY_UUID from "@/graphql/queries/GetUserByUUID";
import Loading from "../Loading/Loading";
import classes from "./MyTournaments.module.css";
import masterClasses from "../MasterStyles.module.css"

export function MyTournaments() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("all");

  const userDataString = localStorage.getItem("user");
  let userUUID = "";

  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      userUUID = userData.uuid || "";
      // console.log("Found user UUID:", userUUID);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  const { loading: userLoading, error: userError } = useQuery(GET_USER_BY_UUID, {
    variables: { uuid: userUUID },
    skip: !userUUID,
    onCompleted: (data) => {
      if (data?.allUsers?.edges?.[0]?.node?.userId) {
        const fetchedUserId = data.allUsers.edges[0].node.userId;
        setUserId(fetchedUserId);
        // console.log("User ID found:", fetchedUserId);
      }
    },
  });

  const {
    loading: tournamentsLoading,
    error: tournamentsError,
    data: allTournamentsData,
    refetch: refetchTournaments,
  } = useQuery(GET_ALL_TOURNAMENTS, {
    fetchPolicy: "network-only",
  });

  // Query to get tournaments where the user is a participant
  const {
    loading: participatedTournamentsLoading,
    error: participatedTournamentsError,
    data: participatedTournamentsData,
    refetch: refetchParticipatedTournaments,
  } = useQuery(GET_TOURNAMENTS_BY_USER, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error fetching participated tournaments:", error);
    },
  });

  const [deleteTournament, { loading: deleteLoading }] = useMutation(DELETE_TOURNAMENT, {
    onCompleted: () => {
      refetchTournaments();
      refetchParticipatedTournaments();
    },
    onError: (err) => {
      console.error("Error deleting tournament:", err.message);
    },
  });

  const [leaveTournament, { loading: leaveLoading }] = useMutation(DELETE_TEAM_PARTICIPANT, {
    onCompleted: () => {
      refetchParticipatedTournaments();
      toast.success("You have successfully left the tournament", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    onError: (err) => {
      console.error("Error leaving tournament:", err.message);
      toast.error("Error leaving tournament: " + err.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
  });

  if (userError) {
    return <p>Error loading user: {userError.message}</p>;
  }

  if (tournamentsError) {
    return <p>Error loading tournaments: {tournamentsError.message}</p>;
  }

  if (participatedTournamentsError) {
    return <p>Error loading participated tournaments: {participatedTournamentsError.message}</p>;
  }

  // Filter tournaments created by the current user and sort by ID in ascending order
  const allTournaments = allTournamentsData?.allTournaments?.edges || [];
  const createdTournaments = allTournaments
    .filter(({ node }: any) => node.createdBy?.userId === userId)
    .sort((a: any, b: any) => a.node.tournamentId - b.node.tournamentId); // Sort by ID ascending

  // Get tournaments where the user is a participant
  const participatedTournaments = participatedTournamentsData?.allParticipants?.edges || [];

  // Filter participants by the current user's ID
  const userParticipants = participatedTournaments.filter(
    ({ node }: any) => node.userId?.userId === userId
  );

  // Extract tournament data from participants and filter out duplicates
  const joinedTournaments = userParticipants
    .map(({ node }: any) => ({
      ...node.tournamentId,
      teamId: node.teamId?.teamId,
      teamName: node.teamId?.name,
      participantId: node.participantId,
    }))
    .filter((tournament: any) => tournament.createdBy?.userId !== userId);

  // Combine both lists for "All" tab
  const allMyTournaments = [
    ...createdTournaments.map((t: any) => ({ ...t, type: "created" })),
    ...joinedTournaments.map((t: any) => ({ type: "joined", node: t })),
  ];

  // Handle deleting a tournament
  const handleDelete = async (tournamentId: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        await deleteTournament({ variables: { tournamentId: Number(tournamentId) } });
      } catch (e) {
        console.error("Error deleting tournament:", e);
      }
    }
  };

  // Handle leaving a tournament
  const handleLeave = async (participantId: string) => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        "Are you sure you want to leave this tournament? This action cannot be undone."
      )
    ) {
      try {
        await leaveTournament({ variables: { participantId: Number(participantId) } });
      } catch (e) {
        console.error("Error leaving tournament:", e);
      }
    }
  };

  // Function to render tournament cards
  const renderTournamentCard = (tournament: any, type: "created" | "joined") => {
    const node = type === "created" ? tournament.node : tournament;
    const tournamentId = type === "created" ? node.tournamentId : node.tournamentId;
    const teamId = type === "joined" ? node.teamId : null;
    const teamName = type === "joined" ? node.teamName : null;
    const participantId = type === "joined" ? node.participantId : null;

    return (
      <Card key={tournamentId} shadow="md" className={classes.tournamentCard} maw={350} w="100%">
        <Stack align="center" gap="xs">
          <Group justify="center" align="center" w="100%">
            <Title
              className={classes.tournamentName}
              lineClamp={2}
              title={node.name}
              style={{
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {node.name}
            </Title>
          </Group>
          <Badge color={node.isPrivate ? "red" : "green"}>
            {node.isPrivate ? "Private Tournament" : "Public Tournament"}
          </Badge>
          <Badge color={type === "created" ? "blue" : "orange"}>
            {type === "created" ? "Created by you" : "Joined by you"}
          </Badge>
          {teamName && <Badge color="teal">Team: {teamName}</Badge>}
          {node.description && node.description.trim() !== "" && (
            <Text
              className={classes.tournamentDescription}
              ta="center"
              lineClamp={2}
              title={node.description}
              style={{
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {node.description}
            </Text>
          )}

          {/* Tournament details */}
          <Group w="100%" justify="center">
            <Stack gap="xs" align="center" w="100%">
              {node.startDate && node.endDate && (
                <Group gap="xs" justify="center">
                  <IconCalendar size={16} />
                  <Text size="sm">
                    {new Date(node.startDate).toLocaleDateString()} -{" "}
                    {new Date(node.endDate).toLocaleDateString()}
                  </Text>
                </Group>
              )}
              {node.format && (
                <Group gap="xs" justify="center">
                  <IconTrophy size={16} />
                  <Text size="sm">Format: {node.format}</Text>
                </Group>
              )}
              {(node.teamSize || node.maxTeams) && (
                <Group gap="xs" justify="center">
                  <IconUsers size={16} />
                  <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                    {node.teamSize && `Team Size: ${node.teamSize}`}
                    {node.teamSize && node.maxTeams && " | "}
                    {node.maxTeams && `Max Teams: ${node.maxTeams}`}
                  </Text>
                </Group>
              )}
            </Stack>
          </Group>

          {/* Action Buttons */}
          <Group justify="center" mt="sm">
            {type === "created" && (
              <Button
                variant="outline"
                onClick={() => navigate(`/admin-dashboard/${tournamentId}`)}
              >
                Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/tournament/${tournamentId}`)}>
              View
            </Button>
            {type === "joined" && teamId && (
              <Button
                variant="outline"
                color="teal"
                onClick={() => navigate(`/tournament/${tournamentId}/team/${teamId}`)}
              >
                My Team
              </Button>
            )}
            {type === "created" && (
              <Button
                variant="outline"
                color="red"
                loading={deleteLoading}
                onClick={() => handleDelete(tournamentId)}
              >
                Delete
              </Button>
            )}
            {type === "joined" && participantId && (
              <Button
                variant="outline"
                color="red"
                loading={leaveLoading}
                onClick={() => handleLeave(participantId)}
              >
                Leave
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    );
  };

  const noTournamentsMessage = (type: string) => (
    <Text fz="md" opacity={0.6}>
      {type === "created"
        ? "You haven't created any tournaments yet."
        : type === "joined"
          ? "You haven't joined any tournaments yet."
          : "No tournaments found."}
      {type !== "joined" && (
        <button
          type="button"
          onClick={() => navigate("/create-tournament")}
          className={classes.createNowButton}
        >
          Create one now!
        </button>
      )}
    </Text>
  );

  if (userLoading || tournamentsLoading || participatedTournamentsLoading) {
    return <Loading />;
  }

  return (
    <div className={classes.pageContainer} style={{ marginTop: "1rem" }}>
      <Title className={masterClasses.mainTitle}>My Tournaments</Title>
      <Tabs value={activeTab} onChange={setActiveTab} color="orange" mt="md">
        <Tabs.List justify="center">
          <Tabs.Tab fz="md" value="all">
            All Tournaments
          </Tabs.Tab>
          <Tabs.Tab fz="md" value="created">
            Created by Me
          </Tabs.Tab>
          <Tabs.Tab fz="md" value="joined">
            Joined by Me
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all" pt="xl">
          {allMyTournaments.length === 0 ? (
            noTournamentsMessage("all")
          ) : (
            <Group className={classes.tournamentList} gap="md">
              {allMyTournaments.map((tournament: any) =>
                renderTournamentCard(
                  tournament.type === "created" ? tournament : tournament.node,
                  tournament.type as "created" | "joined"
                )
              )}
            </Group>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="created" pt="xl">
          {createdTournaments.length === 0 ? (
            noTournamentsMessage("created")
          ) : (
            <Group className={classes.tournamentList} gap="md">
              {createdTournaments.map((tournament: any) =>
                renderTournamentCard(tournament, "created")
              )}
            </Group>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="joined" pt="xl">
          {joinedTournaments.length === 0 ? (
            noTournamentsMessage("joined")
          ) : (
            <Group className={classes.tournamentList} gap="md">
              {joinedTournaments.map((tournament: any) =>
                renderTournamentCard(tournament, "joined")
              )}
            </Group>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
