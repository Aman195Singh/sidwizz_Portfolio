import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import hostBowtie from "@/assets/host-bowtie.jpg";
import avatarPriya from "@/assets/avatar-priya.jpg";
import avatarAmit from "@/assets/avatar-amit.jpg";
import {
  changeSelfPasswordServerFn,
  devQuickLoginServerFn,
  getCurrentSessionServerFn,
  loginServerFn,
  logoutServerFn,
  registerMemberServerFn,
  submitOrganizerApplicationServerFn,
  updateSelfProfileServerFn,
  type AuthSessionDTO,
} from "@/lib/auth-server";
import type { AccountStatus, DataScope, FeatureKey, PermissionKey } from "@/lib/rbac-schema";

export type UserRole = "admin" | "client" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | undefined;
  role: UserRole;
  primaryRoleKey: string;
  roleKeys: string[];
  roleNames: string[];
  accountStatus: AccountStatus;
  emailVerified: boolean;
  organization?: string | undefined;
  organizationIds: string[];
  avatar?: string | undefined;
  dataScope: DataScope;
  permissions: PermissionKey[];
  features: FeatureKey[];
  createdAt: string;
  lastLoginAt?: string | undefined;
  pendingApplicationStatus?:
    | "pending_review"
    | "approved"
    | "changes_requested"
    | "rejected"
    | undefined;
  pendingApplicationNote?: string | undefined;
}

const DEFAULT_ROLE_AVATARS: Record<UserRole, string> = {
  admin: hostBowtie,
  client: avatarPriya,
  member: avatarAmit,
};

function mapSessionToUser(s: AuthSessionDTO): User {
  return {
    id: s.userId,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    primaryRoleKey: s.primaryRoleKey,
    roleKeys: s.roleKeys,
    roleNames: s.roleNames,
    accountStatus: s.accountStatus,
    emailVerified: s.emailVerified,
    organization: s.organization,
    organizationIds: s.organizationIds,
    avatar: s.avatar || DEFAULT_ROLE_AVATARS[s.role],
    dataScope: s.dataScope,
    permissions: s.permissions,
    features: s.features,
    createdAt: s.createdAt,
    lastLoginAt: s.lastLoginAt,
    pendingApplicationStatus: s.pendingApplicationStatus,
    pendingApplicationNote: s.pendingApplicationNote,
  };
}

export interface OrganizerOnboardingInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  organizationName: string;
  organizationType:
    | "Corporate Brand"
    | "Event Management Agency"
    | "Tech Summit / Conference"
    | "Festival / Live Promoter"
    | "Luxury Wedding / Family Office"
    | "University / Institution";
  websiteOrSocial?: string | undefined;
  expectedEventFormats?: string[] | undefined;
  notes?: string | undefined;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string | undefined; user?: User | undefined }>;
  devQuickLogin: (
    role: UserRole
  ) => Promise<{ success: boolean; error?: string | undefined; user?: User | undefined }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    organization?: string | undefined;
    phone?: string | undefined;
  }) => Promise<{ success: boolean; error?: string | undefined; user?: User | undefined }>;
  submitOrganizerApplication: (
    data: OrganizerOnboardingInput
  ) => Promise<{ success: boolean; error?: string | undefined; user?: User | undefined }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: PermissionKey) => boolean;
  hasFeature: (feature: FeatureKey) => boolean;
  updateProfilePhoto: (avatarUrl: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      // Purge any legacy client-side localStorage session keys from pre-P1 builds
      if (typeof window !== "undefined") {
        localStorage.removeItem("siddwhizz_auth_user");
        localStorage.removeItem("siddwhizz_user_passwords");
      }
      const res = await getCurrentSessionServerFn();
      if (res.authenticated && res.session) {
        setUser(mapSessionToUser(res.session));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    try {
      const res = await loginServerFn({ data: { email, password } });
      if (!res.success || !res.session) {
        return { success: false, error: res.error || "Invalid credentials." };
      }
      const hydrated = mapSessionToUser(res.session);
      setUser(hydrated);
      return { success: true, user: hydrated };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Authentication service error.",
      };
    }
  };

  const devQuickLogin = async (targetRole: UserRole) => {
    if (!import.meta.env.DEV) {
      return {
        success: false,
        error: "Demo role switching is disabled in production.",
      };
    }
    try {
      const res = await devQuickLoginServerFn({ data: { targetRole } });
      if (!res.success || !res.session) {
        return { success: false, error: res.error || "Dev login unavailable." };
      }
      const hydrated = mapSessionToUser(res.session);
      setUser(hydrated);
      return { success: true, user: hydrated };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Dev login failed.",
      };
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    organization?: string | undefined;
    phone?: string | undefined;
  }) => {
    if (data.role === "admin") {
      return {
        success: false,
        error: "Admin accounts cannot be self-registered publicly. Staff must be invited by a Super Admin.",
      };
    }

    if (data.role === "client") {
      return submitOrganizerApplication({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || "+91 00000 00000",
        organizationName: data.organization || "Corporate / Event Partner",
        organizationType: "Corporate Brand",
      });
    }

    try {
      const res = await registerMemberServerFn({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
        },
      });
      if (!res.success || !res.session) {
        return { success: false, error: res.error || "Member registration failed." };
      }
      const hydrated = mapSessionToUser(res.session);
      setUser(hydrated);
      return { success: true, user: hydrated };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Registration error.",
      };
    }
  };

  const submitOrganizerApplication = async (data: OrganizerOnboardingInput) => {
    try {
      const res = await submitOrganizerApplicationServerFn({ data });
      if (!res.success || !res.session) {
        return { success: false, error: res.error || "Application submission failed." };
      }
      const hydrated = mapSessionToUser(res.session);
      setUser(hydrated);
      return { success: true, user: hydrated };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Organizer application error.",
      };
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await logoutServerFn();
    } catch {
      // ignore
    }
  };

  const hasPermission = useCallback(
    (permission: PermissionKey): boolean => {
      if (!user || user.accountStatus !== "active") return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const hasFeature = useCallback(
    (feature: FeatureKey): boolean => {
      if (!user || user.accountStatus !== "active") return false;
      return user.features.includes(feature);
    },
    [user]
  );

  const updateProfilePhoto = async (avatarUrl: string) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const res = await updateSelfProfileServerFn({ data: { avatar: avatarUrl } });
      if (res.success && res.session) {
        setUser(mapSessionToUser(res.session));
        return { success: true };
      }
      return { success: false, error: res.error || "Failed to update photo." };
    } catch {
      return { success: false, error: "Failed to update photo." };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      return await changeSelfPasswordServerFn({
        data: { currentPassword, newPassword },
      });
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Password update failed.",
      };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const res = await updateSelfProfileServerFn({
        data: {
          name: data.name,
          phone: data.phone,
          organization: data.organization,
          avatar: data.avatar,
        },
      });
      if (res.success && res.session) {
        setUser(mapSessionToUser(res.session));
        return { success: true };
      }
      return { success: false, error: res.error || "Profile update failed." };
    } catch {
      return { success: false, error: "Profile update failed." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        devQuickLogin,
        signup,
        submitOrganizerApplication,
        logout,
        refreshSession,
        hasPermission,
        hasFeature,
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
