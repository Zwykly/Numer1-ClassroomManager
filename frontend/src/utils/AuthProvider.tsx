import { createContext, useContext, useState, useEffect } from "react";
import { type Session, type User } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { error } from "better-auth/api";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cachedSession = localStorage.getItem("session");
  const initialSession = cachedSession ? JSON.parse(cachedSession) : null;

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const { data } = await authClient.getSession();
      setSession(data?.session ?? null);
      setUser(data?.user ?? null);
      localStorage.setItem("session", JSON.stringify(data));
    } catch (error) {
      localStorage.removeItem("session");
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, refetch }}>
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
