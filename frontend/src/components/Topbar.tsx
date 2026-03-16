import { Home } from "lucide-react";

export function Topbar() {
    return (
        <div className="w-full h-20 mt-4 flex justify-center items-center font-semibold text-black">
            <div className="w-[95%] h-[80%] bg-white rounded-2xl">
                <div className="w-full h-full flex justify-between items-center px-6">
                    <div className="">
                        <Home color="black" />
                    </div>
                    <div className="w-[70%] h-full flex flex-row justify-end items-center">
                        <a className="mx-3.5" href="">My calendar</a>
                        <a className="mx-3.5" href="">Todays plan</a>
                        <a className="mx-3.5" href="">My Groups/Students</a>
                        <div className="mx-3.5 h-[70%] rounded-2xl w-auto bg-yellow px-5 flex items-center justify-center">
                            <a className="">Add class</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}