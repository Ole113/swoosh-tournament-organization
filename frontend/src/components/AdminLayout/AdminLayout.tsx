import React, { useEffect, useState } from "react";
import { IconEdit, IconPencilPlus, IconUserPlus } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Burger, Container, Drawer, Group, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "../MasterStyles.module.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const tournamentIdFromUrl = location.pathname.match(/\/admin-dashboard\/(\d+)/)?.[1];
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [isHeaderDrawerOpen, setIsHeaderDrawerOpen] = useState(false);

  const lastTournamentId = tournamentIdFromUrl || localStorage.getItem("lastEditedTournamentId");

  const handleNavigation = (link: string) => {
    if (link === "/admin-dashboard") {
      // Get the current tournament ID from the URL if we're on the admin-dashboard page
      const currentPath = location.pathname;
      const match = currentPath.match(/\/admin-dashboard\/(\d+)/);
      if (match) {
        // Store the current tournament ID
        localStorage.setItem("lastEditedTournamentId", match[1]);
      }

      // Check if we have a last edited tournament
      if (lastTournamentId) {
        navigate(`/admin-dashboard/${lastTournamentId}`);
        return;
      }
      // If no last tournament, fall back to my-tournaments
      navigate("/my-tournaments");
      return;
    }
    navigate(link);
  };

  const adminLinks = [
    {
      link: "/admin-dashboard",
      label: "Edit Tournament",
      icon: IconEdit,
    },
    {
      link: `/admin-dashboard/${lastTournamentId}/edit-matches`,
      label: "Edit Matches",
      icon: IconPencilPlus,
    },
    {
      link: `/admin-dashboard/${lastTournamentId}/admin-invite-users`,
      label: "Invite Users",
      icon: IconUserPlus,
    },
  ];

  // Common sidebar content component
  const SidebarContent = ({ hideTitle = false }: { hideTitle?: boolean }) => (
    <>
      {!hideTitle && (
        <Text
          className={classes.subtitle}
          style={{
            color: "var(--mantine-color-dark-7)",
            marginBottom: "2rem",
            fontSize: "1.75rem",
            fontWeight: 600,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          Tournament Control
        </Text>
      )}

      {adminLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <Group
            key={index}
            onClick={() => {
              handleNavigation(link.link);
              closeDrawer(); // Close drawer on navigation
            }}
            className={classes.sidebarLink}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "0.75rem",
              transition: "all 0.2s ease",
            }}
          >
            <ThemeIcon
              variant="light"
              color="orange"
              size="lg"
              style={{
                backgroundColor: "var(--mantine-color-orange-0)",
              }}
            >
              <Icon size={20} />
            </ThemeIcon>
            <Text size="sm" fw={500}>
              {link.label}
            </Text>
          </Group>
        );
      })}
    </>
  );

  // Effect to listen for header drawer state changes
  useEffect(() => {
    const handleHeaderToggle = (event: Event) => {
      // Cast event to CustomEvent to access detail
      const customEvent = event as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail) {
        setIsHeaderDrawerOpen(customEvent.detail.isOpen);
      }
    };

    document.addEventListener("headerDrawerToggled", handleHeaderToggle);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener("headerDrawerToggled", handleHeaderToggle);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
      {/* Burger Menu for Mobile - Conditionally rendered */}
      {!drawerOpened && !isHeaderDrawerOpen && (
        <Burger
          // opened={drawerOpened} // Removed to prevent transformation to 'X'
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            toggleDrawer();
          }}
          hiddenFrom="sm" // Only show Burger on mobile
          size="md"
          style={{ position: "fixed", top: "70px", left: "1rem", zIndex: 1100 }} // Moved down
        />
      )}

      {/* Sidebar - Mobile (Drawer) */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <Text fw={700} fz="xl" mb="sm">
            Tournament Control
          </Text>
        }
        padding="md"
        size="md"
        hiddenFrom="sm" // Only show drawer on mobile
        zIndex={1000} // Ensure drawer is above content
      >
        <SidebarContent hideTitle />
      </Drawer>

      {/* Main Layout Container */}
      <Box
        style={{
          display: "flex",
          flexDirection: "column", // Keep main axis vertical for header/footer if added later
          minHeight: "50vh",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
      >
        {/* Container for Sidebar and Main Content */}
        <Box
          style={{
            display: "flex",
            flex: 1, // Allow this inner box to grow and fill height
          }}
        >
          {/* Sidebar - Desktop */}
          <Box
            component="nav" // Use nav semantic element
            style={{
              width: "280px",
              backgroundColor: "white",
              padding: "2rem",
              paddingTop: "5rem",
              borderRight: "1px solid var(--mantine-color-gray-2)",
            }}
            visibleFrom="sm" // Hide this Box on mobile
          >
            <SidebarContent />
          </Box>

          {/* Main Content */}
          <Box component="main" style={{ flex: 1, padding: "2rem" }}>
            {" "}
            {/* Use main semantic element */}
            <Container size="xl" px="xs" w="100%">
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
}
