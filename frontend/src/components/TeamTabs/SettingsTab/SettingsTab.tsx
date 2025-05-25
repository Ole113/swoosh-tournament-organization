import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { Button, Divider, Group, Textarea, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import PrivateForm from "@/components/MakePrivate/PrivateForm";
import { FRONTEND_URL } from "@/constants";
import UPDATE_TEAM from "@/graphql/mutations/UpdateTeam";
import Team from "@/types/Team";
import classes from "./SettingsTab.module.css";

export default function SettingsTab({ teamInfo }: { teamInfo: Partial<Team> }) {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();
  const clipboard = useClipboard({ timeout: 500 });
  const [copyClicked, setCopyClicked] = useState<boolean>(false);
  const [regenerateClicked, setRegenerateClicked] = useState<boolean>(false);
  const [updateTeam, { error: updateTeamError }] = useMutation(UPDATE_TEAM, {
    errorPolicy: "all",
  });

  const updatedTeamForm = useForm({
    initialValues: {
      name: teamInfo.name ? teamInfo.name : "",
      description: teamInfo.description ? teamInfo.description : "",
      isPrivate: teamInfo.isPrivate,
      password: teamInfo.password !== undefined ? teamInfo.password : undefined,
      withPassword: teamInfo.password !== undefined,
      withInviteLink: teamInfo.inviteLink !== undefined,
      inviteLink: teamInfo.inviteLink !== undefined ? teamInfo.inviteLink : uuidv4(),
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      password: (value, values) =>
        values.withPassword && value?.trim().length === 0 ? "Password is required" : null,
    },
  });

  const fullInviteLink = `${FRONTEND_URL}/tournament/${tournamentCode}/join?inviteCode=${updatedTeamForm.getInputProps("inviteLink").value}`;

  useEffect(() => {
    if (updateTeamError) {
      toast.error("Something went wrong with updating the team", {
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
  }, [updateTeamError]);

  useEffect(() => {
    if (copyClicked) {
      setTimeout(setCopyClicked, 1200, false);
      clipboard.copy(fullInviteLink);
    }
  }, [copyClicked]);

  useEffect(() => {
    if (regenerateClicked) {
      setTimeout(setRegenerateClicked, 1200, false);

      updatedTeamForm.setValues({
        inviteLink: uuidv4(),
      });

      updateTeamFields({
        inviteLink: updatedTeamForm.getInputProps("inviteLink").value,
        isPrivate: updatedTeamForm.getInputProps("isPrivate").value,
      });
    }
  }, [regenerateClicked]);

  const updateTeamFields = async (fields: any) => {
    const updatedTeam = await updateTeam({
      variables: {
        teamId: Number(teamInfo.teamId),
        ...fields,
      },
    });

    updatedTeamForm.setValues(updatedTeam.data.updateTeam.team);
  };

  const formSubmitted = async (updatedTeamInfo: typeof updatedTeamForm.values) => {
    const { withPassword, withInviteLink, ...filteredFields } = updatedTeamInfo;

    if (!withPassword) {
      filteredFields.password = "";
    }

    if (!withInviteLink) {
      filteredFields.inviteLink = "";
    }

    updateTeamFields(filteredFields);

    toast.success("Your team has been successfully updated!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <form onSubmit={updatedTeamForm.onSubmit(formSubmitted)} className={classes.settingsTab}>
      <TextInput
        label="Name"
        className={classes.formElement}
        size="md"
        placeholder="Name"
        withAsterisk
        {...updatedTeamForm.getInputProps("name")}
      />

      <Textarea
        label="Description"
        className={classes.formElement}
        size="md"
        placeholder="A short description about your team!"
        {...updatedTeamForm.getInputProps("description")}
      />

      <Divider my="md" />

      <PrivateForm formType="team" mainForm={updatedTeamForm} />

      <Divider my="md" />

      {(updatedTeamForm.getInputProps("withInviteLink").value ||
        !updatedTeamForm.getInputProps("isPrivate").value) && (
        <Group align="flex-end" gap="0" className={classes.inviteLinkGroup}>
          <TextInput
            label="Team Invite Link"
            className={classes.formElement}
            size="md"
            style={{ flex: 1 }}
            readOnly
            value={fullInviteLink}
          />
          <Tooltip label={regenerateClicked ? "Regenerated!" : "Regenerate invite link"} withArrow>
            <button type="button" onClick={() => setRegenerateClicked(true)}>
              {regenerateClicked ? (
                <IconCheck color="black" size={15} />
              ) : (
                <IconRefresh color="black" size={15} />
              )}
            </button>
          </Tooltip>
          <Tooltip label={copyClicked ? "Copied!" : "Copy invite link"} withArrow>
            <button type="button" onClick={() => setCopyClicked(true)}>
              {copyClicked ? (
                <IconCheck color="white" size={15} />
              ) : (
                <IconCopy color="white" size={15} />
              )}
            </button>
          </Tooltip>
        </Group>
      )}

      <Group>
        <Button color="orange" type="submit" className={classes.updateTeamButton}>
          Update
        </Button>
      </Group>
    </form>
  );
}
