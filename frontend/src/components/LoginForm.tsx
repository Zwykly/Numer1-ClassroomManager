import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/utils/AuthProvider";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "./common/Button";
import logo from "../logo.png";

type LoginFormData = {
    username: string;
    password: string;
}

export function LoginForm() {
    const navigate = useNavigate();
    const validateEmailRegex = /^\S+@\S+\.\S+$/;
    const { refetch } = useAuth();
    const [authError, setAuthError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        setAuthError(null);
        const isEmailLogin = validateEmailRegex.test(data.username);
        try {
            const result = isEmailLogin
                ? await authClient.signIn.email({
                    email: data.username,
                    password: data.password,
                })
                : await authClient.signIn.username({
                    username: data.username,
                    password: data.password,
                });

            if (result.error) {
                setAuthError(result.error.message ?? "Invalid credentials. Please try again.");
                return;
            }

            await refetch();
            navigate("/myHome", { replace: true });
        } catch (err) {
            console.error(err);
            setAuthError("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="flex w-full flex-col rounded-2xl border border-light-grey bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center gap-3">
                <img src={logo} alt="Classroom Manager" className="h-11 w-11 object-contain" />
                <div className="flex flex-col leading-none">
                    <span className="text-base font-bold tracking-tight text-black">Classroom</span>
                    <span className="text-base font-bold tracking-tight text-orange">Manager</span>
                </div>
            </div>

            <h1 className="mt-6 text-3xl font-bold text-black">Welcome back</h1>
            <p className="mt-1 text-sm text-darker-grey">
                Log in to manage your classes, students and groups.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-black">Username or e-mail</span>
                    <input
                        id="login-username"
                        autoComplete="username"
                        {...register("username", { required: true })}
                        placeholder="e.g. ireneuszKozicki2024"
                        className="w-full rounded-xl border border-grey bg-white px-4 py-3 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                    />
                    {errors.username && (
                        <span className="text-xs font-semibold text-red-600">This field is required.</span>
                    )}
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-black">Password</span>
                    <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        {...register("password", { required: true })}
                        placeholder="•••••••"
                        className="w-full rounded-xl border border-grey bg-white px-4 py-3 text-black placeholder:text-darker-grey focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
                    />
                    {errors.password && (
                        <span className="text-xs font-semibold text-red-600">This field is required.</span>
                    )}
                </label>

                {authError && (
                    <div className="rounded-xl border border-red-300 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                        {authError}
                    </div>
                )}

                <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Log in"}
                </Button>
            </form>
        </div>
    );
}
