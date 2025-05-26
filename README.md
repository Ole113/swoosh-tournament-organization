# Swoosh Tournament Organization

Swoosh Tournament Organization is a web-based platform designed to simplify the organization and management of sports tournaments. It provides tools for admins to create tournaments, manage teams and participants, schedule matches, and track scores effortlessly. Swoosh ensures an intuitive experience for both organizers and participants.

---

## Getting started

### Prerequisites

To run this project locally, you need:

- \*\*Python 3.9 or above
- \*\*PostgreSQL 14 or above
- \*\*Node.js (for frontend dependencies, if applicable)
- \*\*pipenv or virtualenv (recommended for Python environments)

### Backend Setup

1. **Install Python dependencies:**

   - Install `python-dotenv` to manage environment variables:
     ```bash
     python -m pip install python-dotenv
     ```
   - Install `psycopg2-binary` for PostgreSQL database connections:
     ```bash
     pip install psycopg2-binary
     ```

- There are additional dependencies that you will have to install. When running `python manage.py runserver` you will get error messages about additional dependencies that are required.

2. **Configure the `.env` file:**

   - Create a `.env` file in the project root based on `.env.config`.
   - Update the `.env` file with your local PostgreSQL password.

3. **Apply database migrations:**

   ```bash
   python manage.py migrate
   ```

4. **Run the backend server:**

   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install frontend dependencies:**

   ```bash
   cd frontend
   ```

   ```bash
   npm install
   ```

2. **Run storybook for frontend development**
   ```bash
   npm run storybook
   ```

---

## Features

### Tournament Management

- Create and configure tournaments with customizable formats (round-robin, single-elimination, etc.).
- Set start and end dates, team sizes, and participant limits.
- Manage tournament statuses (e.g., upcoming, ongoing, completed).

### Participant and Team Management

- Add and manage participants with detailed information.
- Assign participants to teams and track team records.
- Flexible support for different team sizes and structures.

### Match Scheduling and Tracking

- Schedule matches with start and end times.
- Record match scores and statuses.
- Link participants and teams to specific matches.

### User-Friendly Interface

- Clean and intuitive UI for admins and participants.
- Real-time updates and notifications for tournament progress.

### GraphQL API Support

- Extendable API built with GraphQL for integration and data retrieval.

---

## Usage

Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

---

## Support

If you encounter any issues, need assistance, or have questions about the project, please create an issue.

## Authors and acknowledgment

Thank you to the four very busy individuals for their contributions during their final year of undergraduate school at the University of Utah.

---

## License

MIT License
