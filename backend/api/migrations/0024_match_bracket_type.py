# Generated by Django 5.1.4 on 2025-03-25 10:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_merge_20250228_0427'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='bracket_type',
            field=models.CharField(default='winners', max_length=20),
        ),
    ]
