import { LoginForm } from "../components/LoginForm";

export function Login() {
    return (
        <div className="w-full h-full flex justify-center align-middle items-center">
            <div className="w-140 h-150 flex flex-col justify-center items-center">
                <LoginForm />
            </div>
        </div>

    );
}