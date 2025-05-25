import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Container, Group, Text } from "@mantine/core";
import classes from "./Footer.module.css";

const data = [
  {
    title: "Tournaments",
    links: [
      { label: "Join", link: "/join" },
      { label: "Create", link: "/create-tournament" },
      { label: "My Tournaments", link: "/my-tournaments" },
      { label: "Tutorial", link: "/tutorial" },
    ],
  },
];

export default function Footer() {
  const navigate = useNavigate();
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<"a">
        key={index}
        className={classes.link}
        component="a"
        onClick={(event) => {
          event.preventDefault();
          navigate(link.link);
        }}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Text size="xs" c="dimmed" className={classes.description}>
            Swoosh makes it easier than easier to organize tournaments. Whether you are a
            participant or an organizer, Swoosh provides the fastest and easiest solution for you.
            Get started now by creating a tournament or joining one!
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © 2025 Swoosh. All rights reserved.
        </Text>

        <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandTwitter size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandYoutube size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandInstagram size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
}
