import { useState } from "react";
import classes from "./Header.module.scss";
import { IconChevronDown } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  Anchor,
  Burger,
  Button,
  Center,
  Container,
  Drawer,
  Group,
  Menu,
  Modal,
  Stack,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Logo from "../Logo/Logo";

interface Link {
  link: string;
  label: string;
  links?: Link[];
}

interface HeaderMenuProps {
  links: Link[];
}

export function HeaderMenu({ links }: HeaderMenuProps) {
  const navigate = useNavigate();

  // Adjust logo based on light/dark mode
  const { colorScheme } = useMantineColorScheme();
  const logoColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";

  // Hamburger menu
  const [opened, { toggle, close }] = useDisclosure(false);

  // State for the Logout Modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Handle logout function
  const handleLogout = () => {
    localStorage.removeItem("user");

    // Redirect to the login page
    navigate("/login");
  };

  // Navigate with Settings and Log Out label
  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item
        key={item.link}
        onClick={() => {
          if (item.label === "Settings") {
            navigate("/settings");
          } else if (item.label === "Logout") {
            setLogoutModalOpen(true);
          } else {
            // Handle other potential sub-links if necessary
            navigate(item.link);
          }
        }}
      >
        {item.label}
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <div key={link.label}>
          <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
            <Menu.Target>
              <Anchor component="button" type="button" className={classes.link}>
                <Center>
                  <span className={classes.linkLabel}>{link.label}</span>
                  <IconChevronDown size="0.9rem" stroke={1.5} />
                </Center>
              </Anchor>
            </Menu.Target>
            <Menu.Dropdown>{menuItems}</Menu.Dropdown>
          </Menu>
        </div>
      );
    }

    // Use Anchor for simple navigation links
    return (
      <Anchor
        component="button"
        type="button"
        key={link.label}
        onClick={() => navigate(link.link)}
        className={classes.link}
      >
        {link.label}
      </Anchor>
    );
  });

  // Updated Drawer links generation
  const drawerLinks = links.flatMap((link) => {
    // If the link has sub-links (like the user menu)
    if (link.links && link.links.length > 0) {
      // Render as an Accordion
      return (
        <Accordion
          key={link.label}
          variant="transparent"
          classNames={{
            item: classes.drawerAccordionItem,
            control: classes.drawerAccordionControl,
          }}
        >
          <Accordion.Item value={link.label}>
            <Accordion.Control>{link.label}</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                {link.links.map((item) => (
                  <Anchor
                    key={item.label}
                    className={classes.drawerSubLink}
                    onClick={(e) => {
                      e.preventDefault();
                      close(); // Close drawer
                      if (item.label === "Settings") {
                        navigate("/settings");
                      } else if (item.label === "Logout") {
                        setLogoutModalOpen(true);
                      }
                    }}
                  >
                    {item.label}
                  </Anchor>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      );
    }

    // Otherwise, return a regular link
    return (
      <Anchor
        key={link.label}
        className={classes.link}
        onClick={(e) => {
          e.preventDefault();
          close();
          navigate(link.link);
        }}
      >
        {link.label}
      </Anchor>
    );
  });

  // The final HTML returned after links have been inserted
  return (
    <div>
      <header className={classes.header}>
        <Container size="md">
          <div className={classes.inner}>
            <Anchor onClick={() => navigate("/")}>
              <Logo color={logoColor} />
            </Anchor>
            <Group gap={5} visibleFrom="sm">
              {items}
            </Group>
            <Burger
              opened={opened}
              onClick={(e) => {
                // Dispatch custom event before toggling
                document.dispatchEvent(
                  new CustomEvent("headerDrawerToggled", { detail: { isOpen: !opened } })
                );
                e.stopPropagation(); // Prevent event bubbling
                toggle();
              }}
              size="sm"
              hiddenFrom="sm"
            />
          </div>
        </Container>
        <Drawer
          opened={opened}
          onClose={close}
          position="top"
          title="Navigation"
          padding="md"
          size="40%"
          overlayProps={{ opacity: 0.5, blur: 4 }}
          zIndex={900}
        >
          <Stack>{drawerLinks}</Stack>
        </Drawer>
      </header>
      <div className={classes.paddingBlock} />

      {/* Logout Confirmation Modal */}
      <Modal
        opened={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirmation:"
      >
        <p>Are you sure you want to log out?</p>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}
        >
          <Button color="red" onClick={handleLogout}>
            Log Out
          </Button>
          <Button variant="outline" onClick={() => setLogoutModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
