CREATE TYPE "roles" AS ENUM('admin', 'teacher');--> statement-breakpoint
CREATE TABLE "classroom_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"classroom_id" uuid NOT NULL,
	"online_classroom_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"teacher_id" uuid NOT NULL,
	"additional_info" text,
	"created_on" timestamp DEFAULT now() NOT NULL,
	"edited_on" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"max_number_of_people" integer NOT NULL,
	"additional_info" text,
	"status" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"group_id" uuid NOT NULL,
	"student_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "online_classrooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"teacher_id" uuid NOT NULL,
	"comment" text,
	"status" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar,
	"description" text,
	"reservation_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"additional_info" text
);
--> statement-breakpoint
CREATE TABLE "reservation_students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reservation_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"additional_info" text
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"phone_number" varchar,
	"email" varchar,
	"additional_info" text
);
--> statement-breakpoint
CREATE TABLE "teacher_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"group_id" uuid NOT NULL UNIQUE,
	"teacher_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"auth_id" varchar(255) UNIQUE,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"additional_info" text,
	"role" "roles" DEFAULT 'teacher'::"roles"
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text UNIQUE,
	"display_username" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "classroom_reservations" ADD CONSTRAINT "classroom_reservations_classroom_id_classrooms_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id");--> statement-breakpoint
ALTER TABLE "classroom_reservations" ADD CONSTRAINT "classroom_reservations_rzJ1rOMLluAg_fkey" FOREIGN KEY ("online_classroom_id") REFERENCES "online_classrooms"("id");--> statement-breakpoint
ALTER TABLE "classroom_reservations" ADD CONSTRAINT "classroom_reservations_teacher_id_users_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id");--> statement-breakpoint
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id");--> statement-breakpoint
ALTER TABLE "online_classrooms" ADD CONSTRAINT "online_classrooms_teacher_id_users_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "reservation_groups" ADD CONSTRAINT "reservation_groups_mZogy7Pq04Ng_fkey" FOREIGN KEY ("reservation_id") REFERENCES "classroom_reservations"("id");--> statement-breakpoint
ALTER TABLE "reservation_groups" ADD CONSTRAINT "reservation_groups_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id");--> statement-breakpoint
ALTER TABLE "reservation_students" ADD CONSTRAINT "reservation_students_sZSCq2qpoQmo_fkey" FOREIGN KEY ("reservation_id") REFERENCES "classroom_reservations"("id");--> statement-breakpoint
ALTER TABLE "reservation_students" ADD CONSTRAINT "reservation_students_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id");--> statement-breakpoint
ALTER TABLE "teacher_groups" ADD CONSTRAINT "teacher_groups_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id");--> statement-breakpoint
ALTER TABLE "teacher_groups" ADD CONSTRAINT "teacher_groups_teacher_id_users_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;