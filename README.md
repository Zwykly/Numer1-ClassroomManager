# Classroom Manager

Classroom Manager is a super easy to use system designed to manage classroom reservations, students, groups, and teachers. It allows teachers to keep track of physical classrooms, online sessions, and manage role-based access to this data.
q
## Backend
q
The backend of this project is built to be fast, type-safe, scaleable, and securely managed using modern web standards.

### Tech Stack
- **[Bun](https://bun.sh/)**: A fast all-in-one JavaScript runtime, bundler, and package manager.
- **[ElysiaJS](https://elysiajs.com/)**: An ergonomic, highly performant web framework specifically built for Bun.
- **[Drizzle ORM](https://orm.drizzle.team/)**: A headless TypeScript ORM that brings maximum type safety to SQL databases and performs schema generation.
- **[PostgreSQL](https://www.postgresql.org/)**: The robust relational database storing all the data.
- **[Better Auth](https://better-auth.com/)**: A modern, comprehensive authentication library handling users, sessions, and database integrations.

### How I made it & Structure
The backend utilizes a cleanly separated model-route-controller architecture inside standard TypeScript:
- **`src/db/`**: Contains the database initialization configuration (`db.ts`) and database schema definitions mapping TypeScript to Postgres (`schema.ts`).
- **`src/models/`**: Defines structures/schemas (using Typebox/Zod principles) for data validation to ensure incoming and outgoing API requests have the strictly correct format.
- **`src/controllers/`**: Contains the core business logic; holds the functions that asynchronously query the database via Drizzle and process/return the data.
- **`src/routes/`**: Initializes the API endpoints using Elysia, applying middleware/guards, parsing validations, and delegating actual work to controllers.
- **`src/auth/`**: Holds the internal authentication configuration (`auth.ts`), handling web sessions, and authorization logic like Elysia macros (`authGuard.ts`).

### How to Run it From Scratch
To get the backend spinning locally from scratch, walk through these simple steps:

1. **Install Bun:** If you haven't yet, install the Bun runtime on your system.
   (It depends on your system, check [BUN](https://bun.sh/docs/installation))

2. **Navigate to the Backend Directory:**
   ```bash
   cd backend/app
   ```

3. **Install Dependencies:**
   Run the following to automatically download and scaffold all necessary libraries.
   ```bash
   bun install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend/app` directory and populate it with your database credentials and secret auth keys. An example structure:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/classroom_db"
   BETTER_AUTH_SECRET="your_random_secret_string"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

5. **Generate and Apply Database Migrations:**
   Using Drizzle Kit, apply your TypeScript schemas into your SQL Postgres database. Make sure your local Postgres instance is running first.
   ```bash
   bun drizzle-kit generate
   bun drizzle-kit migrate
   ```

6. **Start the Development Server:**
   This will run the server locally in watch mode. It will automatically detect code changes and reload dynamically.
   ```bash
   bun run dev
   ```
   *Your backend should now be up and listening for requests!*

## Frontend

*This section will be populated in the future once the frontend is integrated.*
