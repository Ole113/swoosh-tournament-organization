import { useParams } from "react-router-dom";
import { TournamentBracket } from "@/components/TournamentBracket/TournamentBracket";

export function TournamentBracketPage() {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  return <TournamentBracket id={tournamentCode} />;
}
