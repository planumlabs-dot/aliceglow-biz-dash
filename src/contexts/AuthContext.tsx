import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  role: "ADMIN" | "USER";
  email: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("aliceglow_token")
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        // Check expiry
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          logout();
          return;
        }
        setUser({
          role: payload.perfils?.includes("ADMIN") || payload.role === "ADMIN" ? "ADMIN" : "USER",
          email: payload.email || payload.sub || "",
          name: payload.name || "",
        });
      } else {
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("aliceglow_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("aliceglow_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: user?.role === "ADMIN",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
