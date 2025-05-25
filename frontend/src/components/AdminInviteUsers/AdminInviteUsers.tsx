import { useState } from "react";
import { IconSend, IconTrash, IconUserPlus } from "@tabler/icons-react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Box,
} from "@mantine/core";
import classes from "../MasterStyles.module.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { GET_TOURNAMENT } from "@/graphql/queries/GetSingleTournament";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import CREATE_TEAM from "@/graphql/mutations/CreateTeam";
import CREATE_PARTICIPANT from "@/graphql/mutations/CreateParticipant";
import { BACKEND_URL } from "@/constants";

export function AdminInviteUsers() {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();
  const [email, setEmail] = useState("");
  const [bulkAdd, setBulk] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [createTeam] = useMutation(CREATE_TEAM);
  const [createParticipant] = useMutation(CREATE_PARTICIPANT);

  const { data } = useQuery(GET_TOURNAMENT, {
    variables: { id: tournamentCode },
    skip: !tournamentCode,
  });

  const handleInvite = () => {
    if (email && !invitedUsers.includes(email)) {
      setInvitedUsers([...invitedUsers, email]);
      setEmail("");
    }
  };

  const removeInvitedUser = (emailToRemove: string) => {
    setInvitedUsers(invitedUsers.filter((e) => e !== emailToRemove));
  };

  const sendInvites = async () => {
    const emailSubject = `Invite to join tournament ${data?.tournament?.name}`;
    const emailContent = `
          <p>Please ensure you have a Swoosh account and follow this link.</p>
          <p>${window.location.origin}/tournament/${tournamentCode}?inviteCode=${data?.tournament?.inviteLink}</p>
        `;

    invitedUsers.forEach(email => {
      sendEmail(email, emailSubject, emailContent);
      toast.info("Sending out invitations.")
    });

    setEmail("");
    setInvitedUsers([]);
  };

  const sendEmail = async (to_email: string, subject: string, content: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/send-email/`,
        {
          to_email: to_email,
          subject: subject,
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
      toast.error("Error sending email.");

    }
  };

  const bulkAddParticipants = async () => {
    if (!bulkAdd) return;

    // Parse names
    const teamNames = bulkAdd
      .split("\n")
      .map(name => name.trim())
      .filter(name => name.length > 0);

    const tournamentId = parseInt(tournamentCode || "", 10);
    const createdByUuid = data?.tournament?.createdBy?.uuid;
    const userId = parseInt(data?.tournament?.createdBy?.userId || "", 10);

    if (!tournamentId || !createdByUuid || !userId) {
      toast.error("Missing required tournament or user information.");
      return;
    }

    for (const name of teamNames) {
      try {
        const { data: teamData } = await createTeam({
          variables: {
            name,
            description: null,
            tournamentId,
            record: "0-0",
            isPrivate: false,
            inviteLink: null,
            password: null,
            createdByUuid,
          },
        });

        const teamId = teamData?.createTeam?.team?.teamId;

        if (!teamId) {
          toast.error(`Failed to create team: ${name}`);
          continue;
        }

        const parsedTeamId = parseInt(teamId, 10);
        
        await createParticipant({
          variables: {
            teamId: parsedTeamId,
            tournamentId: tournamentId,
            userId: userId,
          },
        });

        toast.success(`Added ${name} successfully.`);
      } catch (err) {
        console.error(err);
        toast.error(`Error adding ${name}`);
      }
    }

    setBulk("");
  };

  return (
    <Container size="md" py="xl">
        <Box w="100%" py="xl" style={{ textAlign: "center" }}>
          <Title className={classes.mainTitle}>Invite Users</Title>
        </Box>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Group grow>
            <TextInput
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  color="orange"
                  onClick={handleInvite}
                  disabled={!email}
                >
                  <IconUserPlus size={20} />
                </ActionIcon>
              }
              styles={{
                input: {
                  "&:focus": { borderColor: "var(--mantine-color-orange-6)" },
                },
              }}
            />
          </Group>

          {invitedUsers.length > 0 && (
            <>
              <Divider my="sm" label="Invited Users" labelPosition="center" />
              <ScrollArea h={200}>
                <Stack gap="xs">
                  {invitedUsers.map((invitedEmail) => (
                    <Group key={invitedEmail} justify="space-between">
                      <Badge size="lg" radius="sm" variant="dot" color="orange">
                        {invitedEmail}
                      </Badge>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeInvitedUser(invitedEmail)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              </ScrollArea>
            </>
          )}

          {invitedUsers.length > 0 && (
            <Button
              leftSection={<IconSend size={16} />}
              variant="filled"
              color="orange"
              mt="md"
              radius="md"
              onClick={sendInvites}
            >
              Send Invitations
            </Button>
          )}

          {invitedUsers.length === 0 && (
            <Text c="dimmed" ta="center" mt="md">
              No users invited yet. Add users using the input field above.
            </Text>
          )}
        </Stack>
      </Card>

      <Box w="100%" py="xl" style={{ textAlign: "center" }} mt={100}>
          <Title className={classes.mainTitle}>Bulk Add Teams</Title>
        </Box>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Group grow>
            <Textarea
              autosize
              placeholder="Enter team names seperated by newlines."
              onChange={(e) => setBulk(e.target.value)}
              value={bulkAdd}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  color="orange"
                  onClick={bulkAddParticipants}
                  disabled={!bulkAdd}
                >
                  <IconUserPlus size={20} />
                </ActionIcon>
              }
              styles={{
                input: {
                  "&:focus": { borderColor: "var(--mantine-color-orange-6)" },
                },
              }}
            />
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
