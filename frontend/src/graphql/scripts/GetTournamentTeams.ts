import Participant from "@/types/Participant";
import Team from "@/types/Team";

export default function getTournamentTeams(tournamentId: string, data: any) {
  if(!data) {
    return [];
  }

  return data.teamsByTournamentId.map((currTeam: any) => {
    const { name, description, teamId, record, isPrivate, inviteLink, password, participantSet, createdByUuid } = currTeam;

    const team: Partial<Team> = {
      name,
      description,
      teamId,
      record,
      isPrivate,
      ...(inviteLink && { inviteLink }),
      ...(password && { password }),
      participantSet: participantSet.edges.map(({ node }: { node: any }) => {
        const { userId, name, email, phone, uuid } = node.userId;

        const participant: Partial<Participant> = {
          userId,
          tournamentId,
          teamId,
          name,
          email,
          phone,
          participantId: node.participantId,
          uuid,
        };

        return participant;
      }),
      createdBy: createdByUuid,
    };

    return team;
  });
}
