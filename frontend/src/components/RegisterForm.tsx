export function RegisterForm() {
    return (
        <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-center items-center">
            <form className="w-[90%] h-[80%] flex flex-col items-center">
                <div className="w-[90%] h-auto flex flex-col justify-start ">
                    <a className=" text-4xl text-black text-left font-medium">Register to <br /> Numer1 Class Manager</a>
                    <div className="mt-2 w-full h-1 bg-black rounded-2xl"></div>
                </div>
                <div className="mt-10 w-[90%] h-auto flex flex-col justify-start">
                    <a className="text-l text-black font-bold">E-mail:</a>
                    <input placeholder="eg. kawa@gmail.com" className="mt-1 text-l text-black p-3 rounded-2xl placeholder-gray-500 border-black border-2 bg-white"></input>
                </div>
                <div className="mt-3 w-[90%] h-auto flex flex-row justify-between">
                    <div className="w-[48%] h-auto flex flex-col justify-start">
                        <a className="text-l text-black font-bold">First name:</a>
                        <input placeholder="eg. Ewa" className="mt-1 text-l text-black p-3 rounded-2xl placeholder-gray-500 border-black border-2 bg-white"></input>
                    </div>
                    <div className="w-[48%] h-auto flex flex-col justify-start">
                        <a className="text-l text-black font-bold">Last name:</a>
                        <input placeholder="eg. Nowacka" className="mt-1 text-l text-black p-3 rounded-2xl placeholder-gray-500 border-black border-2 bg-white"></input>
                    </div>
                </div>
                <div className="mt-3 w-[90%] h-auto flex flex-col justify-start">
                    <a className="text-l text-black font-bold">Username:</a>
                    <input placeholder="eg. ireneuszKozicki2024" className="mt-1 text-l text-black p-3 rounded-2xl placeholder-gray-500 border-black border-2 bg-white"></input>
                </div>
                <div className="mt-3 w-[90%] h-auto flex flex-col justify-start">
                    <a className="text-l text-black font-bold">Password:</a>
                    <input type="password" placeholder="•••••••" className="mt-1 text-l text-black p-3 rounded-2xl placeholder-gray-500 border-black border-2 bg-white"></input>
                </div>
                <button className="mt-6 text-xl text-black font-bold bg-yellow px-10 py-3 rounded-2xl"> REGISTER </button>
            </form>
            <div className="flex flex-col justify-center items-center">
                <div className="text-black text-l">
                    Already have an account? <a href="/" className="text-blue font-bold"> Click here </a>
                </div>
            </div>
        </div>
    );
}