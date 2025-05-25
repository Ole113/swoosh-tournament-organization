import { useParams } from "react-router-dom";
import { TournamentSchedule } from "@/components/TournamentSchedule/TournamentSchedule";

export function TournamentSchedulePage() {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  return <TournamentSchedule id={tournamentCode} />;
}
