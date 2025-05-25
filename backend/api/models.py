from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    password = models.CharField(max_length=128)
    uuid = models.UUIDField(null=False, unique=True)

    username = None  # Remove the username field
    USERNAME_FIELD = 'email'  # Set email as the unique identifier
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.name


class Tournament(models.Model):
    tournament_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE)
    format = models.CharField(max_length=50)
    team_size = models.PositiveIntegerField(null=True)
    max_teams = models.PositiveIntegerField(null=True)
    show_email = models.BooleanField()
    show_phone = models.BooleanField()
    invite_link = models.UUIDField(null=True, unique=True)
    password = models.TextField(null=True)
    is_private = models.BooleanField()
    current_phase = models.IntegerField(default=1)

    def __str__(self):
        return f"Tournament {self.tournament_id})"

    @property
    def id(self):
        return self.tournament_id


class Team(models.Model):
    team_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True)
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    record = models.CharField(max_length=100, null=True)
    invite_link = models.UUIDField(null=True, unique=True)
    password = models.TextField(null=True)
    is_private = models.BooleanField()
    created_by_uuid = models.ForeignKey(
        User, on_delete=models.CASCADE, to_field="uuid")

    def __str__(self):
        return f"Team {self.name} ({self.tournament_id.name})"


class Participant(models.Model):
    participant_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="participants")
    tournament_id = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name="participants")
    team_id = models.ForeignKey(
        'Team', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Participant {self.participant_id} in Tournament {self.tournament_id.tournament_id}"


class Match(models.Model):
    match_id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    score1 = models.CharField(max_length=10)
    score2 = models.CharField(max_length=10)
    seed = models.PositiveIntegerField(default=0)
    round = models.PositiveIntegerField(default=1)
    # MIGHT NOT NEED THIS - calculate through start_date and end_date
    status = models.CharField(max_length=100)
    court = models.CharField(max_length=100)
    verified = models.PositiveIntegerField(default=0)
    bracket_type = models.CharField(max_length=20, default='winners')

    # Using a related name for easier reverse lookups
    participants = models.ManyToManyField(
        'Participant', through='MatchParticipant')

    def __str__(self):
        return f"Match {self.match_id}"


class MatchParticipant(models.Model):
    match_id = models.ForeignKey(Match, on_delete=models.CASCADE)
    participant_id = models.ForeignKey(Participant, on_delete=models.CASCADE)
    # Use 1 or 2 to distinguish teams
    team_number = models.IntegerField(choices=[(1, 'Team 1'), (2, 'Team 2')])
    # Link to the team the participant is on
    team_id = models.ForeignKey('Team', on_delete=models.CASCADE)

    class Meta:
        # Ensures a participant can only appear once per match
        unique_together = ('match_id', 'participant_id')

    def __str__(self):
        return f"Match {self.match_id} - Participant {self.participant_id.user_id} in Team {self.team_number}"
