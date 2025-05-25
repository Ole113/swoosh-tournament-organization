import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { Anchor, Button, Container, PasswordInput, Stack, TextInput, Title, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CREATE_USER } from "@/graphql/mutations/CreateUser";
import { LOGIN_MUTATION } from "@/graphql/mutations/LoginUser";
import { GET_USER_BY_EMAIL } from "@/graphql/queries/GetUserByEmail";
import { GET_All_USERS } from "@/graphql/queries/GetAllUsers";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Define types for the GraphQL response
interface UserNode {
  name: string;
  email: string;
  phone: string;
}

interface UserEdge {
  node: UserNode;
}

interface AllUsersData {
  allUsers: {
    edges: UserEdge[];
  };
}

export function UserRegister() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [createUser] = useMutation(CREATE_USER);
  const [login] = useMutation(LOGIN_MUTATION);
  const { refetch: fetchUserData } = useQuery(GET_USER_BY_EMAIL, { variables: { email: "" }, skip: true });
  const { refetch: getAllUsers } = useQuery<AllUsersData>(GET_All_USERS, { skip: true });

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
    validate: {
      name: (value) => (value.trim() ? null : "Name is required"),
      email: (value) => (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) ? null : "Invalid email"),
      phone: (value) => (/^\d{10}$/.test(value) ? null : "Phone number must contain exactly 10 digits"),
      password: (value) => (value.length >= 4 ? null : "Password must be at least 4 characters"),
    },
  });

  const handleRegister = async (values: FormValues) => {
    const validation = form.validate();
    
    if (validation.hasErrors) {
      return; // Stop if there are validation errors
    }
    
    setLoading(true);
    setError("");

    try {
      // Get all users to check if the phone number already exists
      const { data: allUsersData } = await getAllUsers();
      
      // Check if phone number already exists among users
      const phoneExists = allUsersData?.allUsers?.edges.some(
        (edge: UserEdge) => edge.node.phone === values.phone
      );
      
      if (phoneExists) {
        setError("This phone number is already registered. Please use a different phone number.");
        setLoading(false);
        return;
      }

      // Proceed with user creation if phone number is unique
      await createUser({
        variables: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          uuid: uuidv4(),
        },
      });

      // Log in the user immediately after successful registration
      const { data } = await login({ variables: { email: values.email, password: values.password } });

      const token = data?.tokenAuth?.token;
      if (token) {
        const { data: userData } = await fetchUserData({ email: values.email });

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

          toast.success("Registration successful!");
          navigate("/");
        } else {
          setError("User data could not be retrieved");
        }
      } else {
        setError("Login failed after registration");
      }
    } catch (e) {
      console.error("Error registering user.", e);
      setError("This email is already registered. Use a different email");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = form.onSubmit(handleRegister);

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
        Sign Up
      </Title>

      {error && <Text color="red" style={{ textAlign: "center", marginBottom: "1rem" }}>{error}</Text>}

      <Stack>
        <TextInput
          withAsterisk
          label="Full Name"
          placeholder="John Doe"
          {...form.getInputProps("name")}
          radius="md"
          size="lg"
          mb={20}
        />

        <TextInput
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps("email")}
          radius="md"
          size="lg"
          mb={20}
        />

        <TextInput
          withAsterisk
          label="Phone Number"
          placeholder="1234567890"
          {...form.getInputProps("phone")}
          radius="md"
          size="lg"
          mb={20}
        />

        <PasswordInput
          withAsterisk
          label="Password"
          placeholder="****"
          {...form.getInputProps("password")}
          radius="md"
          size="lg"
          mb={20}
        />
      </Stack>

      <Button 
        color="orange" 
        size="md"
        variant="gradient"
        gradient={{ from: "red", to: "orange" }}
        onClick={() => handleRegister(form.values)}
        loading={loading}
        fullWidth
      >
        Sign Up
      </Button>

      <Text mt="md">
        Already have an account?{" "}
        <Anchor style={{ color: 'black', textDecoration: "underline" }} onClick={() => navigate("/login")}>
          Log In
        </Anchor>
      </Text>
    </Container>
  );
}