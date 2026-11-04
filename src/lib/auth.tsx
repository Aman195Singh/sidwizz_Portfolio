import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UserRole = "admin" | "client" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
  createdAt: string;
}

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: "usr_admin_01",
    name: "Siddharth Maurya",
    email: "admin@siddwhizz.com",
    role: "admin",
    organization: "SIDD.WHIZZ Official",
    createdAt: "2024-01-01T00:00:00Z",
  },
  client: {
    id: "usr_client_01",
    name: "Priya Sharma",
    email: "priya@techsummit.io",
    role: "client",
    organization: "Apex Global Tech Summits",
    createdAt: "2024-06-15T00:00:00Z",
  },
  member: {
    id: "usr_member_01",
    name: "Amit Verma",
    email: "amit.verma@example.com",
    role: "member",
    organization: "Event Enthusiast & Community",
    createdAt: "2024-09-10T00:00:00Z",
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (data: { name: string; email: string; password?: string; role: UserRole; organization?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfilePhoto: (avatarUrl: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "siddwhizz_auth_user";
const PASSWORDS_KEY = "siddwhizz_user_passwords";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.warn("Failed to read user from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (u: User | null) => {
    setUser(u);
    try {
      if (typeof window !== "undefined") {
        if (u) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn("Failed to write user to localStorage", e);
    }
  };

  const getStoredPassword = (email: string): string => {
    if (typeof window === "undefined") return "password123";
    try {
      const map = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || "{}");
      if (map[email.toLowerCase()]) return map[email.toLowerCase()];
    } catch {
      // ignore
    }
    return email.toLowerCase().includes("admin") ? "sid123" : "password123";
  };

  const setStoredPassword = (email: string, newPass: string) => {
    if (typeof window === "undefined") return;
    try {
      const map = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || "{}");
      map[email.toLowerCase()] = newPass;
      localStorage.setItem(PASSWORDS_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  };

  const login = async (email: string, password?: string, forcedRole?: UserRole) => {
    const lowerEmail = email.toLowerCase().trim();
    let selectedUser: User;

    if (forcedRole && DEMO_USERS[forcedRole]) {
      selectedUser = { ...DEMO_USERS[forcedRole] };
    } else if (lowerEmail.includes("admin") || lowerEmail === DEMO_USERS.admin.email) {
      selectedUser = { ...DEMO_USERS.admin };
    } else if (lowerEmail.includes("client") || lowerEmail.includes("summit") || lowerEmail === DEMO_USERS.client.email) {
      selectedUser = { ...DEMO_USERS.client };
    } else if (lowerEmail === DEMO_USERS.member.email) {
      selectedUser = { ...DEMO_USERS.member };
    } else {
      selectedUser = {
        id: `usr_${Date.now()}`,
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: lowerEmail,
        role: "client",
        organization: "Client Organization",
        createdAt: new Date().toISOString(),
      };
    }

    // Retain avatar if previously saved
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email === selectedUser.email && parsed.avatar) {
            selectedUser.avatar = parsed.avatar;
          }
        }
      }
    } catch {
      // ignore
    }

    // Verify password if given
    if (password) {
      const validPass = getStoredPassword(lowerEmail);
      if (password !== validPass && password !== "sid123" && password !== "password123") {
        return { success: false, error: "Incorrect password. Default for admin is 'sid123'." };
      }
    }

    saveUser(selectedUser);
    return { success: true, user: selectedUser };
  };

  const signup = async (data: { name: string; email: string; password?: string; role: UserRole; organization?: string }) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role,
      organization: data.organization?.trim() || (data.role === "admin" ? "Management" : data.role === "client" ? "Corporate Client" : "Community"),
      createdAt: new Date().toISOString(),
    };

    if (data.password) {
      setStoredPassword(data.email, data.password);
    }

    saveUser(newUser);
    return { success: true };
  };

  const updateProfilePhoto = async (avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };
    const updated = { ...user, avatar: avatarUrl };
    saveUser(updated);
    return { success: true };
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };
    const currentValid = getStoredPassword(user.email);

    if (currentPassword !== currentValid && currentPassword !== "sid123" && currentPassword !== "password123") {
      return { success: false, error: "Current password does not match." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    setStoredPassword(user.email, newPassword);
    return { success: true };
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };
    const updated = { ...user, ...data };
    saveUser(updated);
    return { success: true };
  };

  const logout = () => {
    saveUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (DEMO_USERS[newRole]) {
      saveUser(DEMO_USERS[newRole]);
    } else if (user) {
      saveUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        updateProfilePhoto,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
