import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { IconScoreboard, IconSettings, IconUsersGroup, IconVs } from "@tabler/icons-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Tabs, Text } from "@mantine/core";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";
import Team from "@/types/Team";
import { isFutureDate } from "@/utils";
import Loading from "../Loading/Loading";
import ResultsTab from "./ResultsTab/ResultsTab";
import ScheduleTab from "./ScheduleTab/ScheduleTab";
import SettingsTab from "./SettingsTab/SettingsTab";
import TeammatesTab from "./TeammatesTab/TeammatesTab";
import classes from "./TeamTabs.module.css";

export default function TeamTabs({
  teamInfo,
  teamCreator,
}: {
  teamInfo: Partial<Team>;
  teamCreator: { isCreator: boolean; id: string | undefined };
}) {
  const { tournamentCode, teamId } = useParams<{ tournamentCode: string; teamId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const urlTab = queryParams.get("tab");

  const [activeTab, setActiveTab] = useState<string | null>(urlTab || "schedule");

  useEffect(() => {
    if (activeTab) {
      const newQueryParams = new URLSearchParams(location.search);
      newQueryParams.set("tab", activeTab);
      navigate({ search: newQueryParams.toString() }, { replace: true });
    }
  }, [activeTab, navigate, location.search]);

  const { data: matchesData, loading: matchesLoading } = useQuery(GET_MATCHES_BY_TOURNAMENT, {
    variables: { tournamentId: tournamentCode },
  });

  const upcomingMatches: any[] = [];
  const matchResults: any[] = [];

  if (matchesData) {
    matchesData.allMatchesByTournamentId.forEach((match: any) =>
      match.matchparticipantSet.edges.forEach((participant: any) => {
        if (participant.node.participantId.teamId.teamId === teamId) {
          return isFutureDate(match.startDate)
            ? upcomingMatches.push(match)
            : matchResults.push(match);
        }
      })
    );
  }

  if (matchesLoading) {
    return <Loading />;
  }

  const matchesGenerated = matchesData && matchesData.allMatchesByTournamentId.length > 0;

  return (
    <div className={classes.teamTabs}>
      <Tabs color="orange" value={activeTab} onChange={setActiveTab}>
        <Tabs.List style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
          <Tabs.Tab value="schedule" leftSection={<IconVs size={17} />}>
            <Text fz="md">Schedule</Text>
          </Tabs.Tab>
          <Tabs.Tab value="results" leftSection={<IconScoreboard size={17} />}>
            <Text fz="md">Results</Text>
          </Tabs.Tab>
          <Tabs.Tab value="teammates" leftSection={<IconUsersGroup size={17} />}>
            <Text fz="md">Teammates</Text>
          </Tabs.Tab>
          {teamCreator.isCreator && (
            <Tabs.Tab value="settings" leftSection={<IconSettings size={17} />}>
              <Text fz="md">Settings</Text>
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="schedule">
          <ScheduleTab upcomingMatches={upcomingMatches} />
        </Tabs.Panel>

        <Tabs.Panel value="results">
          <ResultsTab matchResults={matchResults} teamName={teamInfo.name || ""} />
        </Tabs.Panel>

        <Tabs.Panel value="teammates">
          <TeammatesTab
            teamCreator={teamCreator}
            teammates={teamInfo.participantSet || []}
            matchResults={matchResults}
            matchesGenerated={matchesGenerated}
          />
        </Tabs.Panel>

        {teamCreator.isCreator && (
          <Tabs.Panel value="settings">
            <SettingsTab teamInfo={teamInfo} />
          </Tabs.Panel>
        )}
      </Tabs>
    </div>
  );
}
