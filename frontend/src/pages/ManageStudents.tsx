import { Sidebar } from "../components/Sidebar";

export function ManageStudents() {
    return (
        <div className="w-full h-screen flex flex-row">
            <Sidebar />
            <div className="h-screen flex flex-col w-full bg-white">
                <div className="pt-15 px-6">
                    <h1 className="text-black font-bold text-4xl">Students</h1>
                </div>
            </div>
        </div>
    );
}
