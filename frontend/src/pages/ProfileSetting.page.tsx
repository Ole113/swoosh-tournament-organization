import Footer from "@/components/Footer/Footer";
import { HeaderMenu } from "@/components/Header/Header";
import { ProfileSetting } from "@/components/ProfileSetting/ProfileSetting";

// Define your user dropdown links and login check function
const userDropdownLinks = [
  { link: "/settings", label: "Settings" },
  { link: "/logout", label: "Logout" },
];

// Links for logged out state
const linksNotLoggedIn = [
  { link: "/join", label: "Join Tournament" },
  { link: "/signup", label: "Sign Up" },
  { link: "/login", label: "Log In" },
];

// Links for logged in state
const linksLoggedIn = (username: string) => [
  { link: "/join", label: "Join Tournament" },
  { link: "/create-tournament", label: "Create Tournament" },
  { link: "/my-tournaments", label: "My Tournaments" },
  {
    link: "#user",
    label: username,
    links: userDropdownLinks,
  },
];

// Function to get the login status and return the correct links
const getLoginLinks = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.token && user.name) {
    return linksLoggedIn(user.name); // Return links for logged in user
  }

  return linksNotLoggedIn; // Return links for logged out user
};

export default function ProfileSettingsPage() {
  const links = getLoginLinks(); // Get the dynamic links based on login status

  return (
    <>
      <HeaderMenu links={links} />
      <ProfileSetting />
      <Footer />
    </>
  );
}
