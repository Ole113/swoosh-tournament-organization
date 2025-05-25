import { useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { Button, Divider, Stack, Textarea, TextInput, Title, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import CREATE_PARTICIPANT from "@/graphql/mutations/CreateParticipant";
import GET_USER_BY_UUID from "@/graphql/queries/GetUserByUUID";
import CREATE_TEAM from "../../graphql/mutations/CreateTeam";
import PrivateForm from "../MakePrivate/PrivateForm";
import classes from "./CreateTeam.module.css";

export default function CreateTeam({
  userInTournament,
  setCurrentComponent,
}: {
  userInTournament: boolean;
  setCurrentComponent: (value: string) => void;
}) {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [createTeam, { error: teamError }] = useMutation(CREATE_TEAM, {
    errorPolicy: "all",
  });

  const [createParticipant, { error: participantError }] = useMutation(CREATE_PARTICIPANT, {
    errorPolicy: "all",
  });

  useEffect(() => {
    if (teamError) {
      toast.error("Something went wrong when creating the team", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      console.log({ teamError, participantError });

      console.error("Error creating team:", teamError.message);
    }
  }, [teamError, participantError]);

  const teamForm = useForm({
    initialValues: {
      name: "",
      description: "",
      isPrivate: false,
      password: "",
      withPassword: false,
      withInviteLink: true,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      password: (value, values) =>
        values.withPassword && value.trim().length === 0 ? "Password is required" : null,
    },
  });

  const loggedInUserUUID = JSON.parse(localStorage.getItem("user") || "{}");
  const { data: userData } = useQuery(GET_USER_BY_UUID, {
    variables: { uuid: loggedInUserUUID.uuid },
  });

  const formSubmitted = async (teamInfo: typeof teamForm.values) => {
    if (!loggedInUserUUID.uuid) {
      toast.error("You need to be logged in to create a team", {
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
    } else if (userInTournament) {
      toast.error("You are already part of a team in this tournament", {
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

    try {
      const newTeam = await createTeam({
        variables: {
          ...(teamInfo.description !== "" ? { description: teamInfo.description } : {}),
          name: teamInfo.name,
          tournamentId: Number(tournamentCode),
          record: "0-0",
          ...(teamInfo.withInviteLink ? { inviteLink: uuidv4() } : {}),
          isPrivate: teamInfo.isPrivate,
          ...(teamInfo.withPassword ? { password: teamInfo.password } : {}),
          createdByUuid: loggedInUserUUID.uuid,
        },
      });

      await createParticipant({
        variables: {
          teamId: Number(newTeam.data.createTeam.team.teamId),
          tournamentId: Number(newTeam.data.createTeam.team.tournamentId.tournamentId),
          userId: Number(userData.allUsers.edges[0].node.userId),
        },
      });

      toast.success("Team successfully created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      navigate(`/tournament/${tournamentCode}/team/${newTeam.data.createTeam.team.teamId}`);
    } catch (e) {
      console.error("Error creating team:", e);
    }
  };

  return (
    <form onSubmit={teamForm.onSubmit(formSubmitted)} className={classes.form}>
      <Title
        order={1}
        className={classes.gradientTitle}
        ta="center"
        fz={isMobile ? "h2" : "h1"}
        mb="lg"
      >
        Create Your Team
      </Title>
      <Divider my="md" />

      <TextInput
        label="Name"
        className={classes.formElement}
        size="md"
        placeholder="Name"
        withAsterisk
        {...teamForm.getInputProps("name")}
      />

      <Textarea
        label="Description"
        className={classes.formElement}
        size="md"
        placeholder="A short description about your team!"
        {...teamForm.getInputProps("description")}
      />

      <Divider my="md" />

      <PrivateForm formType="team" mainForm={teamForm} />

      <Divider my="xl" />
      <Stack gap="md">
        <Button color="orange" type="submit" fullWidth={isMobile}>
          Create
        </Button>
        <Button
          variant="outline"
          color="orange"
          fullWidth={isMobile}
          onClick={() => setCurrentComponent("CreateOrJoinTeam")}
        >
          Back
        </Button>
      </Stack>
    </form>
  );
}
