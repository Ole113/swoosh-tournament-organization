import { IconVs } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { Group, Table, Text } from "@mantine/core";
import { formatISODate } from "@/utils";
import classes from "./ScheduleTab.module.css";

export default function ScheduleTab({ upcomingMatches }: { upcomingMatches: any }) {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  const matchesRows = upcomingMatches.map((match: any) => {
    const matchParticipants = new Map();

    match.matchparticipantSet.edges.forEach((participant: any) => {
      const teamName = participant.node.participantId.teamId.name;

      const participantInfo = {
        name: participant.node.participantId.userId.name,
        teamId: participant.node.participantId.teamId.teamId,
      };

      let currTeammates = matchParticipants.get(teamName);

      if (currTeammates === undefined) {
        currTeammates = [];
      }

      matchParticipants.set(teamName, [...currTeammates, participantInfo]);
    });

    const participantsFormatted = Array.from(matchParticipants.entries()).map(
      ([teamName, teammates], index) => (
        <Group key={`team-${teamName}-${index}`}>
          <div className={classes.vsTeams}>
            <Text
              fz="md"
              onClick={() => navigate(`/tournament/${tournamentCode}/team/${teammates[0].teamId}`)}
            >
              {teamName}
            </Text>
          </div>
        </Group>
      )
    );

    participantsFormatted.splice(
      1,
      0,
      <div key="vs-icon" className={classes.vsIcon}>
        <IconVs size={20} />
      </div>
    );

    return (
      <Table.Tr key={match.matchId}>
        <Table.Td>{formatISODate(match.startDate)}</Table.Td>
        <Table.Td>
          <div className={classes.participantsContainer}>{participantsFormatted}</div>
        </Table.Td>
        <Table.Td>{match.round}</Table.Td>
        <Table.Td>{match.court}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div className={classes.scheduleTable}>
      <Table striped highlightOnHover horizontalSpacing="xl" verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Teams</Table.Th>
            <Table.Th>Round</Table.Th>
            <Table.Th>Location</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {matchesRows !== undefined && matchesRows.length > 0 && matchesRows}
        </Table.Tbody>
      </Table>
      {matchesRows === undefined ||
        (matchesRows.length === 0 && (
          <Text className={classes.noMatches} fz="xl" opacity={0.6}>
            No upcoming matches found
          </Text>
        ))}
    </div>
  );
}
