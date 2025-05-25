import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Alert, Button, Container, PasswordInput, Stack, TextInput, Title, Text, Anchor } from "@mantine/core";
import { LOGIN_MUTATION } from "@/graphql/mutations/LoginUser";
import { GET_USER_BY_EMAIL } from "@/graphql/queries/GetUserByEmail";

export function UserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [login] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      const token = data?.tokenAuth?.token;
      if (token) {
        const { data: userData } = await fetchUserData({ email });

        if (userData?.allUsers?.edges.length > 0) {
          const userDataNode = userData.allUsers.edges[0].node;

          localStorage.setItem(
            "user",
            JSON.stringify({
              token,
              name: userDataNode.name,
              email: userDataNode.email,
              phone: userDataNode.phone,
              uuid: userDataNode.uuid,
              authenticatedTournaments: [],
            })
          );
          toast.success("Log in successful!");
          navigate(`/my-tournaments`);
        } else {
          setError("User data could not be retrieved");
        }
      } else {
        setError("Login response is incomplete");
      }
    },
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
  });

  const { refetch: fetchUserData } = useQuery(GET_USER_BY_EMAIL, {
    variables: { email },
    skip: true, // Skip the initial query execution
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await login({ variables: { email, password } });
    } catch (err) {
      setError("An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <Container
      style={{
        maxWidth: "450px",
        padding: "2rem",
        marginTop: "10rem",
        marginBottom: "15rem",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <Title
        style={{
          color: "var(--mantine-color-dark-6)",
          fontSize: "2rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        Log In
      </Title>
  
      {error && (
        <Alert title="Error" color="red" style={{ marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </Alert>
      )}
  
      <Stack>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
          radius="md"
          size="lg"
          withAsterisk
          variant="filled"
        />
  
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
          radius="md"
          size="lg"
          withAsterisk
          variant="filled"
        />
      </Stack>
  
      <Button
        onClick={handleLogin}
        color="orange"
        size="md"
        loading={loading}
        radius="md"
        fullWidth
        mt="lg"
        variant="gradient"
        gradient={{ from: "orange", to: "red" }}
      >
        Login
      </Button>

      <Text mt="md">
        Don't have an account?{" "}
        <Anchor style={{ color: 'black', textDecoration: "underline" }}  onClick={() => navigate("/signup")}>
          Sign Up
        </Anchor>
      </Text>
    </Container>
  );
}  
