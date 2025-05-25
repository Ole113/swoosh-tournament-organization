# Install dotenv
`python -m pip install python-dotenv`

# Install psycopg2
`pip install psycopg2-binary`

Create a .env file that is the same as .env.config
The only change should be to fill in the password to your local postgres password

# To apply migrations
`python manage.py migrate`

# To run the server
`python manage.py runserver`