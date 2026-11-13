"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { api } from "@/lib/api";

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  scholarId?: string;
  role: "USER" | "ADMIN";
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
  handleGoogleSuccess: (credentialResponse: any) => Promise<boolean>;
  handleWebmailLogin: (email: string, name?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
  googleClientId: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    checkLocalUser();
  }, []);

  const checkLocalUser = async () => {
    try {
      const storedToken = localStorage.getItem("userToken");
      const storedUser = localStorage.getItem("userInfo");
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // Fetch fresh profile from MongoDB to detect if admin changed role to "ADMIN"
        try {
          const res = await api.get("/auth/me");
          if (res.data) {
            setUser(res.data);
            localStorage.setItem("userInfo", JSON.stringify(res.data));
          }
        } catch (e: any) {
          if (e.response?.status === 401 || e.response?.status === 403) {
            logout();
          }
        }
      }
    } catch (e) {
      console.error("Local user check error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const isInstituteEmail = (emailStr: string) => {
    if (!emailStr) return false;
    const clean = emailStr.trim().toLowerCase();
    return clean.endsWith(".nits.ac.in") || clean.endsWith("@nits.ac.in") || clean.endsWith("@cse.nits.ac.in");
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        throw new Error("No credential returned by Google");
      }

      // Pre-check email payload from JWT client-side
      try {
        const parts = credential.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          const email = (payload.email || "").trim().toLowerCase();
          if (email && !isInstituteEmail(email)) {
            alert(`Access Restricted:\n${email} is not an official NIT Silchar institute email.\n\nPlease select your institutional (@cse.nits.ac.in) account to proceed.`);
            setIsLoading(false);
            return false;
          }
        }
      } catch (decodeErr) {
        console.warn("Could not pre-decode token, proceeding to backend validation", decodeErr);
      }

      // Send Google credential directly to backend
      const res = await api.post("/auth/google", { credential });
      const { token: receivedToken, user: backendUser } = res.data;

      localStorage.setItem("userToken", receivedToken);
      localStorage.setItem("userInfo", JSON.stringify(backendUser));
      setToken(receivedToken);
      setUser(backendUser);
      return true;
    } catch (error: any) {
      console.error("Google Auth Backend Error:", error);
      const msg =
        error.response?.data?.message ||
        "Google Authentication failed. Please verify your @cse.nits.ac.in account.";
      alert(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebmailLogin = async (email: string, name?: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!isInstituteEmail(cleanEmail)) {
        alert("Access Restricted:\nPlease enter an official NIT Silchar institute email (@cse.nits.ac.in / @nits.ac.in).\nPersonal emails like @gmail.com are not permitted.");
        setIsLoading(false);
        return false;
      }

      const res = await api.post("/auth/google", {
        googleId: "google-" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_"),
        email: cleanEmail,
        name: name?.trim() || cleanEmail.split("@")[0],
        profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      });

      const { token: receivedToken, user: backendUser } = res.data;
      localStorage.setItem("userToken", receivedToken);
      localStorage.setItem("userInfo", JSON.stringify(backendUser));
      setToken(receivedToken);
      setUser(backendUser);
      return true;
    } catch (error: any) {
      console.error("Webmail Login Error:", error);
      const msg = error.response?.data?.message || "Login failed.";
      alert(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setUser(null);
    setToken(null);
    setAdminOpen(false);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("userInfo", JSON.stringify(updated));
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data) {
        setUser(res.data);
        localStorage.setItem("userInfo", JSON.stringify(res.data));
      }
    } catch (e) {
      console.error("Refresh profile error", e);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  const content = (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        adminOpen,
        setAdminOpen,
        handleGoogleSuccess,
        handleWebmailLogin,
        logout,
        updateUser,
        refreshProfile,
        googleClientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}

export const useAuth = () => useContext(AuthContext);
