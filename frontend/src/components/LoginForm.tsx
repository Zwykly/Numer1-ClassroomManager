import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/utils/AuthProvider";
import type React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type LoginFormData = {
    username: string;
    password: string;
}

export function LoginForm() {
    const navigate = useNavigate();
    const validateEmailRegex = /^\S+@\S+\.\S+$/;
    const { refetch } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        console.log(data);
        const isEmailLogin = validateEmailRegex.test(data.username);
        try {
            if (isEmailLogin) {
                const result = await authClient.signIn.email({
                    email: data.username,
                    password: data.password,
                });
                if (result.error) {
                    console.log(result.error);
                } else {
                    await refetch();
                    navigate("/myHome", { replace: true });
                };
            } else {
                const result = await authClient.signIn.username({
                    username: data.username,
                    password: data.password,
                });
                if (result.error) {
                    console.log(result.error);
                } else {
                    await refetch();
                    navigate("/myHome", { replace: true });
                };
            }

        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-center items-center">
            <form onSubmit={handleSubmit(onSubmit)} className="w-[90%] h-[70%] flex flex-col items-center login-form">
                <div className="w-[90%] h-auto flex flex-col justify-start ">
                    <a className=" text-4xl text-black text-left font-medium">Log in to <br /> Numer1 Class Manager</a>
                    <div className="mt-2 w-full h-1 bg-black rounded-2xl"></div>
                </div>
                <div className="mt-10 w-[90%] h-auto flex flex-col justify-start">
                    <a className="text-l text-black font-bold">Username / E-mail:</a>
                    <input id="login-username" {...register("username", { required: true })} placeholder="eg. ireneuszKozicki2024 or kawa@gmail.com" className="mt-1 text-l text-black p-3 rounded-2xl placeholder-gray-500 border-black border-2 bg-white"></input>
                </div>
                <div className="mt-3 w-[90%] h-auto flex flex-col justify-start">
                    <a className="text-l text-black font-bold">Password:</a>
                    <input id="login-password" {...register("password", { required: true })} type="password" placeholder="•••••••" className="mt-1 text-l text-black p-3 rounded-2xl placeholder-gray-500 placeholder:font-black border-black border-2 bg-white"></input>
                </div>
                <button type="submit" className="mt-6 cursor-pointer text-xl text-black font-bold bg-yellow px-10 py-3 rounded-2xl"> LOGIN </button>
            </form>
            <div className="flex flex-col justify-center items-center">
                <div className="text-black text-l">
                    Need to register? <a href="/register" className="text-blue font-bold"> Click here </a>
                </div>
                <div className="text-black text-l">
                    Forgot your password? <a href="/passwordReset" className="text-blue font-bold"> Click here </a>
                </div>
            </div>
        </div>
    );
}