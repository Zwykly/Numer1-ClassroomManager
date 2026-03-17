import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { AnimatedDotsBackground } from "./components/AnimatedDotsBackground";
import { AuthProvider } from "./utils/AuthProvider";

export function App() {
  return (
    <div className="App w-full h-full bg-black relative overflow-hidden flex items-center justify-center select-none">
      <AnimatedDotsBackground />
      <div className="z-10 w-full h-full">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;
