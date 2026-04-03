import { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import type { userData } from "./models";

type AuthContextType = {
  UserData: userData | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [UserData, setUserData] = useState<userData | null>(() => {
    const cachedUserData = localStorage.getItem("UserData");
    return cachedUserData ? JSON.parse(cachedUserData) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await authClient.getSession();
      setUserData(userData ?? null);
      localStorage.setItem("UserData", JSON.stringify(userData));
    } catch (error) {
      localStorage.removeItem("UserData");
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
