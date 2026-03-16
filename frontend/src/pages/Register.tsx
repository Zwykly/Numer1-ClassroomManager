import { RegisterForm } from "../components/RegisterForm";

export function Register() {
    return (
        <div className="w-full h-full flex justify-center align-middle items-center">
            <div className="w-140 h-200 flex flex-col justify-center items-center">
                <RegisterForm />
            </div>
        </div>

    );
}