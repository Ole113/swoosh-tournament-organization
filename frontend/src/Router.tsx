import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import { HeaderMenu } from "./components/Header/Header";
import { TournamentNotFound } from "./components/TournamentNotFound/TournamentNotFound";
import ErrorPage from "./ErrorPage";
import { AboutPage } from "./pages/About.page";
import { AdminDashboardPage } from "./pages/AdminDashboard.page";
import { AdminInviteUsersPage } from "./pages/AdminInviteUsers.page";
import { AdminManagePage } from "./pages/AdminManage.page";
import CreateTournament from "./pages/CreateTournament/CreateTournament.page";
import EditMatchesPage from "./pages/EditMatches/EditMatches.page";
import { HomePage } from "./pages/Home.page";
import { JoinPage } from "./pages/Join.page";
import JoinTournamentPage from "./pages/JoinTournament/JoinTournament.page";
import MyTournamentsPage from "./pages/MyTournaments.page";
import ProfileSettingsPage from "./pages/ProfileSetting.page";
import TeamPage from "./pages/TeamPage/Team.page";
import { TournamentPage } from "./pages/Tournament.page";
import { TournamentBracketPage } from "./pages/TournamentBracket.page";
import { TournamentSchedulePage } from "./pages/TournamentSchedule.page";
import { TournamentStandingsPage } from "./pages/TournamentStandings.page";
import Tutorial from "./pages/Tutorial/Tutorial.page";
import UserLoginPage from "./pages/UserLogin.page";
import UserRegisterPage from "./pages/UserRegister.page";

const userDropdownLinks = [
  { link: "/settings", label: "Settings" },
  { link: "/logout", label: "Logout" },
];

// TODO: somehow figure out if the user is logged in here and return the correct links
const linksNotLoggedIn = [
  { link: "/join", label: "Join Tournament" },
  { link: "/signup", label: "Sign Up" },
  { link: "/login", label: "Log In" },
];

const linksLoggedIn = (username: string) => [
  { link: "/join", label: "Join Tournament" },
  { link: "/create-tournament", label: "Create Tournament" },
  { link: "/my-tournaments", label: "My Tournaments" },
  {
    link: "#user",
    label: username, // Use the dynamic username here
    links: userDropdownLinks,
  },
];

// Check the authentication status and return the correct links
const getLoginLinks = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.token && user.name) {
    return linksLoggedIn(user.name);
  }

  return linksNotLoggedIn;
};

function Layout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMenu links={getLoginLinks()} />
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/tournament-not-found",
        element: <TournamentNotFound />,
      },
      {
        path: "/create-tournament",
        element: <CreateTournament />,
      },
      {
        path: "/tournament/:tournamentCode/team/:teamId",
        element: <TeamPage />,
      },
      {
        path: "/tournament/:tournamentCode",
        element: <TournamentPage />,
      },
      {
        path: "/tournament/:tournamentCode/join",
        element: <JoinTournamentPage />,
      },
      {
        path: "/tournament/:tournamentCode/schedule",
        element: <TournamentSchedulePage />,
      },
      {
        path: "/tournament/:tournamentCode/standings",
        element: <TournamentStandingsPage />,
      },
      {
        path: "/tournament/:tournamentCode/bracket",
        element: <TournamentBracketPage />,
      },
      {
        path: "/admin-dashboard/:tournamentId",
        element: <AdminDashboardPage />,
      },
      {
        path: "/admin-dashboard/:tournamentCode/edit-matches",
        element: <EditMatchesPage />,
      },
      {
        path: "/admin-manage",
        element: <AdminManagePage />,
      },
      {
        path: "admin-dashboard/:tournamentCode/admin-invite-users",
        element: <AdminInviteUsersPage />,
      },
      {
        path: "/join",
        element: <JoinPage />,
      },
      {
        path: "/my-tournaments",
        element: <MyTournamentsPage />,
      },
      {
        path: "/tournament/:tournamentCode/team/:teamId",
        element: <TeamPage />,
      },
      {
        path: "/tutorial",
        element: <Tutorial />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
    ],
  },
  {
    path: "/signup",
    element: <UserRegisterPage />,
  },
  {
    path: "/login",
    element: <UserLoginPage />,
  },
  {
    path: "/settings",
    element: <ProfileSettingsPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
