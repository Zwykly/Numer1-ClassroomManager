import { Elysia } from "elysia";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);
const db = drizzle(process.env.DATABASE_URL!);
export { db };

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
const result = await db.execute('select 1');
console.log(result);
