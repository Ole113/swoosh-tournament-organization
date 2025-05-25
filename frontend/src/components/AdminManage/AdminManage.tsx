import { Button, Card, Container, Image, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import doubleElim from "./images/doubleElim.png";
import roundRobin from "./images/roundRobin.png";
import singleElim from "./images/singlesElim.png";
import swissFormat from "./images/swiss.png";
import classes from "../MasterStyles.module.css";

export function AdminManage() {
  const formats = [
    {
      title: "Single Elimination",
      img: singleElim,
      description: "An easy knockout format for your tournaments.",
    },
    {
      title: "Double Elimination",
      img: doubleElim,
      description: "Give participants a second chance to compete!",
    },
    {
      title: "Round Robin",
      img: roundRobin,
      description: "Everyone plays against everyone for fair results.",
    },
    {
      title: "Swiss System",
      img: swissFormat,
      description: "Skill-based matchups across multiple rounds.",
    },
  ];

  return (
    <Container size="lg" py="xl">
      <Title className={classes.subtitle} ta="center" mb="xl">
        Tournament Formats
      </Title>
      <SimpleGrid cols={2} spacing="lg">
        {formats.map((format, index) => (
          <Card
            key={index}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className={classes.interactiveCard}
          >
            <Card.Section>
              <Image
                src={format.img}
                height={160}
                fit="contain"
                alt={format.title}
                style={{
                  backgroundColor: "var(--mantine-color-gray-0)",
                  padding: "1rem",
                }}
              />
            </Card.Section>

            <Stack align="center" mt="md">
              <Text fw={700} size="lg" c="dark.7" ta="center">
                {format.title}
              </Text>

              <Text size="sm" c="dimmed" ta="center" mb="md">
                {format.description}
              </Text>

              <Button
                variant="light"
                color="orange"
                fullWidth
                radius="md"
                style={{ fontWeight: 600 }}
              >
                Create Tournament
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
