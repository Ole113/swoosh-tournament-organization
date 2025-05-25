import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDisclosure } from "@mantine/hooks";
import JoinModel from "@/components/JoinModel/JoinModel";
import Loading from "@/components/Loading/Loading";
import NotFound from "@/components/NotFound/NotFound";
import { TournamentDescription } from "@/components/TournamentDescription/TournamentDescription";
import GET_PARTICIPANTS_BY_TOURNAMENT_ID from "@/graphql/queries/GetParticipantsByTournament";
import GET_TEAMS_BY_TOURNAMENT_ID from "@/graphql/queries/GetTeamsByTournamentId";
import GET_TOURNAMENT_BY_ID from "@/graphql/queries/GetTournamentById";
import Tournament from "@/types/Tournament";

export function TournamentPage() {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  const [searchParams] = useSearchParams();
  const tournamentUUID = searchParams.get("inviteCode");
  const [opened, { open, close }] = useDisclosure(false);

  const [tournamentInfo, setTournamentInfo] = useState<Partial<Tournament>>();
  const [modelType, setModelType] = useState<string>("invalid");
  const [invalidTournamentCode, setInvalidTournamentCode] = useState<boolean>(false);
  const [tournamentMembers, setTournamentMembers] = useState<any>([]);

  const { data: tournamentData, loading: tournamentLoading } = useQuery(GET_TOURNAMENT_BY_ID, {
    variables: { id: tournamentCode },
  });

  const { data: tournamentParticipants, loading: participantsLoading } = useQuery(
    GET_PARTICIPANTS_BY_TOURNAMENT_ID,
    {
      variables: { tournamentId: tournamentCode },
    }
  );

  const { data: tournamentTeams, loading: teamsLoading } = useQuery(GET_TEAMS_BY_TOURNAMENT_ID, {
    variables: { tournamentId: tournamentCode },
  });

  useEffect(() => {
    if (tournamentData) {
      setTournamentInfo(tournamentData.tournament);
    } else if (!tournamentLoading) {
      setInvalidTournamentCode(true);
    }
  }, [tournamentData, tournamentLoading]);

  useEffect(() => {
    if (tournamentParticipants) {
      setTournamentMembers(tournamentParticipants.participantsByTournamentId);
    } else if (!participantsLoading) {
      setInvalidTournamentCode(true);
    }
  });

  useEffect(() => {
    if (tournamentInfo) {
      // Checks if the user tried to join the tournament with an invite link
      if (tournamentUUID && tournamentInfo.inviteLink) {
        if (tournamentUUID === tournamentInfo.inviteLink) {
          setModelType("invite");
        } else {
          setModelType("invalid");
        }
      }
      // Checks if the user try's to join a tournament that is password protected
      else if (tournamentInfo.isPrivate) {
        if (tournamentInfo.password) {
          setModelType("password");
        } else {
          setModelType("inviteOnly");
        }
      }

      if (tournamentInfo.isPrivate || tournamentUUID === tournamentInfo.inviteLink) {
        if (tournamentMembers && !isUserAuthenticated()) {
          open();
        }
      }
    }
  }, [tournamentInfo, tournamentMembers]);

  const isUserAuthenticated = (): boolean => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Case where the logged in user is a participant in the tournament
    const isLoggedInUserAuthenticated =
      tournamentMembers.find(
        (participant: any) => participant.userId.uuid === loggedInUser.uuid
      ) !== undefined;

    // Case where the logged in user created the tournament
    const isTournamentCreator = loggedInUser.uuid === tournamentData.tournament.createdBy.uuid;

    // Case where the user has previously authenticated the tournament and it's in local storage
    const previouslyAuthenticated =
      loggedInUser.authenticatedTournaments !== undefined &&
      loggedInUser.authenticatedTournaments.find(
        (tournamentId: any) => tournamentId === tournamentData.tournament.tournamentId
      ) !== undefined;

    return isLoggedInUserAuthenticated || isTournamentCreator || previouslyAuthenticated;
  };

  /**
   * When the user views a tournament through an invite/correct password this adds that
   * tournament id to the users list of previously authenticated tournaments
   */
  const userAuthenticated = (): void => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (Object.keys(loggedInUser).length === 0) {
      toast.error("You need to be logged in to access tournaments", {
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

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...loggedInUser,
        authenticatedTournaments: [
          ...loggedInUser.authenticatedTournaments,
          tournamentData.tournament.tournamentId,
        ],
      })
    );

    close();
  };

  if (participantsLoading || tournamentLoading || teamsLoading) {
    return <Loading />;
  }

  return (
    <>
      {invalidTournamentCode ? (
        <NotFound type="Tournament" />
      ) : (
        <>
          <TournamentDescription {...tournamentInfo} tournamentTeams={tournamentTeams} />
          <JoinModel
            eventType="tournament"
            name={tournamentInfo?.name || ""}
            modelType={modelType}
            backClicked={() => navigate("/")}
            successfulModelAction={userAuthenticated}
            opened={opened}
            password={tournamentInfo?.password || ""}
            buttonLabels={["View"]}
          />
        </>
      )}
    </>
  );
}
