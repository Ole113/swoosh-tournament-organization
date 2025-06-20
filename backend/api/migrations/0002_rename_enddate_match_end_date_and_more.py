# Generated by Django 5.1.3 on 2025-01-16 00:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="match",
            old_name="enddate",
            new_name="end_date",
        ),
        migrations.RenameField(
            model_name="match",
            old_name="matchID",
            new_name="match_id",
        ),
        migrations.RenameField(
            model_name="match",
            old_name="startdate",
            new_name="start_date",
        ),
        migrations.RenameField(
            model_name="matchparticipant",
            old_name="match",
            new_name="match_id",
        ),
        migrations.RenameField(
            model_name="matchparticipant",
            old_name="participant",
            new_name="participant_id",
        ),
        migrations.RenameField(
            model_name="matchparticipant",
            old_name="teamID",
            new_name="team_id",
        ),
        migrations.RenameField(
            model_name="participant",
            old_name="participantID",
            new_name="participant_id",
        ),
        migrations.RenameField(
            model_name="participant",
            old_name="teamID",
            new_name="team_id",
        ),
        migrations.RenameField(
            model_name="participant",
            old_name="tournamentID",
            new_name="tournament_id",
        ),
        migrations.RenameField(
            model_name="participant",
            old_name="userID",
            new_name="user_id",
        ),
        migrations.RenameField(
            model_name="team",
            old_name="teamID",
            new_name="team_id",
        ),
        migrations.RenameField(
            model_name="team",
            old_name="tournament",
            new_name="tournament_id",
        ),
        migrations.RenameField(
            model_name="tournament",
            old_name="createdBy",
            new_name="created_by",
        ),
        migrations.RenameField(
            model_name="tournament",
            old_name="endDate",
            new_name="end_date",
        ),
        migrations.RenameField(
            model_name="tournament",
            old_name="startDate",
            new_name="start_date",
        ),
        migrations.RenameField(
            model_name="tournament",
            old_name="teamSize",
            new_name="team_size",
        ),
        migrations.RenameField(
            model_name="tournament",
            old_name="tournamentID",
            new_name="tournament_id",
        ),
        migrations.RenameField(
            model_name="user",
            old_name="userID",
            new_name="user_id",
        ),
        migrations.AddField(
            model_name="tournament",
            name="description",
            field=models.TextField(default=""),
        ),
        migrations.AddField(
            model_name="tournament",
            name="name",
            field=models.CharField(default=0, max_length=100),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name="matchparticipant",
            unique_together={("match_id", "participant_id")},
        ),
    ]
