import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Divider, Stack, Title, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import SelectWithDescription from "@/components/SelectWithDescription/SelectWithDescription";
import Team from "@/types/Team";
import JoinModel from "../JoinModel/JoinModel";
import classes from "./CreateOrJoinTeam.module.css";

export default function CreateOrJoinTeam({
  setCurrentComponent,
  tournamentTeams,
}: {
  setCurrentComponent: (value: string) => void;
  tournamentTeams: Partial<Team>[];
}) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [searchParams] = useSearchParams();
  const teamUUID = searchParams.get("inviteCode");

  const loggedInUserUUID = JSON.parse(localStorage.getItem("user") || "{}").uuid;
  const userInTournament = !!tournamentTeams.find((team) =>
    team.participantSet?.some((participant) => participant.uuid === loggedInUserUUID)
  );

  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [modelType, setModelType] = useState("password");

  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (teamUUID) {
      const invitedTeam = tournamentTeams.find((team) => team.inviteLink === teamUUID);
      if (invitedTeam) {
        setSelectedTeam(invitedTeam as Team);
        setModelType("invite");
        open();
      } else {
        setModelType("invalid");
        open();
      }
    }
  }, [teamUUID, tournamentTeams, open]);

  const joinTeamClicked = () => {
    if (selectedTeam?.isPrivate) {
      setModelType("password");
      open();
    } else if (userInTournament) {
      toast.error("You cannot join a tournament twice", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      setCurrentComponent(`Join-${selectedTeam?.teamId}`);
    }
  };

  /**
   * Callback function that is passed into the model that fires when the user gets the password correct
   * or if they are invited to a team and click the join button
   */
  const successfulModelAction = () => {
    if (!loggedInUserUUID) {
      toast.error("You need to be logged in to join a team", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else if (userInTournament) {
      toast.error("You cannot join a tournament twice", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      setCurrentComponent(`Join-${selectedTeam?.teamId}`);
    }
  };

  return (
    <>
      <Title
        order={1}
        className={classes.mainTitle}
        ta="center"
        fz={isMobile ? "h2" : "h1"}
        mb="lg"
      >
        Create or Join a Team
      </Title>
      <Divider my="md" />
      <Stack gap="xs">
        <Title order={4} fz={isMobile ? "h5" : "h4"}>
          Create a team
        </Title>
        <Button color="orange" onClick={() => setCurrentComponent("CreateTeam")} fullWidth>
          Create
        </Button>
      </Stack>
      <Divider my="md" />
      <Stack gap="xs">
        <Title order={4} fz={isMobile ? "h5" : "h4"}>
          Or Join an Existing Team
        </Title>
        <SelectWithDescription
          setSelectedTeam={setSelectedTeam}
          tournamentTeams={tournamentTeams}
        />
        <Button color="orange" onClick={joinTeamClicked} disabled={!selectedTeam} fullWidth>
          Join
        </Button>
      </Stack>
      {opened && (
        <div>
          <JoinModel
            eventType="team"
            name={selectedTeam?.name || ""}
            modelType={modelType}
            opened={opened}
            backClicked={() => close()}
            successfulModelAction={successfulModelAction}
            password={selectedTeam?.password || ""}
            buttonLabels={["Join", "Go Back"]}
          />
        </div>
      )}
    </>
  );
}
