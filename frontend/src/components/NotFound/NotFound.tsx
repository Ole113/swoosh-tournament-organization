import { useNavigate } from "react-router-dom";
import { Button, Text } from "@mantine/core";

export default function NotFound({ type }: { type: string }) {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "10rem" }}>
      <h1>404 - {type} Not Found</h1>
      <Text fz="lg" opacity={0.6}>
        The {type} you are looking for does not exist.
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
