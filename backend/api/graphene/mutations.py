import graphene
import graphql_jwt

from .create_mutations import *
from .delete_mutations import *
from .update_mutations import *


class Mutation(graphene.ObjectType):
    create_tournament = CreateTournament.Field()
    create_user = CreateUser.Field()
    create_team = CreateTeam.Field()
    create_participant = CreateParticipant.Field()
    create_match = CreateMatch.Field()
    create_match_participant = CreateMatchParticipant.Field()
    generate_matches = GenerateMatches.Field()
    generate_round_robin_matches = GenerateRoundRobinMatches.Field()
    generate_double_elimination_matches = GenerateDoubleEliminationMatches.Field()
    generate_round_robin_to_single_elimination = GenerateRoundRobinToSingleElimination.Field()
    generate_round_robin_to_double_elimination = GenerateRoundRobinToDoubleElimination.Field()
    generate_swiss_matches = GenerateSwissMatches.Field()
    generate_next_round = GenerateNextRound.Field()
    update_user = UpdateUser.Field()
    update_tournament = UpdateTournament.Field()
    update_team = UpdateTeam.Field()
    update_match = UpdateMatch.Field()
    update_participant = UpdateParticipant.Field()
    update_match_score = UpdateMatchScore.Field()
    delete_user = DeleteUser.Field()
    delete_tournament = DeleteTournament.Field()
    delete_team = DeleteTeam.Field()
    delete_participant = DeleteParticipant.Field()
    delete_match = DeleteMatch.Field()
    delete_matches = DeleteMatches.Field()
    delete_match_participant = DeleteMatchParticipant.Field()
    kick_team = KickTeam.Field()

    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    update_password = UpdatePassword.Field()
    update_name = UpdateName.Field()
    update_phone = UpdatePhone.Field() 
    update_email = UpdateEmail.Field() 