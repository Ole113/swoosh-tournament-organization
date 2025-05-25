import graphene
from graphene_django import DjangoObjectType

from ..models import User, Tournament, Participant, Team, Match, MatchParticipant


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = "__all__"


class TournamentType(DjangoObjectType):
    class Meta:
        model = Tournament
        fields = "__all__"


class ParticipantType(DjangoObjectType):
    class Meta:
        model = Participant
        fields = "__all__"


class TeamType(DjangoObjectType):
    class Meta:
        model = Team
        fields = "__all__"


class MatchType(DjangoObjectType):
    class Meta:
        model = Match
        fields = "__all__"


class MatchParticipantType(DjangoObjectType):
    class Meta:
        model = MatchParticipant
        fields = "__all__"


class UserNode(DjangoObjectType):
    class Meta:
        model = User
        filter_fields = "__all__"
        interfaces = (graphene.relay.Node, )


class TournamentNode(DjangoObjectType):
    class Meta:
        model = Tournament
        filter_fields = "__all__"
        interfaces = (graphene.relay.Node, )


class TeamNode(DjangoObjectType):
    class Meta:
        model = Team
        filter_fields = "__all__"
        interfaces = (graphene.relay.Node, )


class ParticipantNode(DjangoObjectType):
    teamNumber = graphene.Int()
    
    class Meta:
        model = Participant
        filter_fields = "__all__"
        interfaces = (graphene.relay.Node, )
    
    def resolve_teamNumber(self, info):
        # This is a placeholder to satisfy the GraphQL schema
        # The actual teamNumber will come from MatchParticipantNode
        return None

class MatchNode(DjangoObjectType):
    tournamentId = graphene.String()

    class Meta:
        model = Match
        filter_fields = {
            "tournament_id": ["exact"],
        }
        interfaces = (graphene.relay.Node,)

    def resolve_tournamentId(self, info):
        return str(self.tournament.tournament_id)

class MatchParticipantNode(DjangoObjectType):
    teamNumber = graphene.Int()
    
    class Meta:
        model = MatchParticipant
        filter_fields = "__all__"
        interfaces = (graphene.relay.Node, )
    
    # Resolver to convert snake_case field to camelCase for GraphQL
    def resolve_teamNumber(self, info):
        return self.team_number
