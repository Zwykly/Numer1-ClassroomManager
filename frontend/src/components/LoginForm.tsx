export function LoginForm() {
    return (
        <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-center items-center">
            <form className="w-[90%] h-[70%] flex flex-col items-center">
                <div className="w-[90%] h-auto flex flex-col justify-start ">
                    <a className=" text-4xl text-black text-left font-medium">Log in to <br /> Numer1 Class Manager</a>
                    <div className="mt-2 w-full h-1 bg-black rounded-2xl"></div>
                </div>
                <div className="mt-10 w-[90%] h-auto flex flex-col justify-start">
                    <a className="text-l text-black font-bold">Username / E-mail:</a>
                    <input placeholder="eg. ireneuszKozicki2024 or kawa@gmail.com" className="mt-2 text-l text-black p-3 rounded-2xl placeholder-gray-500 border-black border-2 bg-white"></input>
                </div>
                <div className="mt-3 w-[90%] h-auto flex flex-col justify-start">
                    <a className="text-l text-black font-bold">Password:</a>
                    <input type="mt-2 password" className="text-l text-black p-3 rounded-2xl border-black border-2 bg-white"></input>
                </div>
                <button className="mt-6 text-xl text-black font-bold bg-yellow px-10 py-3 rounded-2xl"> LOGIN </button>
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