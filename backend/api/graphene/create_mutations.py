import random
import graphene
from django.core.exceptions import ObjectDoesNotExist
from ..models import User, Tournament, Participant, Team, Match, MatchParticipant
from django.core.exceptions import ObjectDoesNotExist
from .types import *


class CreateUser(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        email = graphene.String(required=True)
        phone = graphene.String(required=True)
        password = graphene.String(required=True)
        uuid = graphene.String(required=True)

    user = graphene.Field(UserType)

    def mutate(root, info, name, email, phone, password, uuid):
        user = User.objects.create(name=name, email=email,
                                   phone=phone, password=password, uuid=uuid)
        user.set_password(password)
        user.save()

        return CreateUser(user=user)


class CreateTournament(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String(required=False)
        start_date = graphene.DateTime(required=True)
        end_date = graphene.DateTime(required=True)
        created_by_id = graphene.String(required=True)
        format = graphene.String(required=True)
        team_size = graphene.Int(required=False)
        max_teams = graphene.Int(required=False)
        show_email = graphene.Boolean(required=True)
        show_phone = graphene.Boolean(required=True)
        invite_link = graphene.String(required=False)
        password = graphene.String(required=False)
        is_private = graphene.Boolean(required=True)

    tournament = graphene.Field(TournamentType)

    def mutate(root, info, name, start_date, end_date, created_by_id, format, show_email, show_phone, is_private,
               description=None, team_size=None, max_teams=None, password=None, invite_link=None):
        try:
            created_by = User.objects.get(pk=created_by_id)
        except ObjectDoesNotExist:
            raise Exception("Creator's ID of the tournament not found.")

        tournament = Tournament.objects.create(
            name=name,
            description=description,
            start_date=start_date,
            end_date=end_date,
            created_by=created_by,
            format=format,
            team_size=team_size,
            max_teams=max_teams,
            show_email=show_email,
            show_phone=show_phone,
            invite_link=invite_link,
            password=password,
            is_private=is_private,
        )

        return CreateTournament(tournament=tournament)


class CreateTeam(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String(required=False)
        tournament_id = graphene.Int(required=True)
        record = graphene.String(required=False)
        invite_link = graphene.String(required=False)
        password = graphene.String(required=False)
        is_private = graphene.Boolean(required=True)
        created_by_uuid = graphene.String(required=True)

    team = graphene.Field(TeamType)

    def mutate(root, info, name, tournament_id, is_private, created_by_uuid, description=None, record=None, password=None, invite_link=None):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            raise Exception("Tournament not found.")

        try:
            created_by_uuid = User.objects.get(uuid=created_by_uuid)
        except ObjectDoesNotExist:
            raise Exception("Creator's UUID not found.")

        team = Team.objects.create(
            name=name,
            description=description,
            tournament_id=tournament,
            created_by_uuid=created_by_uuid,
            record=record,
            is_private=is_private,
            password=password,
            invite_link=invite_link
        )

        return CreateTeam(team=team)


class CreateParticipant(graphene.Mutation):
    class Arguments:
        team_id = graphene.Int(required=True)
        tournament_id = graphene.Int(required=True)
        user_id = graphene.Int(required=True)

    participant = graphene.Field(ParticipantType)

    def mutate(self, info, team_id, tournament_id, user_id):
        try:
            team = Team.objects.get(team_id=team_id)
            tournament = Tournament.objects.get(tournament_id=tournament_id)
            user = User.objects.get(user_id=user_id)
        except (Team.DoesNotExist, Tournament.DoesNotExist, User.DoesNotExist) as e:
            raise Exception(f"Error: {str(e)}")

        participant = Participant.objects.create(
            team_id=team,
            tournament_id=tournament,
            user_id=user
        )

        return CreateParticipant(participant=participant)


class CreateMatch(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.Int(required=True)
        start_date = graphene.DateTime(required=True)
        end_date = graphene.DateTime(required=True)
        score1 = graphene.String(required=False, default_value="")
        score2 = graphene.String(required=False, default_value="")
        status = graphene.String(required=True)
        court = graphene.String(required=True)

    match = graphene.Field(MatchType)

    def mutate(root, info, tournament_id, start_date, end_date, score1, score2, status, court):
        # Ensure the Tournament exists
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            raise Exception("Tournament not found.")

        # Create the Match
        match = Match.objects.create(
            tournament=tournament,
            start_date=start_date,
            end_date=end_date,
            score1=score1,
            score2=score2,
            status=status,
            court=court
        )

        return CreateMatch(match=match)


class CreateMatchParticipant(graphene.Mutation):
    class Arguments:
        match_id = graphene.Int(required=True)
        participant_id = graphene.Int(required=True)
        team_number = graphene.Int(required=True)
        team_id = graphene.Int(required=True)

    match_participant = graphene.Field(MatchParticipantType)

    def mutate(root, info, match_id, participant_id, team_number, team_id):
        try:
            match = Match.objects.get(pk=match_id)
        except Match.DoesNotExist:
            raise Exception("Match not found.")

        try:
            participant = Participant.objects.get(pk=participant_id)
        except Participant.DoesNotExist:
            raise Exception("Participant not found.")

        if MatchParticipant.objects.filter(match=match, participant=participant).exists():
            raise Exception("Participant is already part of this match.")

        match_participant = MatchParticipant.objects.create(
            match=match,
            participant=participant,
            team_number=team_number,
            team_id=team_id
        )

        return CreateMatchParticipant(match_participant=match_participant)


class GenerateMatches(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    matches = graphene.List(MatchNode)
    message = graphene.String()

    def mutate(self, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            raise Exception(
                f"Tournament with ID {tournament_id} does not exist.")

        teams = list(Team.objects.filter(tournament_id=tournament))
        if len(teams) < 2:
            raise Exception(
                "At least two teams are required to generate matches.")

        # Filter teams that have participants
        teams_with_participants = [team for team in teams if Participant.objects.filter(team_id=team).exists()]
        if len(teams_with_participants) < 2:
            return GenerateMatches(matches=[], message="At least two teams must have participants.")

        random.shuffle(teams_with_participants)  # Randomize team order for fairness
        matches = []
        round_number = 1  # First round

        # Ensure fair bye distribution across rounds
        bye_team = None
        if len(teams_with_participants) % 2 == 1:
            bye_team = teams_with_participants.pop(0)  # Assign the first team a bye

            bye_match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Bye",
                court="Bye",
                seed=1,
                round=round_number,
                score1="N/A",
                score2="N/A",
                bracket_type="winners"
            )

            MatchParticipant.objects.create(
                match_id=bye_match,
                participant_id=Participant.objects.filter(team_id=bye_team).first(),
                team_number=1,
                team_id=bye_team
            )

            matches.append(bye_match)

        # Generate matches for the remaining teams
        match_seed = 2  # Start from 2 since bye is seed 1
        for i in range(0, len(teams_with_participants), 2):
            team1, team2 = teams_with_participants[i], teams_with_participants[i + 1]

            match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Scheduled",
                court=f"Court {match_seed}",
                seed=match_seed,
                round=round_number,
                score1="0",
                score2="0",
                bracket_type="winners"
            )

            for participant in Participant.objects.filter(team_id=team1)[:1]:
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=participant,
                    team_number=1,
                    team_id=team1
                )

            for participant in Participant.objects.filter(team_id=team2)[:1]:
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=participant,
                    team_number=2,
                    team_id=team2
                )

            matches.append(match)
            match_seed += 1

        return GenerateMatches(matches=matches, message="Matches successfully generated.")


class GenerateRoundRobinMatches(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    matches = graphene.List(MatchNode)
    message = graphene.String()

    def mutate(self, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            raise Exception(
                f"Tournament with ID {tournament_id} does not exist.")

        teams = list(Team.objects.filter(tournament_id=tournament))
        if len(teams) < 2:
            raise Exception(
                "At least two teams are required to generate matches.")

        # Filter teams that have participants
        teams_with_participants = [team for team in teams if Participant.objects.filter(team_id=team).exists()]
        if len(teams_with_participants) < 2:
            return GenerateRoundRobinMatches(matches=[], message="At least two teams must have participants.")

        # Randomly shuffle the teams to get random initial pairings
        random.shuffle(teams_with_participants)

        matches = []
        
        # Organize round robin schedule into proper rounds
        # For n teams, we need (n-1) rounds with n/2 matches per round
        n = len(teams_with_participants)
        
        # If odd number of teams, add a "BYE" placeholder
        if n % 2 == 1:
            n += 1
            has_bye = True
        else:
            has_bye = False
        
        # Create a list of team indices (with a BYE placeholder if needed)
        team_indices = list(range(n))
        if has_bye:
            team_indices[-1] = None  # Mark the last team as BYE
            
        # Number of rounds needed
        rounds_needed = n - 1
        
        seed_counter = 1
        
        for round_number in range(1, rounds_needed + 1):
            # For each round, create the matches
            for i in range(n // 2):
                team1_idx = team_indices[i]
                team2_idx = team_indices[n - 1 - i]
                
                # Skip if one of the teams is a BYE
                if team1_idx is None or team2_idx is None:
                    continue
                
                team1 = teams_with_participants[team1_idx]
                team2 = teams_with_participants[team2_idx]

                match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Scheduled",
                    court=f"Court {seed_counter}",
                    seed=seed_counter,
                    round=round_number,  # Use the round number, not the match counter
                    score1="0",
                    score2="0"
                )

                for participant in Participant.objects.filter(team_id=team1)[:1]:
                    MatchParticipant.objects.create(
                        match_id=match,
                        participant_id=participant,
                        team_number=1,
                        team_id=team1
                    )

                for participant in Participant.objects.filter(team_id=team2)[:1]:
                    MatchParticipant.objects.create(
                        match_id=match,
                        participant_id=participant,
                        team_number=2,
                        team_id=team2
                    )

                matches.append(match)
                seed_counter += 1
            
            # Rotate the array (keep the first team fixed, rotate the rest)
            # This is a standard algorithm for round robin scheduling
            team_indices = [team_indices[0]] + [team_indices[-1]] + team_indices[1:-1]

        return GenerateRoundRobinMatches(matches=matches, message="Round-robin matches successfully generated.")


class GenerateDoubleEliminationMatches(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    matches = graphene.List(MatchNode)
    message = graphene.String()

    def mutate(self, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            raise Exception(
                f"Tournament with ID {tournament_id} does not exist.")

        teams = list(Team.objects.filter(tournament_id=tournament))
        if len(teams) < 2:
            raise Exception(
                "At least two teams are required to generate matches.")

        # Filter teams that have participants
        teams_with_participants = [team for team in teams if Participant.objects.filter(team_id=team).exists()]
        if len(teams_with_participants) < 2:
            return GenerateDoubleEliminationMatches(
                matches=[], 
                message="At least two teams must have participants."
            )

        # Randomize teams
        random.shuffle(teams_with_participants)
        
        matches = []
        round_number = 1  # First round

        # Ensure fair bye distribution across rounds for winners bracket
        bye_team = None
        if len(teams_with_participants) % 2 == 1:
            bye_team = teams_with_participants.pop(0)  # Assign the first team a bye

            bye_match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Bye",
                court="Bye",
                seed=1,
                round=round_number,
                score1="N/A",
                score2="N/A",
                bracket_type="winners"
            )

            MatchParticipant.objects.create(
                match_id=bye_match,
                participant_id=Participant.objects.filter(team_id=bye_team).first(),
                team_number=1,
                team_id=bye_team
            )

            matches.append(bye_match)

        # Generate matches for the winners bracket (initial round)
        match_seed = 2  # Start from 2 since bye is seed 1
        for i in range(0, len(teams_with_participants), 2):
            if i + 1 >= len(teams_with_participants):
                break  # Should not happen with bye handling

            team1, team2 = teams_with_participants[i], teams_with_participants[i + 1]

            match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Scheduled",
                court=f"Court {match_seed-1}",
                seed=match_seed,
                round=round_number,
                score1="0",
                score2="0",
                bracket_type="winners"  # Explicitly mark as winners bracket
            )

            for participant in Participant.objects.filter(team_id=team1)[:1]:
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=participant,
                    team_number=1,
                    team_id=team1
                )

            for participant in Participant.objects.filter(team_id=team2)[:1]:
                MatchParticipant.objects.create(
                    match_id=match,
                    participant_id=participant,
                    team_number=2,
                    team_id=team2
                )

            matches.append(match)
            match_seed += 1
            
        # We don't create losers bracket matches initially
        # They will be created as teams lose in the winners bracket
        
        return GenerateDoubleEliminationMatches(
            matches=matches, 
            message="Double elimination tournament initial matches successfully generated."
        )
    
    
class DeleteMatches(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, tournament_id):
        try:
            matches = Match.objects.filter(tournament_id=tournament_id)
            matches.delete()
            return DeleteMatches(success=True, message="Matches deleted successfully.")
        except Exception as e:
            return DeleteMatches(success=False, message=str(e))


class GenerateSwissMatches(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    matches = graphene.List(MatchNode)
    message = graphene.String()

    def mutate(self, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            raise Exception(f"Tournament with ID {tournament_id} does not exist.")

        teams = list(Team.objects.filter(tournament_id=tournament))
        if len(teams) < 2:
            raise Exception("At least two teams are required to generate matches.")

        # Filter teams that have participants
        teams_with_participants = [team for team in teams if Participant.objects.filter(team_id=team).exists()]
        if len(teams_with_participants) < 2:
            return GenerateSwissMatches(matches=[], message="At least two teams must have participants.")

        # Randomize teams for initial round
        random.shuffle(teams_with_participants)
        matches = []
        round_number = 1

        # Handle bye for odd number of teams
        if len(teams_with_participants) % 2 == 1:
            bye_team = teams_with_participants.pop()  # Take random team for bye since list is shuffled
            bye_match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Bye",
                court="Bye",
                seed=len(teams_with_participants) + 1,
                round=round_number,
                score1="N/A",
                score2="N/A",
                bracket_type="swiss"  # Mark as Swiss format
            )

            MatchParticipant.objects.create(
                match_id=bye_match,
                participant_id=Participant.objects.filter(team_id=bye_team).first(),
                team_number=1,
                team_id=bye_team
            )
            matches.append(bye_match)

        # Generate first round matches with random pairings
        # Simply pair adjacent teams in our shuffled list
        for i in range(0, len(teams_with_participants), 2):
            if i + 1 >= len(teams_with_participants):
                break

            team1 = teams_with_participants[i]
            team2 = teams_with_participants[i + 1]

            match = Match.objects.create(
                tournament=tournament,
                start_date=tournament.start_date,
                end_date=tournament.end_date,
                status="Scheduled",
                court=f"Court {i//2 + 1}",
                seed=i//2 + 1,
                round=round_number,
                score1="0",
                score2="0",
                bracket_type="swiss"  # Mark as Swiss format
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

        return GenerateSwissMatches(matches=matches, message="Swiss tournament initial round generated successfully with random pairings.")


class GenerateRoundRobinToSingleElimination(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    matches = graphene.List(MatchNode)

    def mutate(self, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            return GenerateRoundRobinToSingleElimination(
                success=False,
                message=f"Tournament with ID {tournament_id} does not exist.",
                matches=[]
            )

        # Check if the tournament format is Round Robin to Single Elimination
        if tournament.format != "Round Robin to Single Elimination":
            return GenerateRoundRobinToSingleElimination(
                success=False,
                message="This tournament is not set up as a Round Robin to Single Elimination.",
                matches=[]
            )

        # Check if there are existing matches
        existing_matches = Match.objects.filter(tournament=tournament)
        
        # If no matches exist yet, generate round robin matches (Phase 1)
        if not existing_matches.exists():
            try:
                round_robin_generator = GenerateRoundRobinMatches()
                result = round_robin_generator.mutate(info, tournament_id)
                # Ensure all matches are marked as round 1
                for match in Match.objects.filter(tournament=tournament):
                    match.round = 1
                    match.save()
                
                return GenerateRoundRobinToSingleElimination(
                    success=True,
                    message="Round robin stage matches generated. Complete these matches before proceeding to elimination stage.",
                    matches=result.matches
                )
            except Exception as e:
                return GenerateRoundRobinToSingleElimination(
                    success=False,
                    message=f"Error generating round robin matches: {str(e)}",
                    matches=[]
                )
        
        # If matches exist, check if all round robin matches are complete
        incomplete_matches = existing_matches.filter(status="Scheduled", round=1)
        if incomplete_matches.exists():
            return GenerateRoundRobinToSingleElimination(
                success=False,
                message="Not all round robin matches are complete. Complete all matches before proceeding to elimination stage.",
                matches=[]
            )
        
        # If there are existing elimination matches, don't generate new ones
        if existing_matches.filter(round__gt=1).exists():
            return GenerateRoundRobinToSingleElimination(
                success=False,
                message="Elimination stage has already been generated.",
                matches=[]
            )
        
        # Calculate team standings based on round robin results
        team_stats = {}
        for match in existing_matches.filter(round=1):
            match_participants = MatchParticipant.objects.filter(match_id=match)
            if len(match_participants) != 2:
                continue
                
            team1 = match_participants[0].team_id
            team2 = match_participants[1].team_id
            
            if team1.team_id not in team_stats:
                team_stats[team1.team_id] = {"team": team1, "wins": 0, "losses": 0, "points": 0}
            if team2.team_id not in team_stats:
                team_stats[team2.team_id] = {"team": team2, "wins": 0, "losses": 0, "points": 0}
            
            score1 = int(match.score1) if match.score1.isdigit() else 0
            score2 = int(match.score2) if match.score2.isdigit() else 0
            
            if score1 > score2:
                team_stats[team1.team_id]["wins"] += 1
                team_stats[team1.team_id]["points"] += 3
                team_stats[team2.team_id]["losses"] += 1
            elif score2 > score1:
                team_stats[team2.team_id]["wins"] += 1
                team_stats[team2.team_id]["points"] += 3
                team_stats[team1.team_id]["losses"] += 1
            else:
                team_stats[team1.team_id]["points"] += 1
                team_stats[team2.team_id]["points"] += 1
        
        # Sort teams by points (descending)
        sorted_teams = sorted(
            team_stats.values(), 
            key=lambda x: (x["points"], x["wins"]), 
            reverse=True
        )
        
        # Use ALL teams for the elimination stage, not just top 50%
        qualified_teams = [stats["team"] for stats in sorted_teams]
        
        if len(qualified_teams) < 2:
            return GenerateRoundRobinToSingleElimination(
                success=False,
                message="Not enough teams for elimination stage. Need at least 2 teams.",
                matches=[]
            )
            
        # Create matches for single elimination (Phase 2)
        matches = []
        round_number = 2  # Start from round 2 (round 1 was round robin)
        
        # Find the next power of 2 to ensure proper bracket structure
        num_teams = len(qualified_teams)
        next_power_of_2 = 1
        while next_power_of_2 < num_teams:
            next_power_of_2 *= 2
            
        # Ensure we have a complete bracket by adding byes if needed
        num_byes = next_power_of_2 - num_teams
        
        # Create the seeded pairs for the first round
        # Standard tournament seeding pairs highest with lowest (1v8, 2v7, 3v6, 4v5, etc.)
        for i in range(next_power_of_2 // 2):
            # Standard seeding pattern: match highest with lowest
            high_seed = i
            low_seed = next_power_of_2 - 1 - i
            
            # Check if either position is a bye
            high_is_bye = high_seed >= num_teams
            low_is_bye = low_seed >= num_teams
            
            # Skip if both positions would be byes
            if high_is_bye and low_is_bye:
                continue
                
            # If one position is a bye, the other team automatically advances
            if high_is_bye:
                team = qualified_teams[low_seed]
                
                bye_match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Bye",
                    court="Bye",
                    seed=i+1,
                    round=round_number,
                    score1="N/A",
                    score2="N/A"
                )
                
                matches.append(bye_match)
                participant = Participant.objects.filter(team_id=team).first()
                if participant:
                    MatchParticipant.objects.create(
                        match_id=bye_match,
                        participant_id=participant,
                        team_number=1,
                        team_id=team
                    )
            elif low_is_bye:
                team = qualified_teams[high_seed]
                
                bye_match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Bye",
                    court="Bye",
                    seed=i+1,
                    round=round_number,
                    score1="N/A",
                    score2="N/A"
                )
                
                matches.append(bye_match)
                participant = Participant.objects.filter(team_id=team).first()
                if participant:
                    MatchParticipant.objects.create(
                        match_id=bye_match,
                        participant_id=participant,
                        team_number=1,
                        team_id=team
                    )
            else:
                # Create a match between the two teams
                team1 = qualified_teams[high_seed]
                team2 = qualified_teams[low_seed]
                
                match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Scheduled",
                    court=f"Court {i+1}",
                    seed=i+1,
                    round=round_number,
                    score1="0",
                    score2="0"
                )
                
                matches.append(match)
                
                # Find participants for these teams
                participant1 = Participant.objects.filter(team_id=team1).first()
                participant2 = Participant.objects.filter(team_id=team2).first()
                
                if participant1:
                    MatchParticipant.objects.create(
                        match_id=match,
                        participant_id=participant1,
                        team_number=1,
                        team_id=team1
                    )
                    
                if participant2:
                    MatchParticipant.objects.create(
                        match_id=match,
                        participant_id=participant2,
                        team_number=2,
                        team_id=team2
                    )
        
        return GenerateRoundRobinToSingleElimination(
            success=True,
            message=f"Successfully generated elimination stage with {len(qualified_teams)} teams using standard seeding.",
            matches=matches
        )


class GenerateRoundRobinToDoubleElimination(graphene.Mutation):
    class Arguments:
        tournament_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    matches = graphene.List(MatchNode)

    def mutate(self, info, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            return GenerateRoundRobinToDoubleElimination(
                success=False,
                message=f"Tournament with ID {tournament_id} does not exist.",
                matches=[]
            )

        # Check if the tournament format is Round Robin to Double Elimination
        if tournament.format != "Round Robin to Double Elimination":
            return GenerateRoundRobinToDoubleElimination(
                success=False,
                message="This tournament is not set up as a Round Robin to Double Elimination.",
                matches=[]
            )

        # Check if there are existing matches
        existing_matches = Match.objects.filter(tournament=tournament)
        
        # If no matches exist yet, generate round robin matches (Phase 1)
        if not existing_matches.exists():
            try:
                round_robin_generator = GenerateRoundRobinMatches()
                result = round_robin_generator.mutate(info, tournament_id)
                # Ensure all matches are marked as round 1
                for match in Match.objects.filter(tournament=tournament):
                    match.round = 1
                    match.bracket_type = "round_robin"
                    match.save()
                
                return GenerateRoundRobinToDoubleElimination(
                    success=True,
                    message="Round robin stage matches generated. Complete these matches before proceeding to double elimination stage.",
                    matches=result.matches
                )
            except Exception as e:
                return GenerateRoundRobinToDoubleElimination(
                    success=False,
                    message=f"Error generating round robin matches: {str(e)}",
                    matches=[]
                )
        
        # If matches exist, check if all round robin matches are complete
        incomplete_matches = existing_matches.filter(status="Scheduled", round=1)
        if incomplete_matches.exists():
            return GenerateRoundRobinToDoubleElimination(
                success=False,
                message="Not all round robin matches are complete. Complete all matches before proceeding to double elimination stage.",
                matches=[]
            )
        
        # If there are existing elimination matches, don't generate new ones
        if existing_matches.filter(round__gt=1).exists():
            return GenerateRoundRobinToDoubleElimination(
                success=False,
                message="Double elimination stage has already been generated.",
                matches=[]
            )
        
        # Calculate team standings based on round robin results
        team_stats = {}
        for match in existing_matches.filter(round=1):
            match_participants = MatchParticipant.objects.filter(match_id=match)
            if len(match_participants) != 2:
                continue
                
            team1 = match_participants[0].team_id
            team2 = match_participants[1].team_id
            
            if team1.team_id not in team_stats:
                team_stats[team1.team_id] = {"team": team1, "wins": 0, "losses": 0, "points": 0}
            if team2.team_id not in team_stats:
                team_stats[team2.team_id] = {"team": team2, "wins": 0, "losses": 0, "points": 0}
            
            score1 = int(match.score1) if match.score1.isdigit() else 0
            score2 = int(match.score2) if match.score2.isdigit() else 0
            
            if score1 > score2:
                team_stats[team1.team_id]["wins"] += 1
                team_stats[team1.team_id]["points"] += 3
                team_stats[team2.team_id]["losses"] += 1
            elif score2 > score1:
                team_stats[team2.team_id]["wins"] += 1
                team_stats[team2.team_id]["points"] += 3
                team_stats[team1.team_id]["losses"] += 1
            else:
                team_stats[team1.team_id]["points"] += 1
                team_stats[team2.team_id]["points"] += 1
        
        # Sort teams by points (descending)
        sorted_teams = sorted(
            team_stats.values(), 
            key=lambda x: (x["points"], x["wins"]), 
            reverse=True
        )
        
        # Use ALL teams for the elimination stage
        qualified_teams = [stats["team"] for stats in sorted_teams]
        
        if len(qualified_teams) < 2:
            return GenerateRoundRobinToDoubleElimination(
                success=False,
                message="Not enough teams for elimination stage. Need at least 2 teams.",
                matches=[]
            )
            
        # --- Transition to Phase 2: Elimination stage ---
        tournament.current_phase = 2
        tournament.save()
        
        # Create matches for the double elimination winners bracket.
        # Use standard seeding (highest vs lowest) with byes inserted if necessary.
        matches_elim = []
        round_number = 2  # Round 2 is the first elimination round.
        
        num_teams = len(qualified_teams)
        next_power_of_2 = 1
        while next_power_of_2 < num_teams:
            next_power_of_2 *= 2
            
        # Ensure we have a complete bracket by adding byes if needed
        num_byes = next_power_of_2 - num_teams
        
        # Create the seeded pairs for the first round of winners bracket
        # Standard tournament seeding pairs highest with lowest (1v8, 2v7, 3v6, 4v5, etc.)
        for i in range(next_power_of_2 // 2):
            # Standard seeding pattern: match highest with lowest
            high_seed = i
            low_seed = next_power_of_2 - 1 - i
            
            # Check if either position is a bye
            high_is_bye = high_seed >= num_teams
            low_is_bye = low_seed >= num_teams
            
            # Skip if both positions would be byes
            if high_is_bye and low_is_bye:
                continue
                
            # If one position is a bye, the other team automatically advances
            if high_is_bye:
                team = qualified_teams[low_seed]
                
                bye_match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Bye",
                    court="Bye",
                    seed=i+1,
                    round=round_number,
                    score1="N/A",
                    score2="N/A",
                    bracket_type="winners"  # Mark as winners bracket
                )
                matches_elim.append(bye_match)
                participant = Participant.objects.filter(team_id=team).first()
                if participant:
                    MatchParticipant.objects.create(
                        match_id=bye_match,
                        participant_id=participant,
                        team_number=1,
                        team_id=team
                    )
            elif low_is_bye:
                team = qualified_teams[high_seed]
                
                bye_match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Bye",
                    court="Bye",
                    seed=i+1,
                    round=round_number,
                    score1="N/A",
                    score2="N/A",
                    bracket_type="winners"  # Mark as winners bracket
                )
                matches_elim.append(bye_match)
                participant = Participant.objects.filter(team_id=team).first()
                if participant:
                    MatchParticipant.objects.create(
                        match_id=bye_match,
                        participant_id=participant,
                        team_number=1,
                        team_id=team
                    )
            else:
                # Create a match between the two teams
                team1 = qualified_teams[high_seed]
                team2 = qualified_teams[low_seed]
                
                match = Match.objects.create(
                    tournament=tournament,
                    start_date=tournament.start_date,
                    end_date=tournament.end_date,
                    status="Scheduled",
                    court=f"Court {i+1}",
                    seed=i+1,
                    round=round_number,
                    score1="0",
                    score2="0",
                    bracket_type="winners"  # Mark as winners bracket
                )
                matches_elim.append(match)
                
                # Find participants for these teams
                participant1 = Participant.objects.filter(team_id=team1).first()
                participant2 = Participant.objects.filter(team_id=team2).first()
                
                if participant1:
                    MatchParticipant.objects.create(
                        match_id=match,
                        participant_id=participant1,
                        team_number=1,
                        team_id=team1
                    )
                    
                if participant2:
                    MatchParticipant.objects.create(
                        match_id=match,
                        participant_id=participant2,
                        team_number=2,
                        team_id=team2
                    )
        
        # We don't create losers bracket matches initially
        # They will be created as teams lose in the winners bracket
        
        return GenerateRoundRobinToDoubleElimination(
            success=True,
            message=f"Successfully generated double elimination stage with {len(qualified_teams)} teams using standard seeding.",
            matches=matches_elim
        )