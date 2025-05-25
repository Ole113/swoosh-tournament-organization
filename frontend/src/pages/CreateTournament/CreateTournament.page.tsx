import { CreateTournament } from "@/components/CreateTournamentPage/CreateTournament";
import tournamentsImage from "@/images/tournaments.jpeg";
import classes from "./CreateTournament.module.css";

export default function CreateTournamentPage() {
  return (
    <>
      <div
        className={classes.createTournamentContainer}
        style={{
          backgroundImage: `url(${tournamentsImage})`,
          backgroundSize: "cover",
        }}
      >
        <div className={classes.createTournamentContainerItem}>
          <CreateTournament />
        </div>
      </div>
    </>
  );
}
