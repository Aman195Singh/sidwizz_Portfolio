import React, { useState, useEffect, useMemo } from "react";
import {
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  CheckCircle2,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Crown,
  Info,
  ArrowUp,
  ArrowDown,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  type SocialAccount,
  type SocialPlatformId,
  type SocialAccountType,
  getStoredSocialAccounts,
  addSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,
  setSocialAccountPrimary,
  toggleSocialAccountVisibility,
  reorderSocialAccounts,
} from "@/lib/data-store";

// ============================================================================
// PLATFORM CATALOG & BRAND CONFIGURATION
// ============================================================================

export interface PlatformConfig {
  id: SocialPlatformId;
  name: string;
  category: "Main Social" | "Messaging & Community" | "Creator & Publishing" | "Professional & Portfolio";
  color: string;
  badgeClass: string;
  domain: string;
  urlPlaceholder: string;
  handlePlaceholder: string;
}

export const PLATFORM_CATALOG: PlatformConfig[] = [
  {
    id: "youtube",
    name: "YouTube",
    category: "Main Social",
    color: "#FF0000",
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/30",
    domain: "youtube.com",
    urlPlaceholder: "https://www.youtube.com/@SiddharthMauryaOfficial",
    handlePlaceholder: "@SiddharthMauryaOfficial",
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Main Social",
    color: "#E1306C",
    badgeClass: "bg-pink-500/10 text-pink-600 border-pink-500/30",
    domain: "instagram.com",
    urlPlaceholder: "https://www.instagram.com/siddharth_maurya",
    handlePlaceholder: "@siddharth_maurya",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Main Social",
    color: "#0A66C2",
    badgeClass: "bg-blue-600/10 text-blue-600 border-blue-600/30",
    domain: "linkedin.com",
    urlPlaceholder: "https://www.linkedin.com/in/siddharth-maurya",
    handlePlaceholder: "/in/siddharth-maurya",
  },
  {
    id: "x",
    name: "X (Twitter)",
    category: "Main Social",
    color: "#000000",
    badgeClass: "bg-neutral-900/10 text-neutral-900 border-neutral-900/30",
    domain: "x.com",
    urlPlaceholder: "https://x.com/Sid_Anchors",
    handlePlaceholder: "@Sid_Anchors",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "Messaging & Community",
    color: "#25D366",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    domain: "wa.me",
    urlPlaceholder: "https://wa.me/919820088776",
    handlePlaceholder: "+91 98200 88776",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Main Social",
    color: "#1877F2",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    domain: "facebook.com",
    urlPlaceholder: "https://www.facebook.com/siddharth.maurya.anchor",
    handlePlaceholder: "siddharth.maurya.anchor",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Main Social",
    color: "#000000",
    badgeClass: "bg-neutral-800/10 text-neutral-800 border-neutral-800/30",
    domain: "tiktok.com",
    urlPlaceholder: "https://www.tiktok.com/@siddwhizz",
    handlePlaceholder: "@siddwhizz",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "Messaging & Community",
    color: "#FFFC00",
    badgeClass: "bg-amber-400/20 text-amber-700 border-amber-400/50",
    domain: "snapchat.com",
    urlPlaceholder: "https://www.snapchat.com/add/sid_anchor",
    handlePlaceholder: "@sid_anchor",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "Creator & Publishing",
    color: "#E60023",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    domain: "pinterest.com",
    urlPlaceholder: "https://www.pinterest.com/siddwhizz",
    handlePlaceholder: "siddwhizz",
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "Messaging & Community",
    color: "#FF4500",
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    domain: "reddit.com",
    urlPlaceholder: "https://www.reddit.com/user/siddwhizz",
    handlePlaceholder: "u/siddwhizz",
  },
  {
    id: "threads",
    name: "Threads",
    category: "Main Social",
    color: "#000000",
    badgeClass: "bg-neutral-900/10 text-neutral-900 border-neutral-900/30",
    domain: "threads.net",
    urlPlaceholder: "https://www.threads.net/@siddharth_maurya",
    handlePlaceholder: "@siddharth_maurya",
  },
  {
    id: "vimeo",
    name: "Vimeo",
    category: "Creator & Publishing",
    color: "#1AB7EA",
    badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/30",
    domain: "vimeo.com",
    urlPlaceholder: "https://vimeo.com/siddwhizz",
    handlePlaceholder: "siddwhizz",
  },
  {
    id: "others",
    name: "Others",
    category: "Professional & Portfolio",
    color: "#64748B",
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-500/30",
    domain: "",
    urlPlaceholder: "https://",
    handlePlaceholder: "username or link",
  },
];

