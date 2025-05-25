import { useParams } from "react-router-dom";
import { TournamentStandings } from "@/components/TournamentStandings/TournamentStandings";

export function TournamentStandingsPage() {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  return <TournamentStandings id={tournamentCode} />;
}
