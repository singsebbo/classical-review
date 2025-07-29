import React, { createContext, useState, useEffect, useContext } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export interface AuthContextInterface {
  isAuthenticated: boolean;
  loading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  async function checkAuth(): Promise<void> {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    fetch(`${SERVER_URL}/api/account/info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }).then(async (res) => {
      if (res.ok) {
        setIsAuthenticated(true);
      } else if (res.status === 401) {
        fetch(`${SERVER_URL}/api/account/refresh-tokens`, {
          method: "POST",
          credentials: "include",
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("accessToken", data.accessToken);
            return checkAuth();
          } else {
            setIsAuthenticated(false);
          }
        })
      } else {
        setIsAuthenticated(false);
      }
    }).catch((error) => {
      console.error("Auth check failed: ", error);
      setIsAuthenticated(false);
    }).finally(() => {
      setLoading(false);
    })
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextInterface = {
    isAuthenticated,
    loading,
    setIsAuthenticated,
    checkAuth,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextInterface {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
