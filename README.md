# Swoosh Tournament Organization
Swoosh Tournament Organization is a web-based platform designed to simplify the organization and management of sports tournaments. It provides tools for admins to create tournaments, manage teams and participants, schedule matches, and track scores effortlessly. Swoosh ensures an intuitive experience for both organizers and participants.

---

## Getting started (needs to be updated)

### Prerequisites

To run this project locally, you need:

- **Python 3.9 or above
- **PostgreSQL 14 or above
- **Node.js (for frontend dependencies, if applicable)
- **pipenv or virtualenv (recommended for Python environments)

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

If you encounter any issues, need assistance, or have questions about the project, please use one of the following support channels:

- **Issue Tracker:** [GitLab Issues](https://capstone.cs.utah.edu/swoosh-tournament-organization/swoosh-tournament-organization/-/issues)  
  Report bugs, request features, or ask questions.
  
- **Email:**  
  For direct inquiries, contact the team at `support@swoosh-tournament.org`.

- **Documentation:**  
  Check the project wiki and detailed guides (coming soon) in the repository.

---

## Roadmap

### Short-Term Goals
- **API Development:** Finalize endpoints for team and participant management.
- **UI Enhancements:** Improve the user interface for match scheduling and visualization.
- **Basic Authentication:** Implement user authentication for admin users to secure tournament management features.

### Mid-Term Goals
- **Real-Time Updates:** Add WebSocket support for real-time match score updates and notifications.
- **Custom Tournament Rules:** Allow admins to configure custom rules and formats for tournaments.
- **Email Notifications:** Notify participants of match schedules, updates, and results via email.

### Long-Term Goals
- **Multi-Tournament Support:** Enable simultaneous management of multiple tournaments.
- **AI-Powered Scheduling:** Implement AI algorithms to optimize match schedules and reduce downtime.
- **Advanced Analytics:** Provide detailed tournament reports with participant and match statistics.
- **Mobile App Integration:** Develop a mobile app for participants to track matches, scores, and tournament updates on the go.

---

## Contributing
Contributions are currently being made by the team members of this project: Alex Elbel, Alex Qi, Hai Minh Pham, and Kaden Salem.

---

## Authors and acknowledgment
Thank you to the four very busy individuals for their contirbutions during their final year of undergraduate school at the University of Utah.

---

## License
For open source projects, say how it is licensed.

---

## Project status
Project status: Demo Day Prototype finished
In CS 4500, we will go through three active four week phases for an alpha, beta, and final before our product is finished. 