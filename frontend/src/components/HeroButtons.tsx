import { CalendarDaysIcon, GraduationCap, UsersRound } from "lucide-react";
import { data } from "react-router-dom";

export function HeroButtons() {
    return (
        <div className="mt-5 w-full h-100 flex justify-center align-middle text-black">
            <div className="w-[80%] h-full flex flex-row justify-between align-middle">
                <div className="w-[30%] h-auto flex flex-col justify-center items-center rounded-2xl bg-white hover:cursor-pointer hover:bg-yellow hover:animate-up-down-jump duration-300" >
                    <div className="w-[70%] h-[40%] flex flex-col justify-end items-center">
                        <div className="z-10 w-full h-full"> </div>
                        <CalendarDaysIcon className="z-0 w-full h-full animate-up-down" size={120} />
                    </div>
                    <div className="w-[70%] h-[40%] mt-5 text-2xl text-center font-bold">
                        Check your calendar. <br/>
                        <a className="font-medium">Today is: </a>
                        <a className="text-blue font-bold">{new Date(Date.now()).toDateString()}</a>
                    </div>
                </div>
                <div className="w-[30%] h-auto flex flex-col justify-center items-center rounded-2xl bg-white hover:cursor-pointer hover:bg-yellow hover:animate-up-down-jump duration-300" >
                    <div className="w-[70%] h-[40%] flex flex-col justify-end items-center">
                        <div className="z-10 w-full h-full"> </div>
                        <GraduationCap className="z-0 w-full h-full animate-up-down" size={120} />
                    </div>
                    <div className="w-[70%] h-[40%] mt-5 text-2xl text-center font-bold">
                        Schedule your next class or manage exisitng ones.
                    </div>
                </div>
                <div className="w-[30%] h-auto flex flex-col justify-center items-center rounded-2xl bg-white hover:cursor-pointer hover:bg-yellow hover:animate-up-down-jump duration-300" >
                    <div className="w-[70%] h-[40%] flex flex-col justify-end items-center">
                        <div className="z-10 w-full h-full"> </div>
                        <UsersRound className="z-0 w-full h-full animate-up-down" size={120} />
                    </div>
                    <div className="w-[70%] h-[40%] mt-5 text-2xl text-center font-bold">
                        Manage your groups and students.
                    </div>
                </div>
            </div>
        </div>
    );
}