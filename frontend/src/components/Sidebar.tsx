import { Navigate } from "react-router-dom";
import logo from "../logo.png";
import { Button } from "./common/Button";
import { Calendar } from "lucide-react";
import { CalendarDatePicker } from "./CalendarDatePicker";
import { startOfDay, formatISO } from "date-fns";

export function Sidebar() {
    return (
        <div className="w-2/9 h-full bg-gray-200 flex flex-col items-center">
            <div className="w-3/4 h-full py-4 flex flex-col items-center justify-between"> 
                <div className="topPart">
                    <div className="w-full h-16 flex flex-row items-center justify-between">
                        <img src={logo} alt="Logo" className="h-full" />
                        <a className="text-black text-2xl leading-none font-bold"> CLASSROOM <br /> MANAGER</a>
                    </div>
                    <Button variant="primary" className="w-full"> RESERVE A <br/> CLASSROOM </Button>

                    <CalendarDatePicker selectedDate={startOfDay(new Date())} className="my-6"/>

                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="w-1/5 h-0.75 bg-darker-grey"/>
                        <a className="text-lg text-darker-grey font-medium"> Other actions</a>
                        <div className="w-1/5 h-0.75 bg-darker-grey"/>
                    </div>
                    <Button variant="secondary" className="w-full"> Manage students </Button>
                    <Button variant="secondary" className="w-full"> Manage groups </Button>
                    <Button variant="secondary" className="w-full"> Manage reservations </Button>
                    <Button variant="secondary" className="w-full"> View your calendar </Button>
                </div>
                <div className="bottomPart w-full flex flex-col items-center">
                    <Button variant="primary" className="w-full">
                        <div className="w-full h-full flex flex-row items-center">
                            <img src={logo} alt="Logo" className="h-7 mr-2" />
                            <a className="text-xl leading-none font-medium"> Joanna krupa </a>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}