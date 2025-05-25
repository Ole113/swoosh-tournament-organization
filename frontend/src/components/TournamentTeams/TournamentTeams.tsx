import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IconShieldLock, IconTrash } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Group, Modal, Popover, ScrollArea, Table, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { KICK_TEAM } from "@/graphql/mutations/KickTeam";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";
import GET_TEAMS_BY_TOURNAMENT_ID from "@/graphql/queries/GetTeamsByTournamentId";
import classes from "./TournamentTeams.module.css";

// Extracted TeamRow component to isolate hooks
function TeamRow({
  team,
  tournamentCode,
  isCreator = false,
  onKickTeam,
  teamRecords,
}: {
  team: any;
  tournamentCode?: string;
  isCreator?: boolean;
  onKickTeam?: (team: any) => void;
  teamRecords: Record<string, { wins: number; losses: number }>;
}) {
  const [opened, { close, open }] = useDisclosure(false);
  const navigate = useNavigate();

  // Get the team's record from the calculated records
  const teamRecord = teamRecords[team.teamId] || { wins: 0, losses: 0 };
  const recordDisplay = `${teamRecord.wins}-${teamRecord.losses}`;

  return (
    <Table.Tr key={team.teamId}>
      <Table.Td>
        <div className={classes.teamNameContainer}>
          {team.isPrivate && (
            <Popover width={200} position="bottom" withArrow shadow="md" opened={opened}>
              <Popover.Target>
                <IconShieldLock
                  onMouseEnter={open}
                  onMouseLeave={close}
                  className={classes.privateIcon}
                  color="red"
                  size={20}
                  stroke={2}
                />
              </Popover.Target>
              <Popover.Dropdown style={{ pointerEvents: "none" }}>
                <Text>This team is private, only members of it can see its details</Text>
              </Popover.Dropdown>
            </Popover>
          )}
          <span
            className={classes.teamName}
            onClick={() => navigate(`/tournament/${tournamentCode}/team/${team.teamId}`)}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}
          >
            {team.name}
          </span>
        </div>
      </Table.Td>

      <>
        <Table.Td>{!team.isPrivate && recordDisplay}</Table.Td>
        <Table.Td>{team.description}</Table.Td>
        <Table.Td>
          {isCreator && (
            <Button
              variant="outline"
              color="red"
              size="sm"
              leftSection={<IconTrash size={16} />}
              onClick={() => onKickTeam && onKickTeam(team)}
            >
              Kick
            </Button>
          )}
        </Table.Td>
      </>
    </Table.Tr>
  );
}

interface TournamentTeamsProps {
  tournamentTeams: any;
  isCreator?: boolean;
  tournamentId?: string;
  onTeamsUpdated?: () => void; // New callback for when teams are updated
}

export default function TournamentTeams({
  tournamentTeams,
  isCreator = false,
  tournamentId,
  onTeamsUpdated,
}: TournamentTeamsProps) {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();
  const [teamToKick, setTeamToKick] = useState<any>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [teamRecords, setTeamRecords] = useState<Record<string, { wins: number; losses: number }>>(
    {}
  );

  // Get tournament ID for queries
  const effectiveTournamentId = tournamentId || tournamentCode;

  // Add refetch for teams list
  const { data: teamsData, refetch: refetchTeams } = useQuery(GET_TEAMS_BY_TOURNAMENT_ID, {
    variables: { tournamentId: effectiveTournamentId },
    skip: !effectiveTournamentId,
    fetchPolicy: "network-only", // Don't use cache
  });

  const { data: matchesData, refetch: refetchMatches } = useQuery(GET_MATCHES_BY_TOURNAMENT, {
    variables: { tournamentId: effectiveTournamentId },
    skip: !effectiveTournamentId,
    fetchPolicy: "network-only", // Don't use cache
  });

  // Create memoized refetch function
  const handleDataRefresh = useCallback(async () => {
    try {
      await Promise.all([refetchTeams(), refetchMatches()]);

      // Call the parent callback if provided
      if (onTeamsUpdated) {
        onTeamsUpdated();
      }
    } catch (error) {
      console.error("Error refreshing teams data:", error);
    }
  }, [refetchTeams, refetchMatches, onTeamsUpdated]);

  // Calculate team records from matches
  useEffect(() => {
    if (matchesData?.allMatchesByTournamentId && tournamentTeams?.teamsByTournamentId) {
      const records: Record<string, { wins: number; losses: number }> = {};

      // Initialize records for all teams
      tournamentTeams.teamsByTournamentId.forEach((team: any) => {
        records[team.teamId] = { wins: 0, losses: 0 };
      });

      // Calculate wins and losses from completed matches
      matchesData.allMatchesByTournamentId.forEach((match: any) => {
        if (match.status === "Completed") {
          const score1 = parseInt(match.score1, 10);
          const score2 = parseInt(match.score2, 10);

          // Get team data from match participants
          if (match.matchparticipantSet?.edges?.length >= 2) {
            const team1Data = match.matchparticipantSet.edges.find(
              (edge: any) => edge.node.teamNumber === 1
            );
            const team2Data = match.matchparticipantSet.edges.find(
              (edge: any) => edge.node.teamNumber === 2
            );

            if (team1Data && team2Data) {
              const team1Id = team1Data.node.participantId.teamId.teamId;
              const team2Id = team2Data.node.participantId.teamId.teamId;

              if (score1 > score2) {
                // Team 1 wins
                if (records[team1Id]) {
                  records[team1Id].wins += 1;
                }
                if (records[team2Id]) {
                  records[team2Id].losses += 1;
                }
              } else if (score2 > score1) {
                // Team 2 wins
                if (records[team1Id]) {
                  records[team1Id].losses += 1;
                }
                if (records[team2Id]) {
                  records[team2Id].wins += 1;
                }
              }
            }
          }
        }
      });

      setTeamRecords(records);
    }
  }, [matchesData, tournamentTeams]);

  // Mutation to kick a team
  const [kickTeam, { loading: kickLoading }] = useMutation(KICK_TEAM, {
    onCompleted: (data) => {
      if (data.kickTeam.success) {
        toast.success(data.kickTeam.message);

        // Instead of page reload, refetch data
        handleDataRefresh();
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

  const handleKickTeam = (team: any) => {
    setTeamToKick(team);
    setConfirmModalOpen(true);
  };

  const confirmKickTeam = () => {
    if (teamToKick) {
      // For ID GraphQL types, we pass the teamId as is - the backend will handle the conversion
      const teamId = teamToKick.teamId;
      // Use tournamentId or fallback to tournamentCode
      const tId = tournamentId || tournamentCode || "";

      console.log("Attempting to kick team:", teamId, "from tournament:", tId);

      kickTeam({
        variables: {
          teamId,
          tournamentId: tId,
        },
      });
    }
  };

  // Use the most up-to-date teams data
  const effectiveTeamsData = teamsData || tournamentTeams;

  if (!effectiveTeamsData) {
    return null; // Return null instead of undefined
  }

  const teams = effectiveTeamsData.teamsByTournamentId.map((team: any) => (
    <TeamRow
      key={team.teamId}
      team={team}
      tournamentCode={tournamentCode}
      isCreator={isCreator}
      onKickTeam={handleKickTeam}
      teamRecords={teamRecords}
    />
  ));

  return (
    <>
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Record</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>{isCreator ? "Actions" : ""}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{teams}</Table.Tbody>
        </Table>
      </ScrollArea>

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
