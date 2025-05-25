import { useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Group,
  NumberInput,
  rem,
  SimpleGrid,
  Stack,
  Switch,
  Textarea,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import Select from "@/components/Form/Select";
import { CREATE_TOURNAMENT } from "@/graphql/mutations/CreateTournament";
import GET_USER_BY_UUID from "@/graphql/queries/GetUserByUUID";
import PrivateForm from "../MakePrivate/PrivateForm";
import classes from "./CreateTournament.module.css";

export function CreateTournament() {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      tournamentName: "",
      tournamentDescription: "",
      startDate: null as Date | null,
      endDate: null as Date | null,
      format: "",
      showEmail: true,
      showPhone: false,
      maxNumTeams: "" as string | number,
      maxTeamSize: "" as string | number,
      isPrivate: false,
      password: "",
      withPassword: false,
      withInviteLink: true,
      inviteLink: "",
    },
    validate: {
      tournamentName: (value) => (value.trim().length > 0 ? null : "Name is required"),
      startDate: (value) => (value ? null : "Start date is required"),
      endDate: (value, values) =>
        value && values.startDate && value > values.startDate
          ? null
          : "End date must be after start date",
      format: (value) => (value.trim().length > 0 ? null : "Format is required"),
      password: (value, values) =>
        values.isPrivate && values.withPassword && !value ? "Password is required" : null,
    },
  });

  const [createTournament, { loading, error }] = useMutation(CREATE_TOURNAMENT, {
    errorPolicy: "all",
  });

  useEffect(() => {
    if (error) {
      toast.error("Something went wrong when creating the tournament", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error("Error creating tournament:", error.message);
    }
  }, [error]);

  const loggedInUserUUID = JSON.parse(localStorage.getItem("user") || "{}");
  const { data: userData } = useQuery(GET_USER_BY_UUID, {
    variables: { uuid: loggedInUserUUID.uuid },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (!loggedInUserUUID.uuid) {
        toast.error("You need to be logged in to create a tournament", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        return;
      }

      const newTournament = await createTournament({
        variables: {
          createdById: userData.allUsers.edges[0].node.userId,
          name: values.tournamentName,
          ...(values.tournamentDescription !== ""
            ? { description: values.tournamentDescription }
            : {}),
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
          format: values.format,
          ...(values.maxTeamSize !== "" ? { teamSize: values.maxTeamSize } : {}),
          ...(values.maxNumTeams !== "" ? { maxTeams: values.maxNumTeams } : {}),
          showEmail: values.showEmail,
          showPhone: values.showPhone,
          ...(values.withInviteLink ? { inviteLink: uuidv4() } : {}),
          isPrivate: values.isPrivate,
          ...(values.password !== "" ? { password: values.password } : {}),
          password: values.password,
        },
      });

      toast.success("Tournament successfully created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      navigate(`/tournament/${newTournament.data.createTournament.tournament.tournamentId}`);
    } catch (e) {
      console.error("Error creating tournament:", e);
    }
  };

  return (
    <div className={classes.form}>
      <h1 className={classes.mainTitle}>Create a Tournament</h1>
      <p className={classes.description}>
        Fill in the information below to get started. After the tournament has been successfully
        created you will be given a invite link for people to join!
      </p>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} verticalSpacing="xl">
          <div>
            <h1 className={classes.title}>Tournament Details</h1>
            <div className={classes.input}>
              <TextInput
                label="Name"
                placeholder="The tournament's name"
                {...form.getInputProps("tournamentName")}
                withAsterisk
              />

              <Textarea
                label="Description"
                placeholder="A description of what the tournament is for"
                {...form.getInputProps("tournamentDescription")}
              />
              <Group>
                <DateTimePicker
                  {...form.getInputProps("startDate")}
                  label="Start Date"
                  placeholder="mm/dd/yyyy"
                  valueFormat="MM/DD/YYYY"
                  withAsterisk
                />
                <DateTimePicker
                  {...form.getInputProps("endDate")}
                  label="End Date"
                  placeholder="mm/dd/yyyy"
                  valueFormat="MM/DD/YYYY"
                  withAsterisk
                />
              </Group>
            </div>
            <Stack>
              <h1 className={classes.title} style={{ paddingTop: rem(1.5) }}>
                Do you want to display your email/phone on the tournament page?
              </h1>
              <Switch
                checked={form.values.showEmail}
                onChange={(event) => form.setFieldValue("showEmail", event.currentTarget.checked)}
                color="teal"
                size="sm"
                label="Email"
                thumbIcon={
                  form.values.showEmail ? (
                    <IconCheck
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.teal[6]}
                      stroke={3}
                    />
                  ) : (
                    <IconX
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.red[6]}
                      stroke={3}
                    />
                  )
                }
              />
              <Switch
                checked={form.values.showPhone}
                onChange={(event) => form.setFieldValue("showPhone", event.currentTarget.checked)}
                color="teal"
                size="sm"
                label="Phone"
                thumbIcon={
                  form.values.showPhone ? (
                    <IconCheck
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.teal[6]}
                      stroke={3}
                    />
                  ) : (
                    <IconX
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.red[6]}
                      stroke={3}
                    />
                  )
                }
              />
            </Stack>
          </div>
          <div>
            <h1 className={classes.title}>Tournament Settings</h1>
            <div className={classes.input}>
              <Select
                label="Format"
                placeholder="Tournament Format"
                withAsterisk
                value={form.values.format}
                onChange={(value) => form.setFieldValue("format", value)}
                error={typeof form.errors.format === "string" ? form.errors.format : undefined}
              />
              <NumberInput {...form.getInputProps("maxNumTeams")} label="Max Number Of Teams" />
              <NumberInput {...form.getInputProps("maxTeamSize")} label="Max Team Size" />
            </div>
            <PrivateForm formType="tournament" mainForm={form} />
            <Button
              className={classes.submitButton}
              type="submit"
              loading={loading}
              color="orange"
              mt="md"
            >
              Create Tournament
            </Button>
          </div>
        </SimpleGrid>
      </form>
    </div>
  );
}
