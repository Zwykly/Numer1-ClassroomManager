import type { UserInfo } from "@/utils/models";

export function WelcomeBanner({ userInfo }: { userInfo?: UserInfo | null }) {
    console.log(userInfo)
    return (
        <div className="w-full h-20 mt-20 text-4xl tracking-wide flex justify-center align-middle text-center">
            Welcome back, {userInfo ? <a className="text-yellow ml-3 font-bold"> {userInfo.firstName} {userInfo.lastName}</a> : null}
        </div>
    );
}