import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import Select from "@/components/Form/Select";
import { GET_ALL_TOURNAMENTS } from "@/graphql/queries/GetAllTournaments";
import { UPDATE_TOURNAMENT } from "../../graphql/mutations/UpdateTournament";
import { GET_TOURNAMENT } from "../../graphql/queries/GetSingleTournament";
import Loading from "../Loading/Loading";
import PrivateForm from "../MakePrivate/PrivateForm";
import classes from "../MasterStyles.module.css";

export function AdminDashboard() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  // Store the tournament ID when the component mounts
  useEffect(() => {
    if (tournamentId) {
      localStorage.setItem("lastEditedTournamentId", tournamentId);
    }
  }, [tournamentId]);

  const {
    data,
    loading: tournamentLoading,
    error,
  } = useQuery(GET_TOURNAMENT, {
    variables: { id: parseInt(tournamentId || "0", 10) },
    skip: !tournamentId,
    fetchPolicy: "network-only",
    onError: (err) => {
      console.error("Error fetching tournament:", err.message);
      toast.error("Failed to load tournament details.");
    },
  });

  const [updateTournament, { loading: updateLoading }] = useMutation(UPDATE_TOURNAMENT, {
    refetchQueries: [
      { query: GET_TOURNAMENT, variables: { id: tournamentId } },
      { query: GET_ALL_TOURNAMENTS }, // Refetch all tournaments to update the list
    ],
    onCompleted: () => {
      toast.success("Tournament updated successfully!");
      navigate(`/tournament/${tournamentId}`);
    },
    onError: (err) => {
      console.error("Error updating tournament:", err.message);
      toast.error("Failed to update tournament.");
    },
  });

  const privateForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      isPrivate: false,
      password: "",
      withPassword: false,
      withInviteLink: true,
      inviteLink: "",
    },
  });

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
    format: string;
    teamSize: number;
    maxTeams: number;
    showEmail: boolean;
    showPhone: boolean;
  }>({
    name: "",
    description: "",
    startDate: null,
    endDate: null,
    format: "",
    teamSize: 0,
    maxTeams: 0,
    showEmail: false,
    showPhone: false,
  });

  useEffect(() => {
    if (data?.tournament) {
      const { tournament } = data;
      setFormData({
        name: tournament.name,
        description: tournament.description,
        startDate: tournament.startDate ? new Date(tournament.startDate) : null,
        endDate: tournament.endDate ? new Date(tournament.endDate) : null,
        format: tournament.format,
        teamSize: tournament.teamSize || 0,
        maxTeams: tournament.maxTeams || 0,
        showEmail: tournament.showEmail || false,
        showPhone: tournament.showPhone || false,
      });

      // Update privateForm values
      privateForm.setValues({
        isPrivate: tournament.isPrivate || false,
        password: tournament.password || "",
        withPassword: Boolean(tournament.password),
        withInviteLink: tournament.withInviteLink ?? true,
        inviteLink: tournament.inviteLink || "",
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const variables = {
      tournamentId: parseInt(tournamentId || "0", 10),
      name: formData.name || null,
      description: formData.description || null,
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.endDate ? formData.endDate.toISOString() : null,
      format: formData.format || null,
      teamSize: formData.teamSize || null,
      maxTeams: formData.maxTeams || null,
      showEmail: formData.showEmail ?? false,
      showPhone: formData.showPhone ?? false,
      ...(privateForm.getValues().withInviteLink ? { inviteLink: uuidv4() } : {}),
      private: privateForm.getValues().isPrivate,
      password: privateForm.getValues().password,
    };

    console.log("Payload being sent to server:", variables);

    updateTournament({
      variables,
    });

    console.log("GraphQL variables:", {
      tournamentId,
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    });
  };

  if (tournamentLoading || updateLoading) {
    return <Loading />;
  }

  if (error) {
    return <p>Error loading tournament: {error.message}</p>;
  }
  return (
    <Box w="100%" py="xl">
      <form style={{ width: "100%" }} onSubmit={handleSubmit}>
        <Box w="100%" py="xl" style={{ textAlign: "center" }}>
          <Title className={classes.mainTitle}>Edit Tournament</Title>
        </Box>
        <Card shadow="lg" p="xl" radius="md" withBorder w="100%" maw={800} mx="auto">
          <Stack gap="md">
            <TextInput
              label="Tournament Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              withAsterisk
              styles={{
                label: { fontWeight: 500 },
                input: { "&:focus": { borderColor: "var(--mantine-color-orange-6)" } },
              }}
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              minRows={3}
              styles={{
                label: { fontWeight: 500 },
                input: { "&:focus": { borderColor: "var(--mantine-color-orange-6)" } },
              }}
            />

            <Group grow>
              <DateTimePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
                valueFormat="MM/DD/YYYY hh:mm A"
                styles={{
                  label: { fontWeight: 500 },
                  input: { "&:focus": { borderColor: "var(--mantine-color-orange-6)" } },
                }}
              />
              <DateTimePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
                valueFormat="MM/DD/YYYY hh:mm A"
                styles={{
                  label: { fontWeight: 500 },
                  input: { "&:focus": { borderColor: "var(--mantine-color-orange-6)" } },
                }}
              />
            </Group>

            <Select
              label="Tournament Format"
              placeholder="Select format"
              withAsterisk
              value={formData.format}
              onChange={(value) => setFormData({ ...formData, format: value })}
            />

            <Group grow>
              <NumberInput
                label="Max Teams"
                value={formData.maxTeams}
                onChange={(value) =>
                  setFormData({ ...formData, maxTeams: typeof value === "number" ? value : 0 })
                }
                styles={{
                  label: { fontWeight: 500 },
                  input: { "&:focus": { borderColor: "var(--mantine-color-orange-6)" } },
                }}
              />
              <NumberInput
                label="Team Size"
                value={formData.teamSize}
                onChange={(value) =>
                  setFormData({ ...formData, teamSize: typeof value === "number" ? value : 0 })
                }
                styles={{
                  label: { fontWeight: 500 },
                  input: { "&:focus": { borderColor: "var(--mantine-color-orange-6)" } },
                }}
              />
            </Group>

            <Divider my="xs" />

            <Group>
              <Switch
                label="Show Email"
                checked={formData.showEmail}
                onChange={(e) => setFormData({ ...formData, showEmail: e.currentTarget.checked })}
              />
              <Switch
                label="Show Phone"
                checked={formData.showPhone}
                onChange={(e) => setFormData({ ...formData, showPhone: e.currentTarget.checked })}
              />
            </Group>

            <Divider my="xs" />

            <PrivateForm mainForm={privateForm} formType="tournament" />

            <Group justify="center" mt="xl">
              <Button
                variant="filled"
                color="orange"
                onClick={() => navigate(`/tournament/${tournamentId}`)}
                size="md"
                radius="md"
              >
                View Tournament
              </Button>
              <Button
                variant="filled"
                color="orange"
                onClick={() => navigate("/my-tournaments")}
                size="md"
                radius="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateLoading}
                variant="filled"
                color="orange"
                size="md"
                radius="md"
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Card>
      </form>
    </Box>
  );
}
