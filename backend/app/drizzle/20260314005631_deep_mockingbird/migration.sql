ALTER TABLE "classroom_reservations" ADD COLUMN "classroom_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "classroom_reservations" ADD COLUMN "online_classroom_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "classroom_reservations" ADD CONSTRAINT "classroom_reservations_classroom_id_classrooms_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id");--> statement-breakpoint
ALTER TABLE "classroom_reservations" ADD CONSTRAINT "classroom_reservations_rzJ1rOMLluAg_fkey" FOREIGN KEY ("online_classroom_id") REFERENCES "online_classrooms"("id");