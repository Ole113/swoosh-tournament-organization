import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IconTrash } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { KICK_TEAM } from "@/graphql/mutations/KickTeam";
import GET_TEAMS_BY_TOURNAMENT_ID from "@/graphql/queries/GetTeamsByTournamentId";

interface Team {
  teamId: string | number;
  name: string;
  description?: string;
  participantSet: {
    edges: {
      node: {
        userId: {
          name: string;
        };
        participantId: string | number;
      };
    }[];
  };
}

interface KickTeamsProps {
  tournamentId: string;
}

export function KickTeams({ tournamentId }: KickTeamsProps) {
  const [teamToKick, setTeamToKick] = useState<Team | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // For internal validation only
  const numericTournamentId = tournamentId ? parseInt(tournamentId, 10) : 0;

  console.log("Tournament ID being used:", tournamentId, "Type:", typeof tournamentId);

  // Query to get all teams in the tournament using teamsByTournamentId
  const { loading, error, data, refetch } = useQuery(GET_TEAMS_BY_TOURNAMENT_ID, {
    variables: {
      tournamentId: tournamentId.toString(), // Ensure it's a string
    },
    fetchPolicy: "network-only",
    onError: (err) => {
      console.error("Error fetching teams:", err);
      console.error("Query variables:", { tournamentId: tournamentId.toString() });
    },
    skip: !tournamentId, // Skip the query if we don't have a valid ID
  });

  // Mutation to kick a team
  const [kickTeam, { loading: kickLoading }] = useMutation(KICK_TEAM, {
    onCompleted: (data) => {
      if (data.kickTeam.success) {
        toast.success(data.kickTeam.message);
        // Refetch teams after kicking
        refetch();
      } else {
        toast.error(data.kickTeam.message);
      }
      setConfirmModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to kick team: ${error.message}`);
      console.error("Kick team error:", error);
      setConfirmModalOpen(false);
    },
  });

  const handleKickTeam = (team: Team) => {
    setTeamToKick(team);
    setConfirmModalOpen(true);
  };

  const confirmKickTeam = () => {
    if (teamToKick) {
      // Ensure teamId is a string for the GraphQL mutation
      const teamId = teamToKick.teamId.toString();

      console.log("Kicking team with ID:", teamId, "from tournament ID:", tournamentId);

      kickTeam({
        variables: {
          teamId,
          tournamentId: tournamentId.toString(),
        },
      });
    }
  };

  if (!numericTournamentId) {
    return <Text c="red">Invalid tournament ID</Text>;
  }

  if (loading) {
    return <Text>Loading teams...</Text>;
  }

  if (error) {
    return (
      <Stack gap="md">
        <Text c="red">Error loading teams: {error.message}</Text>
        <Text size="sm">Please try refreshing the page or contact support.</Text>
        <Text size="xs" c="dimmed">
          Tournament ID: {tournamentId}
        </Text>
      </Stack>
    );
  }

  // Extract teams from the response - teamsByTournamentId returns an array directly
  const teams = data?.teamsByTournamentId || [];

  return (
    <>
      <Stack gap="md">
        <Title order={3}>Manage Teams</Title>
        <Text size="sm" c="dimmed">
          As the tournament creator, you can remove teams from your tournament. This will remove the
          team and their matches from the tournament, but the players will still be part of the
          tournament.
        </Text>

        {teams.length === 0 ? (
          <Text>No teams found in this tournament.</Text>
        ) : (
          teams.map((team: Team) => (
            <Group
              key={team.teamId}
              justify="space-between"
              p="md"
              style={{ border: "1px solid #eee", borderRadius: "8px" }}
            >
              <div>
                <Text fw={600}>{team.name}</Text>
                <Text size="sm" c="dimmed">
                  {team.participantSet.edges.length} members
                </Text>
                {team.description && (
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {team.description}
                  </Text>
                )}
              </div>
              <Button
                variant="outline"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => handleKickTeam(team)}
              >
                Kick Team
              </Button>
            </Group>
          ))
        )}
      </Stack>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Team Removal"
        centered
      >
        <Text mb="md">
          Are you sure you want to remove <strong>{teamToKick?.name}</strong> from this tournament?
          This action cannot be undone.
        </Text>
        <Text mb="xl" size="sm" c="dimmed">
          Team members will remain as participants in the tournament but will no longer be part of
          this team, and the team's matches will be removed.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setConfirmModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" loading={kickLoading} onClick={confirmKickTeam}>
            Yes, Remove Team
          </Button>
        </Group>
      </Modal>
    </>
  );
}
