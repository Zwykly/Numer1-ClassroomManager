import { Home } from "lucide-react";
import { useNavigate } from "react-router";

export function Topbar() {
    const navigate = useNavigate();
    return (
        <div className="w-full h-20 mt-4 flex justify-center items-center font-semibold text-black">
            <div className="w-[95%] h-[80%] bg-white rounded-2xl">
                <div className="w-full h-full flex justify-between items-center px-6">
                    <div className="">
                        <Home color="black" className="hover:cursor-pointer hover:drop-shadow-sm/100 hover:drop-shadow-yellow hover:scale-110 duration-150"/>
                    </div>
                    <div className="w-[70%] h-full flex flex-row justify-end items-center">
                        <a className="mx-3.5 hover:cursor-pointer hover:drop-shadow-sm/100 hover:drop-shadow-yellow hover:scale-110 duration-150" onClick={() => navigate("/")}>My calendar</a>
                        <a className="mx-3.5 hover:cursor-pointer hover:drop-shadow-sm/100 hover:drop-shadow-yellow hover:scale-110 duration-150" onClick={() => navigate("/")}>Todays plan</a>
                        <a className="mx-3.5 hover:cursor-pointer hover:drop-shadow-sm/100 hover:drop-shadow-yellow hover:scale-110 duration-150" onClick={() => navigate("/")}>My Groups/Students</a>
                        <div onClick={() => navigate("/")} className="mx-3.5 h-[70%] rounded-2xl w-auto bg-yellow px-5 flex items-center justify-center cursor-pointer hover:shadow-lg/10 hover:scale-110 duration-150 hover:inset-shadow-sm/100 hover:inset-shadow-white">
                            <a className="">Add class</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}