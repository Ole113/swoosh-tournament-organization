import {
  IconAdjustments,
  IconBolt,
  IconBrandLinkedin,
  IconBrandParsinta,
  IconDeviceMobile,
  IconInfoCircle,
  IconListDetails,
  IconMail,
  IconMailFilled,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Paper,
  rem,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import bracketImg from "./bracketImg.png";
import Elbel from "./elbel.jpg";
import eventImg from "./eventImg.png";
import Pham from "./pham.png";
import Qi from "./qi.jpg";
import Salem from "./salem.jpeg";
import classes from "../MasterStyles.module.css";

export function Welcome() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${eventImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          paddingTop: "200px",
          paddingBottom: "200px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            opacity: "95%",
            paddingTop: "50px",
            paddingBottom: "50px",
          }}
        >
          <Title className={classes.title} ta="center" mt={0} fz={isMobile ? "h1" : undefined}>
            <Text
              inherit
              variant="gradient"
              component="span"
              gradient={{ from: "pink", to: "orange" }}
            >
              Tournament organization
            </Text>{" "}
            made easy.
          </Title>
          <Text c="dimmed" ta="center" size={isMobile ? "lg" : "xl"} maw={580} mx="auto" mt="xl">
            Whether you are a tournament organizer or a participant, Swoosh provides the fastest and
            easiest solution for you. Get started now!
          </Text>
          {/* Conditionally render Group for desktop, Stack for mobile */}
          {isMobile ? (
            <Stack align="center" justify="center" mt={50} gap="md">
              <Button
                component="a"
                onClick={() => navigate("/join")}
                ta="center"
                variant="filled"
                color="orange"
                size="md"
                radius="xl"
              >
                I'm a Participant
              </Button>
              <Button
                component="a"
                onClick={() => navigate("/create-tournament")}
                ta="center"
                variant="filled"
                color="orange"
                size="md"
                radius="xl"
              >
                I'm an Admin
              </Button>
            </Stack>
          ) : (
            <Group justify="center" mt={50}>
              <Button
                component="a"
                onClick={() => navigate("/join")}
                ta="center"
                variant="filled"
                color="orange"
                size="md"
                radius="xl"
              >
                I'm a Participant
              </Button>
              <Button
                component="a"
                onClick={() => navigate("/create-tournament")}
                ta="center"
                variant="filled"
                color="orange"
                size="md"
                radius="xl"
              >
                I'm an Admin
              </Button>
            </Group>
          )}
        </div>
      </div>
      <Title className={classes.subtitle} ta="center" mt={100} fz={isMobile ? "h2" : undefined}>
        Swoosh allows for the use and combination of many tournament formats
      </Title>
      <Text c="dimmed" ta="center" size={isMobile ? "md" : "lg"} maw={650} mx="auto" mt="xl">
        Swoosh provides support for brackets, round robin, and even swiss formats. What's even
        cooler is that you can combine different formats together to fit the exact needs of your
        tournament.
      </Text>
      <Image src={bracketImg} h="auto" w="auto" maw={isMobile ? "100%" : 1450} fit="contain" />
      <Container fluid p={{ base: "lg", sm: 50 }} bg="orange">
        <Title c="white" className={classes.title} ta="center" fz={isMobile ? "h2" : undefined}>
          Why Swoosh?
        </Title>
        {/* Refactor data into an array for mapping */}
        {(() => {
          const whySwooshPoints = [
            {
              icon: IconListDetails,
              title: "The Challenge",
              text: "Tournament organization can be complex. With many different formats combined with unique requirements based on the sport, many niche user needs can be hard to automate.",
            },
            {
              icon: IconDeviceMobile,
              title: "Common Issues",
              text: "While software solutions exist, each seems to struggle with either the user interface or the flexibility of the event format. We think we can do better.",
            },
            {
              icon: IconAdjustments,
              title: "Our Approach",
              text: "Admins need enough flexibility to fine-tune the event, but the application must assist enough to provide value.",
            },
            {
              icon: IconBolt,
              title: "Key Features",
              text: "Beyond setup, admins must update scores in real-time, view standings, and even funnel participants into different formats if needed.",
            },
            {
              icon: IconUsersGroup,
              title: "Our Mission",
              text: "Swoosh aims to provide a sleek and easily understandable UI that makes tournament organization effortless for both the participant and organizer.",
            },
          ];

          return (
            <Grid mt="xl" gutter="xl">
              {whySwooshPoints.map((point, index) => {
                const isLastItem = index === whySwooshPoints.length - 1;
                const Icon = point.icon;
                return (
                  <Grid.Col
                    key={point.title}
                    span={{ base: 12, sm: isLastItem && !isMobile ? 12 : 6 }}
                    // Center the last item on desktop
                    style={
                      isLastItem && !isMobile ? { display: "flex", justifyContent: "center" } : {}
                    }
                  >
                    <Stack
                      gap="sm"
                      style={{
                        height: "100%",
                        maxWidth:
                          isLastItem && !isMobile
                            ? "50%"
                            : undefined /* Optional: constrain width of centered item */,
                      }}
                    >
                      <Group wrap="nowrap">
                        <ThemeIcon variant="light" size="lg" color="white">
                          <Icon style={{ width: rem(24), height: rem(24) }} />
                        </ThemeIcon>
                        <Text fw={700} size="lg" c="white">
                          {point.title}
                        </Text>
                      </Group>
                      <Text c="white" size={isMobile ? "sm" : "md"}>
                        {point.text}
                      </Text>
                    </Stack>
                  </Grid.Col>
                );
              })}
            </Grid>
          );
        })()}
        <Title c="white" className={classes.subtitle} mt={100} mb={50} ta="center">
          Our Team
        </Title>
        <Group justify="center" wrap="wrap" gap="xl">
          <Stack gap="xl" align="center">
            {/* Alex Elbel */}
            <Paper bg="white" p="xl" radius="lg" shadow="lg" w="100%">
              <Group align="center" justify="center" wrap={isMobile ? "wrap" : "nowrap"}>
                <Paper bg="orange" radius="md" shadow="sm" p={{ base: "md", sm: "lg" }} maw={700}>
                  <Stack>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Alex Elbel is a student at the University of Utah studying Computing Science
                      and will be graduating in spring 2025. He's passionate about building software
                      that's both useful and well-designed, and he loves working on collaborative,
                      high-impact projects.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Last summer, Alex Elbel interned at Pluralsight as a Software Engineer, where
                      he helped develop a new Practice Exams experience using Postgres, Kafka, and
                      React.js. He designed accessible frontend components, built message streams
                      with Kafka and Node.js, and created database tables using Knex.js—all while
                      working closely with his team in an Agile environment.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Before that, Alex Elbel worked as an undergraduate researcher at the
                      University of Colorado Boulder, contributing to open-source tools for
                      synthetic biology. He enhanced the functionality of SBOL Canvas and SynBioHub3
                      using TypeScript, Angular.js, React.js, and Redux.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      When Alex Elbel is not coding, you'll usually find him outdoors. He loves
                      skiing, hiking, playing tennis, and bouldering—basically anything that gets
                      him moving and into the mountains.
                    </Text>
                  </Stack>
                </Paper>
                <Stack align="center" miw={isMobile ? 120 : 150} maw={isMobile ? 150 : 200}>
                  <Paper radius={100} shadow="xl">
                    <Image src={Elbel} radius={100} h={200} w={200} />
                  </Paper>
                  <Text c="black" ta="center" size="lg">
                    Alex Elbel
                  </Text>
                  <Group gap="md">
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=alex_elbel@icloud.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconMail />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://www.linkedin.com/in/alex-elbel-9ba56b209/"
                      target="_blank"
                    >
                      <IconBrandLinkedin />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Group>
            </Paper>

            {/* Alex Qi */}
            <Paper bg="white" p="xl" radius="lg" shadow="lg" w="100%">
              <Group align="center" justify="center" wrap="wrap">
                <Stack align="center" miw={isMobile ? 120 : 150} maw={isMobile ? 150 : 200}>
                  <Paper radius={100} shadow="xl">
                    <Image src={Qi} radius={100} h={200} w={200} />
                  </Paper>
                  <Text c="black" ta="center" size="lg">
                    Alex Qi
                  </Text>
                  <Group gap="md">
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=alexanderjqi@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconMail />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://www.linkedin.com/in/alexanderqi/"
                      target="_blank"
                    >
                      <IconBrandLinkedin />
                    </ActionIcon>
                  </Group>
                </Stack>
                <Paper bg="orange" radius="md" shadow="sm" p={{ base: "md", sm: "lg" }} maw={700}>
                  <Stack>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Alex Qi is a Computer Science student at the University of Utah, graduating in
                      Spring 2025 with a minor in Business. Alex's currently working on Swoosh, his
                      senior capstone project, where he's focused on the full-stack
                      experience—writing GraphQL queries and mutations in Django, handling
                      tournament data, and building out React components for a clean and responsive
                      UI.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      This past summer, Alex Qi interned at L3Harris as a Software Engineering
                      Intern, where he worked on the UI for a secure software configuration system
                      used in military aircraft. He also contributed to backend functionality in C#
                      and collaborated in peer reviews. Alex currently interns at Trident Sensing,
                      working with Cesium for 3D mapping and building out real-time frontend
                      features using TypeScript, Next.js, Zustand, and REST/WebSocket APIs.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Outside of class and work, Alex Qi plays competitive pickleball at the
                      national level, representing the University of Utah and proudly sponsored by
                      Selkirk. He loves building things that make people's lives easier and is
                      always looking to grow both as a developer and teammate.
                    </Text>
                  </Stack>
                </Paper>
              </Group>
            </Paper>

            {/* Kaden Salem */}
            <Paper bg="white" p="xl" radius="lg" shadow="lg" w="100%">
              <Group align="center" justify="center" wrap="wrap">
                <Paper bg="orange" radius="md" shadow="sm" p={{ base: "md", sm: "lg" }} maw={700}>
                  <Stack>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Kaden Salem is an undergraduate student at the University of Utah, studying
                      Computer Science in the College of Engineering and Econometrics in the School
                      of Business. His academic work blends technical development with economic and
                      data-driven analysis, offering a balanced perspective on both how systems work
                      and how people use them.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Outside the classroom, Kaden has worked in software engineering and
                      product-related roles, building experience in full-stack development, cloud
                      infrastructure, and user interface design. He enjoys learning new tools,
                      solving real-world problems, and thinking about how to make digital
                      experiences more intuitive.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Kaden is especially interested in the intersection of technology and human
                      behavior—how thoughtful design and data can help create better systems.
                      Whether working on wildfire mapping software or teaching assistant roles in
                      computer science and economics, he values clarity, empathy, and collaboration
                      in both code and communication.
                    </Text>
                  </Stack>
                </Paper>
                <Stack align="center" miw={isMobile ? 120 : 150} maw={isMobile ? 150 : 200}>
                  <Paper radius={100} shadow="xl">
                    <Image src={Salem} radius={100} h={200} w={200} />
                  </Paper>
                  <Text c="black" ta="center" size="lg">
                    Kaden Salem
                  </Text>
                  <Group gap="md">
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=kaden@salemfamily.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconMail />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://www.linkedin.com/in/kadensalem/"
                      target="_blank"
                    >
                      <IconBrandLinkedin />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Group>
            </Paper>

            {/* Minh Pham */}
            <Paper bg="white" p="xl" radius="lg" shadow="lg" w="100%">
              <Group align="center" justify="center" wrap="wrap">
                <Stack align="center" miw={isMobile ? 120 : 150} maw={isMobile ? 150 : 200}>
                  <Paper radius={100} shadow="xl">
                    <Image src={Pham} radius={100} h={200} w={200} />
                  </Paper>
                  <Text c="black" ta="center" size="lg">
                    Minh Hai Pham
                  </Text>
                  <Group gap="md">
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=phamhaiminh2003@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconMail />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      radius="xl"
                      component="a"
                      href="https://www.linkedin.com/in/minh-pham-7344722a8/"
                      target="_blank"
                    >
                      <IconBrandLinkedin />
                    </ActionIcon>
                  </Group>
                </Stack>
                <Paper bg="orange" radius="md" shadow="sm" p={{ base: "md", sm: "lg" }} maw={700}>
                  <Stack>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Minh Hai Pham is pursuing a Bachelor's degree in Computer Science with a minor
                      in Mathematics at the University of Utah. With a strong foundation in both
                      theoretical and applied aspects of computing, Minh is passionate about
                      building scalable, user-focused software and is currently working on Swoosh, a
                      senior capstone project that supports advanced tournament formats with
                      real-time updates and dynamic bracket logic. His contributions focus on
                      frontend architecture, dynamic state management, and seamless integration with
                      backend APIs.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      Minh enjoys solving complex problems through clean, maintainable code and has
                      a particular interest in frontend development and software architecture. He's
                      drawn to projects that require both precision and creativity, and he's excited
                      to pursue a career as a software developer after graduation.
                    </Text>
                    <Text size={isMobile ? "sm" : "lg"} c="white">
                      With a strong foundation in algorithms, data structures, and UI development,
                      Minh continues to grow his skills through coursework and hands-on team
                      projects. He values collaboration, thoughtful design, and building tools that
                      improve user experience.
                    </Text>
                  </Stack>
                </Paper>
              </Group>
            </Paper>
          </Stack>
        </Group>
      </Container>
      <Title className={classes.subtitle} ta="center" mt={100} mb={50}>
        Helpful links
      </Title>
      <Group gap={isMobile ? "xl" : 150} justify="center" mb={isMobile ? "xl" : 50} wrap="wrap">
        <Anchor href="mailto:swooshhelp@gmail.com" underline="never">
          <Stack>
            <IconMailFilled
              color="var(--mantine-color-orange-filled)"
              style={{ width: rem(isMobile ? 50 : 80), height: rem(isMobile ? 50 : 80) }}
            />
            <Text c="dimmed" ta="center" size="lg" mx="auto">
              Email Us
            </Text>
          </Stack>
        </Anchor>
        <Anchor onClick={() => navigate("/tutorial")} underline="never">
          <Stack align="center">
            <IconBrandParsinta
              color="var(--mantine-color-orange-filled)"
              style={{ width: rem(isMobile ? 50 : 80), height: rem(isMobile ? 50 : 80) }}
            />
            <Text c="dimmed" ta="center" size="lg" mx="auto">
              Tutorials
            </Text>
          </Stack>
        </Anchor>
        <Anchor onClick={() => navigate("/about")} underline="never">
          <Stack align="center">
            <IconInfoCircle
              color="var(--mantine-color-orange-filled)"
              style={{ width: rem(isMobile ? 50 : 80), height: rem(isMobile ? 50 : 80) }}
            />
            <Text c="dimmed" ta="center" size="lg" mx="auto">
              About Us
            </Text>
          </Stack>
        </Anchor>
      </Group>
    </>
  );
}
