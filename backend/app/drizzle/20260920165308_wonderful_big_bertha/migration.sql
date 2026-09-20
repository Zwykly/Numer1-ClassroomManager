CREATE TABLE "teacherStudents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"studentId" uuid NOT NULL,
	"teacherId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "color" varchar;--> statement-breakpoint
ALTER TABLE "teacherStudents" ADD CONSTRAINT "teacherStudents_studentId_students_id_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id");--> statement-breakpoint
ALTER TABLE "teacherStudents" ADD CONSTRAINT "teacherStudents_teacherId_users_id_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id");