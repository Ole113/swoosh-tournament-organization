import { HeaderMenu } from "@/components/Header/Header";
import  Footer from "@/components/Footer/Footer";
import { UserLogin } from "@/components/UserLogin/UserLogin";

// Links for logged out state
const linksNotLoggedIn = [
  { link: "/join", label: "Join Tournament" },
  { link: "/signup", label: "Sign Up" },
  { link: "/login", label: "Log In" },
];

// Function to get the login status and return the correct links
const getLoginLinks = () => {
  return linksNotLoggedIn; // Return links for logged out user
};

export default function RegisterPage() {
  const links = getLoginLinks();

  return (
      <>
        <HeaderMenu links={links} />
        <UserLogin />
        <Footer />
      </>
    );
}
