# Generated by Django 5.1.3 on 2025-02-07 01:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_alter_tournament_max_teams_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tournament",
            name="description",
            field=models.TextField(null=True),
        ),
    ]
