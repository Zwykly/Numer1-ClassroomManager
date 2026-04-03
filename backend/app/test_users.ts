import { db } from "./src/index";
import { usersController } from "./src/controllers/users";

async function main() {
    try {
        const users = await usersController.getAllUsers();
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
main();
