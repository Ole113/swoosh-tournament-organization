# Generated by Django 5.1.3 on 2025-02-20 09:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0015_remove_user_role"),
    ]

    operations = [
        migrations.AlterField(
            model_name="team",
            name="description",
            field=models.TextField(null=True),
        ),
    ]
