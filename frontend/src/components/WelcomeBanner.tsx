export function WelcomeBanner(user: any) {
    return (
        <div className="w-full h-20 mt-20 text-4xl tracking-wide flex justify-center align-middle text-center">
            Welcome back, <a className="text-yellow ml-3 font-bold"> {user.firstName} {user.lastName}</a>
        </div>
    );
}