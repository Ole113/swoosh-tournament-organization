import graphene
import random

from ..models import User, Tournament, Participant, Team, Match, MatchParticipant
from .types import *
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password


class UpdateUser(graphene.Mutation):
    class Arguments:
        user_id = graphene.ID()
        name = graphene.String(required=False)
        email = graphene.String(required=False)
        phone = graphene.String(required=False)
        password = graphene.String(required=False)
        uuid = graphene.String(required=False)

    user = graphene.Field(UserType)

    def mutate(root, info, user_id, uuid=None, name=None, email=None, phone=None, password=None):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise Exception("The user_id: ", user_id, ", does not exist")

        if uuid:
            user.uuid = uuid
        if name:
            user.name = name
        if email:
            if User.objects.filter(email=email).exclude(pk=user_id).exists():
                raise Exception(
                    "Another user with this email already exists.")

            user.email = email
        if phone:
            user.phone = phone
        if password:
            user.password = password

        user.save()

        return UpdateUser(user=user)


class UpdateTournament(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)
        name = graphene.String(required=False)
        description = graphene.String(required=False)
        start_date = graphene.DateTime(required=False)
        end_date = graphene.DateTime(required=False)
        format = graphene.String(required=False)
        team_size = graphene.Int(required=False)
        max_teams = graphene.Int(required=False)
        show_email = graphene.Boolean(required=False)
        show_phone = graphene.Boolean(required=False)
        invite_link = graphene.String(required=False)
        password = graphene.String(required=False)
        is_private = graphene.Boolean(required=False)

    tournament = graphene.Field(TournamentType)

    def mutate(
        root,
        info,
        tournament_id,
        name=None,
        description=None,
        start_date=None,
        end_date=None,
        format=None,
        team_size=None,
        max_teams=None,
        show_email=None,
        show_phone=None,
        invite_link=None,
        password=None,
        is_private=None,
    ):

        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            raise Exception("Tournament with ID",
                            tournament_id, " does not exist")

        if name:
            tournament.name = name
        if start_date:
            tournament.start_date = start_date
        if end_date:
            tournament.end_date = end_date
        if format:
            tournament.format = format
        if show_email:
            tournament.show_email = show_email
        if show_phone:
            tournament.show_phone = show_phone
        if is_private is not None:
            tournament.is_private = is_private
        if team_size:
            tournament.team_size = team_size
        if max_teams:
            tournament.max_teams = max_teams
        if description:
            tournament.description = description
        if format:
            tournament.format = format
        if team_size:
            tournament.team_size = team_size
        if password:
            tournament.password = password
        if invite_link:
            tournament.invite_link = invite_link

        tournament.save()

        return UpdateTournament(tournament=tournament)


class UpdateTeam(graphene.Mutation):
    class Arguments:
        team_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        record = graphene.String()
        invite_link = graphene.String()
        password = graphene.String()
        is_private = graphene.Boolean(required=True)

    team = graphene.Field(TeamType)

    def mutate(
        root,
        info,
        team_id,
        is_private,
        name=None,
        description=None,
        record=None,
        password=None,
        invite_link=None,
    ):
        try:
            team = Team.objects.get(pk=team_id)
        except Team.DoesNotExist:
            raise Exception("Team with the given ID does not exist.")

        team.is_private = is_private

        if name is not None:
            team.name = name
        if description is not None:
            team.description = description if description != "" else None
        if record is not None:
            team.record = record
        if password is not None:
            team.password = password if password != "" else None
        if invite_link is not None:
            team.invite_link = invite_link if invite_link != "" else None

        team.save()
        return UpdateTeam(team=team)


class UpdateParticipant(graphene.Mutation):
    class Arguments:
        participant_id = graphene.ID(required=True)
        team_id = graphene.Int(required=True)

    participant = graphene.Field(ParticipantType)

    def mutate(root, info, participant_id, team_id):
        try:
            participant = Participant.objects.get(pk=participant_id)
        except Participant.DoesNotExist:
            raise Exception("Participant with the given ID does not exist.")

        participant.team_id = team_id

        participant.save()

        return UpdateParticipant(participant=participant)


class UpdateMatch(graphene.Mutation):
    class Arguments:
        match_id = graphene.ID(required=True)
        start_date = graphene.DateTime(required=False)
        end_date = graphene.DateTime(required=False)
        score1 = graphene.String(required=False)
        score2 = graphene.String(required=False)
        status = graphene.String(required=False)
        court = graphene.String(required=False)
        seed = graphene.String(required=False)

    match = graphene.Field(MatchType)

    def mutate(
        root,
        info,
        match_id,
        start_date=None,
        end_date=None,
        score1=None,
        score2=None,
        status=None,
        court=None,
        seed=None,
    ):
        try:
            match = Match.objects.get(pk=match_id)
        except Match.DoesNotExist:
            raise Exception("Match with the given ID does not exist.")

        if start_date:
            match.start_date = start_date
        if end_date:
            match.end_date = end_date
        if score1:
            match.score1 = score1
        if score2:
            match.score2 = score2
        if status:
            match.status = status
        if court:
            match.court = court
        if seed:
            match.seed = seed

        match.save()

        return UpdateMatch(match=match)


class UpdateMatchScore(graphene.Mutation):
    class Arguments:
        match_id = graphene.ID(required=True)
        score1 = graphene.String(required=True)
        score2 = graphene.String(required=True)
        verified = graphene.Int(required=False)

    success = graphene.Boolean()
    match = graphene.Field(MatchType)

    def mutate(self, info, match_id, score1, score2, verified=None):
        try:
            match = Match.objects.get(pk=match_id)
        except Match.DoesNotExist:
            raise Exception("Match not found.")

        # Add debug information about the teams and scores
        match_participants = MatchParticipant.objects.filter(match_id=match)
        team1 = match_participants.filter(team_number=1).first()
        team2 = match_participants.filter(team_number=2).first()
        
        if team1 and team2:
            print(f"DEBUG - Updating match {match_id} scores:")
            print(f"  Team {team1.team_id.name} (team_number=1) will have score {score1}")
            print(f"  Team {team2.team_id.name} (team_number=2) will have score {score2}")
            # Convert scores to integers for proper comparison
            try:
                score1_int = int(score1) if score1 and score1 != 'N/A' else 0
                score2_int = int(score2) if score2 and score2 != 'N/A' else 0
                if score1_int > score2_int:
                    print(f"  Team {team1.team_id.name} (team_number=1) will be the winner")
                elif score2_int > score1_int:
                    print(f"  Team {team2.team_id.name} (team_number=2) will be the winner")
                else:
                    print("  The match will be a tie")
            except (ValueError, TypeError):
                print("  Invalid scores - cannot determine winner")

        # Update match scores
        match.score1 = score1
        match.score2 = score2
        match.status = "Completed"  # Mark match as completed
        if verified is not None:
            match.verified = verified
        match.save()

        # Update team records based on match results
        if team1 and team2:
            UpdateMatchScore.update_team_records(team1.team_id, team2.team_id, match)

        return UpdateMatchScore(success=True, match=match)
    
    @staticmethod
    def update_team_records(team1, team2, match):
        """Update the records of both teams based on match results"""
        try:
            score1 = int(match.score1) if match.score1 and match.score1 != 'N/A' else 0
            score2 = int(match.score2) if match.score2 and match.score2 != 'N/A' else 0
        except (ValueError, TypeError):
            print("Error parsing scores while updating team records")
            return
        
        # Calculate team records for both teams
        for team in [team1, team2]:
            if team is None:
                print("Warning: Trying to update record for None team - skipping")
                continue
                
            # Get all completed matches for this team
            team_matches = MatchParticipant.objects.filter(
                team_id=team,
                match_id__status="Completed"
            ).select_related('match_id')
            
            # Count wins and losses
            wins = 0
            losses = 0
            ties = 0
            
            for participant in team_matches:
                match = participant.match_id
                team_num = participant.team_number
                
                try:
                    match_score1 = int(match.score1) if match.score1 and match.score1 != 'N/A' else 0
                    match_score2 = int(match.score2) if match.score2 and match.score2 != 'N/A' else 0
                except (ValueError, TypeError):
                    continue
                
                if team_num == 1:
                    if match_score1 > match_score2:
                        wins += 1
                    elif match_score1 < match_score2:
                        losses += 1
                    else:
                        ties += 1
                else:  # team_num == 2
                    if match_score2 > match_score1:
                        wins += 1
                    elif match_score2 < match_score1:
                        losses += 1
                    else:
                        ties += 1
            
            # Update team record
            record_str = f"{wins}-{losses}"
            if ties > 0:
                record_str += f"-{ties}"
            
            team.record = record_str
            team.save()
            
            team_name = getattr(team, 'name', 'Unknown')
            print(f"Updated team {team_name} record to {record_str}")


