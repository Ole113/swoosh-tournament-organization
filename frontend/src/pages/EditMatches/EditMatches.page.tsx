import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout/AdminLayout";
import EditMatches from "@/components/EditMatches/EditMatches";
import Loading from "@/components/Loading/Loading";
import { GET_MATCHES_BY_TOURNAMENT } from "@/graphql/queries/GetMatches";

export default function EditMatchesPage() {
  const { tournamentCode } = useParams<{ tournamentCode: string }>();

  const { data: matchesData, loading } = useQuery(GET_MATCHES_BY_TOURNAMENT, {
    variables: { tournamentId: tournamentCode },
    fetchPolicy: "network-only",
  });

  return (
    <div>
      <AdminLayout>
        {loading ? (
          <Loading />
        ) : (
          <EditMatches matchResults={matchesData.allMatchesByTournamentId} />
        )}
      </AdminLayout>
    </div>
  );
}
