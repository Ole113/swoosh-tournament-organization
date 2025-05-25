import { useNavigate } from "react-router-dom";
import { Button, Text } from "@mantine/core";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "20rem" }}>
      <h1>Oops - Something went wrong</h1>
      <Text fz="lg" opacity={0.6}>
        An error occurred internally. Try refreshing this page or trying it later.
      </Text>
      <Button
        onClick={() => navigate("/my-tournaments")}
        variant="filled"
        color="orange"
        size="lg"
        style={{ marginTop: "20px" }}
      >
        Back to Tournaments
      </Button>
    </div>
  );
}
