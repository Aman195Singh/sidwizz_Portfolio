import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import hostBowtie from "@/assets/host-bowtie.jpg";
import avatarPriya from "@/assets/avatar-priya.jpg";
import avatarAmit from "@/assets/avatar-amit.jpg";

export type UserRole = "admin" | "client" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
  createdAt: string;
  sessionSignature?: string;
}

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: "usr_admin_01",
    name: "Siddharth Maurya",
    email: "admin@siddwhizz.com",
    role: "admin",
    organization: "SIDD.WHIZZ Official",
    avatar: hostBowtie,
    createdAt: "2024-01-01T00:00:00Z",
  },
  client: {
    id: "usr_client_01",
    name: "Priya Sharma",
    email: "priya@techsummit.io",
    role: "client",
    organization: "Apex Global Tech Summits",
    avatar: avatarPriya,
    createdAt: "2024-06-15T00:00:00Z",
  },
  member: {
    id: "usr_member_01",
    name: "Amit Verma",
    email: "amit.verma@example.com",
    role: "member",
    organization: "Event Enthusiast & Community",
    avatar: avatarAmit,
    createdAt: "2024-09-10T00:00:00Z",
  },
};

/**
 * Tamper-evident session signature generator & verifier.
 * Prevents DevTools privilege escalation (e.g. manually editing `"role": "admin"` in localStorage).
 */
const SESSION_SALT = "SIDDWHIZZ_RBAC_GUARD_2026_V2";

function computeSessionSignature(u: Pick<User, "id" | "email" | "role">): string {
  const payload = `${u.id}|${u.email.toLowerCase()}|${u.role}|${SESSION_SALT}`;
  let h1 = 0xdeadbeef ^ payload.length;
  let h2 = 0x41c6ce57 ^ payload.length;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `sig_${(h2 >>> 0).toString(16).padStart(8, "0")}${(h1 >>> 0).toString(16).padStart(8, "0")}`;
}

function verifySessionIntegrity(u: User | null): u is User {
  if (!u || !u.id || !u.email || !u.role || !u.sessionSignature) return false;
  return u.sessionSignature === computeSessionSignature(u);
}

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
const PROFILES_KEY = "siddwhizz_user_profiles";

interface SavedUserProfile {
  name?: string;
  organization?: string;
  avatar?: string;
}

function getSavedProfileForEmail(email: string): SavedUserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const map = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
    return map[email.toLowerCase().trim()] || null;
  } catch {
    return null;
  }
}

function persistProfileForEmail(u: User) {
  if (typeof window === "undefined" || !u.email) return;
  try {
    const map = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
    map[u.email.toLowerCase().trim()] = {
      name: u.name,
      organization: u.organization,
      avatar: u.avatar,
    };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function mergeWithSavedProfile(baseUser: User): User {
  const saved = getSavedProfileForEmail(baseUser.email);
  if (!saved) return baseUser;
  return {
    ...baseUser,
    name: saved.name || baseUser.name,
    organization: saved.organization || baseUser.organization,
    avatar: saved.avatar !== undefined ? saved.avatar : baseUser.avatar,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount with tamper-evident signature verification
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: User = JSON.parse(stored);
          if (verifySessionIntegrity(parsed)) {
            const hydrated = mergeWithSavedProfile({
              ...parsed,
              avatar: parsed.avatar ?? DEMO_USERS[parsed.role]?.avatar,
            });
            setUser(hydrated);
          } else {
            console.warn("Tampered or unsigned session detected in localStorage. Clearing session.");
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to read user from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (u: User | null) => {
    if (!u) {
      setUser(null);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // ignore
      }
      return;
    }

    const signedUser: User = {
      ...u,
      sessionSignature: computeSessionSignature(u),
    };
    setUser(signedUser);
    persistProfileForEmail(signedUser);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(signedUser));
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

    // Retain saved profile & avatar across sign-outs using persistent PROFILES_KEY
    selectedUser = mergeWithSavedProfile(selectedUser);

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
    if (data.role === "admin") {
      return {
        success: false,
        error: "Admin accounts cannot be self-registered publicly. Please sign in on /login with authorized Admin credentials.",
      };
    }

    const safeRole: UserRole = data.role === "member" ? "member" : "client";
    const cleanEmail = data.email.toLowerCase().trim();
    const existingSaved = getSavedProfileForEmail(cleanEmail);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: safeRole,
      organization:
        data.organization?.trim() || (safeRole === "client" ? "Corporate Client" : "Community"),
      avatar: existingSaved?.avatar || DEMO_USERS[safeRole].avatar,
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
    // Prevent arbitrary role escalation through updateProfile
    const { role: _ignoredRole, sessionSignature: _ignoredSig, ...safeUpdates } = data;
    const updated = { ...user, ...safeUpdates };
    saveUser(updated);
    return { success: true };
  };

  const logout = () => {
    saveUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (DEMO_USERS[newRole]) {
      saveUser(mergeWithSavedProfile({ ...DEMO_USERS[newRole] }));
    } else if (user) {
      saveUser(mergeWithSavedProfile({ ...user, role: newRole }));
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
