import graphene

from ..models import User, Tournament, Participant, Team, Match, MatchParticipant
from graphql_jwt.decorators import login_required
from django.contrib.auth import authenticate
from .types import *


class DeleteUser(graphene.Mutation):
    class Arguments:
        password = graphene.String(required=True)
        uuid = graphene.String(required=True)

    success = graphene.Boolean()

    def mutate(root, info, password, uuid):
        try:
            # Get the user by UUID directly without checking the current logged-in user
            user_to_delete = User.objects.get(uuid=uuid)
            
            # Authenticate with email and password directly
            authenticated_user = authenticate(email=user_to_delete.email, password=password)
            
            if authenticated_user is None:
                raise Exception("Incorrect password. Please try again.")
                
            # Verify this is the same user
            if str(authenticated_user.uuid) != uuid:
                raise Exception("You can only delete your own account.")
            
            # If authentication is successful, delete the user
            user_to_delete.delete()
            
            return DeleteUser(success=True)
            
        except User.DoesNotExist:
            raise Exception("User not found.")
        except Exception as e:
            raise Exception(str(e))


class DeleteTournament(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
            tournament.delete()
            return DeleteTournament(success=True)
        except Tournament.DoesNotExist:
            raise Exception("Tournament not found.")


class DeleteTeam(graphene.Mutation):
    class Arguments:
        team_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, team_id):
        try:
            team = Team.objects.get(pk=team_id)
            team.delete()
            return DeleteTeam(success=True)
        except Team.DoesNotExist:
            raise Exception("Team not found.")


class DeleteParticipant(graphene.Mutation):
    class Arguments:
        participant_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, participant_id):
        try:
            participant = Participant.objects.get(pk=participant_id)
            participant.delete()
            return DeleteParticipant(success=True)
        except Participant.DoesNotExist:
            raise Exception("Participant not found.")


class DeleteMatch(graphene.Mutation):
    class Arguments:
        match_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, match_id):
        try:
            match = Match.objects.get(pk=match_id)
            match.delete()
            return DeleteMatch(success=True)
        except Match.DoesNotExist:
            raise Exception("Match not found.")


class DeleteMatchParticipant(graphene.Mutation):
    class Arguments:
        match_id = graphene.Int(required=True)
        participant_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, match_id, participant_id):
        try:
            match_participant = MatchParticipant.objects.get(
                match_id=match_id, participant_id=participant_id
            )
            match_participant.delete()
            return DeleteMatchParticipant(success=True)
        except MatchParticipant.DoesNotExist:
            raise Exception("MatchParticipant not found.")


class KickTeam(graphene.Mutation):
    class Arguments:
        team_id = graphene.ID(required=True)
        tournament_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, team_id, tournament_id):
        try:
            # Get the team and tournament
            team = Team.objects.get(pk=team_id)
            tournament = Tournament.objects.get(pk=tournament_id)

            # Check if the team exists in the tournament
            if team.tournament_id.tournament_id != int(tournament_id):
                return KickTeam(success=False, message="Team is not part of this tournament")

            # Find all participants in the team
            participants = Participant.objects.filter(team_id=team_id)
            
            # Before removing the team, we need to remove any match participants
            # to avoid foreign key constraint issues
            match_participants = MatchParticipant.objects.filter(team_id=team_id)
            match_participants.delete()
            
            # Set all participants' team_id to null
            for participant in participants:
                participant.team_id = None
                participant.save()
            
            # Delete the team
            team.delete()
            
            return KickTeam(success=True, message="Team was successfully kicked from the tournament")
        
        except Team.DoesNotExist:
            return KickTeam(success=False, message="Team not found")
        except Tournament.DoesNotExist:
            return KickTeam(success=False, message="Tournament not found")
        except Exception as e:
            return KickTeam(success=False, message=f"Error: {str(e)}")
