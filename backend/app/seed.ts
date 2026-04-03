import { drizzle } from "drizzle-orm/node-postgres";
import { table as schema } from "./src/db/schema";

import { Client } from "pg";

// Ensure you have DATABASE_URL set in your .env file
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/my_database";

// Setup Postgres client and Drizzle
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
const db = drizzle(client);

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // ---------------------------------------------------------------------------
    // 1. CLEANUP (Optional: Remove if you don't want to reset data on every seed)
    // Deleting in reverse order of dependencies to avoid foreign key errors
    // ---------------------------------------------------------------------------
    console.log("🧹 Clearing existing data...");
    await db.delete(schema.reservationStudents);
    await db.delete(schema.reservationGroups);
    await db.delete(schema.groupStudents);
    await db.delete(schema.teacherGroups);
    await db.delete(schema.onlineClassrooms);
    await db.delete(schema.classroomReservations);
    await db.delete(schema.classrooms);
    await db.delete(schema.groups);
    await db.delete(schema.students);
    await db.delete(schema.users);

    // ---------------------------------------------------------------------------
    // 2. SEED INDEPENDENT TABLES
    // ---------------------------------------------------------------------------
    console.log("👤 Inserting Users (Teachers)...");
    const insertedUsers = await db.insert(schema.users).values([
      {
        username: "teacher_john",
        password: "hashed_password_123", // In a real app, ensure this is a hashed password
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@school.com",
        additionalInfo: "Senior Mathematics Teacher",
      },
      {
        username: "teacher_jane",
        password: "hashed_password_456",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@school.com",
        additionalInfo: "Physics Department Head",
      },
    ]).returning();

    console.log("🎓 Inserting Students...");
    const insertedStudents = await db.insert(schema.students).values([
      { firstName: "Alice", lastName: "Johnson", email: "alice@student.com", phoneNumber: "123456789" },
      { firstName: "Bob", lastName: "Brown", email: "bob@student.com", phoneNumber: "987654321" },
      { firstName: "Charlie", lastName: "Davis", email: "charlie@student.com", phoneNumber: "555123456" },
      { firstName: "Diana", lastName: "Evans", email: "diana@student.com", phoneNumber: "444987654" },
    ]).returning();

    console.log("📚 Inserting Groups...");
    const insertedGroups = await db.insert(schema.groups).values([
      { name: "Advanced Calculus", description: "Preparation for university math." },
      { name: "Intro to Physics", description: "Basic mechanics and thermodynamics." },
    ]).returning();

    console.log("🏢 Inserting Classrooms...");
    const insertedClassrooms = await db.insert(schema.classrooms).values([
      { name: "Room 101", maxNumberOfPeople: 30, status: "active", additionalInfo: "Has projector" },
      { name: "Room 202", maxNumberOfPeople: 20, status: "active", additionalInfo: "Chemistry Lab" },
      { name: "Room 303", maxNumberOfPeople: 15, status: "maintenance", additionalInfo: "AC broken" },
    ]).returning();

    // ---------------------------------------------------------------------------
    // 3. SEED DEPENDENT TABLES (Level 1)
    // ---------------------------------------------------------------------------
    console.log("🔗 Associating Teachers with Groups...");
    await db.insert(schema.teacherGroups).values([
      // Note: groupId is marked as unique in your schema
      { groupId: insertedGroups[0].id, teacherId: insertedUsers[0].id }, // John teaches Calculus
      { groupId: insertedGroups[1].id, teacherId: insertedUsers[1].id }, // Jane teaches Physics
    ]);

    console.log("🔗 Associating Students with Groups...");
    await db.insert(schema.groupStudents).values([
      // Calculus Group
      { groupId: insertedGroups[0].id, studentId: insertedStudents[0].id },
      { groupId: insertedGroups[0].id, studentId: insertedStudents[1].id },
      // Physics Group
      { groupId: insertedGroups[1].id, studentId: insertedStudents[2].id },
      { groupId: insertedGroups[1].id, studentId: insertedStudents[3].id },
    ]);

    console.log("🌐 Inserting Online Classrooms...");
    await db.insert(schema.onlineClassrooms).values([
      { name: "Virtual Math Lab", teacherId: insertedUsers[0].id, status: "active", comment: "Zoom Link: ..." },
      { name: "Online Physics Help", teacherId: insertedUsers[1].id, status: "inactive" },
    ]);

    console.log("📅 Inserting Classroom Reservations...");
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const insertedReservations = await db.insert(schema.classroomReservations).values([
      {
        teacherId: insertedUsers[0].id,
        startDate: now,
        endDate: tomorrow,
        additionalInfo: "Midterm Exam Prep",
      },
      {
        teacherId: insertedUsers[1].id,
        startDate: tomorrow,
        endDate: nextWeek,
        additionalInfo: "Physics Experiment Week",
      },
    ]).returning();

    // ---------------------------------------------------------------------------
    // 4. SEED DEPENDENT TABLES (Level 2)
    // ---------------------------------------------------------------------------
    console.log("📌 Linking Reservations to Groups and Students...");

    // Link reservation 1 to the Calculus group
    await db.insert(schema.reservationGroups).values([
      {
        reservationId: insertedReservations[0].id,
        groupId: insertedGroups[0].id,
        name: "Calculus Exam Slot",
        description: "Mandatory attendance",
      }
    ]);

    // Link reservation 2 to specific students directly
    await db.insert(schema.reservationStudents).values([
      { reservationId: insertedReservations[1].id, studentId: insertedStudents[2].id, additionalInfo: "Needs wheelchair access" },
      { reservationId: insertedReservations[1].id, studentId: insertedStudents[3].id },
    ]);

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    // Close the database connection to exit the script properly
    await client.end();
    process.exit(0);
  }
}

seed();