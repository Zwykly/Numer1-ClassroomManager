# Authentication & Database Architecture

This document briefly explains the purpose of crucial files regarding the authentication and database architecture within the backend of the Numer1 Classroom Manager project.

## [schema.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/auth-schema.ts) ([src/db/schema.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/db/schema.ts))

**Purpose**: Defines the primary application domain models and how they map to actual tables in the PostgreSQL database.

**Why it exists**: 
- We use Drizzle ORM to interact with the database. Therefore, we need to declare our tables (e.g., `classrooms`, `classroom_reservations`, `students`, `groups`) so Drizzle knows what columns exist, what data types they are (UUID, varchar, boolean), and what constraints apply.
- It also exports **relations**. By defining relations, Drizzle ORM can figure out how tables connect (e.g., one teacher has many reservations, students belong to groups). This enables powerful relational querying natively in TypeScript without having to write convoluted raw SQL joins.
- Note: It includes a [users](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/controllers/users.ts#67-68) table, which is our **business-logic user representation** (assigning roles like "admin" or "teacher", keeping additional info), keeping it separated from the core login credentials managed by the Authentication system.

## [auth.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/auth/auth.ts) ([src/auth/auth.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/auth/auth.ts))

**Purpose**: Serves as the configuration core for the `better-auth` library handling authentication.

**Why it exists**:
- It wires up our postgres database (via `drizzleAdapter`) to Better Auth so the library knows where to store sessions, accounts, and credentials (found in [auth-schema.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/auth-schema.ts)).
- It enables plugins and configurations like Email & Password login, and required user fields (like requiring `firstName` and `lastName`).

### **The `databaseHooks` section**
This is the most critical intersection between system authentication and our specific business logic.
By default, `better-auth` manages sessions and a core [user](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/controllers/users.ts#67-68) table holding emails, passwords, and verification tokens. However, the rest of our app relies on the [users](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/controllers/users.ts#67-68) table in [schema.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/auth-schema.ts) (handled by [usersController](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/controllers/users.ts#67-68)) to link people to classes, reservations, and to assign system permissions (e.g. "admin" vs. "teacher").

Therefore, we use a **Database Hook** (`databaseHooks.user.create.after`). 
Whenever a person correctly registers their account:
1. `better-auth` securely creates the auth user in its internal schema.
2. The [after](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/auth/auth.ts#45-66) hook triggers immediately.
3. The hook automatically takes the `id`, `email`, `firstName`, and `lastName` of this newly authenticated identity and uses `usersController.createUser` to create a mirrored business record in our [schema.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/auth-schema.ts) [users](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/controllers/users.ts#67-68) table.

This cleanly separates authentication credentials from business logic while keeping both records perfectly synchronized upon signup.

## [authGuard.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/auth/authGuard.ts) ([src/auth/authGuard.ts](file:///Users/igorszuba/Documents/proj/Numer1-ClassroomManager/backend/app/src/auth/authGuard.ts))

**Purpose**: Reusable ElysiaJS macros (middleware) to protect endpoints from unauthorized access.

**Why it exists**:
- We need a way to easily flag routes as "protected", so we don't allow unauthenticated users to create classrooms or view private data.
- The `authGuard` creates Elysia macros like `isAuth` (requires the user to be logged in) or `isAdmin` (requires the specific admin role).
- When a route applies this guard, it fetches the session token using the request headers. If the user is unauthenticated, the route instantly rejects the request with a `401 Unauthorized` status.
- Crucially, it fetches the user session via Better Auth, and **then** retrieves the business logic details from our database (`usersController.getUserInfoAuthId`). It dynamically attaches everything to the route handler's context: `{ session, user: { ...session.user, userInfo } }`.
- Because of this file, enforcing security checks and fetching the requesting user in any route is as simple as adding `isAuth: true`.
