import { Elysia, status } from "elysia";
import { auth } from "./auth";
import { usersController } from "../controllers/users";

export const authGuard = new Elysia()
    .macro({
        isAuth: {
            async resolve({ request }) {
                const session = await auth.api.getSession(request);
                console.log("session", session);
                if (!session || !session.user) {
                    return status(401, "Unauthorized");
                }
                const userInfo = await usersController.getUserInfoAuthId(session.user.id);
                return {
                    session: session.session,
                    user: {
                        ...session.user,
                        userInfo: userInfo,
                    },
                };
            }
        },
        isAdmin: {
            async resolve({ request }) {
                const session = await auth.api.getSession(request);
                if (!session || !session.user) {
                    return status(401, "Unauthorized");
                }
                const userInfo = await usersController.getUserInfoAuthId(session.user.id);
                if (userInfo.role !== "admin") {
                    return status(403, "Forbidden");
                }
                return {
                    session,
                    user: {
                        ...session.user,
                        userInfo: userInfo,
                    },
                };
            }
        }
    });