// ============================================================================
// BRAND ICONS SVG COMPONENT
// ============================================================================

export function PlatformBrandIcon({
  platform,
  className = "h-5 w-5",
}: {
  platform: string;
  className?: string;
}) {
  const p = platform.toLowerCase();
  if (p === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#FF0000" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (p === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path
          fill="url(#ig-grad-icon)"
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        />
        <defs>
          <radialGradient id="ig-grad-icon" r="150%" cx="30%" cy="107%">
            <stop stopColor="#fdf497" offset="0%" />
            <stop stopColor="#fdf497" offset="5%" />
            <stop stopColor="#fd5949" offset="45%" />
            <stop stopColor="#d6249f" offset="60%" />
            <stop stopColor="#285AEB" offset="90%" />
          </radialGradient>
        </defs>
      </svg>
    );
  }
  if (p === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#0A66C2" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24m1.4 9.74V9.93H5.06v8.57h2.8z" />
      </svg>
    );
  }
  if (p === "x" || p === "twitter") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#000000" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#25D366" aria-hidden="true">
        <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.201.3-.777.98-.953 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.3.301-.501.101-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.237-.245-.588-.493-.508-.678-.517-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.51c0 1.48 1.079 2.909 1.23 3.109.15.2 2.123 3.242 5.143 4.547.718.31 1.279.495 1.716.634.721.229 1.377.197 1.896.119.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.431-.076-.125-.277-.201-.578-.351zM12.04 2C6.516 2 2.028 6.488 2.028 12.012c0 1.84.498 3.567 1.365 5.05L2 22l5.088-1.336a9.96 9.96 0 0 0 4.952 1.312h.004c5.523 0 10.012-4.488 10.012-10.012A10.007 10.007 0 0 0 12.04 2z" />
      </svg>
    );
  }
  if (p === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#1877F2" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#000000" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96v8.42c.01 2.39-1.07 4.77-2.92 6.22-2.12 1.68-5.07 2.05-7.53 1.05-2.5-1.01-4.29-3.43-4.57-6.13-.34-3.15 1.5-6.28 4.45-7.38 1.12-.42 2.33-.56 3.52-.45v4.1c-.81-.17-1.68-.05-2.42.34-.87.45-1.49 1.32-1.65 2.28-.21 1.19.34 2.45 1.37 3.08 1.03.65 2.42.6 3.39-.14.71-.53 1.13-1.37 1.14-2.27V.02z" />
      </svg>
    );
  }
  if (p === "snapchat") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#FFFC00" aria-hidden="true">
        <path d="M12 2c-3.8 0-6.5 2.5-6.5 5.5 0 1.2.5 2.8 1.2 3.8.2.3.1.6-.1.8-.4.3-1.2.6-1.7 1.1-.5.5-.3 1.1.2 1.3 1.1.4 2.2.1 3 .1.3 0 .5.2.5.5 0 .5-.7 1.5-1.6 2.3-.6.5-.4 1.2.2 1.5 1.4.6 3.1.1 4.8.1 1.7 0 3.4.5 4.8-.1.6-.3.8-1 .2-1.5-.9-.8-1.6-1.8-1.6-2.3 0-.3.2-.5.5-.5.8 0 1.9.3 3-.1.5-.2.7-.8.2-1.3-.5-.5-1.3-.8-1.7-1.1-.2-.2-.3-.5-.1-.8.7-1 1.2-2.6 1.2-3.8 0-3-2.7-5.5-6.5-5.5z" />
      </svg>
    );
  }
  if (p === "pinterest") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#E60023" aria-hidden="true">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.171-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.373-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.003-5.378 12.003-12.004C24.01 5.367 18.641 0 12.017 0z" />
      </svg>
    );
  }
  if (p === "reddit") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#FF4500" aria-hidden="true">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    );
  }
  if (p === "threads") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#000000" aria-hidden="true">
        <path d="M12.186 24C5.468 24 0 18.532 0 11.814 0 5.096 5.468 0 12.186 0c6.685 0 12.132 5.378 12.132 11.814 0 .546-.046 1.092-.138 1.637-.152.91-1.002 1.523-1.911 1.371-.91-.152-1.523-1.002-1.371-1.911.066-.394.099-.788.099-1.097 0-4.887-3.974-8.861-8.811-8.861-4.888 0-8.861 3.974-8.861 8.861 0 4.888 3.973 8.862 8.861 8.862 2.396 0 4.67-.955 6.326-2.612.674-.674 1.767-.674 2.441 0 .674.674.674 1.767 0 2.441C18.665 22.753 15.533 24 12.186 24z" />
      </svg>
    );
  }
  if (p === "vimeo") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#1AB7EA" aria-hidden="true">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.525 3.01 7.525c-.179 0-.806.378-1.881 1.131L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128 1.579-1.379 2.766-2.115 3.557-2.21 1.867-.202 3.019.986 3.456 3.565.468 2.776.791 4.516.969 5.219.535 2.42 1.121 3.631 1.766 3.631.498 0 1.23-.787 2.196-2.361.966-1.574 1.488-2.762 1.564-3.564.135-1.328-.382-1.993-1.551-1.993-.564 0-1.144.131-1.742.393 1.161-3.806 3.39-5.65 6.687-5.534 2.445.087 3.585 1.664 3.42 4.73z" />
      </svg>
    );
  }
  return <Share2 className={className} />;
}

