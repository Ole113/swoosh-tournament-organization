import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { IconEdit, IconVs } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  Group,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { UPDATE_MATCH } from "@/graphql/mutations/UpdateMatch";
import { formatISODate } from "@/utils";
import masterClasses from "../MasterStyles.module.css";
import classes from "./EditMatches.module.css";

export default function EditMatches({ matchResults }: { matchResults: any }) {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [updateMatch, { error: updateMatchError }] = useMutation(UPDATE_MATCH, {
    errorPolicy: "all",
  });

  localStorage.setItem("lastEditedTournamentId", tournamentCode || "");

  const [matches, setMatches] = useState<any[]>(matchResults || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    setMatches(matchResults);
  }, [matchResults]);

  const handleEditClick = (matchIndex: number) => {
    setEditingIndex(matchIndex);
    setEditedValues((prev) => ({
      ...prev,
      [matchIndex]: matches[matchIndex],
    }));
  };

  const handleChange = (matchIndex: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [matchIndex]: {
        ...prev[matchIndex],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      const updatedMatches = [...matches];
      updatedMatches[editingIndex] = editedValues[editingIndex];
      setMatches(updatedMatches);
      setEditingIndex(null);

      await updateMatch({
        variables: {
          matchId: editedValues[editingIndex].matchId,
          score1: editedValues[editingIndex].score1,
          score2: editedValues[editingIndex].score2,
          seed: String(editedValues[editingIndex].seed),
          startDate: editedValues[editingIndex].startDate,
          court: editedValues[editingIndex].court,
        },
      });

      toast.success("Match successfully updated!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  useEffect(() => {
    if (updateMatchError) {
      toast.error("Something went wrong with updating the match", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [updateMatchError]);

  return (
    <Box w="100%" py="xl">
      <Box w="100%" py="xl" style={{ textAlign: "center" }}>
        <Title className={masterClasses.mainTitle}>Edit Matches</Title>
      </Box>

      <Card shadow="lg" p={isMobile ? "sm" : "xl"} radius="md" withBorder w="100%">
        <ScrollArea>
          <Table
            striped
            highlightOnHover
            horizontalSpacing={isMobile ? 0 : "xl"}
            verticalSpacing={isMobile ? "xs" : "md"}
            fz={isMobile ? "xs" : "sm"}
            style={{ tableLayout: "fixed" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  style={{
                    width: isMobile ? "20px" : "50px",
                    whiteSpace: "nowrap",
                    padding: isMobile ? "4px" : undefined,
                    fontSize: isMobile ? "11px" : undefined,
                  }}
                />
                <Table.Th
                  style={{
                    minWidth: isMobile ? "70px" : "120px",
                    whiteSpace: "nowrap",
                    padding: isMobile ? "4px" : undefined,
                    fontSize: isMobile ? "11px" : undefined,
                  }}
                >
                  Start Date
                </Table.Th>
                <Table.Th
                  style={{
                    minWidth: isMobile ? "100px" : "200px",
                    whiteSpace: "nowrap",
                    padding: isMobile ? "4px" : undefined,
                    fontSize: isMobile ? "11px" : undefined,
                  }}
                >
                  Participants
                </Table.Th>
                <Table.Th
                  style={{
                    width: isMobile ? "30px" : "60px",
                    whiteSpace: "nowrap",
                    padding: isMobile ? "4px" : undefined,
                    fontSize: isMobile ? "11px" : undefined,
                  }}
                >
                  Round
                </Table.Th>
                <Table.Th
                  style={{
                    minWidth: isMobile ? "60px" : "100px",
                    whiteSpace: "nowrap",
                    padding: isMobile ? "4px" : undefined,
                    fontSize: isMobile ? "11px" : undefined,
                  }}
                >
                  Location
                </Table.Th>
                <Table.Th
                  style={{
                    minWidth: isMobile ? "40px" : "70px",
                    whiteSpace: "nowrap",
                    padding: isMobile ? "4px" : undefined,
                    fontSize: isMobile ? "11px" : undefined,
                  }}
                >
                  Score
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {matches.map((match, matchIndex) => {
                const matchParticipants = new Map();
                match.matchparticipantSet.edges.forEach((participant: any) => {
                  const teamName = participant.node.participantId.teamId.name;
                  const participantInfo = {
                    name: participant.node.participantId.userId.name,
                    teamId: participant.node.participantId.teamId.teamId,
                  };

                  const currTeammates = matchParticipants.get(teamName) || [];
                  matchParticipants.set(teamName, [...currTeammates, participantInfo]);
                });

                const participantNodes = Array.from(matchParticipants.entries()).map(
                  ([teamName, teammates], index) => (
                    <React.Fragment key={`team-${teamName}-${index}`}>
                      {index > 0 && !isMobile && (
                        <div className={classes.vsIcon} style={{ alignSelf: "center" }}>
                          <IconVs size={20} />
                        </div>
                      )}
                      <Group wrap="nowrap" gap={isMobile ? 2 : "xs"}>
                        <div className={classes.vsTeams}>
                          <Text
                            fz={isMobile ? "xs" : "sm"}
                            onClick={() =>
                              navigate(`/tournament/${tournamentCode}/team/${teammates[0].teamId}`)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {teamName}
                          </Text>
                          <Text fz="xs" opacity={0.6}>
                            {teammates.map((teammate: any, idx: number) =>
                              idx > 0 ? `, ${teammate.name}` : teammate.name
                            )}
                          </Text>
                        </div>
                      </Group>
                    </React.Fragment>
                  )
                );

                return (
                  <Table.Tr key={match.matchId}>
                    <Table.Td>
                      {editingIndex === matchIndex ? (
                        <Button
                          className={classes.editIcon}
                          size="xs"
                          onClick={handleSave}
                          color="green"
                        >
                          Save
                        </Button>
                      ) : (
                        <Tooltip label="Edit Match?" withArrow>
                          <IconEdit
                            className={classes.editIcon}
                            size={20}
                            color="orange"
                            onClick={() => handleEditClick(matchIndex)}
                          />
                        </Tooltip>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {editingIndex === matchIndex ? (
                        <DateTimePicker
                          value={
                            editedValues[matchIndex]?.startDate
                              ? new Date(editedValues[matchIndex]?.startDate)
                              : null
                          }
                          onChange={(date) =>
                            handleChange(matchIndex, "startDate", date ? date.toISOString() : "")
                          }
                          placeholder="Pick a date & time"
                          valueFormat="MM/DD/YYYY"
                          size={isMobile ? "xs" : "sm"}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        formatISODate(match.startDate)
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={isMobile ? 2 : "xs"} className={classes.participantsContainer}>
                        {participantNodes}
                      </Stack>
                    </Table.Td>
                    <Table.Td>{match.round}</Table.Td>
                    <Table.Td>
                      {editingIndex === matchIndex ? (
                        <TextInput
                          size={isMobile ? "xs" : "sm"}
                          value={editedValues[matchIndex]?.court || ""}
                          onChange={(e) => handleChange(matchIndex, "court", e.target.value)}
                        />
                      ) : (
                        match.court
                      )}
                    </Table.Td>
                    <Table.Td>
                      {editingIndex === matchIndex ? (
                        <Stack gap={2} align="center">
                          <TextInput
                            value={editedValues[matchIndex]?.score1 || ""}
                            onChange={(e) => handleChange(matchIndex, "score1", e.target.value)}
                            size="xs"
                            style={{ width: "100%" }}
                          />
                          <TextInput
                            value={editedValues[matchIndex]?.score2 || ""}
                            onChange={(e) => handleChange(matchIndex, "score2", e.target.value)}
                            size="xs"
                            style={{ width: "100%" }}
                          />
                        </Stack>
                      ) : (
                        `${match.score1} - ${match.score2}`
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {matchResults.length === 0 && (
          <Text className={classes.noMatches} fz="lg" opacity={0.6}>
            No matches found to edit. You likely need to generate the matches on the tournament
            dashboard.
          </Text>
        )}
      </Card>
    </Box>
  );
}
