import { useQuery } from "@apollo/client";
import Tournament from "@/types/Tournament";
import { GET_USER_TOURNAMENTS } from "../queries/GetTournamentsByFields";

export const USER_1_QID = "VXNlck5vZGU6MQ==";
export const USER_2_QID = "VXNlck5vZGU6Mg==";

export default function getTournamentsByFields(fields: object) {
  const { loading, error, data } = useQuery(GET_USER_TOURNAMENTS, {
    variables: { ...fields },
  });

  if (!loading && !error) {
    const allTournaments = data.allTournaments.edges.map(({ node }: { node: any }) => {
      const tournament: Partial<Tournament> = {};

      tournament.name = node.name;
      tournament.description = node.description;
      tournament.startDate = node.startDate;
      tournament.endDate = node.endDate;
      tournament.format = node.format;
      tournament.maxTeams = node.maxTeams;
      tournament.teamSize = node.teamSize;
      tournament.showEmail = node.showEmail;
      tournament.showPhone = node.showPhone;
      tournament.createdByName = node.createdBy.name;
      tournament.createdByPhone = node.createdBy.phone;
      tournament.createdByEmail = node.createdBy.email;
      tournament.inviteLink = node.inviteLink;
      tournament.password = node.password;
      tournament.isPrivate = node.private;
      tournament.password = node.password;

      return tournament;
    });

    return allTournaments;
  }

  return undefined;
}