// ============================================================================
// URL VALIDATOR
// ============================================================================

export function validatePlatformUrl(platform: SocialPlatformId, url: string): { isValid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, error: "Profile URL is required." };
  }
  const clean = url.trim();
  if (!/^https?:\/\//i.test(clean) && platform !== "whatsapp") {
    return { isValid: false, error: "URL must start with https:// or http://" };
  }
  const cfg = PLATFORM_CATALOG.find((p) => p.id === platform);
  if (cfg && cfg.domain) {
    try {
      const parsed = new URL(clean);
      if (!parsed.hostname.toLowerCase().includes(cfg.domain.toLowerCase())) {
        return { isValid: false, error: `URL hostname must match ${cfg.domain}` };
      }
    } catch {
      return { isValid: false, error: "Please enter a valid URL." };
    }
  }
  return { isValid: true };
}

// ============================================================================
// COMPACT SOCIAL ACCOUNTS CARD & TWO MODAL WORKFLOWS
// ============================================================================

export function SocialAccountsManager() {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(getStoredSocialAccounts);

  // Modal states
  const [selectedAccountForDetails, setSelectedAccountForDetails] = useState<SocialAccount | null>(null);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<SocialAccount | null>(null);

  // Form states for Add / Edit
  const [formPlatform, setFormPlatform] = useState<SocialPlatformId>("youtube");
  const [formAccountName, setFormAccountName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formProfileUrl, setFormProfileUrl] = useState("https://www.youtube.com/@SiddharthMauryaOfficial");
  const [formAccountType, setFormAccountType] = useState<SocialAccountType>("Creator");
  const [formIsPrimaryPlatform, setFormIsPrimaryPlatform] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string | undefined;
    username?: string | undefined;
    url?: string | undefined;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Search in View All Modal
  const [allSearchQuery, setAllSearchQuery] = useState("");

  // Sync state
  useEffect(() => {
    const handleSync = () => {
      setSocialAccounts(getStoredSocialAccounts());
    };
    window.addEventListener("siddwhizz_social_updated", handleSync);
    return () => window.removeEventListener("siddwhizz_social_updated", handleSync);
  }, []);

  // Top 5 accounts for compact card view
  const topAccounts = useMemo(() => {
    return socialAccounts.slice(0, 5);
  }, [socialAccounts]);

  // Open Add Modal
  const openAddModal = (platformPreset?: SocialPlatformId) => {
    const plat = platformPreset || "youtube";
    const cfg = PLATFORM_CATALOG.find((p) => p.id === plat);
    setEditingAccountId(null);
    setFormPlatform(plat);
    setFormAccountName("");
    setFormUsername("");
    setFormProfileUrl(cfg ? cfg.urlPlaceholder : "https://");
    setFormAccountType("Creator");
    setFormIsPrimaryPlatform(false);
    setFormErrors({});
    setAddAccountModalOpen(true);
  };

  // Open Edit from Details Modal
  const openEditModalFromDetails = (acc: SocialAccount) => {
    setEditingAccountId(acc.id);
    setFormPlatform(acc.platform);
    setFormAccountName(acc.accountName);
    setFormUsername(acc.username);
    setFormProfileUrl(acc.profileUrl);
    setFormAccountType(acc.accountType);
    setFormIsPrimaryPlatform(acc.isPrimaryPlatform || acc.isPrimaryOverall);
    setFormErrors({});
    setSelectedAccountForDetails(null);
    setAddAccountModalOpen(true);
  };

  // Handle Form Validation & Save
  const handleSaveAccount = async () => {
    const errors: { name?: string; username?: string; url?: string } = {};
    if (!formAccountName.trim()) {
      errors.name = "Account display name is required.";
    }
    if (!formUsername.trim()) {
      errors.username = "Username or handle is required.";
    } else {
      // Check duplicate handle
      const normHandle = formUsername.trim().toLowerCase().replace(/^@/, "");
      const isDup = socialAccounts.some(
        (a) =>
          a.id !== editingAccountId &&
          a.platform === formPlatform &&
          a.username.trim().toLowerCase().replace(/^@/, "") === normHandle
      );
      if (isDup) {
        errors.username = `An account with handle "${formUsername}" already exists for ${formPlatform}.`;
      }
    }

    const urlCheck = validatePlatformUrl(formPlatform, formProfileUrl);
    if (!urlCheck.isValid) {
      errors.url = urlCheck.error || "Invalid URL.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const dataPayload = {
        platform: formPlatform,
        accountName: formAccountName.trim(),
        username: formUsername.trim().startsWith("@") || formPlatform === "linkedin" || formPlatform === "whatsapp" || formPlatform === "others"
          ? formUsername.trim()
          : `@${formUsername.trim()}`,
        profileUrl: formProfileUrl.trim(),
        accountType: formAccountType,
        isPrimaryPlatform: formIsPrimaryPlatform,
        isPrimaryOverall: formIsPrimaryPlatform && !socialAccounts.some((a) => a.isPrimaryOverall),
        isVisible: true,
        displayOrder: socialAccounts.length + 1,
      };

      if (editingAccountId) {
        updateSocialAccount(editingAccountId, dataPayload);
        toast.success("Social account details updated successfully!");
      } else {
        addSocialAccount(dataPayload);
        toast.success("New social account added to your directory!");
      }

      setAddAccountModalOpen(false);
      setEditingAccountId(null);
    } catch (err) {
      toast.error("Failed to save social account.");
    } finally {
      setIsSaving(false);
    }
  };

  // Set as Main from Details Modal
  const handleSetMain = (acc: SocialAccount) => {
    setSocialAccountPrimary(acc.id, "platform");
    toast.success(`Marked ${acc.accountName} as primary ${acc.platform} account!`);
    setSelectedAccountForDetails({
      ...acc,
      isPrimaryPlatform: true,
      isPrimaryOverall: true,
    });
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (!deleteConfirmAccount) return;
    deleteSocialAccount(deleteConfirmAccount.id);
    toast.success(`Removed ${deleteConfirmAccount.accountName} from social accounts directory.`);
    setDeleteConfirmAccount(null);
    setSelectedAccountForDetails(null);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. COMPACT SOCIAL MEDIA ACCOUNTS CARD (SINGLE COLUMN)           */}
      {/* ============================================================== */}
      <div className="panel-card shadow-sm space-y-0">
        <div className="panel-card-header flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
            <div className="rounded-xl bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-extrabold text-foreground uppercase tracking-tight">
                Social Media Accounts
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage your social media profiles, add multiple accounts, and set a main account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openAddModal()}
            className="btn-red !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 uppercase tracking-wider font-extrabold"
          >
            <Plus className="h-3.5 w-3.5" /> + ADD ACCOUNT
          </button>
        </div>

        <div className="panel-card-body p-0">
          {/* List of Accounts (Max 5 shown directly) */}
          <div className="divide-y divide-neutral-200">
            {topAccounts.map((acc) => {
              const cfg = PLATFORM_CATALOG.find((p) => p.id === acc.platform);
              const isMain = acc.isPrimaryOverall || acc.isPrimaryPlatform;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountForDetails(acc)}
                  className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-neutral-50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-white border border-neutral-200 shadow-2xs shrink-0 group-hover:scale-105 transition">
                      <PlatformBrandIcon platform={acc.platform} className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {cfg?.name || acc.platform}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium truncate">
                          {acc.accountName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    {isMain && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        <span>👑</span> Main
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between p-3.5 sm:px-5 border-t border-neutral-200 bg-neutral-50/70 text-xs text-muted-foreground">
            <span>
              Showing {topAccounts.length} of {socialAccounts.length} accounts
            </span>

            <button
              type="button"
              onClick={() => setViewAllModalOpen(true)}
              className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Accounts ({socialAccounts.length}) →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ACCOUNT DETAILS POPUP (OPENS ON ROW CLICK)                  */}
      {/* ============================================================== */}
      {selectedAccountForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 bg-neutral-50">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-display text-base font-extrabold">Account Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccountForDetails(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-neutral-200 hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50/50">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white border border-neutral-200 shadow-sm shrink-0">
                  <PlatformBrandIcon platform={selectedAccountForDetails.platform} className="h-9 w-9" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display text-lg font-black text-foreground">
                      {PLATFORM_CATALOG.find((p) => p.id === selectedAccountForDetails.platform)?.name || selectedAccountForDetails.platform}
                    </h4>
                    {(selectedAccountForDetails.isPrimaryOverall || selectedAccountForDetails.isPrimaryPlatform) && (
                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Main Account
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm text-foreground mt-0.5">{selectedAccountForDetails.accountName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{selectedAccountForDetails.username}</p>
                </div>
              </div>

              {/* Metadata Grid matching Image 2 */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Account Name</span>
                  <span className="font-bold text-foreground">{selectedAccountForDetails.accountName}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Username / Handle</span>
                  <span className="font-mono font-bold text-foreground">{selectedAccountForDetails.username}</span>
                </div>

                <div className="col-span-2 p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Profile URL</span>
                  <a
                    href={selectedAccountForDetails.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-primary font-bold hover:underline flex items-center gap-1.5 break-all"
                  >
                    <span>{selectedAccountForDetails.profileUrl}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>

                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Account Type</span>
                  <span className="font-bold text-foreground">{selectedAccountForDetails.accountType}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Platform Main</span>
                  <span className="font-bold text-foreground flex items-center gap-1 text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> {selectedAccountForDetails.isPrimaryPlatform ? "Yes" : "No"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Overall Main</span>
                  <span className="font-bold text-foreground flex items-center gap-1 text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> {selectedAccountForDetails.isPrimaryOverall ? "Yes" : "No"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Visibility</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    {selectedAccountForDetails.isVisible ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-600" /> Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-neutral-500" /> Private
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Created On</span>
                  <span className="text-muted-foreground">15 Oct 2026, 04:20 PM</span>
                </div>

                <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-0.5">Last Updated</span>
                  <span className="text-muted-foreground">20 Oct 2026, 11:08 AM</span>
                </div>
              </div>

              {/* Actions Footer matching Image 2 */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => handleSetMain(selectedAccountForDetails)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                >
                  <Crown className="h-3.5 w-3.5 text-amber-600" />
                  <span>Set as Main</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModalFromDetails(selectedAccountForDetails)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 transition cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmAccount(selectedAccountForDetails)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ADD / EDIT YOUR ACCOUNT POPUP (MATCHING IMAGE 3)             */}
      {/* ============================================================== */}
      {addAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/10 p-1.5 text-primary border border-primary/20 shrink-0">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold text-foreground">
                    {editingAccountId ? "Edit Social Account" : "Add Your Account"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Connect a new social media account to your profile.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddAccountModalOpen(false);
                  setEditingAccountId(null);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-neutral-200 hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Platform Selector Dropdown */}
              <div>
                <label className="font-bold text-foreground block mb-1">Select Platform *</label>
                <div className="relative">
                  <select
                    value={formPlatform}
                    onChange={(e) => {
                      const plat = e.target.value as SocialPlatformId;
                      setFormPlatform(plat);
                      const cfg = PLATFORM_CATALOG.find((p) => p.id === plat);
                      if (cfg && !formProfileUrl.trim()) {
                        setFormProfileUrl(cfg.urlPlaceholder);
                      }
                    }}
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-3.5 pr-8 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  >
                    {PLATFORM_CATALOG.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="font-bold text-foreground block mb-1">Account Name / Display Name *</label>
                <input
                  type="text"
                  value={formAccountName}
                  onChange={(e) => {
                    setFormAccountName(e.target.value);
                    if (formErrors.name) setFormErrors((err) => ({ ...err, name: undefined }));
                  }}
                  placeholder="e.g., Siddharth Maurya"
                  className={`w-full rounded-xl border py-2.5 px-3.5 text-xs text-foreground focus:outline-none ${
                    formErrors.name ? "border-red-500 bg-red-50/20" : "border-neutral-300 focus:border-primary"
                  }`}
                />
                {formErrors.name && <p className="text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              {/* Username / Handle */}
              <div>
                <label className="font-bold text-foreground block mb-1">Username / Handle *</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => {
                    setFormUsername(e.target.value);
                    if (formErrors.username) setFormErrors((err) => ({ ...err, username: undefined }));
                  }}
                  placeholder="e.g., @SiddharthMauryaOfficial"
                  className={`w-full rounded-xl border py-2.5 px-3.5 text-xs text-foreground focus:outline-none ${
                    formErrors.username ? "border-red-500 bg-red-50/20" : "border-neutral-300 focus:border-primary"
                  }`}
                />
                {formErrors.username && <p className="text-red-600 mt-1">{formErrors.username}</p>}
              </div>

              {/* Profile URL */}
              <div>
                <label className="font-bold text-foreground block mb-1">Profile URL *</label>
                <div className="relative">
                  <input
                    type="url"
                    value={formProfileUrl}
                    onChange={(e) => {
                      setFormProfileUrl(e.target.value);
                      if (formErrors.url) setFormErrors((err) => ({ ...err, url: undefined }));
                    }}
                    placeholder="e.g., https://youtube.com/@SiddharthMauryaOfficial"
                    className={`w-full rounded-xl border py-2.5 pl-3.5 pr-8 text-xs text-foreground font-mono focus:outline-none ${
                      formErrors.url ? "border-red-500 bg-red-50/20" : "border-neutral-300 focus:border-primary"
                    }`}
                  />
                  {formProfileUrl && (
                    <a
                      href={formProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1"
                      title="Test URL"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {formErrors.url && <p className="text-red-600 mt-1">{formErrors.url}</p>}
              </div>

              {/* Account Type Radio Group */}
              <div>
                <label className="font-bold text-foreground block mb-1.5">Account Type *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Personal", "Creator", "Business", "Organization"] as SocialAccountType[]).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold text-center transition ${
                        formAccountType === type
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-neutral-300 hover:bg-neutral-50 text-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value={type}
                        checked={formAccountType === type}
                        onChange={() => setFormAccountType(type)}
                        className="sr-only"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Main Account Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mainAccountCheck"
                  checked={formIsPrimaryPlatform}
                  onChange={(e) => setFormIsPrimaryPlatform(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
                <label htmlFor="mainAccountCheck" className="font-bold text-foreground cursor-pointer flex items-center gap-1">
                  <span>👑 Set as Main Account for this platform</span>
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setAddAccountModalOpen(false);
                    setEditingAccountId(null);
                  }}
                  className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Account"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. VIEW ALL ACCOUNTS MODAL (FOR ORDERING & ALL ACCOUNTS)         */}
      {/* ============================================================== */}
      {viewAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-300 bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 bg-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <h3 className="font-display text-base font-extrabold text-foreground">
                  All Social Media Accounts ({socialAccounts.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewAllModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-neutral-200 hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b border-neutral-200 bg-white shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={allSearchQuery}
                  onChange={(e) => setAllSearchQuery(e.target.value)}
                  placeholder="Search accounts by name, username, or platform..."
                  className="w-full rounded-xl border border-neutral-300 pl-9 pr-4 py-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-200 p-2">
              {socialAccounts
                .filter((a) => {
                  if (!allSearchQuery.trim()) return true;
                  const q = allSearchQuery.toLowerCase();
                  return (
                    a.accountName.toLowerCase().includes(q) ||
                    a.username.toLowerCase().includes(q) ||
                    a.platform.toLowerCase().includes(q)
                  );
                })
                .map((acc, index, arr) => {
                  const cfg = PLATFORM_CATALOG.find((p) => p.id === acc.platform);
                  return (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition"
                    >
                      <div
                        onClick={() => {
                          setSelectedAccountForDetails(acc);
                          setViewAllModalOpen(false);
                        }}
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                      >
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white border border-neutral-200 shadow-2xs shrink-0">
                          <PlatformBrandIcon platform={acc.platform} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{cfg?.name}</span>
                            <span className="text-xs text-muted-foreground font-medium truncate">{acc.accountName}</span>
                            {(acc.isPrimaryOverall || acc.isPrimaryPlatform) && (
                              <span className="rounded bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.2 text-[9px] font-black uppercase">
                                👑 Main
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground block">{acc.username}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const newOrder = [...socialAccounts];
                            const curr = newOrder[index];
                            const prev = newOrder[index - 1];
                            if (curr && prev) {
                              newOrder[index] = prev;
                              newOrder[index - 1] = curr;
                              reorderSocialAccounts(newOrder.map((a) => a.id));
                            }
                          }}
                          className="p-1 rounded border border-neutral-200 bg-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === arr.length - 1}
                          onClick={() => {
                            const newOrder = [...socialAccounts];
                            const curr = newOrder[index];
                            const next = newOrder[index + 1];
                            if (curr && next) {
                              newOrder[index] = next;
                              newOrder[index + 1] = curr;
                              reorderSocialAccounts(newOrder.map((a) => a.id));
                            }
                          }}
                          className="p-1 rounded border border-neutral-200 bg-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. DELETE CONFIRMATION MODAL                                    */}
      {/* ============================================================== */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-300 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-foreground">Remove Social Account?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Are you sure you want to remove "{deleteConfirmAccount.accountName}" ({deleteConfirmAccount.platform})?
                  This action does not modify external accounts.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="btn-outline !py-1.5 !px-3.5 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn-red !py-1.5 !px-4 text-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
