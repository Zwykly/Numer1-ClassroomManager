import "dotenv/config";
import { db } from "./src/db/db";
import { auth } from "./src/auth/auth";
import { UsersService } from "./src/services/users";

// Seeds the first administrator account. Safe to run on every container start:
// if the account already exists it is simply promoted/left as-is.
const email = (process.env.ADMIN_EMAIL ?? "admin@classroom.local").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
const firstName = process.env.ADMIN_FIRST_NAME ?? "Admin";
const lastName = process.env.ADMIN_LAST_NAME ?? "User";

function logCredentials() {
  console.log("--------------------------------------------------------");
  console.log(" Initial admin account");
  console.log(`   email:    ${email}`);
  console.log(`   password: ${password}`);
  console.log("--------------------------------------------------------");
}

async function main() {
  const existing = await db.query.users.findFirst({ where: { email } });

  if (existing) {
    if (existing.role !== "admin") {
      await UsersService.patch(existing.id, { role: "admin" });
      console.log(`Promoted existing user ${email} to admin.`);
    } else {
      console.log(`Admin account ${email} already exists, skipping creation.`);
    }
    logCredentials();
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      firstName,
      lastName,
    } as any,
  });

  const created = await UsersService.getByAuthId(result.user.id);
  if (!created) {
    throw new Error(
      "Admin auth account was created but the business user row is missing.",
    );
  }

  await UsersService.patch(created.id, { role: "admin" });
  console.log(`Created admin account ${email}.`);
  logCredentials();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed the initial admin account:", error);
    process.exit(1);
  });
