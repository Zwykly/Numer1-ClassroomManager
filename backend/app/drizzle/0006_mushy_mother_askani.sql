ALTER TABLE "auth_users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "auth_users" DROP COLUMN "last_name";