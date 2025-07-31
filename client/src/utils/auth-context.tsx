import React, { createContext, useState, useEffect, useContext } from "react";
import { LikedReview, Review, UserDetails } from "./interfaces";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export interface AuthContextInterface {
  isAuthenticated: boolean;
  loading: boolean;
  userDetails: UserDetails | null;
  userReviews: Review[] | null;
  likedReviews: LikedReview[] | null;
  setIsAuthenticated: (value: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userReviews, setUserReviews] = useState<Review[] | null>(null);
  const [likedReviews, setLikedReviews] = useState<LikedReview[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function checkAuth(): Promise<void> {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
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
      }).catch((error) => {
        console.error("Auth check failed: ", error);
        setIsAuthenticated(false);
      }).finally(() => {
        return;
      })
    }
    fetch(`${SERVER_URL}/api/account/info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data.userDetails);
        setUserReviews(data.userReviews);
        setLikedReviews(data.LikedReviews);
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
    userDetails,
    userReviews,
    likedReviews,
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
