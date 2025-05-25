import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  CopyButton,
  Group,
  Popover,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Participant from "@/types/Participant";
import Tournament from "@/types/Tournament";
import Team from "../../types/Team";
import classes from "./TeamDescription.module.css";

export default function TeamDescription({
  tournamentInfo,
  teamInfo,
}: {
  tournamentInfo: Partial<Tournament>;
  teamInfo: Partial<Team>;
}) {
  const navigate = useNavigate();
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [phoneOpened, { close: phoneClose, toggle: phoneToggle }] = useDisclosure(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [emailOpened, { close: emailClose, toggle: emailToggle }] = useDisclosure(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopy = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 1333);
  };

  const teamCreator: Partial<Participant> = teamInfo.createdBy || {};

  return (
    <Stack className={classes.teamDescriptionContainer} gap="md">
      {teamInfo === undefined ? <h1>TODO - show model here saying team could not be found</h1> : ""}

      {/* Stack Title and Badges */}
      <Stack gap="xs">
        {/* Replace h1 with responsive Title */}
        <Title order={1} fz={isMobile ? "h3" : "h1"}>
          {teamInfo.name}
        </Title>
        {/* Allow badges to wrap and adjust vertical spacing on mobile */}
        <Group gap="xs">
          <Badge
            color="#fd7e14"
            size={isMobile ? "sm" : "md"}
          >{`${teamInfo.isPrivate ? "Private" : "Public"} Team`}</Badge>
          <Badge
            color="#fd7e14"
            size={isMobile ? "sm" : "md"}
          >{`${teamInfo.participantSet?.length}${tournamentInfo.teamSize !== null ? `/${tournamentInfo.teamSize}` : ""} Teammate${teamInfo.participantSet?.length !== 1 ? "s" : ""}`}</Badge>
          <Badge color="#fd7e14" size={isMobile ? "sm" : "md"}>
            {teamInfo.record} Record
          </Badge>
        </Group>
      </Stack>

      <Text
        fz={isMobile ? "md" : "lg"}
        fw="450"
        className={classes.tournamentName}
        onClick={() => navigate(`/tournament/${tournamentCode}`)}
      >
        {tournamentInfo.name}
      </Text>

      {/* Restructure Created By section */}
      <Group mt="xs">
        <Text size={isMobile ? "sm" : "md"} className={classes.createdByText}>
          Created By {teamCreator.name}
        </Text>
        <Group
          gap={isMobile ? "xs" : "sm"}
          style={{ flexWrap: "wrap" }}
          className={classes.popovers}
        >
          {teamCreator.phone && (
            <Popover
              position="bottom"
              withArrow
              shadow="md"
              opened={phoneOpened}
              onClose={phoneClose}
            >
              <Popover.Target>
                <CopyButton value={String(teamCreator.phone)}>
                  {({ copy }) => (
                    <Text
                      component="span"
                      style={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                      onClick={() => {
                        copy();
                        handleCopy(setPhoneCopied);
                        phoneToggle();
                      }}
                      onMouseEnter={!isMobile ? phoneToggle : undefined}
                      onMouseLeave={!isMobile ? phoneClose : undefined}
                    >
                      Phone
                    </Text>
                  )}
                </CopyButton>
              </Popover.Target>

              <Popover.Dropdown
                style={phoneCopied ? { backgroundColor: "#15b886", color: "white" } : {}}
              >
                {phoneCopied ? "Copied!" : teamCreator.phone}
              </Popover.Dropdown>
            </Popover>
          )}

          {teamCreator.email && (
            <Popover
              position="bottom"
              withArrow
              shadow="md"
              opened={emailOpened}
              onClose={emailClose}
            >
              <Popover.Target>
                <CopyButton value={String(teamCreator.email)}>
                  {({ copy }) => (
                    <Text
                      component="span"
                      style={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                      onClick={() => {
                        copy();
                        handleCopy(setEmailCopied);
                        emailToggle();
                      }}
                      onMouseEnter={!isMobile ? emailToggle : undefined}
                      onMouseLeave={!isMobile ? emailClose : undefined}
                    >
                      Email
                    </Text>
                  )}
                </CopyButton>
              </Popover.Target>

              <Popover.Dropdown
                style={emailCopied ? { backgroundColor: "#15b886", color: "white" } : {}}
              >
                {emailCopied ? "Copied!" : teamCreator.email}
              </Popover.Dropdown>
            </Popover>
          )}
        </Group>
      </Group>

      {teamInfo.description && (
        <Text fz={isMobile ? "sm" : "lg"} opacity={0.6} mt="md">
          {teamInfo.description}
        </Text>
      )}
    </Stack>
  );
}
