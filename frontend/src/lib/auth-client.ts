import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import { API_URL } from "./api-url";

export const authClient = createAuthClient({
    baseURL: API_URL,
    plugins: [
        usernameClient(),
    ]
});

export const {
    signIn,
    signOut,
    signUp,
    useSession,
} = authClient;