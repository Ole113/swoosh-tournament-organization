import {
  IconApi,
  IconBrackets,
  IconBrandDjango,
  IconBrandPython,
  IconBrandReact,
  IconDeviceMobile,
  IconUsers,
} from "@tabler/icons-react";
import {
  Anchor,
  Box,
  Container,
  Image,
  List,
  MantineTheme,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import classes from "@/components/MasterStyles.module.css";
import bracketDemo from "@/images/bracket-demo.png";
import roundRobinDemo from "@/images/round-robin.png";
import swissDemo from "@/images/swiss-format.png";
import tournamentDashboard from "@/images/tournament-dashboard.png";

export function AboutPage() {
  const techStackItems = [
    {
      icon: IconBrandReact,
      title: "React Frontend",
      color: "blue",
      link: "https://react.dev",
    },
    {
      icon: IconBrandPython,
      title: "Python Backend",
      color: "yellow",
      link: "https://www.python.org",
    },
    {
      icon: IconApi,
      title: "GraphQL API",
      color: "pink",
      link: "https://graphql.org",
    },
    {
      icon: IconBrandDjango,
      title: "Django Framework",
      color: "green",
      link: "https://www.djangoproject.com",
    },
  ] as const;

  return (
    <Stack gap={0}>
      {/* Hero Section */}
      <Box py={80}>
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Title className={classes.title} ta="center">
              About{" "}
              <Text
                inherit
                variant="gradient"
                component="span"
                gradient={{ from: "pink", to: "orange" }}
              >
                Swoosh
              </Text>
            </Title>
            <Text c="dimmed" size="xl" maw={800} ta="center">
              Swoosh is a modern tournament management platform designed to simplify the
              organization and participation in tournaments. Whether you're managing a local sports
              event or a large-scale competition, Swoosh provides the tools you need to create,
              manage, and participate in tournaments efficiently.
            </Text>
            <Image
              src={tournamentDashboard}
              radius="md"
              className={classes.image}
              style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)" }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Problem We Solve Section with larger bracket demo */}
      <Box bg="gray.0" py={80}>
        <Container size="lg">
          <Stack gap="xl">
            <Title order={2} className={classes.subtitle} ta="center">
              The Problem We Solve
            </Title>
            <Text c="dimmed" size="lg" maw={900} mx="auto" mb="xl">
              Tournament organization can be complex, with many different formats and unique
              requirements based on the sport. While existing software solutions attempt to address
              these challenges, they often struggle with either user interface or limited
              flexibility. Swoosh bridges this gap by providing:
            </Text>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: "xl", md: 50 }}>
              <List
                spacing="xl"
                size="lg"
                center
                icon={
                  <ThemeIcon size={28} radius="xl" color="orange">
                    <IconBrackets size={18} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <Text size="xl" fw={600} mb={4}>
                    Flexible Tournament Formats
                  </Text>
                  <Text size="md" c="dimmed">
                    Support for single elimination, double elimination, round robin, and Swiss
                    formats, with the ability to combine different formats
                  </Text>
                </List.Item>
                <List.Item>
                  <Text size="xl" fw={600} mb={4}>
                    Real-time Updates
                  </Text>
                  <Text size="md" c="dimmed">
                    Live score tracking and bracket progression
                  </Text>
                </List.Item>
                <List.Item>
                  <Text size="xl" fw={600} mb={4}>
                    Intuitive Interface
                  </Text>
                  <Text size="md" c="dimmed">
                    Clean, modern design that's easy to navigate for both organizers and
                    participants
                  </Text>
                </List.Item>
                <List.Item>
                  <Text size="xl" fw={600} mb={4}>
                    Comprehensive Management
                  </Text>
                  <Text size="md" c="dimmed">
                    Tools for scheduling, scoring, and tracking tournament progress
                  </Text>
                </List.Item>
              </List>
              <Box
                style={{
                  width: "100%",
                  overflow: "visible",
                }}
              >
                <Image
                  src={bracketDemo}
                  radius="md"
                  className={classes.image}
                  styles={(theme) => ({
                    root: {
                      width: "100%",
                      height: "auto",
                      maxHeight: "600px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                      [`@media (max-width: ${theme.breakpoints.md})`]: {
                        width: "100vw",
                        marginLeft: "calc(-50vw + 50%)",
                        marginRight: "calc(-50vw + 50%)",
                        marginTop: theme.spacing.xl,
                        marginBottom: theme.spacing.xl,
                      },
                    },
                  })}
                  fit="contain"
                />
              </Box>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Tournament Formats Section */}
      <Box py={80}>
        <Container size="lg">
          <Stack gap="xl">
            <Title order={2} className={classes.subtitle} ta="center">
              Multiple Tournament Formats
            </Title>
            <Text c="dimmed" size="lg" maw={900} mx="auto" ta="center">
              Swoosh supports various tournament formats to meet your specific needs. From
              traditional brackets to round-robin and Swiss formats, we've got you covered.
            </Text>
            <SimpleGrid cols={2} spacing="xl">
              <Paper shadow="md" p="xl" radius="md" withBorder>
                <Stack gap="md">
                  <Text size="xl" fw={500} ta="center">
                    Round Robin
                  </Text>
                  <Image src={roundRobinDemo} radius="md" className={classes.image} />
                  <Text size="md" c="dimmed">
                    Perfect for leagues and tournaments where every team should play against each
                    other.
                  </Text>
                </Stack>
              </Paper>
              <Paper shadow="md" p="xl" radius="md" withBorder>
                <Stack gap="md">
                  <Text size="xl" fw={500} ta="center">
                    Swiss Format
                  </Text>
                  <Image src={swissDemo} radius="md" className={classes.image} />
                  <Text size="md" c="dimmed">
                    Ideal for large tournaments where a full round-robin is impractical.
                  </Text>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Key Features Section */}
      <Box bg="gray.0" py={80}>
        <Container size="lg">
          <Stack gap="xl">
            <Title order={2} className={classes.subtitle} ta="center">
              Key Features
            </Title>
            <SimpleGrid cols={3} spacing="xl">
              <Paper shadow="md" p={30} radius="md" withBorder>
                <ThemeIcon size={50} radius="md" color="orange" mb="md">
                  <IconBrackets size={30} />
                </ThemeIcon>
                <Text size="xl" fw={500} mb="sm">
                  Multiple Tournament Formats
                </Text>
                <Text size="md" c="dimmed">
                  Support for various tournament styles including single elimination, double
                  elimination, round robin, and Swiss formats.
                </Text>
              </Paper>

              <Paper shadow="md" p={30} radius="md" withBorder>
                <ThemeIcon size={50} radius="md" color="orange" mb="md">
                  <IconUsers size={30} />
                </ThemeIcon>
                <Text size="xl" fw={500} mb="sm">
                  Team Management
                </Text>
                <Text size="md" c="dimmed">
                  Easy team creation, participant management, and role assignments for tournament
                  organizers.
                </Text>
              </Paper>

              <Paper shadow="md" p={30} radius="md" withBorder>
                <ThemeIcon size={50} radius="md" color="orange" mb="md">
                  <IconDeviceMobile size={30} />
                </ThemeIcon>
                <Text size="xl" fw={500} mb="sm">
                  Mobile-Friendly Design
                </Text>
                <Text size="md" c="dimmed">
                  Responsive interface that looks seamless on both desktop and mobile devices.
                </Text>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Technology Stack Section with hover effects */}
      <Box py={80}>
        <Container size="lg">
          <Stack gap="xl">
            <Title order={2} className={classes.subtitle} ta="center">
              Technology Stack
            </Title>
            <SimpleGrid cols={4} spacing="xl">
              {techStackItems.map((item) => (
                <Anchor
                  key={item.title}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <Paper
                    p="xl"
                    radius="md"
                    withBorder
                    style={{
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    styles={(theme: MantineTheme) => ({
                      root: {
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: theme.shadows.md,
                          borderColor: theme.colors[item.color][4],
                        },
                      },
                    })}
                  >
                    <Stack align="center" gap="md">
                      <ThemeIcon size={60} radius="md" color={item.color} variant="light">
                        <item.icon size={35} />
                      </ThemeIcon>
                      <Text size="lg" fw={500} ta="center">
                        {item.title}
                      </Text>
                    </Stack>
                  </Paper>
                </Anchor>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
}
