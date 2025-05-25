import { IconVs, IconWashDryFlat } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { Group, Table, Text, Tooltip } from "@mantine/core";
import { formatISODate } from "@/utils";
import classes from "./ResultsTab.module.css";

export default function ResultsTab({
  matchResults,
  teamName,
}: {
  matchResults: any;
  teamName: string;
}) {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  const matchesRows = matchResults.map((match: any) => {
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
            <Text fz="xs" opacity={0.6}>
              {teammates.map((teammate: any, index: number) =>
                index > 0 ? `${teammate.name}, ` : teammate.name
              )}
            </Text>
          </div>
        </Group>
      )
    );

    // Puts the vs icon in between the two teams in the array
    participantsFormatted.splice(
      1,
      0,
      <div key="vs-icon" className={classes.vsIcon}>
        <IconVs size={20} />
      </div>
    );

    const getResultIcon = () => {
      const matchScores = [Number(match.score1), Number(match.score2)];

      // If the users team is the second team in participants then score1 is not their score so reverse the scores array
      if (!participantsFormatted[0].key?.includes(teamName)) {
        matchScores.reverse();
      }

      if (matchScores[0] > matchScores[1]) {
        return (
          <Tooltip label="Win" withArrow>
            <span className={classes.resultIcon}>✅</span>
          </Tooltip>
        );
      } else if (matchScores[0] === matchScores[1]) {
        return (
          <Tooltip label="Tie" withArrow>
            <span className={classes.resultIcon}>
              <IconWashDryFlat stroke={2} color="orange" size={16} />
            </span>
          </Tooltip>
        );
      }

      return (
        <Tooltip label="Loss" withArrow>
          <span className={classes.resultIcon}>❌</span>
        </Tooltip>
      );
    };

    return (
      <Table.Tr key={match.matchId}>
        <Table.Td>{getResultIcon()}</Table.Td>
        <Table.Td>{formatISODate(match.startDate)}</Table.Td>
        <Table.Td>
          <div className={classes.participantsContainer}>{participantsFormatted}</div>
        </Table.Td>
        <Table.Td>{match.round}</Table.Td>
        <Table.Td>{match.court}</Table.Td>
        <Table.Td>
          {match.score1} - {match.score2}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div className={classes.scheduleTable}>
      <Table striped highlightOnHover horizontalSpacing="xl" verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Date</Table.Th>
            <Table.Th>Participants</Table.Th>
            <Table.Th>Round</Table.Th>
            <Table.Th>Location</Table.Th>
            <Table.Th>Score</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {matchesRows !== undefined && matchesRows.length > 0 && matchesRows}
        </Table.Tbody>
      </Table>
      {matchesRows === undefined ||
        (matchesRows.length === 0 && (
          <Text className={classes.noMatches} fz="xl" opacity={0.6}>
            No match results found
          </Text>
        ))}
    </div>
  );
}
