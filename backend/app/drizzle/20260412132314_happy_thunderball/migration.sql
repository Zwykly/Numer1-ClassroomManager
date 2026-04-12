CREATE TYPE "reservationCycleStatus" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "reservationStatus" AS ENUM('scheduled', 'canceled', 'ongoing', 'completed', 'cyclical');--> statement-breakpoint
CREATE TABLE "reservationCycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"teacherId" uuid NOT NULL,
	"additionalInfo" text,
	"anchorDate" timestamp NOT NULL,
	"cycleEndDate" timestamp,
	"numberOfOccurrences" integer,
	"frequency" integer NOT NULL,
	"status" "reservationCycleStatus" DEFAULT 'active'::"reservationCycleStatus" NOT NULL,
	"createdOn" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classroom_reservations" RENAME TO "classroomReservations";--> statement-breakpoint
ALTER TABLE "group_students" RENAME TO "groupStudents";--> statement-breakpoint
ALTER TABLE "online_classrooms" RENAME TO "onlineClassrooms";--> statement-breakpoint
ALTER TABLE "reservation_groups" RENAME TO "reservationGroups";--> statement-breakpoint
ALTER TABLE "reservation_students" RENAME TO "reservationStudents";--> statement-breakpoint
ALTER TABLE "teacher_groups" RENAME TO "teacherGroups";--> statement-breakpoint
ALTER TABLE "classroomReservations" RENAME COLUMN "classroom_id" TO "classroomId";--> statement-breakpoint
ALTER TABLE "classroomReservations" RENAME COLUMN "online_classroom_id" TO "onlineClassroomId";--> statement-breakpoint
ALTER TABLE "classroomReservations" RENAME COLUMN "teacher_id" TO "teacherId";--> statement-breakpoint
ALTER TABLE "classroomReservations" RENAME COLUMN "additional_info" TO "additionalInfo";--> statement-breakpoint
ALTER TABLE "classroomReservations" RENAME COLUMN "created_on" TO "createdOn";--> statement-breakpoint
ALTER TABLE "classroomReservations" RENAME COLUMN "edited_on" TO "editedOn";--> statement-breakpoint
ALTER TABLE "classrooms" RENAME COLUMN "max_number_of_people" TO "maxNumberOfPeople";--> statement-breakpoint
ALTER TABLE "classrooms" RENAME COLUMN "additional_info" TO "additionalInfo";--> statement-breakpoint
ALTER TABLE "groupStudents" RENAME COLUMN "group_id" TO "groupId";--> statement-breakpoint
ALTER TABLE "groupStudents" RENAME COLUMN "student_id" TO "studentId";--> statement-breakpoint
ALTER TABLE "onlineClassrooms" RENAME COLUMN "teacher_id" TO "teacherId";--> statement-breakpoint
ALTER TABLE "reservationGroups" RENAME COLUMN "reservation_id" TO "reservationId";--> statement-breakpoint
ALTER TABLE "reservationGroups" RENAME COLUMN "group_id" TO "groupId";--> statement-breakpoint
ALTER TABLE "reservationGroups" RENAME COLUMN "additional_info" TO "additionalInfo";--> statement-breakpoint
ALTER TABLE "reservationStudents" RENAME COLUMN "reservation_id" TO "reservationId";--> statement-breakpoint
ALTER TABLE "reservationStudents" RENAME COLUMN "student_id" TO "studentId";--> statement-breakpoint
ALTER TABLE "reservationStudents" RENAME COLUMN "additional_info" TO "additionalInfo";--> statement-breakpoint
ALTER TABLE "students" RENAME COLUMN "first_name" TO "firstName";--> statement-breakpoint
ALTER TABLE "students" RENAME COLUMN "last_name" TO "lastName";--> statement-breakpoint
ALTER TABLE "students" RENAME COLUMN "phone_number" TO "phoneNumber";--> statement-breakpoint
ALTER TABLE "students" RENAME COLUMN "additional_info" TO "additionalInfo";--> statement-breakpoint
ALTER TABLE "teacherGroups" RENAME COLUMN "group_id" TO "groupId";--> statement-breakpoint
ALTER TABLE "teacherGroups" RENAME COLUMN "teacher_id" TO "teacherId";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "auth_id" TO "authId";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "last_name" TO "lastName";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "additional_info" TO "additionalInfo";--> statement-breakpoint
ALTER TABLE "teacherGroups" DROP CONSTRAINT "teacher_groups_group_id_key";--> statement-breakpoint
ALTER TABLE "classroomReservations" ADD COLUMN "reservationTime" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "classroomReservations" ADD COLUMN "status" "reservationStatus" DEFAULT 'scheduled'::"reservationStatus" NOT NULL;--> statement-breakpoint
ALTER TABLE "classroomReservations" ADD COLUMN "cycleId" uuid;--> statement-breakpoint
ALTER TABLE "classroomReservations" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "classroomReservations" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "classroomReservations" ALTER COLUMN "classroomId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "classroomReservations" ALTER COLUMN "onlineClassroomId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "onlineClassrooms" ADD CONSTRAINT "onlineClassrooms_teacherId_key" UNIQUE("teacherId");--> statement-breakpoint
ALTER TABLE "classroomReservations" ADD CONSTRAINT "classroomReservations_cycleId_reservationCycles_id_fkey" FOREIGN KEY ("cycleId") REFERENCES "reservationCycles"("id");--> statement-breakpoint
ALTER TABLE "reservationCycles" ADD CONSTRAINT "reservationCycles_teacherId_users_id_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id");