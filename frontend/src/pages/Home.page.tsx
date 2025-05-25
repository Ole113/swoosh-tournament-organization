import { Welcome } from "../components/Welcome/Welcome";

const linksNotLoggedIn = [
  { link: "/join", label: "Join Tournament" },
  { link: "/signup", label: "Sign Up" },
  { link: "/login", label: "Log In" },
  { link: "/create-tournament", label: "Create Tournament"}
];

export function HomePage() {
  return (
    <>
      <Welcome />
    </>
  );
}