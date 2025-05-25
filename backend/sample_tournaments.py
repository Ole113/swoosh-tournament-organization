import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, Tournament

def add_sample_tournaments():
    # Create a user
    user = User.objects.create(
        role='Admin',
        name='Admin User',
        email='admin@example.com',
        phone='9876543210',
        password='password123'
    )

    # Add sample tournaments
    Tournament.objects.bulk_create([
        Tournament(
            startDate='2024-01-01',
            endDate='2024-01-10',
            status='Upcoming',
            createdBy=user,
            format='Round Robin',
            teamSize=4
        ),
        Tournament(
            startDate='2024-02-01',
            endDate='2024-02-15',
            status='Ongoing',
            createdBy=user,
            format='Knockout',
            teamSize=8
        ),
        Tournament(
            startDate='2023-12-01',
            endDate='2023-12-10',
            status='Completed',
            createdBy=user,
            format='Double Elimination',
            teamSize=6
        ),
    ])

    print("Sample tournaments added successfully!")

if __name__ == '__main__':
    add_sample_tournaments()
