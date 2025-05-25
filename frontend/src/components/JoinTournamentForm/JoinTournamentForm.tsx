import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { JOIN_TEAM } from "@/graphql/mutations/JoinTeam";
import GET_USER_BY_UUID from "@/graphql/queries/GetUserByUUID";
import Team from "../../types/Team";
import CreateOrJoinTeam from "../CreateOrJoinTeam/CreateOrJoinTeam";
import CreateTeam from "../CreateTeamForm/CreateTeam";
import classes from "./JoinTournamentForm.module.css";

export default function JoinTournamentForm({
  tournamentTeams,
}: {
  tournamentTeams: Partial<Team>[];
}) {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();
  const navigate = useNavigate();
  const [currentComponent, setCurrentComponent] = useState<string>("CreateOrJoinTeam");
  const [createParticipant, { error }] = useMutation(JOIN_TEAM, {
    errorPolicy: "all",
  });

  useEffect(() => {
    if (error) {
      toast.error("Something went wrong trying to join the team", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      console.error("Error joining team:", error.message);
    }
  }, [error]);

  const loggedInUserUUID = JSON.parse(localStorage.getItem("user") || "{}");
  const { data: userData } = useQuery(GET_USER_BY_UUID, {
    variables: { uuid: loggedInUserUUID.uuid },
  });

  useEffect(() => {
    if (currentComponent.startsWith("Join")) {
      if (!loggedInUserUUID.uuid) {
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

        setCurrentComponent("CreateOrJoinTeam");

        return;
      }

      const teamId = currentComponent.split("-")[1];

      try {
        createParticipant({
          variables: {
            teamId: parseInt(teamId, 10),
            tournamentId: parseInt(tournamentCode ?? "", 10),
            userId: Number(userData.allUsers.edges[0].node.userId),
          },
        });

        toast.success("Successfully joined team!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        navigate(`/tournament/${tournamentCode}/team/${teamId}`);
      } catch (e) {
        console.error("Error creating tournament:", e);
      }
    }
  }, [currentComponent]);

  const userInTournament = !!tournamentTeams.find((team) =>
    team.participantSet?.some((participant) => participant.uuid === loggedInUserUUID.uuid)
  );

  const renderCurrentComponent = () => {
    if (currentComponent === "CreateOrJoinTeam") {
      return (
        <CreateOrJoinTeam
          tournamentTeams={tournamentTeams}
          setCurrentComponent={setCurrentComponent}
        />
      );
    } else if (currentComponent === "CreateTeam") {
      return (
        <CreateTeam userInTournament={userInTournament} setCurrentComponent={setCurrentComponent} />
      );
    }
  };

  return <div className={classes.joinTournamentForm}>{renderCurrentComponent()}</div>;
}
