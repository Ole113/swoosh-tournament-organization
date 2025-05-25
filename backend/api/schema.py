import graphene
from graphene_django.filter import DjangoFilterConnectionField

from .graphene.types import *
from .graphene.mutations import Mutation
from api.graphene.delete_mutations import *
from api.graphene.create_mutations import *
from api.graphene.update_mutations import *


class Query(graphene.ObjectType):
    user = graphene.relay.Node.Field(UserNode)
    all_users = DjangoFilterConnectionField(UserNode)
    tournament = graphene.Field(TournamentType, id=graphene.ID(required=True))

    def resolve_tournament(self, info, id):
        try:
            return Tournament.objects.get(pk=id)
        except Tournament.DoesNotExist:
            raise Exception(f"Tournament with ID {id} does not exist")

    all_tournaments = DjangoFilterConnectionField(TournamentNode)

    participant = graphene.relay.Node.Field(ParticipantNode)
    all_participants = DjangoFilterConnectionField(ParticipantNode)

    team = graphene.relay.Node.Field(TeamNode)
    all_teams = DjangoFilterConnectionField(TeamNode)
    teams_by_tournament_id = graphene.List(
        TeamNode, tournament_id=graphene.String(required=True))

    def resolve_teams_by_tournament_id(self, info, tournament_id):
        return Team.objects.filter(tournament_id__tournament_id=tournament_id)

    match = graphene.relay.Node.Field(MatchNode)
    all_matches = DjangoFilterConnectionField(MatchNode)

    match_participant = graphene.relay.Node.Field(MatchParticipantNode)
    all_match_participants = DjangoFilterConnectionField(MatchParticipantNode)

    all_matches_by_tournament_id = graphene.List(
        MatchNode, tournament_id=graphene.String())

    def resolve_all_matches_by_tournament_id(self, info, tournament_id):
        return Match.objects.filter(tournament__tournament_id=tournament_id)

    participants_by_tournament_id = graphene.List(
        ParticipantType, tournament_id=graphene.String(
            required=True)  # Use String to match GraphQL ID format
    )

    def resolve_participants_by_tournament_id(self, info, tournament_id):
        try:
            # ✅ Use the correct field
            return Participant.objects.filter(tournament_id=int(tournament_id))
        except Tournament.DoesNotExist:
            raise Exception("Tournament not found.")


schema = graphene.Schema(query=Query, mutation=Mutation)
