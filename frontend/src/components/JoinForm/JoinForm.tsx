import { useState } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  Anchor,
  Button,
  Center,
  Group,
  Image,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Logo from "../Logo/Logo";

export function JoinForm() {
  const navigate = useNavigate();
  const [tournamentId, setTournamentId] = useState("");

  return (
    <>
      <Center style={{ height: "100vh" }} bg="var(--mantine-color-orange-1)">
        <Paper shadow="xl" p={50}>
          <Stack gap={0}>
            <Logo color="black" />
            <Text c="dimmed" ta="left" size="sm" mt={20}>
              Enter your tournament ID
            </Text>
            <Group>
              <TextInput
                autoFocus
                size="xl"
                variant="unstyled"
                label=""
                placeholder=""
                onChange={(event) => setTournamentId(event.currentTarget.value)}
              />
              <Anchor onClick={() => navigate(`/tournament/${tournamentId}`)} underline="never" role="link">
                <IconArrowRight color="black" />
              </Anchor>
            </Group>
          </Stack>
        </Paper>
      </Center>
    </>
  );
}
