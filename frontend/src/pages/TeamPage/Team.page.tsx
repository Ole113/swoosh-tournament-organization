import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ConfirmModel from "@/components/ConfirmModel/ConfirmModel";
import Loading from "@/components/Loading/Loading";
import NotFound from "@/components/NotFound/NotFound";
import TeamDescription from "@/components/TeamDescription/TeamDescription";
import TeamTabs from "@/components/TeamTabs/TeamTabs";
import GET_TEAMS_BY_TOURNAMENT_ID from "@/graphql/queries/GetTeamsByTournamentId";
import GET_TOURNAMENT_BY_ID from "@/graphql/queries/GetTournamentById";
import getTournamentTeams from "@/graphql/scripts/GetTournamentTeams";
import Tournament from "@/types/Tournament";
import Team from "../../types/Team";
import classes from "./Team.page.module.css";

export default function TeamPage() {
  const navigate = useNavigate();
  const { tournamentCode, teamId } = useParams<{ tournamentCode: string; teamId: string }>();
  const [opened, { open, close }] = useDisclosure(false);

  const [tournamentInfo, setTournamentInfo] = useState<Partial<Tournament>>();
  const [teamInfo, setTeamInfo] = useState<Partial<Team> | null>(null);
  const [invalidTeamCode, setInvalidTeamCode] = useState<boolean>(false);
  const [notAuthenticated, setNotAuthenticated] = useState<boolean>(false);

  const {
    data: tournamentData,
    loading: tournamentLoading,
    refetch: refetchTournament,
  } = useQuery(GET_TOURNAMENT_BY_ID, {
    variables: { id: tournamentCode },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (teamId) {
      refetchTournament();
    }
  }, [teamId, refetchTournament]);

  useEffect(() => {
    if (tournamentData) {
      const tournament = structuredClone(tournamentData.tournament);
      tournament.createdByName = tournament.createdBy.name;
      tournament.createdByPhone = tournament.createdBy.phone;
      tournament.createdByEmail = tournament.createdBy.email;

      setTournamentInfo(tournament);
    }
  }, [tournamentData, tournamentLoading]);

  const {
    loading: teamsLoading,
    data: teamsData,
    refetch: refetchTeams,
  } = useQuery(GET_TEAMS_BY_TOURNAMENT_ID, {
    variables: { tournamentId: tournamentCode },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    refetchTeams();
  }, [tournamentCode, refetchTeams]);

  const teams = getTournamentTeams(tournamentCode || "", teamsData);

  useEffect(() => {
    if (teams) {
      const selectedTeam = teams.find((team: any) => team.teamId === teamId) || null;
      if (!teamsLoading && selectedTeam === null) {
        setInvalidTeamCode(true);
      } else {
        setTeamInfo(selectedTeam);
      }
    }
  }, [teamsData, teamsLoading, teamId]);

  const loggedInUserUUID = JSON.parse(localStorage.getItem("user") || "{}").uuid;
  const teamCreator = {
    id: teamInfo?.createdBy?.userId,
    isCreator: loggedInUserUUID === teamInfo?.createdBy?.uuid,
  };

  if (teamsLoading || tournamentLoading) {
    return <Loading />;
  }

  return (
    <>
      {invalidTeamCode ? (
        <NotFound type="Team" />
      ) : notAuthenticated ? (
        <ConfirmModel
          opened={opened}
          close={close}
          content={
            <div>
              <h1>Unable to view team</h1>
              <Text fz="md" opacity={0.6}>
                You need to join this tournament before you can view teams in it.
              </Text>
            </div>
          }
          successfulModelAction={() => navigate(`/tournament/${tournamentCode}`)}
          backClicked={() => navigate("/")}
          buttonLabels={["Join Now", "Back"]}
        />
      ) : (
        <>
          <button
            className={classes.backButton}
            onClick={() => navigate(`/tournament/${tournamentCode}`)}
            type="button"
          >
            <IconArrowLeft size={30} style={{ verticalAlign: "middle" }} />
            Tournament
          </button>
          <div className={classes.teamPage}>
            <div className={classes.teamPageContainer}>
              <TeamDescription tournamentInfo={tournamentInfo || {}} teamInfo={teamInfo || {}} />
              <TeamTabs teamCreator={teamCreator} teamInfo={teamInfo || {}} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
