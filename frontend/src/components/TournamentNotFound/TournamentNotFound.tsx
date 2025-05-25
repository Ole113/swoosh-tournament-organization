import { useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";

export function TournamentNotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "20rem" }}>
      <h1>404 - Tournament Not Found</h1>
      <h2>The tournament you are looking for does not exist.</h2>
      <Button 
        onClick={() => navigate("/my-tournaments")} 
        variant="outline" 
        size="lg" 
        style={{ marginTop: "20px", color:"white", backgroundColor:"orange", }}>
            Back to Tournaments
      </Button>
    </div>
  );
}
