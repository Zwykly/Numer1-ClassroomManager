import { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { error } from "better-auth/api";
import type { userData } from "./models";

type AuthContextType = {
  UserData: userData | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cachedUserData = localStorage.getItem("UserData");
  const initialUserData = cachedUserData ? JSON.parse(cachedUserData) : null;

  const [UserData, setUserData] = useState<userData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await authClient.getSession();
      setUserData(userData ?? null);
      console.log("User Data",userData)
      localStorage.setItem("UserData", JSON.stringify(userData));
    } catch (error) {
      localStorage.removeItem("session");
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <AuthContext.Provider value={{ UserData, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
