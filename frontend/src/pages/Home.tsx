import { Topbar } from "../components/Topbar";

export function Home() {
    return (
        <div className="w-full h-full flex flex-col">
            <Topbar />
            <h1 className="text-3xl font-bold underline">Home</h1>
        </div>
    );
}