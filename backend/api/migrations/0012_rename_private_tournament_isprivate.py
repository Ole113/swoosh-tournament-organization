# Generated by Django 5.1.3 on 2025-02-10 19:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0011_alter_tournament_invite_link"),
    ]

    operations = [
        migrations.RenameField(
            model_name="tournament",
            old_name="private",
            new_name="isPrivate",
        ),
    ]
