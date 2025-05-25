import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { IconArrowLeft, IconAlertTriangle } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@mantine/core";
import JoinTournamentForm from "@/components/JoinTournamentForm/JoinTournamentForm";
import Loading from "@/components/Loading/Loading";
import GET_TEAMS_BY_TOURNAMENT_ID from "@/graphql/queries/GetTeamsByTournamentId";
import GET_TOURNAMENT_BY_ID from "@/graphql/queries/GetTournamentById";
import getTournamentTeams from "@/graphql/scripts/GetTournamentTeams";
import Tournament from "@/types/Tournament";
import Team from "../../types/Team";
import classes from "./JoinTournament.module.css";

export default function JoinTournamentPage() {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  const {
    data: tournamentData,
    loading: tournamentLoading,
    error,
  } = useQuery(GET_TOURNAMENT_BY_ID, {
    variables: { id: tournamentCode },
  });

  useEffect(() => {
    if (!tournamentLoading && (error || !tournamentData?.tournament)) {
      navigate("/tournament-not-found");
    }
  }, [tournamentLoading, error, tournamentData, navigate]);

  let tournamentInfo: Partial<Tournament> = {};

  if (tournamentData) {
    const tournament = structuredClone(tournamentData.tournament);
    tournament.createdByName = tournament.createdBy.name;
    tournament.createdByPhone = tournament.createdBy.phone;
    tournament.createdByEmail = tournament.createdBy.email;

    tournamentInfo = tournament;
  }

  const { data: teamsData, loading: teamsLoading } = useQuery(GET_TEAMS_BY_TOURNAMENT_ID, {
    variables: { tournamentId: tournamentCode },
  });

  const teams = getTournamentTeams(tournamentCode || "", teamsData);

  let tournamentTeams: Partial<Team>[] = teams;

  // If there's a max team size filter teams out that are full
  if (tournamentInfo.teamSize) {
    tournamentTeams = tournamentTeams.filter((team: any) => {
      return (
        team.participantSet &&
        tournamentInfo.teamSize &&
        team.participantSet.length < tournamentInfo.teamSize
      );
    });
  }

  if (tournamentLoading || teamsLoading) {
    return <Loading />;
  }

  // Type-safe check for tournament limits
  // We consider a tournament to have unlimited teams if maxTeams is not defined,
  // is null, or is a non-positive number
  const maxTeams = tournamentInfo.maxTeams;
  const hasTeamLimit = maxTeams !== undefined && 
                      maxTeams !== null && 
                      typeof maxTeams === 'number' && 
                      maxTeams > 0;
  
  const isTournamentFull = hasTeamLimit && 
                          tournamentTeams.length >= maxTeams;

  return (
    <>
      <button
        className={classes.backButton}
        onClick={() => navigate(`/tournament/${tournamentCode}`)}
        type="button"
      >
        <IconArrowLeft size={30} style={{ verticalAlign: "middle" }} />
        Tournament
      </button>
      <div className={classes.joinTournamentContainer}>
        <Card
          className={classes.joinTournamentCard}
          shadow="sm"
          padding="xl"
          radius="s"
          withBorder
          style={{ borderWidth: "3px", }}
        >
          {isTournamentFull ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                padding: "2rem",
                backgroundColor: "#fff",
                textAlign: "center",
              }}
            >
              <IconAlertTriangle size={50} color="orange" />
              <p
                style={{
                  color: "orange",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  margin: 0,
                }}
              >
                This tournament has reached the maximum number of teams.
              </p>
            </div>
          ) : (
            <JoinTournamentForm tournamentTeams={tournamentTeams} />
          )}
        </Card>
      </div>
    </>
  );
}