class GenerateNextRound(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)

            # Check if this is a double elimination tournament or phase 2 of Round Robin to Double Elimination
            is_double_elimination = tournament.format == "Double Elimination"
            
            # Add check for Round Robin to Double Elimination in phase 2
            is_rr_to_de_phase2 = (tournament.format == "Round Robin to Double Elimination" and 
                                hasattr(tournament, 'current_phase') and 
                                tournament.current_phase == 2)

            # Get the highest round number that has matches
            last_round_number = (
                Match.objects.filter(tournament=tournament)
                .order_by("-round")
                .values_list("round", flat=True)
                .first()
            )

            if last_round_number is None:
                return GenerateNextRound(success=False, message="No matches found in this tournament.")

            # Check for completed championship matches first
            championship_matches = Match.objects.filter(
                tournament=tournament, 
                bracket_type="championship",
                status="Completed"
            ).order_by('-round')
            
            if championship_matches.exists():
                last_championship = championship_matches.first()
                
                # Get championship participants
                champ_participants = MatchParticipant.objects.filter(match_id=last_championship)
                if champ_participants.count() < 2:
                    return GenerateNextRound(success=False, message="Cannot determine champion due to incomplete championship match data")
                
                # Get team IDs
                team1_data = champ_participants.filter(team_number=1).first()
                team2_data = champ_participants.filter(team_number=2).first()
                
                if not team1_data or not team2_data:
                    return GenerateNextRound(success=False, message="Missing team data in championship match")
                    
                team1 = team1_data.team_id
                team2 = team2_data.team_id
                
                # Get scores with proper handling of invalid scores
                try:
                    score1 = int(last_championship.score1) if last_championship.score1 and last_championship.score1 != 'N/A' else 0
                    score2 = int(last_championship.score2) if last_championship.score2 and last_championship.score2 != 'N/A' else 0
                except (ValueError, TypeError):
                    return GenerateNextRound(success=False, message="Invalid scores in championship match")
                
                # Determine which team won
                is_team1_winner = False
                is_team2_winner = False
                
                # Special case handling for championship matches with lopsided scores
                if (score1 >= 10 and score2 == 0) or (score2 >= 10 and score1 == 0):
                    # If the score pattern indicates a one-sided match:
                    if score1 >= 10 and score2 == 0:
                        is_team1_winner = True
                        team1_name = getattr(team1, 'name', "Unknown") if team1 else "Unknown"
                        print(f"Championship match: Team 1 ({team1_name}) won with score {score1}-{score2}")
                    else:
                        is_team2_winner = True
                        team2_name = getattr(team2, 'name', "Unknown") if team2 else "Unknown"
                        print(f"Championship match: Team 2 ({team2_name}) won with score {score2}-{score1}")
                else:
                    # Regular score comparison
                    is_team1_winner = score1 > score2
                    is_team2_winner = score2 > score1
                    print(f"Championship match: Winner determined by score comparison {score1}-{score2}")
                
                # We need to determine if this is the first championship match or the true final
                # Count how many championship matches we have before this one
                prior_championship_count = Match.objects.filter(
                    tournament=tournament, 
                    bracket_type="championship",
                    round__lt=last_championship.round
                ).count()
                
                # If this is the first championship match (prior_championship_count == 0)
                if prior_championship_count == 0:
                    # Find out bracket origins for each team
                    # We need to know which is from winners bracket and which is from losers
                    winners_bracket_finals = Match.objects.filter(
                        tournament=tournament,
                        bracket_type="winners",
                        round__gt=1,  # Not first round
                        status="Completed"
                    ).order_by('-round').first()
                    
                    losers_bracket_finals = Match.objects.filter(
                        tournament=tournament,
                        bracket_type="losers",
                        status="Completed"
                    ).order_by('-round').first()
                    
                    if not winners_bracket_finals or not losers_bracket_finals:
                        return GenerateNextRound(success=False, message="Cannot determine bracket origins of teams")
                    
                    # Check if team1 is from winners bracket
                    wb_finals_participants = MatchParticipant.objects.filter(match_id=winners_bracket_finals)
                    wb_team_ids = [p.team_id.team_id for p in wb_finals_participants]
                    
                    # Team is from winners bracket if it participated in winners final
                    team1_is_wb_champion = team1.team_id in wb_team_ids
                    team2_is_wb_champion = team2.team_id in wb_team_ids
                    
                    # But we need to be careful about teams that appear in both brackets
                    # So let's also check the losers bracket final
                    lb_finals_participants = MatchParticipant.objects.filter(match_id=losers_bracket_finals)
                    lb_team_ids = [p.team_id.team_id for p in lb_finals_participants]
                    
                    # If a team appears in both brackets, we need to check which one is more recent
                    if team1.team_id in lb_team_ids and team1.team_id in wb_team_ids:
                        # If the losers final is more recent, team1 is from losers bracket
                        if losers_bracket_finals.round > winners_bracket_finals.round:
                            team1_is_wb_champion = False
                    
                    if team2.team_id in lb_team_ids and team2.team_id in wb_team_ids:
                        # If the losers final is more recent, team2 is from losers bracket
                        if losers_bracket_finals.round > winners_bracket_finals.round:
                            team2_is_wb_champion = False
                    
                    # Now we know which team is from which bracket and who won
                    wb_champion_won = (team1_is_wb_champion and is_team1_winner) or (team2_is_wb_champion and is_team2_winner)
                    lb_champion_won = (not team1_is_wb_champion and is_team1_winner) or (not team2_is_wb_champion and is_team2_winner)
                    
                    print(f"Winners bracket champion won: {wb_champion_won}")
                    print(f"Losers bracket champion won: {lb_champion_won}")
                    
                    # Get the wb and lb champions
                    wb_champion = team1 if team1_is_wb_champion else team2
                    lb_champion = team2 if team1_is_wb_champion else team1
                    
                    # If winners bracket champion won, the tournament is over
                    # because the losers bracket team now has its second loss
                    if wb_champion_won:
                        winning_team = wb_champion
                        winning_team_name = getattr(winning_team, 'name', "Unknown") if winning_team else "Unknown" 
                        tournament_name = getattr(tournament, 'name', "Unknown") if tournament else "Unknown"
                        print(f"Tournament complete: Winners bracket champion {winning_team_name} won")
                        try:
                            return GenerateNextRound(success=True, message=f"Tournament {tournament_name} has a winner: {winning_team_name}")
                        except AttributeError:
                            return GenerateNextRound(success=True, message="Tournament has a winner from the winners bracket")
                    
                    # If losers bracket champion won, create a true final
                    if lb_champion_won:
                        # Create a true final (bracket reset) match
                        next_round = last_championship.round + 1
                        true_final = Match.objects.create(
                            tournament=tournament,
                            start_date=tournament.start_date,
                            end_date=tournament.end_date,
                            status="Scheduled",
                            court="True Final Court",
                            seed=1,
                            round=next_round,
                            score1="0",
                            score2="0",
                            verified=0,
                            bracket_type="championship"
                        )
                        
                        # Both teams keep the same position in the true final
                        for participant in MatchParticipant.objects.filter(match_id=last_championship, team_number=1):
                            MatchParticipant.objects.create(
                                match_id=true_final,
                                participant_id=participant.participant_id,
                                team_number=1,
                                team_id=participant.team_id
                            )
                        
                        for participant in MatchParticipant.objects.filter(match_id=last_championship, team_number=2):
                            MatchParticipant.objects.create(
                                match_id=true_final,
                                participant_id=participant.participant_id,
                                team_number=2,
                                team_id=participant.team_id
                            )
                        
                        return GenerateNextRound(success=True, message=f"Created true final match for Round {next_round}")
                else:
                    # This is the true final match
                    # Track team origins to determine the winner
                    winners_bracket_finals = Match.objects.filter(
                        tournament=tournament,
                        bracket_type="winners",
                        round__gt=1,
                        status="Completed"
                    ).order_by('-round').first()
                    
                    if not winners_bracket_finals:
                        return GenerateNextRound(success=False, message="Cannot determine winner - missing winners bracket data")
                    
                    # Check if team1 is from winners bracket
                    wb_finals_participants = MatchParticipant.objects.filter(match_id=winners_bracket_finals)
                    wb_team_ids = [p.team_id.team_id for p in wb_finals_participants]
                    
                    # Determine which team came from which bracket
                    team1_is_wb_champion = team1.team_id in wb_team_ids
                    team2_is_wb_champion = team2.team_id in wb_team_ids
                    
                    # Get the actual winner based on scores
                    winning_team = team1 if is_team1_winner else team2
                    
                    # Now we can declare a winner with the correct context (which bracket they came from)
                    if (team1_is_wb_champion and is_team1_winner) or (team2_is_wb_champion and is_team2_winner):
                        bracket_origin = "winners"
                    else:
                        bracket_origin = "losers"
                    
                    try:
                        winning_team_name = getattr(winning_team, 'name', "Unknown") if winning_team else "Unknown"
                        tournament_name = getattr(tournament, 'name', "Unknown")
                        return GenerateNextRound(success=True, 
                                              message=f"Tournament {tournament_name} has a winner: {winning_team_name} (from {bracket_origin} bracket)")
                    except AttributeError:
                        return GenerateNextRound(success=True, 
                                              message=f"Tournament has a winner from the {bracket_origin} bracket")

            # Check if all matches in the last round are completed
            remaining_matches = Match.objects.filter(
                tournament=tournament, round=last_round_number
            ).exclude(verified=3).exclude(status="Bye")

            if remaining_matches.exists():
                return GenerateNextRound(success=False, message="Not all matches in the current round are completed yet.")


            # Now that all matches are completed, generate the next round
            if is_double_elimination or is_rr_to_de_phase2:
                success, message = GenerateNextRound.create_next_round_double_elimination(
                    tournament, last_round_number)
            elif tournament.format == "Swiss System":
                success, message = GenerateNextRound.create_next_round_swiss(
                    tournament, last_round_number)
            else:
                success, message = GenerateNextRound.create_next_round_matches(
                    tournament, last_round_number)
                
            return GenerateNextRound(success=success, message=message)

        except Exception as e:
            return GenerateNextRound(success=False, message=f"Error: {str(e)}")

    @staticmethod
    def create_next_round_double_elimination(tournament, current_round):
        """
        Generate the next round of matches for a double elimination tournament.
        Handles both winners bracket and losers bracket progression.
        """
        # Get matches from the current round, separated by bracket type
        winners_matches = Match.objects.filter(
            tournament=tournament,
            round=current_round,
            bracket_type="winners",
            status__in=["Completed", "Bye"]
        ).order_by('seed')

        losers_matches = Match.objects.filter(
            tournament=tournament,
            round=current_round,
            bracket_type="losers",
            status__in=["Completed", "Bye"]
        ).order_by('seed')

        # Debug output to track what's happening in each round
        print(f"Round {current_round}: Processing {winners_matches.count()} winners matches and {losers_matches.count()} losers matches")

        # Check if we have reached the championship point - need exactly one winners finalist team
        # and at least one losers bracket match that we can treat as the losers bracket final
        # In most cases, we should wait until the losers bracket has progressed more
        
        # In a true double elimination tournament:
        # 1. We need to complete all the rounds of the losers bracket
        # 2. We need exactly one finalist from winners bracket
        # 3. We need exactly one finalist from losers bracket
        
        # Count the total teams still in the tournament to know if we're at the championship point
        active_teams_count = (
            MatchParticipant.objects.filter(
                match_id__tournament=tournament,
                match_id__status__in=["Completed", "Bye"]
            ).values('team_id').distinct().count()
        )
        
        # Get winners and losers bracket teams separately
        winners_bracket_teams = MatchParticipant.objects.filter(
            match_id__tournament=tournament,
            match_id__bracket_type="winners",
            match_id__status__in=["Completed", "Bye"]
        ).values('team_id').distinct()
        
        losers_bracket_teams = MatchParticipant.objects.filter(
            match_id__tournament=tournament,
            match_id__bracket_type="losers",
            match_id__status__in=["Completed", "Bye"]
        ).values('team_id').distinct()
        
        # Count losers bracket rounds to ensure we don't create the final too early
        losers_rounds_count = Match.objects.filter(
            tournament=tournament,
            bracket_type="losers"
        ).values('round').distinct().count()
        
        # A championship match should only be created when:
        # 1. We have exactly one winner's bracket finalist
        # 2. We have exactly one losers bracket finalist 
        # 3. The winners bracket has exactly one match in the final round
        # 4. We've had enough losers bracket rounds - approximately log2(n)-1 for n teams
        winners_final_complete = winners_matches.count() == 1 and current_round > 1
        
        # Check if the winners bracket has concluded (has exactly one champion)
        winners_bracket_concluded = False
        winners_bracket_champion = None
        
        # Find the most recent winners bracket match
        latest_winners_round = Match.objects.filter(
            tournament=tournament,
            bracket_type="winners"
        ).order_by('-round').values('round').first()
        
        if latest_winners_round:
            latest_round_number = latest_winners_round['round']
            latest_winners_matches = Match.objects.filter(
                tournament=tournament,
                bracket_type="winners",
                round=latest_round_number
            )
            
            # If there's exactly one match in the latest winners round and it's completed or a bye
            if latest_winners_matches.count() == 1 and latest_winners_matches.first().status in ["Completed", "Bye"]:
                winners_bracket_concluded = True
                
                # Identify the champion
                last_match = latest_winners_matches.first()
                if last_match.status == "Bye":
                    # If it's a bye, the lone participant is the champion
                    champion_participant = MatchParticipant.objects.filter(match_id=last_match).first()
                    if champion_participant:
                        winners_bracket_champion = champion_participant.team_id
                else:
                    # Determine winner from completed match
                    participants = MatchParticipant.objects.filter(match_id=last_match)
                    if participants.count() == 2:
                        team1 = participants.filter(team_number=1).first().team_id
                        team2 = participants.filter(team_number=2).first().team_id
                        
                        try:
                            score1 = int(last_match.score1) if last_match.score1 and last_match.score1 != 'N/A' else 0
                            score2 = int(last_match.score2) if last_match.score2 and last_match.score2 != 'N/A' else 0
                            
                            if score1 > score2:
                                winners_bracket_champion = team1
                            elif score2 > score1:
                                winners_bracket_champion = team2
                        except (ValueError, TypeError):
                            winners_bracket_concluded = False
        
        # Check if this appears to be the last losers bracket match
        # by examining if we've had enough rounds of losers bracket play
        total_teams = Team.objects.filter(tournament_id=tournament).count()
        estimated_losers_rounds = max(1, int(total_teams / 2))  # Approximate number of losers rounds needed
        losers_bracket_nearly_complete = losers_rounds_count >= estimated_losers_rounds - 1
        
        # In a true double elimination, we need to handle the losers bracket final
        # which includes the loser from the winners final
        if winners_final_complete and losers_matches.count() == 1 and losers_bracket_nearly_complete:
            # Get all losers bracket matches in all rounds
            all_losers_matches = Match.objects.filter(
                tournament=tournament,
                bracket_type="losers",
            ).count()
            
            # Special case for championship - check if we're ready for championship match:
            # 1. We have a single losers match in this round (the losers final)
            # 2. We have at least a reasonable number of losers matches total
            # 3. This means we've completed the losers bracket progression properly
            if losers_matches.count() == 1 and all_losers_matches >= max(2, estimated_losers_rounds - 1):
                # If we have a single losers match in this round, and it's after sufficient
                # losers rounds, we're likely at the losers final and ready for championship
                
                # Check if the losers match is completed
                losers_final = losers_matches.first()
                if losers_final.status == "Completed" or losers_final.status == "Bye":
                    # Debug logging to understand the logic flow
                    print(f"Creating championship match. Winners final: {winners_matches.first().match_id}, Losers final: {losers_final.match_id}")
                    
                return GenerateNextRound.create_championship_match(
                    tournament,
                    current_round,
                        winners_matches.first(), 
                    losers_final
                )
                # If the losers final isn't completed yet, we don't want to create a championship match
            
            # If we have a completed winners final but we're not ready for championship,
            # we need to create a regular losers bracket final with the loser from winners final
            winners_final_match = winners_matches.first()
            
            # We need to create the losers final that includes the loser from winners final
            winners_participants = MatchParticipant.objects.filter(match_id=winners_final_match)
            if winners_participants.count() < 2:
                return False, "Cannot determine winners from incomplete winners final"
            
            # Determine winner and loser from winners final
            team1_data = winners_participants.filter(team_number=1).first()
            team2_data = winners_participants.filter(team_number=2).first()
            
            if not team1_data or not team2_data:
                return False, "Missing team data in winners final"
                
            team1 = team1_data.team_id
            team2 = team2_data.team_id
            
            # Get scores with proper handling of invalid scores
            try:
                score1 = int(winners_final_match.score1) if winners_final_match.score1 and winners_final_match.score1 != 'N/A' else 0
                score2 = int(winners_final_match.score2) if winners_final_match.score2 and winners_final_match.score2 != 'N/A' else 0
            except (ValueError, TypeError):
                return False, "Invalid scores in winners final"
            
            # Only advance if there's a clear winner (no ties)
            if score1 > score2:
                winners_winner = team1
                winners_loser = team2
            elif score2 > score1:
                winners_winner = team2
                winners_loser = team1
            else:
                return False, "Cannot determine winners bracket champion due to tied score"
            
            # Process winners from losers bracket matches
            losers_winner = None
            if losers_matches:
                losers_match = losers_matches.first()
                losers_participants = MatchParticipant.objects.filter(match_id=losers_match)
                
                if losers_participants.count() < 2 and losers_match.status != "Bye":
                    return False, "Cannot determine winner from incomplete losers match"
                
                if losers_match.status == "Bye":
                    losers_winner = losers_participants.first().team_id
                else:
                    # Determine winner from losers match
                    team1_data = losers_participants.filter(team_number=1).first()
                    team2_data = losers_participants.filter(team_number=2).first()
                    
                    if not team1_data or not team2_data:
                        return False, "Missing team data in losers match"
                        
                    team1 = team1_data.team_id
                    team2 = team2_data.team_id
                    
                    # Get scores with proper handling of invalid scores
                    try:
                        score1 = int(losers_match.score1) if losers_match.score1 and losers_match.score1 != 'N/A' else 0
                        score2 = int(losers_match.score2) if losers_match.score2 and losers_match.score2 != 'N/A' else 0
                    except (ValueError, TypeError):
                        return False, "Invalid scores in losers match"
                    
                    # Only advance if there's a clear winner (no ties)
                    if score1 > score2:
                        losers_winner = team1
                    elif score2 > score1:
                        losers_winner = team2
                    else:
                        return False, "Cannot determine losers bracket winner due to tied score"
            
            if not losers_winner:
                return False, "Cannot determine losers bracket winner"
            
            # Create losers final match between winners loser and losers winner
            next_round = current_round + 1
            losers_final = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Scheduled",
                court="Losers Final Court",
                seed=1,
                round=next_round,
                score1="0",
                score2="0",
                bracket_type="losers"
            )
            
            # Add winner from losers bracket match as team 1
            losers_winner_participants = Participant.objects.filter(team_id=losers_winner)
            if losers_winner_participants.exists():
                MatchParticipant.objects.create(
                    match_id=losers_final,
                    participant_id=losers_winner_participants.first(),
                    team_number=1,
                    team_id=losers_winner
                )
            else:
                return False, "Cannot find participants for losers bracket winner"
            
            # Add loser from winners final as team 2
            winners_loser_participants = Participant.objects.filter(team_id=winners_loser)
            if winners_loser_participants.exists():
                MatchParticipant.objects.create(
                    match_id=losers_final,
                    participant_id=winners_loser_participants.first(),
                    team_number=2,
                    team_id=winners_loser
                )
            else:
                return False, "Cannot find participants for winners bracket loser"
            
            return True, f"Created losers final match for Round {next_round}"
        
        next_round = current_round + 1
        advancing_winners = []
        advancing_losers = []
        new_losers = []  # Teams that lost in the winners bracket this round
        matches_created = 0
        
        # Process winners bracket matches
        for match in winners_matches:
                if match.status == "Bye":
                # Team with bye advances in winners bracket
                    bye_participant = MatchParticipant.objects.filter(match_id=match).first()
                    if bye_participant:
                        advancing_winners.append({
                            'team': bye_participant.team_id,
                            'source_seed': match.seed,
                            'is_bye_winner': True
                        })
                else:
                # Regular match - determine winner and loser
                    participants = MatchParticipant.objects.filter(match_id=match)
                    if participants.count() < 2:
                        print(f"Skipping match {match.match_id} - not enough participants")
                        continue  # Skip invalid matches
                    
                    # Get team IDs for the two teams
                    team1_data = participants.filter(team_number=1).first()
                    team2_data = participants.filter(team_number=2).first()
                    
                    if not team1_data or not team2_data:
                        print(f"Skipping match {match.match_id} - missing team data")
                        continue  # Skip if missing team data
                        
                    team1 = team1_data.team_id
                    team2 = team2_data.team_id
                    
                    print(f"Processing winners match between {team1.name} and {team2.name}")
                    
                # Get scores with proper handling of invalid scores
                    try:
                        score1 = int(match.score1) if match.score1 and match.score1 != 'N/A' else 0
                        score2 = int(match.score2) if match.score2 and match.score2 != 'N/A' else 0
                        print(f"Scores: {team1.name}={score1}, {team2.name}={score2}")
                    except (ValueError, TypeError):
                        # If scores can't be converted to integers, treat as incomplete
                        print(f"Invalid scores for match {match.match_id}: {match.score1}-{match.score2}")
                        continue
                    
                # Only advance if there's a clear winner (no ties)
                    if score1 > score2:
                        winner_team = team1
                        loser_team = team2
                        print(f"{team1.name} won, {team2.name} to losers bracket")
                    elif score2 > score1:
                        winner_team = team2
                        loser_team = team1
                        print(f"{team2.name} won, {team1.name} to losers bracket")
                    else:
                    # Tie or incomplete match - skip this match
                        print(f"Skipping match {match.match_id} due to tie")
                        continue
                    
                # Winner advances in winners bracket
                    advancing_winners.append({
                        'team': winner_team,
                        'source_seed': match.seed,
                        'is_bye_winner': False
                    })
                    
                # Every loser from winners bracket goes to losers bracket
                # (this ensures every team gets a chance to lose twice)
                    new_losers.append({
                        'team': loser_team,
                        'source_seed': match.seed,
                        'round_eliminated': current_round
                    })

        print(f"Winners advancing: {len(advancing_winners)}, New losers: {len(new_losers)}")

        # Process losers bracket matches
        for match in losers_matches:
            if match.status == "Bye":
                # Team with bye advances in losers bracket
                bye_participant = MatchParticipant.objects.filter(match_id=match).first()
                if bye_participant and bye_participant.team_id:
                    team_name = getattr(bye_participant.team_id, 'name', "Unknown") if bye_participant.team_id else "Unknown"
                    print(f"{team_name} advances in losers bracket with a bye")
                    advancing_losers.append({
                        'team': bye_participant.team_id,
                        'source_seed': match.seed,
                        'is_bye_winner': True
                    })
            else:
                # Regular match - only winner advances, loser is eliminated
                participants = MatchParticipant.objects.filter(match_id=match)
                if participants.count() < 2:
                    print(f"Skipping losers match {match.match_id} - not enough participants")
                    continue  # Skip invalid matches

                # Get team IDs for the two teams
                team1_data = participants.filter(team_number=1).first()
                team2_data = participants.filter(team_number=2).first()
                
                if not team1_data or not team2_data:
                    print(f"Skipping losers match {match.match_id} - missing team data")
                    continue  # Skip if missing team data
                    
                team1 = team1_data.team_id
                team2 = team2_data.team_id
                
                print(f"Processing losers match between {team1.name} and {team2.name}")
                
                # Get scores with proper handling of invalid scores
                try:
                    score1 = int(match.score1) if match.score1 and match.score1 != 'N/A' else 0
                    score2 = int(match.score2) if match.score2 and match.score2 != 'N/A' else 0
                    print(f"Scores: {team1.name}={score1}, {team2.name}={score2}")
                except (ValueError, TypeError):
                    # If scores can't be converted to integers, treat as incomplete
                    print(f"Invalid scores for losers match {match.match_id}: {match.score1}-{match.score2}")
                    continue
                
                # Only advance if there's a clear winner (no ties)
                if score1 > score2:
                    winner_team = team1
                    print(f"{team1.name} advances in losers bracket, {team2.name} eliminated")
                elif score2 > score1:
                    winner_team = team2
                    print(f"{team2.name} advances in losers bracket, {team1.name} eliminated")
                else:
                    # Tie or incomplete match - skip this match
                    print(f"Skipping losers match {match.match_id} due to tie")
                    continue
                
                # Winner advances in losers bracket
                advancing_losers.append({
                    'team': winner_team,
                    'source_seed': match.seed,
                    'is_bye_winner': False
                })

        print(f"Losers advancing: {len(advancing_losers)}")
        
        # Verify we have valid teams advancing
        if not advancing_winners and not advancing_losers and not new_losers:
            # Check if this could be the final losers bracket match that should lead to championship
            if losers_matches.count() == 1 and losers_matches.first().status == "Completed":
                # Instead of expecting winners final in the same round, find the most recent completed one
                winners_final = Match.objects.filter(
                    tournament=tournament, 
                    bracket_type="winners",
                    status="Completed"
                ).order_by('-round').first()
                
                if winners_final:
                    # We have a winners champion and a losers champion ready for championship
                    print(f"Creating championship match with winners final from round {winners_final.round} and losers final from round {current_round}")
                    return GenerateNextRound.create_championship_match(
                        tournament,
                        current_round,
                        winners_final,
                        losers_matches.first()
                    )
            
            return False, "No teams advancing to next round. Ensure matches have clear winners."
        
        # Check separately if we need to create a championship match based on having completed finals
        # We should create a championship match if:
        # 1. We have a completed losers bracket final (exactly one losers match in current round)
        # 2. We have a completed winners bracket final (may be from an earlier round)
        if losers_matches.count() == 1 and losers_matches.first().status == "Completed" and losers_bracket_nearly_complete:
            losers_final = losers_matches.first()
            winners_final = Match.objects.filter(
                tournament=tournament, 
                bracket_type="winners",
                status="Completed"
            ).order_by('-round').first()
            
            if winners_final:
                # Both bracket finals are complete - create championship match
                print(f"Creating championship match from final check with winners final from round {winners_final.round}")
                return GenerateNextRound.create_championship_match(
                    tournament,
                    current_round,
                    winners_final,
                    losers_final
                )

        # Create matches for the next round
        # For winners bracket, use proper pairing logic
        if advancing_winners:
            # If winners bracket has concluded but losers bracket hasn't, don't create more winners bracket matches
            if winners_bracket_concluded and winners_bracket_champion:
                champion_name = getattr(winners_bracket_champion, 'name', "Unknown") if winners_bracket_champion else "Unknown"
                print(f"Winners bracket has concluded with champion {champion_name} - waiting for losers bracket")
                # Don't create any new bye matches for the winners bracket champion
                # Just let the losers bracket continue
            else:
                print(f"Creating winners bracket for round {next_round} with {len(advancing_winners)} teams")
                # Create the next round of matches in the winners bracket
                matches_created += GenerateNextRound.create_bracket_matches(
                    tournament,
                    next_round,
                    advancing_winners,
                    "winners", 
                    start_seed=1
                )
        
        # For losers bracket, we need to handle both advancing losers and new losers from winners bracket
        if advancing_losers or new_losers:
            # Regular losers bracket progression continues if we didn't create a championship match
            # Handle new losers first - they enter the losers bracket
            if new_losers:
                # Sort new losers by their original seeds for proper pairing
                new_losers.sort(key=lambda x: x.get('source_seed', 999))
                
                # If we have both advancing losers and new losers, pair them appropriately
                if advancing_losers:
                    # Sort advancing losers for pairing
                    advancing_losers.sort(key=lambda x: x['source_seed'])
                
                    # Create matches between advancing losers and new losers
                    # This follows standard double elimination format where new losers face
                    # advancing losers from the previous round
                    all_losers = []
                    
                    # Proper pairing for losers bracket requires us to pair teams carefully
                    # For standard double elimination, we need to keep track of which round teams are eliminated
                    # and ensure they're paired according to the standard bracket pattern
                    
                    # First, add special flag for new losers to distinguish them from advancing losers
                    for loser in new_losers:
                        loser['is_new_loser'] = True
                        
                    # Now combine all losers in a way that follows standard double elimination pattern
                    # Different strategies based on which round we're in
                    if next_round == 2:  # First losers round
                        # In the first losers round, we simply pair the losers from the first winners round
                        all_losers = new_losers
                    else:
                        # In later rounds, we need to interleave new losers with advancing losers
                        # in a pattern that matches standard double elimination
                        
                        # Fix: Always include both new_losers and advancing_losers
                        # In standard double elim, if a team loses in round n of winners bracket,
                        # they enter round 2n-1 of losers bracket
                        all_losers = new_losers + advancing_losers
                
                    print(f"Creating losers bracket for round {next_round} with {len(all_losers)} teams (mixed)")
                    for team in all_losers:
                        team_name = team['team'].name if hasattr(team['team'], 'name') else "Unknown"
                        is_new = team.get('is_new_loser', False)
                        print(f"  Team {team_name} {'(new loser)' if is_new else '(advancing)'}")
                
                    matches_created += GenerateNextRound.create_bracket_matches(
                        tournament,
                        next_round,
                        all_losers, 
                        "losers", 
                        start_seed=len(advancing_winners) + 1
                    )
                else:
                    # If only new losers, pair them against each other
                    print(f"Creating losers bracket for round {next_round} with {len(new_losers)} teams (new losers only)")
                    for team in new_losers:
                        print(f"  Team {team['team'].name} (new loser)")
                    
                    matches_created += GenerateNextRound.create_bracket_matches(
                        tournament,
                        next_round,
                        new_losers, 
                        "losers", 
                        start_seed=len(advancing_winners) + 1
                    )
            elif advancing_losers:
                # If only advancing losers, pair them against each other
                print(f"Creating losers bracket for round {next_round} with {len(advancing_losers)} teams (advancing losers only)")
                for team in advancing_losers:
                    print(f"  Team {team['team'].name} (advancing in losers bracket)")
                
                matches_created += GenerateNextRound.create_bracket_matches(
                    tournament,
                    next_round,
                    advancing_losers, 
                    "losers", 
                    start_seed=len(advancing_winners) + 1
                )
        else:
            print("No teams available for losers bracket")
        
        # Check if both winners and losers brackets have concluded but no championship match was created
        if matches_created == 0 and winners_bracket_concluded:
            # Check if the losers bracket has also concluded
            losers_bracket_concluded = False
            losers_bracket_champion = None
            
            # Find the most recent losers bracket match
            latest_losers_round = Match.objects.filter(
                tournament=tournament,
                bracket_type="losers"
            ).order_by('-round').values('round').first()
            
            if latest_losers_round:
                latest_round_number = latest_losers_round['round']
                latest_losers_matches = Match.objects.filter(
                    tournament=tournament,
                    bracket_type="losers",
                    round=latest_round_number
                )
                
                # If there's exactly one match in the latest losers round and it's completed or a bye
                if latest_losers_matches.count() == 1 and latest_losers_matches.first().status == "Completed":
                    losers_bracket_concluded = True
                    
                    # Identify the champion
                    last_match = latest_losers_matches.first()
                    participants = MatchParticipant.objects.filter(match_id=last_match)
                    
                    if participants.count() == 2:
                        team1 = participants.filter(team_number=1).first().team_id
                        team2 = participants.filter(team_number=2).first().team_id
                        
                        try:
                            score1 = int(last_match.score1) if last_match.score1 and last_match.score1 != 'N/A' else 0
                            score2 = int(last_match.score2) if last_match.score2 and last_match.score2 != 'N/A' else 0
                            
                            if score1 > score2:
                                losers_bracket_champion = team1
                            elif score2 > score1:
                                losers_bracket_champion = team2
                        except (ValueError, TypeError):
                            losers_bracket_concluded = False
            
            # If both brackets have concluded, create the championship match
            if losers_bracket_concluded and losers_bracket_champion and winners_bracket_champion:
                winners_name = getattr(winners_bracket_champion, 'name', "Unknown") if winners_bracket_champion else "Unknown"
                losers_name = getattr(losers_bracket_champion, 'name', "Unknown") if losers_bracket_champion else "Unknown"
                print(f"Both brackets concluded. Creating championship match between {winners_name} and {losers_name}")
                
                # Create the championship match
                championship_match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Scheduled",
                    court="Championship Court",
                    seed=1,
                    round=current_round + 1,
                    score1="0",
                    score2="0",
                    bracket_type="championship"
                )
                
                # Add winners bracket champion as team 1
                wb_participants = Participant.objects.filter(team_id=winners_bracket_champion)
                if wb_participants.exists():
                    MatchParticipant.objects.create(
                        match_id=championship_match,
                        participant_id=wb_participants.first(),
                        team_number=1,
                        team_id=winners_bracket_champion
                    )
                
                # Add losers bracket champion as team 2
                lb_participants = Participant.objects.filter(team_id=losers_bracket_champion)
                if lb_participants.exists():
                    MatchParticipant.objects.create(
                        match_id=championship_match,
                        participant_id=lb_participants.first(),
                        team_number=2,
                        team_id=losers_bracket_champion
                    )
                
                return True, f"Created championship match between {winners_name} and {losers_name}"
            else:
                # Only winners bracket has concluded but not losers bracket
                champion_name = getattr(winners_bracket_champion, 'name', "Unknown") if winners_bracket_champion else "Unknown"
                return False, f"Waiting for losers bracket to conclude. {champion_name} is the winners bracket champion."
        
        return True, f"Generated {matches_created} matches for Round {next_round} in Double Elimination tournament"

    @staticmethod
    def create_championship_match(tournament, current_round, winners_bracket_final, losers_bracket_final):
        """Create the championship match between winners bracket and losers bracket champions"""
        
        # Check if we already have championship matches
        championship_matches = Match.objects.filter(
            tournament=tournament, 
            bracket_type="championship"
        )
        
        if championship_matches.exists():
            # If championship matches already exist, we're creating a true final match
            # This happens when the losers bracket winner defeats the winners bracket winner
            # in the first championship match
            
            # Get the most recent championship match
            last_championship = championship_matches.order_by('-round').first()
            
            # Only process if the last championship match is complete
            if last_championship.status == "Completed":
                # Additional debug info about the championship match
                print(f"DEBUG - Championship Match {last_championship.match_id}, Score: {last_championship.score1}-{last_championship.score2}")
                champ_participants = MatchParticipant.objects.filter(match_id=last_championship)
                for p in champ_participants:
                    print(f"DEBUG - Participant Team {p.team_id.name} has team_number={p.team_number}")
                
                # Get the losers bracket champion
                losers_participants = MatchParticipant.objects.filter(match_id=losers_bracket_final)
                
                if losers_participants.count() < 2 and losers_bracket_final.status != "Bye":
                    return False, "Cannot determine losers bracket champion due to incomplete data"
                
                # If it's a bye match, the lone participant is the champion
                if losers_bracket_final.status == "Bye":
                    lb_champion = losers_participants.first().team_id
                    lb_champion_name = getattr(lb_champion, 'name', "Unknown") if lb_champion else "Unknown"
                    print(f"DEBUG - Losers bracket champion is {lb_champion_name} (bye)")
                else:
                    # Get team IDs for the two teams in losers final
                    team1_data = losers_participants.filter(team_number=1).first()
                    team2_data = losers_participants.filter(team_number=2).first()
                    
                    if not team1_data or not team2_data:
                        return False, "Missing team data in losers bracket final"
                        
                    team1 = team1_data.team_id
                    team2 = team2_data.team_id
                    
                    # Get scores with proper handling of invalid scores
                    try:
                        score1 = int(losers_bracket_final.score1) if losers_bracket_final.score1 and losers_bracket_final.score1 != 'N/A' else 0
                        score2 = int(losers_bracket_final.score2) if losers_bracket_final.score2 and losers_bracket_final.score2 != 'N/A' else 0
                    except (ValueError, TypeError):
                        return False, "Invalid scores in losers bracket final"
                    
                    # In our model, score1 is ALWAYS tied to team_number=1, and score2 is ALWAYS tied to team_number=2
                    # Determine losers bracket champion (no ties allowed)
                    team1_name = getattr(team1, 'name', "Unknown") if team1 else "Unknown"
                    team2_name = getattr(team2, 'name', "Unknown") if team2 else "Unknown"
                    print(f"DEBUG - Determining losers champion: Team {team1_name} (team_number=1, score={score1}) vs Team {team2_name} (team_number=2, score={score2})")
                    
                    if score1 > score2:
                        # Team with team_number=1 won
                        lb_champion = team1
                        print(f"DEBUG - Losers bracket champion is {team1_name} (team_number=1) with score {score1}-{score2}")
                    elif score2 > score1:
                        # Team with team_number=2 won
                        lb_champion = team2
                        print(f"DEBUG - Losers bracket champion is {team2_name} (team_number=2) with score {score1}-{score2}")
                    else:
                        # If there's a tie, we can't determine a winner
                        return False, "Cannot determine losers bracket champion due to tied score"
                
                # Verify the two champions are different teams
                if winners_bracket_final.team_id.pk == lb_champion.pk:
                    return False, "Cannot create championship match - same team won both brackets"
                
                # Create the championship match (winners bracket champion vs losers bracket champion)
                next_round = current_round + 1
                championship_match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Scheduled",
                    court="Championship Court",
                    seed=1,
                    round=next_round,
                    score1="0",
                    score2="0",
                    bracket_type="championship"
                )
                
                # Winners bracket champion is always team 1
                wb_participants = Participant.objects.filter(team_id=winners_bracket_final.team_id)
                if wb_participants.exists():
                    MatchParticipant.objects.create(
                        match_id=championship_match,
                        participant_id=wb_participants.first(),
                        team_number=1,
                        team_id=winners_bracket_final.team_id
                    )
                else:
                    return False, "Cannot find participants for winners bracket champion"
                
                # Losers bracket champion is always team 2
                lb_participants = Participant.objects.filter(team_id=lb_champion)
                if lb_participants.exists():
                    MatchParticipant.objects.create(
                        match_id=championship_match,
                        participant_id=lb_participants.first(),
                        team_number=2,
                        team_id=lb_champion
                    )
                else:
                    return False, "Cannot find participants for losers bracket champion"
                
                return True, f"Created championship match for Round {next_round}"
            else:
                return False, "Championship match is not completed yet"
        
        # If we're here, we're creating the first championship match
        
        # Additional debug info about the winners bracket match
        print(f"DEBUG - Winners Bracket Final {winners_bracket_final.match_id}, Score: {winners_bracket_final.score1}-{winners_bracket_final.score2}")
        winners_participants = MatchParticipant.objects.filter(match_id=winners_bracket_final)
        for p in winners_participants:
            if p and p.team_id:
                team_name = getattr(p.team_id, 'name', "Unknown")
                print(f"DEBUG - Participant Team {team_name} has team_number={p.team_number}")
            
        # Get the winners bracket champion
        if winners_participants.count() < 2:
            return False, "Cannot determine winners bracket champion due to incomplete data"
        
        # Get team IDs for the two teams in winners final
        team1_data = winners_participants.filter(team_number=1).first()
        team2_data = winners_participants.filter(team_number=2).first()
        
        if not team1_data or not team2_data:
            return False, "Missing team data in winners bracket final"
            
        team1 = team1_data.team_id
        team2 = team2_data.team_id
        
        # Get scores with proper handling of invalid scores
        try:
            score1 = int(winners_bracket_final.score1) if winners_bracket_final.score1 and winners_bracket_final.score1 != 'N/A' else 0
            score2 = int(winners_bracket_final.score2) if winners_bracket_final.score2 and winners_bracket_final.score2 != 'N/A' else 0
        except (ValueError, TypeError):
            return False, "Invalid scores in winners bracket final"
        
        # In our model, score1 is ALWAYS tied to team_number=1, and score2 is ALWAYS tied to team_number=2
        # Determine winners bracket champion (no ties allowed)
        if score1 > score2:
            # Team with team_number=1 won
            wb_champion = team1
            print(f"DEBUG - Winners bracket champion is {team1.name} (team_number=1) with score {score1}-{score2}")
        elif score2 > score1:
            # Team with team_number=2 won
            wb_champion = team2
            print(f"DEBUG - Winners bracket champion is {team2.name} (team_number=2) with score {score1}-{score2}")
        else:
            # If there's a tie, we can't determine a winner
            return False, "Cannot determine winners bracket champion due to tied score"
        
        # Additional debug info about the losers bracket match
        print(f"DEBUG - Losers Bracket Final {losers_bracket_final.match_id}, Score: {losers_bracket_final.score1}-{losers_bracket_final.score2}")
        losers_participants = MatchParticipant.objects.filter(match_id=losers_bracket_final)
        for p in losers_participants:
            if p and p.team_id:
                team_name = getattr(p.team_id, 'name', "Unknown")
                print(f"DEBUG - Participant Team {team_name} has team_number={p.team_number}")
            
        # Get the losers bracket champion
        if losers_participants.count() < 2 and losers_bracket_final.status != "Bye":
            return False, "Cannot determine losers bracket champion due to incomplete data"
        
        # If it's a bye match, the lone participant is the champion
        if losers_bracket_final.status == "Bye":
            lb_champion = losers_participants.first().team_id
            lb_champion_name = getattr(lb_champion, 'name', "Unknown") if lb_champion else "Unknown"
            print(f"DEBUG - Losers bracket champion is {lb_champion_name} (bye)")
        else:
            # Get team IDs for the two teams in losers final
            team1_data = losers_participants.filter(team_number=1).first()
            team2_data = losers_participants.filter(team_number=2).first()
            
            if not team1_data or not team2_data:
                return False, "Missing team data in losers bracket final"
                
            team1 = team1_data.team_id
            team2 = team2_data.team_id
            
            # Get scores with proper handling of invalid scores
            try:
                score1 = int(losers_bracket_final.score1) if losers_bracket_final.score1 and losers_bracket_final.score1 != 'N/A' else 0
                score2 = int(losers_bracket_final.score2) if losers_bracket_final.score2 and losers_bracket_final.score2 != 'N/A' else 0
            except (ValueError, TypeError):
                return False, "Invalid scores in losers bracket final"
            
            # In our model, score1 is ALWAYS tied to team_number=1, and score2 is ALWAYS tied to team_number=2
            # Determine losers bracket champion (no ties allowed)
            team1_name = getattr(team1, 'name', "Unknown") if team1 else "Unknown"
            team2_name = getattr(team2, 'name', "Unknown") if team2 else "Unknown"
            print(f"DEBUG - Determining losers champion: Team {team1_name} (team_number=1, score={score1}) vs Team {team2_name} (team_number=2, score={score2})")
            
            if score1 > score2:
                # Team with team_number=1 won
                lb_champion = team1
                print(f"DEBUG - Losers bracket champion is {team1_name} (team_number=1) with score {score1}-{score2}")
            elif score2 > score1:
                # Team with team_number=2 won
                lb_champion = team2
                print(f"DEBUG - Losers bracket champion is {team2_name} (team_number=2) with score {score1}-{score2}")
            else:
                # If there's a tie, we can't determine a winner
                return False, "Cannot determine losers bracket champion due to tied score"
        
        # Verify the two champions are different teams
        if wb_champion.pk == lb_champion.pk:
            return False, "Cannot create championship match - same team won both brackets"
        
        # Create the championship match (winners bracket champion vs losers bracket champion)
        next_round = current_round + 1
        championship_match = Match.objects.create(
            tournament=tournament,
            start_date=tournament.start_date,
            end_date=tournament.end_date,
            status="Scheduled",
            court="Championship Court",
            seed=1,
            round=next_round,
            score1="0",
            score2="0",
            bracket_type="championship"
        )
        
        # Winners bracket champion is always team 1
        wb_participants = Participant.objects.filter(team_id=wb_champion)
        if wb_participants.exists():
            MatchParticipant.objects.create(
                match_id=championship_match,
                participant_id=wb_participants.first(),
                team_number=1,
                team_id=wb_champion
            )
        else:
            return False, "Cannot find participants for winners bracket champion"
        
        # Losers bracket champion is always team 2
        lb_participants = Participant.objects.filter(team_id=lb_champion)
        if lb_participants.exists():
            MatchParticipant.objects.create(
                match_id=championship_match,
                participant_id=lb_participants.first(),
                team_number=2,
                team_id=lb_champion
            )
        else:
            return False, "Cannot find participants for losers bracket champion"
        
        return True, f"Created championship match for Round {next_round}"

    @staticmethod
    def create_bracket_matches(tournament, round_number, teams, bracket_type, start_seed=1):
        """
        Creates matches for any bracket type based on provided teams.
        Teams should be provided in order, and will be paired 1 vs 2, 3 vs 4, etc.
        For losers bracket, the pairing follows the standard double elimination pattern.
        """
        if len(teams) < 1:
            print(f"No teams provided for {bracket_type} bracket in round {round_number}")
            return 0  # No teams, no matches to create
        
        # Special case: In losers bracket, if there's only one team and it's the final losers round,
        # we should NOT create a bye match as this team should go directly to the championship
        if bracket_type == "losers" and len(teams) == 1:
            # First check if this is likely the losers final (at least one match already exists in this bracket)
            existing_losers_matches = Match.objects.filter(
                tournament=tournament,
                bracket_type="losers"
            ).count()
            
            if existing_losers_matches > 0:
                # Also check that the winners bracket is ready for championship (has a completed final)
                winners_final_exists = Match.objects.filter(
                    tournament=tournament,
                    bracket_type="winners",
                    status="Completed"
                ).count() > 0
                
                if winners_final_exists:
                    print(f"Single team in losers bracket with winners final complete - ready for championship")
                    # Don't create a bye match, as this team should go to the championship match
                    # which will be created separately by the create_championship_match method
                    return 0
        
        matches_created = 0
        paired_teams = []
        
        # For losers bracket, we need to follow the standard double elimination pattern
        if bracket_type == "losers":
            print(f"Creating losers bracket matches for round {round_number} with {len(teams)} teams")
            
            # Check if we have teams coming from winners bracket (new losers)
            new_losers = [t for t in teams if t.get('is_new_loser', False) or t.get('round_eliminated')]
            advancing_losers = [t for t in teams if not t.get('is_new_loser', False) and not t.get('round_eliminated')]
            
            # Check for teams that have had recent byes - we need to avoid giving them byes again
            teams_with_recent_byes_ids = set()
            if round_number > 1:
                teams_with_recent_byes_ids = set(MatchParticipant.objects.filter(
                    match_id__tournament=tournament,
                    match_id__status="Bye",
                    match_id__bracket_type="losers",
                    match_id__round__in=[round_number - 1, round_number - 2]  # Check last two rounds
                ).values_list('team_id__team_id', flat=True).distinct())
                
                print(f"In create_next_round_double_elimination: Found {len(teams_with_recent_byes_ids)} teams with recent byes")
                
                # Print team IDs with recent byes for debugging
                if teams_with_recent_byes_ids:
                    print(f"Team IDs with recent byes: {teams_with_recent_byes_ids}")
                
                # Tag teams with previous byes for special handling
                for team in advancing_losers:
                    if team['team'].team_id in teams_with_recent_byes_ids:
                        team['had_recent_bye'] = True
                        print(f"Team {getattr(team['team'], 'name', 'Unknown')} (ID: {team['team'].team_id}) had a recent bye")
                    else:
                        team['had_recent_bye'] = False
            
            print(f"  New losers: {len(new_losers)}, Advancing losers: {len(advancing_losers)}")
            
            # Case 1: Both new losers and advancing losers - standard double elimination pattern
            if new_losers and advancing_losers:
                # Prioritize matching teams with recent byes with teams without recent byes
                # This helps ensure teams don't get consecutive byes
                if round_number > 1:
                    # Sort advancing losers by whether they had a recent bye
                    advancing_losers.sort(key=lambda x: 0 if x.get('had_recent_bye', False) else 1)
                
                if round_number % 2 == 0:
                    # For even numbered rounds after the first, pair new losers against advancing losers
                    # Sort for predictable pairing
                    new_losers.sort(key=lambda x: x.get('source_seed', 999))
                    advancing_losers.sort(key=lambda x: x.get('source_seed', 999))
                    
                    # Standard double elimination pairs new losers with advancing losers
                    for i in range(min(len(new_losers), len(advancing_losers))):
                        paired_teams.append([new_losers[i], advancing_losers[i]])
                    
                    # Handle extra teams if counts don't match
                    extra_new = new_losers[len(advancing_losers):] if len(new_losers) > len(advancing_losers) else []
                    extra_advancing = advancing_losers[len(new_losers):] if len(advancing_losers) > len(new_losers) else []
                    
                    # Pair any extra teams with each other
                    for i in range(0, len(extra_new), 2):
                        if i + 1 < len(extra_new):
                            paired_teams.append([extra_new[i], extra_new[i+1]])
                    
                    for i in range(0, len(extra_advancing), 2):
                        if i + 1 < len(extra_advancing):
                            paired_teams.append([extra_advancing[i], extra_advancing[i+1]])
                else:
                    # For odd numbered rounds, we typically pair within each group first
                    # For standard double elimination, follow the bracket pattern
                    all_teams = new_losers + advancing_losers
                    all_teams.sort(key=lambda x: x.get('source_seed', 999))
                    
                    for i in range(0, len(all_teams), 2):
                        if i + 1 < len(all_teams):
                            paired_teams.append([all_teams[i], all_teams[i+1]])
            
            # Case 2: Only new losers from winners bracket
            elif new_losers and not advancing_losers:
                print("  Pairing only new losers from winners bracket")
                new_losers.sort(key=lambda x: x.get('source_seed', 999))
                
                # In standard double elimination, for first round losers
                # we pair highest seed vs lowest seed (1 vs 8, 2 vs 7, etc.)
                if round_number == 1 or len(new_losers) >= 4:
                    half = len(new_losers) // 2
                    for i in range(half):
                        paired_teams.append([new_losers[i], new_losers[len(new_losers) - 1 - i]])
                else:
                    # Regular sequential pairing for later rounds or small brackets
                    for i in range(0, len(new_losers), 2):
                        if i + 1 < len(new_losers):
                            paired_teams.append([new_losers[i], new_losers[i+1]])
            
            # Case 3: Only teams advancing in losers bracket
            elif advancing_losers and not new_losers:
                print("  Pairing only teams advancing in losers bracket")
                advancing_losers.sort(key=lambda x: x.get('source_seed', 999))
                
                for i in range(0, len(advancing_losers), 2):
                    if i + 1 < len(advancing_losers):
                        paired_teams.append([advancing_losers[i], advancing_losers[i+1]])
        
        # For winners bracket and other bracket types, use standard pairing
        elif bracket_type == "winners":
            print(f"Creating winners bracket matches for round {round_number} with {len(teams)} teams")
            
            # For winners bracket, sort teams based on the seed of the match they won
            # This ensures correct progression (Winner of Match 1 vs Winner of Match 2)
            teams.sort(key=lambda x: x.get('source_seed', 999))
            
            # Apply seed-based pairing (High vs Low) ONLY for the first round
            if round_number == 1:
                print(f"Applying High vs Low seed pairing for Round 1 Winners Bracket")
                half = len(teams) // 2
                for i in range(half):
                    paired_teams.append([teams[i], teams[len(teams) - 1 - i]])
            else:
                # For subsequent rounds (Round 2+), use sequential pairing (Winner 1v2, Winner 3v4)
                print(f"Applying sequential pairing for Round {round_number} Winners Bracket")
                for i in range(0, len(teams), 2):
                    if i + 1 < len(teams):
                        paired_teams.append([teams[i], teams[i+1]])
        
        # For other bracket types (e.g., swiss)
        else:
            print(f"Creating {bracket_type} bracket matches for round {round_number} with {len(teams)} teams")
            # Group teams into pairs for matches (1 vs 2, 3 vs 4, etc.)
            for i in range(0, len(teams), 2):
                if i + 1 < len(teams):
                    paired_teams.append([teams[i], teams[i+1]])
        
        # Handle odd number of teams with a bye
        # First identify which teams are paired and which teams need byes
        paired_team_objects = []
        for team_pair in paired_teams:
            for team in team_pair:
                paired_team_objects.append(team['team'])
        
        unpaired_teams = [t for t in teams if t['team'] not in paired_team_objects]
        
        if unpaired_teams:
            print(f"Need to assign {len(unpaired_teams)} byes")
            
            # Get history of which teams have already had byes
            teams_with_byes = MatchParticipant.objects.filter(
                match_id__tournament=tournament,
                match_id__status="Bye",
                match_id__bracket_type=bracket_type
            ).values_list('team_id', flat=True).distinct()
            
            print(f"Teams that have previously had byes: {len(teams_with_byes)}")
            
            # For the losers bracket, we need to be more strict about byes - avoid consecutive byes
            # Check if any teams got a bye in the last round or two rounds ago
            teams_with_recent_byes = []
            if bracket_type == "losers" and round_number > 1:
                teams_with_recent_byes = MatchParticipant.objects.filter(
                    match_id__tournament=tournament,
                    match_id__status="Bye",
                    match_id__bracket_type=bracket_type,
                    match_id__round__in=[round_number - 1, round_number - 2]  # Check last two rounds
                ).values_list('team_id', flat=True).distinct()
                print(f"Teams with recent byes in last two rounds: {len(teams_with_recent_byes)}")
                
                # ABSOLUTELY forbid consecutive byes - these teams must be paired
                if teams_with_recent_byes:
                    # Get the teams that had byes
                    teams_with_byes_objects = []
                    for team_with_bye in teams_with_recent_byes:
                        # Find the team in unpaired_teams
                        for team in unpaired_teams:
                            if team['team'].team_id == team_with_bye:
                                teams_with_byes_objects.append(team)
                                break
                    
                    print(f"Found {len(teams_with_byes_objects)} teams with recent byes that need pairing")
                    
                    # Force pairing of teams with recent byes if possible
                    if len(teams_with_byes_objects) >= 2:
                        # Sort by seed to keep pairing fair
                        teams_with_byes_objects.sort(key=lambda x: x.get('source_seed', 999))
                        
                        # Pair them (as many as possible)
                        for i in range(0, len(teams_with_byes_objects) - 1, 2):
                            paired_teams.append([teams_with_byes_objects[i], teams_with_byes_objects[i+1]])
                            print(f"Forced pairing to avoid consecutive byes: {getattr(teams_with_byes_objects[i]['team'], 'name', 'Unknown')} vs {getattr(teams_with_byes_objects[i+1]['team'], 'name', 'Unknown')}")
                        
                        # Remove these teams from unpaired_teams
                        for team in teams_with_byes_objects[:len(teams_with_byes_objects) - len(teams_with_byes_objects) % 2]:
                            if team in unpaired_teams:
                                unpaired_teams.remove(team)
                        
                        # If there's an odd number, the remaining team still needs special handling
                        if len(teams_with_byes_objects) % 2 == 1:
                            remaining_team = teams_with_byes_objects[-1]
                            # Try to find a team without a recent bye to pair with
                            for team in unpaired_teams:
                                if team['team'].team_id not in teams_with_recent_byes:
                                    paired_teams.append([remaining_team, team])
                                    print(f"Paired remaining team with bye: {getattr(remaining_team['team'], 'name', 'Unknown')} vs {getattr(team['team'], 'name', 'Unknown')}")
                                    unpaired_teams.remove(team)
                                    if remaining_team in unpaired_teams:
                                        unpaired_teams.remove(remaining_team)
                                    break
                    elif len(teams_with_byes_objects) == 1:
                        # If only one team has had a bye, pair it with any other team
                        bye_team = teams_with_byes_objects[0]
                        for team in unpaired_teams:
                            if team != bye_team:
                                paired_teams.append([bye_team, team])
                                print(f"Paired single team with bye: {getattr(bye_team['team'], 'name', 'Unknown')} vs {getattr(team['team'], 'name', 'Unknown')}")
                                unpaired_teams.remove(team)
                                if bye_team in unpaired_teams:
                                    unpaired_teams.remove(bye_team)
                                break
                    
                    # After forced pairing, if some teams with recent byes are still not paired,
                    # we'll prioritize them in the next steps
            
            # Step 1: First sort teams by whether they've had a recent bye
            # Teams with recent byes should be paired first to avoid consecutive byes
            # This is especially important for losers bracket
            if bracket_type == "losers" and teams_with_recent_byes:
                # Sort the unpaired teams to prioritize teams that didn't have a recent bye
                unpaired_teams.sort(key=lambda x: 1 if x['team'].team_id in teams_with_recent_byes else 0)
                
                # If all teams have had recent byes, we'll need to use a different method
                all_had_recent_byes = all(t['team'].team_id in teams_with_recent_byes for t in unpaired_teams)
                if all_had_recent_byes:
                    print("All teams have had recent byes - pairing based on matching strengths")
                    # In this case, we can pair the teams with similar strengths (source seeds)
                    unpaired_teams.sort(key=lambda x: x.get('source_seed', 999))
                    
                    # Try to pair teams with similar strengths
                    paired_teams_from_unpaired = []
                    for i in range(0, len(unpaired_teams) - 1, 2):
                        paired_teams.append([unpaired_teams[i], unpaired_teams[i+1]])
                        paired_teams_from_unpaired.append(unpaired_teams[i])
                        paired_teams_from_unpaired.append(unpaired_teams[i+1])
                    
                    # Remove the paired teams from unpaired_teams
                    unpaired_teams = [t for t in unpaired_teams if t not in paired_teams_from_unpaired]
            else:
                # Regular sorting by whether they've had any bye before
                unpaired_teams.sort(key=lambda x: 1 if x['team'].team_id in teams_with_byes else 0)
            
            # If all teams have had byes or none have had byes, use the original ordering
            all_had_byes = all(t['team'].team_id in teams_with_byes for t in unpaired_teams)
            none_had_byes = all(t['team'].team_id not in teams_with_byes for t in unpaired_teams)
            
            if all_had_byes or none_had_byes:
                # Sort by seed if all teams have had byes or none have had byes
                unpaired_teams.sort(key=lambda x: x.get('source_seed', 999))
                
                # For fairness in allocating byes, if all teams have had byes,
                # use a count-based approach to prioritize teams with fewer byes
                if all_had_byes:
                    # Count the number of byes each team has had
                    bye_counts = {}
                    for team in unpaired_teams:
                        team_id = team['team'].team_id
                        bye_count = MatchParticipant.objects.filter(
                            match_id__tournament=tournament,
                            match_id__status="Bye",
                            match_id__bracket_type=bracket_type,
                            team_id=team_id
                        ).count()
                        bye_counts[team_id] = bye_count
                    
                    # Sort teams by the number of byes they've had (ascending)
                    unpaired_teams.sort(key=lambda x: bye_counts.get(x['team'].team_id, 0))
            
            # Create bye matches for each unpaired team
            for team in unpaired_teams:
                # Skip if team['team'] is None
                if team.get('team') is None:
                    print("Warning: Skipping None team that needs a bye")
                    continue
                
                # For losers bracket, check if this team had a bye in previous rounds - if so, try to swap with another team
                if bracket_type == "losers" and team['team'].team_id in teams_with_recent_byes:
                    print(f"⚠️ WARNING: Team {getattr(team['team'], 'name', 'Unknown')} (ID: {team['team'].team_id}) would get a consecutive bye")
                    print(f"  Had recent bye according to ID check: {team['team'].team_id in teams_with_recent_byes}")
                    
                    recent_bye_count = MatchParticipant.objects.filter(
                        match_id__tournament=tournament,
                        match_id__status='Bye',
                        match_id__bracket_type='losers',
                        match_id__round__in=[round_number - 1, round_number - 2],
                        team_id=team['team']
                    ).count()
                    
                    print(f"  Recent byes found in database: {recent_bye_count}")
                    
                    # Try to find another team that hasn't had a recent bye to give the bye to instead
                    swap_candidate = None
                    for other_team in paired_teams:
                        # Check both teams in the pair
                        for idx, paired_team in enumerate(other_team):
                            if paired_team['team'].team_id not in teams_with_recent_byes:
                                # Found a candidate - swap them
                                swap_candidate = paired_team
                                other_team_idx = idx
                                pair_idx = paired_teams.index(other_team)
                                
                                # Make this team take the place of the swap candidate in the pair
                                paired_teams[pair_idx][other_team_idx] = team
                                print(f"🔄 Swapped team {getattr(team['team'], 'name', 'Unknown')} with {getattr(swap_candidate['team'], 'name', 'Unknown')} to avoid consecutive byes")
                                
                                # Now give the bye to the swap candidate
                                team = swap_candidate
                                break
                        if swap_candidate:
                            break
                    
                    if not swap_candidate:
                        print("⚠️ Could not find a swap candidate - this team will get a consecutive bye")
                
                # If we got here, create the bye match
                bye_match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Bye",
                    court="Bye",
                    seed=start_seed + len(paired_teams),  # Put bye matches at the end
                    round=round_number,
                    score1="N/A",
                    score2="N/A",
                    bracket_type=bracket_type
                )
                
                # Add the team with a bye
                bye_team_participants = Participant.objects.filter(team_id=team['team'])
                if bye_team_participants.exists():
                    MatchParticipant.objects.create(
                        match_id=bye_match,
                        participant_id=bye_team_participants.first(),
                        team_number=1,
                        team_id=team['team']
                    )
                
                team_name = "Unknown"
                if team['team'] is not None:
                    team_name = getattr(team['team'], 'name', "Unknown")
                print(f"  Created bye match for {team_name}")
                matches_created += 1
        
        # Create matches for paired teams
        for i, pair in enumerate(paired_teams):
            team1 = pair[0]
            team2 = pair[1]
            
            # Skip if either team is None
            if team1.get('team') is None or team2.get('team') is None:
                print("Warning: Skipping match with None team")
                continue
                
            team1_name = getattr(team1['team'], 'name', "Unknown") if team1['team'] else "Unknown"
            team2_name = getattr(team2['team'], 'name', "Unknown") if team2['team'] else "Unknown"
            print(f"  Creating match: {team1_name} vs {team2_name}")
            
            # Create the match
            match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Scheduled",
                court=f"{bracket_type.capitalize()} Court {start_seed + i}",
                seed=start_seed + i,
                round=round_number,
                score1="0",
                score2="0",
                bracket_type=bracket_type
            )

            # Add first team
            team1_participants = Participant.objects.filter(team_id=team1['team'])
            if team1_participants.exists():
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=team1_participants.first(),
                    team_number=1,
                    team_id=team1['team']
                )

            # Add second team
            team2_participants = Participant.objects.filter(team_id=team2['team'])
            if team2_participants.exists():
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=team2_participants.first(),
                    team_number=2,
                    team_id=team2['team']
                )

            matches_created += 1
        
        return matches_created

    @staticmethod
    def create_next_round_matches(tournament, current_round):
        """
        Generate the next round of matches based on the winners of the previous round.
        Also handles teams with byes advancing to the next round.
        Maintains predictable seeding for proper bracket visualization.
        """
        # Get completed matches and bye matches from the current round, ordered by seed
        completed_matches = Match.objects.filter(
            tournament=tournament,
            round=current_round,
            status="Completed"
        ).order_by('seed')

        bye_matches = Match.objects.filter(
            tournament=tournament,
            round=current_round,
            status="Bye"
        ).order_by('seed')

        # Create an ordered list to track winners with their seeds
        advancing_teams = []

        # Process bye matches first - these teams automatically advance
        for bye_match in bye_matches:
            bye_participant = MatchParticipant.objects.filter(match_id=bye_match).first()
            if bye_participant:
                advancing_teams.append({
                    'team': bye_participant.team_id,
                    'source_seed': bye_match.seed,  # Keep track of original seed
                    'is_bye_winner': True
                })

        # Process winners from completed matches
        for match in completed_matches:
            match_participants = MatchParticipant.objects.filter(match_id=match)

            if match_participants.count() < 2:
                continue  # Skip invalid matches

            # Get team IDs for the two teams
            team1_data = match_participants.filter(team_number=1).first()
            team2_data = match_participants.filter(team_number=2).first()
            
            if not team1_data or not team2_data:
                continue  # Skip if missing team data
                
            team1 = team1_data.team_id
            team2 = team2_data.team_id
            
            # Get scores with proper handling of invalid scores
            try:
                score1 = int(match.score1) if match.score1 and match.score1 != 'N/A' else 0
                score2 = int(match.score2) if match.score2 and match.score2 != 'N/A' else 0
            except (ValueError, TypeError):
                # If scores can't be converted to integers, treat as incomplete
                continue
            
            # Only advance if there's a clear winner (no ties)
            if score1 > score2:
                winner_team = team1
            elif score2 > score1:
                winner_team = team2
            else:
                # Tie or incomplete match - skip this match
                continue

            # Add winner to advancing teams with original seed
            advancing_teams.append({
                'team': winner_team,
                'source_seed': match.seed,
                'is_bye_winner': False
            })

        # Verify we have valid teams advancing
        if not advancing_teams:
            return False, "No teams advancing to next round. Ensure matches have clear winners."

        # Calculate the next round
        next_round = current_round + 1

        # Use our common bracket match creation method
        matches_created = GenerateNextRound.create_bracket_matches(
            tournament, 
            next_round, 
            advancing_teams, 
            "winners", # Single elimination is always "winners" bracket
            start_seed=1
        )
        
        if matches_created > 0:
            return True, f"Generated {matches_created} matches for Round {next_round}"
        else:
            # If we have only one team advancing, they're the champion
            if len(advancing_teams) == 1:
                champion = advancing_teams[0]['team']
                # Check if champion is None or doesn't have name attribute
                if champion is None:
                    return True, "Tournament has a winner but champion data is incomplete"
                
                try:
                    champion_name = getattr(champion, 'name', "Unknown")
                    return True, f"Tournament {tournament.name} has a winner: {champion_name}"
                except AttributeError:
                    return True, "Tournament has a winner"
            else:
                return False, "Failed to create matches for the next round"

    @staticmethod
    def create_next_round_swiss(tournament, current_round):
        """
        Generate the next round of Swiss format matches.
        Teams are paired based on their current records.
        """
        # Get all teams in the tournament with their current records
        teams = Team.objects.filter(tournament_id=tournament)
        team_records = {}
        
        # Calculate current records for each team
        for team in teams:
            wins = 0
            losses = 0
            
            # Get all matches this team has played
            team_matches = MatchParticipant.objects.filter(
                team_id=team,
                match_id__tournament=tournament,
                match_id__round__lte=current_round,
                match_id__status="Completed"
            ).select_related('match_id')
            
            for match_participant in team_matches:
                match = match_participant.match_id
                team_number = match_participant.team_number
                
                try:
                    score1 = int(match.score1) if match.score1 and match.score1 != 'N/A' else 0
                    score2 = int(match.score2) if match.score2 and match.score2 != 'N/A' else 0
                except (ValueError, TypeError):
                    continue
                
                if team_number == 1:
                    if score1 > score2:
                        wins += 1
                    elif score2 > score1:
                        losses += 1
                else:  # team_number == 2
                    if score2 > score1:
                        wins += 1
                    elif score1 > score2:
                        losses += 1
            
            team_records[team] = {
                'wins': wins,
                'losses': losses,
                'points': wins  # Could be modified to include draws or other scoring
            }
        
        # Sort teams by record (wins first, then points if needed)
        sorted_teams = sorted(
            team_records.keys(),
            key=lambda t: (team_records[t]['wins'], team_records[t]['points']),
            reverse=True
        )
        
        # Filter out teams without participants
        teams_with_participants = [
            team for team in sorted_teams 
            if Participant.objects.filter(team_id=team).exists()
        ]
        
        if len(teams_with_participants) < 2:
            return False, "Not enough teams with participants for next round"
        
        matches = []
        next_round = current_round + 1
        
        # Handle bye for odd number of teams
        if len(teams_with_participants) % 2 == 1:
            bye_team = teams_with_participants.pop()  # Give bye to lowest ranked team
            bye_match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Bye",
                court="Bye",
                seed=len(teams_with_participants) + 1,
                round=next_round,
                score1="N/A",
                score2="N/A",
                bracket_type="swiss"
            )
            
            MatchParticipant.objects.create(
                match_id=bye_match,
                participant_id=Participant.objects.filter(team_id=bye_team).first(),
                team_number=1,
                team_id=bye_team
            )
            matches.append(bye_match)
        
        # Create matches pairing teams with similar records
        # Teams should not play each other more than once if possible
        used_teams = set()
        for i in range(0, len(teams_with_participants), 2):
            if i + 1 >= len(teams_with_participants):
                break
                
            team1 = teams_with_participants[i]
            
            # Find the next available team that hasn't played team1
            team2 = None
            for potential_team in teams_with_participants[i+1:]:
                if potential_team in used_teams:
                    continue
                    
                # Check if these teams have played each other
                previous_match = MatchParticipant.objects.filter(
                    team_id=team1,
                    match_id__tournament=tournament,
                    match_id__round__lte=current_round
                ).filter(
                    match_id__matchparticipant__team_id=potential_team
                ).exists()
                
                if not previous_match:
                    team2 = potential_team
                    break
            
            # If no suitable team found, take the next available team
            if team2 is None:
                for potential_team in teams_with_participants[i+1:]:
                    if potential_team not in used_teams:
                        team2 = potential_team
                        break
            
            if team2 is None:
                continue  # No available opponent found
            
            # Create the match
            match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Scheduled",
                court=f"Court {i//2 + 1}",
                seed=i//2 + 1,
                round=next_round,
                score1="0",
                score2="0",
                bracket_type="swiss"
            )
            
            # Add first team
            for participant in Participant.objects.filter(team_id=team1)[:1]:
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=participant,
                    team_number=1,
                    team_id=team1
                )
            
            # Add second team
            for participant in Participant.objects.filter(team_id=team2)[:1]:
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=participant,
                    team_number=2,
                    team_id=team2
                )
            
            matches.append(match)
            used_teams.add(team1)
            used_teams.add(team2)
        
        if not matches:
            return False, "No matches could be created for next round"
            
        return True, f"Generated {len(matches)} matches for Swiss format Round {next_round}"


