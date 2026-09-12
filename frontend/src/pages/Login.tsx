import loginBackground from "../login-bg.png";
import { LoginForm } from "../components/LoginForm";

export function Login() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-canvas p-4">
            <img
                src={loginBackground}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10 w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
