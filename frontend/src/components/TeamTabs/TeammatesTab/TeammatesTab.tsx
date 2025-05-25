import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { IconUserX } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, ScrollArea, Table, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ConfirmModel from "@/components/ConfirmModel/ConfirmModel";
import DELETE_TEAM_PARTICIPANT from "@/graphql/mutations/DeleteTeamParticipant";
import Participant from "@/types/Participant";
import classes from "./TeammatesTab.module.css";

export default function TeammatesTab({
  teammates,
  matchResults,
  teamCreator,
  matchesGenerated,
}: {
  teammates: Participant[];
  matchResults: any;
  teamCreator: { isCreator: boolean; id: string | undefined };
  matchesGenerated: boolean;
}) {
  const { teamId } = useParams<{ teamId: string }>();
  const [toKickParticipant, setToKickParticipant] = useState<number>();

  const [teammateKicked, { error: kickTeammateError }] = useMutation(DELETE_TEAM_PARTICIPANT, {
    errorPolicy: "all",
  });

  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (kickTeammateError) {
      toast.error("Something went wrong when trying to kick the teammate", {
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
  }, [kickTeammateError]);

  const kickTeammate = async () => {
    const kicked = await teammateKicked({
      variables: {
        participantId: toKickParticipant,
      },
    });

    if (kicked.data.deleteParticipant.success) {
      toast.success("Teammate successfully kicked!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      close();
    }
  };

  const kickClicked = (participantId: number) => {
    setToKickParticipant(participantId);
    open();
  };

  const teammateResults = new Map();
  matchResults.forEach((match: any) => {
    match.matchparticipantSet.edges.forEach((participant: any) => {
      if (participant.node.participantId.teamId.teamId === teamId) {
        const participantId = participant.node.participantId.participantId;
        const currResults = teammateResults.get(participantId) || { wins: 0, losses: 0, ties: 0 };

        if (Number(match.score1) > Number(match.score2)) {
          currResults.wins++;
        } else if (Number(match.score1) < Number(match.score2)) {
          currResults.losses++;
        } else {
          currResults.ties++;
        }

        teammateResults.set(participantId, currResults);
      }
    });
  });

  const teammatesRows = teammates.map((teammate) => {
    const { wins, losses, ties } = teammateResults.get(teammate.participantId) || {
      wins: 0,
      losses: 0,
      ties: 0,
    };

    return (
      <Table.Tr key={teammate.participantId}>
        <Table.Td>
          {teamCreator.isCreator && teammate.userId !== teamCreator.id && matchesGenerated && (
            <Tooltip label="Kick this teammate?" withArrow>
              <Button
                onClick={() => kickClicked(Number(teammate.participantId))}
                className={classes.kickButton}
                variant="transparent"
                size="compact-xs"
              >
                <IconUserX color="red" size={15} />
              </Button>
            </Tooltip>
          )}
        </Table.Td>

        <Table.Td>{teammate.name}</Table.Td>
        <Table.Td>{teammate.email}</Table.Td>
        <Table.Td>{teammate.phone ?? "None"}</Table.Td>
        {matchesGenerated && (
          <Table.Td>
            {wins}-{losses}-{ties}
          </Table.Td>
        )}
      </Table.Tr>
    );
  });

  return (
    <div className={classes.teammatesTable}>
      <ScrollArea>
        <Table striped highlightOnHover horizontalSpacing="xl" verticalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Phone</Table.Th>
              {matchesGenerated && <Table.Th>Record</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{teammatesRows}</Table.Tbody>
        </Table>
      </ScrollArea>
      {opened && (
        <div>
          <ConfirmModel
            opened={opened}
            close={close}
            content={
              <div>
                <h1>Are you sure that you want to kick this teammate?</h1>
                <Text fz="md" opacity={0.6}>
                  If your team is private they won't be able to rejoin unless they have the
                  appropriate invite link or password. If your team is public they can rejoin at
                  anytime.
                </Text>
              </div>
            }
            successfulModelAction={kickTeammate}
            buttonLabels={["Kick", "Go Back"]}
          />
        </div>
      )}
    </div>
  );
}