class UpdatePassword(graphene.Mutation):
    class Arguments:
        uuid = graphene.UUID(required=True)
        old_password = graphene.String(required=True)
        new_password = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()

    def mutate(self, info, uuid, old_password, new_password):
        try:
            user = get_user_model().objects.get(uuid=uuid)

            if not check_password(old_password, user.password):
                raise Exception("The old password is incorrect.")

            user.password = make_password(new_password)
            user.save()
            return UpdatePassword(user=user, success=True)

        except get_user_model().DoesNotExist:
            raise Exception(f"User with UUID {uuid} does not exist.")


class UpdateName(graphene.Mutation):
    class Arguments:
        uuid = graphene.UUID(required=True)
        new_name = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()

    def mutate(self, info, uuid, new_name):
        try:
            user = get_user_model().objects.get(uuid=uuid)
            user.name = new_name
            user.save()
            return UpdateName(user=user, success=True)

        except get_user_model().DoesNotExist:
            raise Exception(f"User with UUID {uuid} does not exist.")


class UpdatePhone(graphene.Mutation):
    class Arguments:
        uuid = graphene.UUID(required=True)
        new_phone = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()

    def mutate(self, info, uuid, new_phone):
        try:
            user = get_user_model().objects.get(uuid=uuid)
            user.phone = new_phone
            user.save()
            return UpdatePhone(user=user, success=True)

        except get_user_model().DoesNotExist:
            raise Exception(f"User with UUID {uuid} does not exist.")


class UpdateEmail(graphene.Mutation):
    class Arguments:
        uuid = graphene.UUID(required=True)
        new_email = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()

    def mutate(self, info, uuid, new_email):
        try:
            user = get_user_model().objects.get(uuid=uuid)
            user.email = new_email
            user.save()
            return UpdateEmail(user=user, success=True)

        except get_user_model().DoesNotExist:
            raise Exception(f"User with UUID {uuid} does not exist.")
