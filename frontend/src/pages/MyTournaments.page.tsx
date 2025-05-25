import React from "react";
import { MyTournaments } from "@/components/MyTournaments/MyTournaments";

export default function MyTournamentsPage() {
  return (
      <>
        <MyTournaments />
      </>
    );
  // change back to this once userId with login fucntionality is implemented
  // const userId = "VXNlck5vZGU6Mg==";
  // return <MyTournaments userId={userId} />;
}
