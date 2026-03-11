CREATE TYPE "public"."roles" AS ENUM('admin', 'teacher');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "roles" DEFAULT 'teacher';