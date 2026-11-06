import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Radio,
  Star,
  Layers,
  AlertTriangle,
  MoveVertical,
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
    category: "Messaging & Community",
    color: "#000000",
    badgeClass: "bg-neutral-800/10 text-neutral-800 border-neutral-800/30",
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
    color: "#6B7280",
    badgeClass: "bg-neutral-500/10 text-neutral-700 border-neutral-500/30",
    domain: "",
    urlPlaceholder: "https://yourportfolio.com",
    handlePlaceholder: "handle or profile link",
  },
];

// Pixel-perfect SVG Brand Icons
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
          fill="url(#ig-grad)"
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        />
        <defs>
          <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
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
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.54V8.75a8.16 8.16 0 0 0 4.82 1.56V6.85a4.83 4.83 0 0 1-1-.16z" />
      </svg>
    );
  }
  if (p === "snapchat") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#EAA100" aria-hidden="true">
        <path d="M12.06 2c3.15 0 5.48 2.21 5.48 5.25 0 1.05-.33 2.11-.33 2.11s.57.17.91.43c.42.32.35.79.08 1.07-.46.47-1.12.39-1.41.34 0 .28.02.66.02.94 0 .84-.33 1.58-.97 2.06-.52.39-1.21.57-1.95.6-.25.53-.78 1.05-1.83 1.05-1.07 0-1.58-.52-1.83-1.05-.74-.03-1.43-.21-1.95-.6-.64-.48-.97-1.22-.97-2.06 0-.28.02-.66.02-.94-.29.05-.95.13-1.41-.34-.27-.28-.34-.75.08-1.07.34-.26.91-.43.91-.43s-.33-1.06-.33-2.11C6.58 4.21 8.91 2 12.06 2z" />
      </svg>
    );
  }
  if (p === "pinterest") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#E60023" aria-hidden="true">
        <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.98-.13-2.48.03-3.55l1.09-4.63s-.28-.56-.28-1.38c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.32 0 .8-.51 2-0.78 3.12-.22.93.46 1.69 1.38 1.69 1.66 0 2.94-1.75 2.94-4.28 0-2.24-1.61-3.8-3.9-3.8-2.66 0-4.22 1.99-4.22 4.05 0 .8.31 1.66.7 2.13.08.09.09.18.06.32l-.26 1.07c-.04.18-.14.22-.33.13-1.23-.57-2-2.37-2-3.82 0-3.11 2.26-5.97 6.52-5.97 3.42 0 6.08 2.44 6.08 5.7 0 3.4-2.14 6.14-5.12 6.14-1 0-1.94-.52-2.26-1.13l-.61 2.34c-.22.86-.82 1.94-1.22 2.6A12 12 0 1 0 12 0z" />
      </svg>
    );
  }
  if (p === "reddit") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#FF4500" aria-hidden="true">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702z" />
      </svg>
    );
  }
  if (p === "threads") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#000000" aria-hidden="true">
        <path d="M12.186 24h-.007c-3.581-.024-6.335-1.199-8.187-3.494C2.191 18.261 1.25 15.148 1.2 11.23c.05-3.918.991-7.031 2.792-9.276C5.844.66 8.598-.024 12.179 0h.014c3.581.024 6.34 1.2 8.191 3.495 1.8 2.245 2.741 5.358 2.791 9.276-.05 3.918-.991 7.031-2.791 9.276C18.533 24.34 15.779 24.024 12.186 24zm4.493-13.684c-.11-.059-.22-.118-.334-.176a6.837 6.837 0 0 0-4.166-1.428h-.01c-1.854 0-3.376.602-4.524 1.79-1.157 1.198-1.748 2.8-1.756 4.762.008 1.961.599 3.564 1.756 4.762 1.148 1.188 2.67 1.79 4.524 1.79h.01c1.868 0 3.394-.606 4.536-1.802 1.054-1.104 1.632-2.553 1.718-4.305.003-.063.005-.126.005-.189v-1.92h-6.26v1.92h4.34c-.11 1.348-.737 2.146-1.874 2.373-.418.083-.847.098-1.28.046-1.121-.136-1.884-.798-2.268-1.97-.24-.73-.3-1.63-.178-2.67.14-.99.55-1.8 1.22-2.41a3.52 3.52 0 0 1 2.45-.88h.01c.96.002 1.83.336 2.51.966.19.176.36.376.51.6l1.37-1.37a8.55 8.55 0 0 0-1.81-1.38z" />
      </svg>
    );
  }
  if (p === "vimeo") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#1AB7EA" aria-hidden="true">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.525 3.01 7.525c-.179 0-.806.378-1.881 1.131L0 7.197c1.185-1.044 2.351-2.083 3.501-3.118 1.572-1.36 2.763-2.084 3.573-2.174 1.902-.191 3.076.993 3.524 3.551.488 2.784.827 4.529 1.018 5.234.577 2.492 1.218 3.738 1.921 3.738.544 0 1.206-.807 1.986-2.421.78-1.614 1.196-2.84 1.248-3.678.093-1.428-.415-2.143-1.524-2.143-.539 0-1.096.124-1.671.372 1.11-3.645 3.23-5.419 6.357-5.322 2.316.071 3.42 1.55 3.313 4.437z" />
      </svg>
    );
  }
  return <Globe className={`${className} text-muted-foreground`} />;
}

// Domain URL Validator
export function validatePlatformUrl(platform: SocialPlatformId, url: string): { isValid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, error: "Profile URL is required" };
  }
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return { isValid: false, error: "Enter a valid full URL starting with https://" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { isValid: false, error: "URL must start with https://" };
  }

  const hostname = parsed.hostname.toLowerCase();

  switch (platform) {
    case "youtube":
      if (!hostname.includes("youtube.com") && !hostname.includes("youtu.be")) {
        return { isValid: false, error: "URL must be a valid YouTube link (e.g. https://www.youtube.com/@channel)" };
      }
      break;
    case "instagram":
      if (!hostname.includes("instagram.com")) {
        return { isValid: false, error: "URL must be an Instagram link (e.g. https://www.instagram.com/username)" };
      }
      break;
    case "linkedin":
      if (!hostname.includes("linkedin.com")) {
        return { isValid: false, error: "URL must be a LinkedIn link (e.g. https://www.linkedin.com/in/username)" };
      }
      break;
    case "x":
      if (!hostname.includes("x.com") && !hostname.includes("twitter.com")) {
        return { isValid: false, error: "URL must be an X/Twitter link (e.g. https://x.com/handle)" };
      }
      break;
    case "whatsapp":
      if (!hostname.includes("wa.me") && !hostname.includes("whatsapp.com")) {
        return { isValid: false, error: "URL must be a WhatsApp link (e.g. https://wa.me/919820088776)" };
      }
      break;
    case "facebook":
      if (!hostname.includes("facebook.com")) {
        return { isValid: false, error: "URL must be a Facebook link (e.g. https://www.facebook.com/pagename)" };
      }
      break;
    case "tiktok":
      if (!hostname.includes("tiktok.com")) {
        return { isValid: false, error: "URL must be a TikTok link (e.g. https://www.tiktok.com/@creator)" };
      }
      break;
    case "snapchat":
      if (!hostname.includes("snapchat.com")) {
        return { isValid: false, error: "URL must be a Snapchat link (e.g. https://www.snapchat.com/add/username)" };
      }
      break;
    case "pinterest":
      if (!hostname.includes("pinterest.com")) {
        return { isValid: false, error: "URL must be a Pinterest link (e.g. https://www.pinterest.com/username)" };
      }
      break;
    case "reddit":
      if (!hostname.includes("reddit.com")) {
        return { isValid: false, error: "URL must be a Reddit link (e.g. https://www.reddit.com/user/username)" };
      }
      break;
    case "threads":
      if (!hostname.includes("threads.net")) {
        return { isValid: false, error: "URL must be a Threads link (e.g. https://www.threads.net/@handle)" };
      }
      break;
    case "vimeo":
      if (!hostname.includes("vimeo.com")) {
        return { isValid: false, error: "URL must be a Vimeo link (e.g. https://vimeo.com/channel)" };
      }
      break;
    default:
      break;
  }

  return { isValid: true };
}

// ============================================================================
// MAIN SOCIAL ACCOUNTS MANAGER COMPONENT
// ============================================================================

export function SocialAccountsManager() {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(getStoredSocialAccounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Wizard / Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<SocialAccount | null>(null);
  const [manageOrderModalOpen, setManageOrderModalOpen] = useState(false);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Add / Edit Form State
  const [formPlatform, setFormPlatform] = useState<SocialPlatformId>("youtube");
  const [formCustomPlatformName, setFormCustomPlatformName] = useState("");
  const [formAccountName, setFormAccountName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formProfileUrl, setFormProfileUrl] = useState("");
  const [formAccountType, setFormAccountType] = useState<SocialAccountType>("Creator");
  const [formIsPrimaryPlatform, setFormIsPrimaryPlatform] = useState(false);
  const [formIsPrimaryOverall, setFormIsPrimaryOverall] = useState(false);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);

  // Form Validation & Double-click guard
  const [formErrors, setFormErrors] = useState<{ name?: string; username?: string; url?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Step 1 Platform Search
  const [platformSearch, setPlatformSearch] = useState("");

  // Sync with global events
  useEffect(() => {
    const handleSync = () => {
      setSocialAccounts(getStoredSocialAccounts());
    };
    window.addEventListener("siddwhizz_social_updated", handleSync);
    return () => window.removeEventListener("siddwhizz_social_updated", handleSync);
  }, []);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return socialAccounts.filter((a) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        a.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPlatform = platformFilter === "all" || a.platform === platformFilter;
      return matchSearch && matchPlatform;
    });
  }, [socialAccounts, searchQuery, platformFilter]);

  // Platform count helper for filter chips
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    socialAccounts.forEach((a) => {
      counts[a.platform] = (counts[a.platform] || 0) + 1;
    });
    return counts;
  }, [socialAccounts]);

  // Platforms matching search in Step 1
  const filteredPlatforms = useMemo(() => {
    if (!platformSearch.trim()) return PLATFORM_CATALOG;
    return PLATFORM_CATALOG.filter(
      (p) =>
        p.name.toLowerCase().includes(platformSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(platformSearch.toLowerCase())
    );
  }, [platformSearch]);

  // Open Add Modal
  const openAddModal = (presetPlatform?: SocialPlatformId) => {
    const targetPlatform = presetPlatform || "youtube";
    const cfg = PLATFORM_CATALOG.find((p) => p.id === targetPlatform);
    setEditingAccount(null);
    setFormPlatform(targetPlatform);
    setFormCustomPlatformName("");
    setFormAccountName("");
    setFormUsername("");
    setFormProfileUrl(cfg ? cfg.urlPlaceholder : "https://");
    setFormAccountType("Creator");
    setFormIsPrimaryPlatform(false);
    setFormIsPrimaryOverall(false);
    setFormIsVisible(true);
    setFormDisplayOrder(socialAccounts.length + 1);
    setFormErrors({});
    setPlatformSearch("");

    // If platform was explicitly clicked, start at step 2 (details)
    setWizardStep(presetPlatform ? 2 : 1);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (acc: SocialAccount) => {
    setEditingAccount(acc);
    setFormPlatform(acc.platform);
    setFormCustomPlatformName(acc.customPlatformName || "");
    setFormAccountName(acc.accountName);
    setFormUsername(acc.username);
    setFormProfileUrl(acc.profileUrl);
    setFormAccountType(acc.accountType);
    setFormIsPrimaryPlatform(acc.isPrimaryPlatform);
    setFormIsPrimaryOverall(acc.isPrimaryOverall);
    setFormIsVisible(acc.isVisible);
    setFormDisplayOrder(acc.displayOrder || 1);
    setFormErrors({});
    setWizardStep(2); // Jump directly to details
    setModalOpen(true);
  };

  // Validate step 2
  const validateStep2 = (): boolean => {
    const errors: { name?: string; username?: string; url?: string } = {};

    if (!formAccountName.trim()) {
      errors.name = "Account display name is required.";
    }

    if (!formUsername.trim()) {
      errors.username = "Username or handle is required.";
    } else {
      // Check duplicate normalized username within the same platform
      const normHandle = formUsername.trim().toLowerCase().replace(/^@/, "");
      const isDuplicate = socialAccounts.some(
        (a) =>
          a.id !== editingAccount?.id &&
          a.platform === formPlatform &&
          a.username.trim().toLowerCase().replace(/^@/, "") === normHandle
      );
      if (isDuplicate) {
        errors.username = `An account with username "${formUsername}" already exists for ${formPlatform}.`;
      }
    }

    const urlCheck = validatePlatformUrl(formPlatform, formProfileUrl);
    if (!urlCheck.isValid) {
      errors.url = urlCheck.error;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit & Save
  const handleSaveAccount = async () => {
    if (!validateStep2()) {
      setWizardStep(2);
      return;
    }

    setIsSaving(true);
    try {
      const dataPayload = {
        platform: formPlatform,
        customPlatformName: formPlatform === "others" ? formCustomPlatformName.trim() : undefined,
        accountName: formAccountName.trim(),
        username: formUsername.trim().startsWith("@") || formPlatform === "linkedin" || formPlatform === "whatsapp" || formPlatform === "others"
          ? formUsername.trim()
          : `@${formUsername.trim()}`,
        profileUrl: formProfileUrl.trim(),
        accountType: formAccountType,
        isPrimaryOverall: formIsPrimaryOverall,
        isPrimaryPlatform: formIsPrimaryPlatform || formIsPrimaryOverall,
        isVisible: formIsVisible,
        displayOrder: Number(formDisplayOrder) || socialAccounts.length + 1,
      };

      if (editingAccount) {
        updateSocialAccount(editingAccount.id, dataPayload);
        toast.success(`Updated "${dataPayload.accountName}" (${dataPayload.platform}) successfully!`);
      } else {
        addSocialAccount(dataPayload);
        toast.success(`Added "${dataPayload.accountName}" to your Social Directory!`);
      }

      setSocialAccounts(getStoredSocialAccounts());
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to save social account. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Primary
  const handleSetPrimary = (acc: SocialAccount, scope: "platform" | "overall") => {
    setSocialAccountPrimary(acc.id, scope);
    setSocialAccounts(getStoredSocialAccounts());
    toast.success(
      scope === "overall"
        ? `Set "${acc.accountName}" as your Overall Main Social Profile!`
        : `Set "${acc.accountName}" as your Main ${acc.platform.toUpperCase()} Account!`
    );
  };

  // Quick Toggle Visibility
  const handleToggleVisibility = (acc: SocialAccount) => {
    const nextVis = toggleSocialAccountVisibility(acc.id);
    setSocialAccounts(getStoredSocialAccounts());
    toast.success(`"${acc.accountName}" is now ${nextVis ? "visible on public website" : "private (Admin only)"}.`);
  };

  // Delete Action
  const handleDeleteAccount = (acc: SocialAccount) => {
    deleteSocialAccount(acc.id);
    setSocialAccounts(getStoredSocialAccounts());
    setDeleteConfirmAccount(null);
    toast.success(`Removed "${acc.accountName}" (${acc.platform}) from saved directory.`);
  };

  // Manage Order Helpers
  const openOrderModal = () => {
    setOrderedIds(socialAccounts.map((a) => a.id));
    setManageOrderModalOpen(true);
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= orderedIds.length) return;
    const nextList = [...orderedIds];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(newIdx, 0, moved);
    setOrderedIds(nextList);
  };

  const handleSaveOrder = () => {
    reorderSocialAccounts(orderedIds);
    setSocialAccounts(getStoredSocialAccounts());
    setManageOrderModalOpen(false);
    toast.success("Updated social accounts display order!");
  };

  const selectedPlatformConfig = PLATFORM_CATALOG.find((p) => p.id === formPlatform) || PLATFORM_CATALOG[0];

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. SOCIAL MEDIA ACCOUNTS (MAIN TABLE & MANAGEMENT CARD)        */}
      {/* ============================================================== */}
      <div className="panel-card shadow-sm">
        {/* Header matching Desktop Reference Image */}
        <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/20 shrink-0">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
                  Social Media Accounts
                </h3>
                <span className="rounded-full bg-primary text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
                  NEW
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Manage all your social media profiles, add multiple accounts, set a main account and control their visibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={openOrderModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 transition shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              title="Change public display ordering"
            >
              <MoveVertical className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Manage Order</span>
            </button>

            <button
              type="button"
              onClick={() => openAddModal()}
              className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Your Account</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="panel-card-body p-4 sm:p-6 space-y-4">
          {/* Search Bar & Platform Filter Chips */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search account (e.g., Instagram, YouTube)..."
                className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 text-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Scrollable Filter Chips without line-dropping */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={() => setPlatformFilter("all")}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer min-h-[32px] flex items-center gap-1 ${
                  platformFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "border border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                }`}
              >
                All ({socialAccounts.length})
              </button>

              {["youtube", "instagram", "linkedin", "x", "whatsapp"].map((plat) => {
                const count = platformCounts[plat] || 0;
                if (count === 0 && platformFilter !== plat) return null;
                const cfg = PLATFORM_CATALOG.find((p) => p.id === plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatformFilter(plat)}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer min-h-[32px] flex items-center gap-1.5 ${
                      platformFilter === plat
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "border border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                    }`}
                  >
                    <PlatformBrandIcon platform={plat} className="h-3.5 w-3.5" />
                    <span>{cfg?.name || plat} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {filteredAccounts.length === 0 ? (
            <div className="panel-inner-tile p-8 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-200 text-muted-foreground">
                <Share2 className="h-6 w-6" />
              </div>
              <h4 className="font-display text-base font-bold text-foreground">No Social Accounts Found</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || platformFilter !== "all"
                  ? "No accounts match your search filter. Try clearing your search query."
                  : "Add your social media profiles to manage all your public links and handles from one place."}
              </p>
              <button
                type="button"
                onClick={() => openAddModal()}
                className="btn-red !py-2 !px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> + Add Your Account
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (min-width: 640px) */}
              <div className="hidden sm:block overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="border-b border-neutral-300 bg-neutral-100 font-display text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="p-3 whitespace-nowrap">Platform</th>
                      <th className="p-3 whitespace-nowrap">Account Details</th>
                      <th className="p-3 whitespace-nowrap">Type</th>
                      <th className="p-3 whitespace-nowrap">Status</th>
                      <th className="p-3 whitespace-nowrap text-center">Main</th>
                      <th className="p-3 whitespace-nowrap text-center">Visibility</th>
                      <th className="p-3 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredAccounts.map((acc) => {
                      const cfg = PLATFORM_CATALOG.find((p) => p.id === acc.platform);
                      return (
                        <tr key={acc.id} className="hover:bg-neutral-50/70 transition">
                          {/* Platform */}
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="grid h-7 w-7 place-items-center rounded-lg bg-neutral-100 border border-neutral-200">
                                <PlatformBrandIcon platform={acc.platform} className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-foreground">
                                {acc.platform === "others" ? acc.customPlatformName || "Other" : cfg?.name || acc.platform}
                              </span>
                            </div>
                          </td>

                          {/* Account Details */}
                          <td className="p-3 whitespace-nowrap">
                            <div>
                              <p className="font-bold text-foreground">{acc.accountName}</p>
                              <p className="font-mono text-[11px] text-muted-foreground">{acc.username}</p>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="p-3 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                              {acc.accountType}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                              <Check className="h-3 w-3" /> Saved
                            </span>
                          </td>

                          {/* Main Selection Radio / Badge */}
                          <td className="p-3 whitespace-nowrap text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(acc, "platform")}
                                className={`rounded-full p-1 transition cursor-pointer ${
                                  acc.isPrimaryPlatform
                                    ? "text-primary hover:scale-110"
                                    : "text-neutral-300 hover:text-neutral-500"
                                }`}
                                title={acc.isPrimaryPlatform ? "Platform Primary Profile" : "Click to set as Main"}
                              >
                                <Radio className={`h-4 w-4 ${acc.isPrimaryPlatform ? "fill-primary" : ""}`} />
                              </button>
                              {acc.isPrimaryOverall && (
                                <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-1.5 py-0.2 border border-amber-300">
                                  Overall Main
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Visibility Toggle */}
                          <td className="p-3 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(acc)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                                acc.isVisible
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                  : "bg-neutral-100 text-neutral-500 border border-neutral-300 hover:bg-neutral-200"
                              }`}
                              title={acc.isVisible ? "Public (Visible on website)" : "Private (Admin panel only)"}
                            >
                              {acc.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              <span>{acc.isVisible ? "Public" : "Private"}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-3 whitespace-nowrap text-right space-x-1">
                            <a
                              href={acc.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white p-1.5 text-muted-foreground hover:bg-neutral-100 hover:text-primary transition shadow-2xs"
                              title="Open Profile URL in new tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => openEditModal(acc)}
                              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white p-1.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground transition shadow-2xs cursor-pointer"
                              title="Edit Account Details"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmAccount(acc)}
                              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition shadow-2xs cursor-pointer"
                              title="Delete Account Entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Compact Cards View (screen < 640px) */}
              <div className="block sm:hidden space-y-3">
                {filteredAccounts.map((acc) => {
                  const cfg = PLATFORM_CATALOG.find((p) => p.id === acc.platform);
                  return (
                    <div
                      key={acc.id}
                      className="panel-inner-tile p-3.5 space-y-3 rounded-xl border border-neutral-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white border border-neutral-200 shrink-0">
                            <PlatformBrandIcon platform={acc.platform} className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-foreground text-sm leading-tight">{acc.accountName}</h4>
                              {acc.isPrimaryOverall && (
                                <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-1.5 py-0.2 border border-amber-300">
                                  Main
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-muted-foreground mt-0.5">{acc.username}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(acc)}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              acc.isVisible
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : "bg-neutral-100 text-neutral-500 border border-neutral-300"
                            }`}
                          >
                            {acc.isVisible ? "Public" : "Private"}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-xs">
                        <span className="text-muted-foreground font-medium">
                          {acc.platform === "others" ? acc.customPlatformName || "Other" : cfg?.name} • {acc.accountType}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={acc.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-neutral-300 bg-white text-muted-foreground hover:text-primary"
                            title="Open Link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditModal(acc)}
                            className="p-1.5 rounded-lg border border-neutral-300 bg-white text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmAccount(acc)}
                            className="p-1.5 rounded-lg border border-neutral-300 bg-white text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Quick Platform Icons Bar at bottom of table card */}
          <div className="border-t border-neutral-200 pt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Quick Add:</span>
              {PLATFORM_CATALOG.slice(0, 10).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openAddModal(p.id)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-neutral-200 bg-white hover:border-primary/50 hover:scale-110 transition shadow-2xs cursor-pointer shrink-0"
                  title={`Add ${p.name} account`}
                >
                  <PlatformBrandIcon platform={p.id} className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openAddModal()}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View All Accounts ({socialAccounts.length}) →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ADD YOUR ACCOUNT (QUICK PICKER CARD)                         */}
      {/* ============================================================== */}
      <div className="panel-card shadow-sm">
        <div className="panel-card-header flex items-center gap-2.5">
          <div className="rounded-xl bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-black uppercase tracking-wider text-foreground">
              Add Your Account
            </h3>
            <p className="text-xs text-muted-foreground">Connect a new social media profile to your official host directory.</p>
          </div>
        </div>

        <div className="panel-card-body p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {PLATFORM_CATALOG.slice(0, 12).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openAddModal(p.id)}
                className="group rounded-xl border border-neutral-300 bg-white p-3 flex flex-col items-center justify-center gap-2 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer text-center"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-50 group-hover:bg-primary/5 transition">
                  <PlatformBrandIcon platform={p.id} className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition line-clamp-1">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. KEY FEATURES CARD                                           */}
      {/* ============================================================== */}
      <div className="panel-card shadow-sm">
        <div className="panel-card-header flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-display text-sm font-black uppercase tracking-wider text-foreground">
            Key Features (Directory Phase 1)
          </h4>
        </div>
        <div className="panel-card-body p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Add multiple accounts per platform</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Set a main (primary) account per platform & overall</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Support 12+ popular platforms + Custom platforms</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Show/Hide account on public website (Public / Private)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Edit, test URL & delete any account safely</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Manage custom display ordering for public website</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT ACCOUNT (3-STEP WIZARD)                      */}
      {/* ============================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-300 bg-white p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold font-mono">
                    Phase 1 Directory
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-foreground">
                    {editingAccount ? "Edit Social Account" : "Add Social Media Account"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Save your official social handle and profile reference without sharing passwords.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-neutral-100 hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2 border-b border-neutral-200 pb-3 text-center">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  wizardStep === 1
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-neutral-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>1. Platform</span>
                {wizardStep > 1 && <Check className="h-3 w-3" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (formPlatform) setWizardStep(2);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  wizardStep === 2
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-neutral-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>2. Details</span>
                {wizardStep > 2 && <Check className="h-3 w-3" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setWizardStep(3);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  wizardStep === 3
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-neutral-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>3. Review</span>
              </button>
            </div>

            {/* STEP 1: SELECT PLATFORM */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1.5">
                    Select Social Platform
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={platformSearch}
                      onChange={(e) => setPlatformSearch(e.target.value)}
                      placeholder="Search platform (e.g., YouTube, Instagram, WhatsApp)..."
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                  {filteredPlatforms.map((p) => {
                    const isSelected = formPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormPlatform(p.id);
                          if (!editingAccount) {
                            setFormProfileUrl(p.urlPlaceholder);
                          }
                        }}
                        className={`group relative rounded-xl border p-3 flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary"
                            : "border-neutral-300 bg-white hover:border-primary/50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 rounded-full bg-primary text-white p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <PlatformBrandIcon platform={p.id} className="h-6 w-6" />
                        <span className="text-xs font-bold text-foreground group-hover:text-primary">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ACCOUNT DETAILS */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                {/* Platform Indicator */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 border border-neutral-200">
                  <div className="flex items-center gap-2.5">
                    <PlatformBrandIcon platform={formPlatform} className="h-6 w-6" />
                    <div>
                      <h4 className="font-bold text-xs text-foreground">
                        Account Details ({selectedPlatformConfig.name})
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Domain: {selectedPlatformConfig.domain || "Custom"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Change Platform
                  </button>
                </div>

                {formPlatform === "others" && (
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                      Custom Platform Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCustomPlatformName}
                      onChange={(e) => setFormCustomPlatformName(e.target.value)}
                      placeholder="e.g. Behance, Dribbble, Substack"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                )}

                {/* Account Name */}
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                    Account Name * (Nickname / Stage Title)
                  </label>
                  <input
                    type="text"
                    required
                    value={formAccountName}
                    onChange={(e) => {
                      setFormAccountName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Siddharth Maurya Official"
                    className={`w-full rounded-xl border bg-white py-2 px-3 text-xs text-foreground focus:outline-none ${
                      formErrors.name ? "border-destructive ring-1 ring-destructive" : "border-neutral-300 focus:border-primary"
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-destructive mt-1 font-semibold">{formErrors.name}</p>}
                </div>

                {/* Username / Handle */}
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                    Username / Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => {
                      setFormUsername(e.target.value);
                      if (formErrors.username) setFormErrors((prev) => ({ ...prev, username: undefined }));
                    }}
                    placeholder={selectedPlatformConfig.handlePlaceholder}
                    className={`w-full rounded-xl border bg-white py-2 px-3 text-xs font-mono text-foreground focus:outline-none ${
                      formErrors.username ? "border-destructive ring-1 ring-destructive" : "border-neutral-300 focus:border-primary"
                    }`}
                  />
                  {formErrors.username && (
                    <p className="text-[11px] text-destructive mt-1 font-semibold">{formErrors.username}</p>
                  )}
                </div>

                {/* Profile URL with Domain Validation */}
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                    Profile URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formProfileUrl}
                    onChange={(e) => {
                      setFormProfileUrl(e.target.value);
                      if (formErrors.url) setFormErrors((prev) => ({ ...prev, url: undefined }));
                    }}
                    placeholder={selectedPlatformConfig.urlPlaceholder}
                    className={`w-full rounded-xl border bg-white py-2 px-3 text-xs font-mono text-foreground focus:outline-none ${
                      formErrors.url ? "border-destructive ring-1 ring-destructive" : "border-neutral-300 focus:border-primary"
                    }`}
                  />
                  {formErrors.url && <p className="text-[11px] text-destructive mt-1 font-semibold">{formErrors.url}</p>}
                </div>

                {/* Account Type & Display Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Account Type</label>
                    <select
                      value={formAccountType}
                      onChange={(e) => setFormAccountType(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Creator">Creator (Public stage / showreels)</option>
                      <option value="Personal">Personal (Direct network)</option>
                      <option value="Business">Business (Agency / Corporate inquiries)</option>
                      <option value="Official">Official (Verified stage handle)</option>
                      <option value="Portfolio">Portfolio (Visual galleries)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Primary & Visibility Toggles */}
                <div className="panel-inner-tile p-3.5 space-y-3 rounded-xl">
                  {/* Set as Platform Main */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Set as Main {selectedPlatformConfig.name} Account
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Primary account displayed for this platform.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormIsPrimaryPlatform(!formIsPrimaryPlatform)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${
                        formIsPrimaryPlatform ? "bg-primary" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                          formIsPrimaryPlatform ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Set as Overall Main */}
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2.5">
                    <div>
                      <p className="text-xs font-bold text-foreground">Set as Overall Main Portfolio Profile</p>
                      <p className="text-[11px] text-muted-foreground">
                        Primary social link highlighted across the whole site.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormIsPrimaryOverall(!formIsPrimaryOverall)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${
                        formIsPrimaryOverall ? "bg-primary" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                          formIsPrimaryOverall ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Show on Public Website */}
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2.5">
                    <div>
                      <p className="text-xs font-bold text-foreground">Show on Public Website</p>
                      <p className="text-[11px] text-muted-foreground">
                        Enable or disable public visibility on footer & contact.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormIsVisible(!formIsVisible)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${
                        formIsVisible ? "bg-emerald-600" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                          formIsVisible ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setWizardStep(3);
                    }}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SAVE */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-neutral-300 bg-neutral-50/70 space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                    <PlatformBrandIcon platform={formPlatform} className="h-5 w-5" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {formPlatform === "others" ? formCustomPlatformName || "Other Platform" : selectedPlatformConfig.name}
                      </h4>
                      <p className="text-muted-foreground font-mono">{formUsername}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Display Name</span>
                      <span className="font-semibold text-foreground">{formAccountName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Account Type</span>
                      <span className="font-semibold text-foreground">{formAccountType}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Profile URL</span>
                      <a
                        href={formProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-primary underline truncate block"
                      >
                        {formProfileUrl}
                      </a>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Main Account</span>
                      <span className="font-semibold text-foreground">
                        {formIsPrimaryOverall ? "Yes (Overall Main)" : formIsPrimaryPlatform ? "Yes (Platform Main)" : "No"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Visibility</span>
                      <span className={`font-semibold ${formIsVisible ? "text-emerald-700" : "text-neutral-600"}`}>
                        {formIsVisible ? "Public (Website)" : "Private (Admin Only)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveAccount}
                    className="btn-red !py-2 !px-6 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>{isSaving ? "Saving Account..." : editingAccount ? "Save Changes" : "Save Account"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE CONFIRMATION                                     */}
      {/* ============================================================== */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-destructive/15 text-destructive p-2.5 border border-destructive/30 shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-foreground">Delete Social Account?</h3>
                <p className="text-xs text-muted-foreground">Are you sure you want to remove this saved account?</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center gap-3">
              <PlatformBrandIcon platform={deleteConfirmAccount.platform} className="h-6 w-6" />
              <div>
                <p className="text-xs font-bold text-foreground">{deleteConfirmAccount.accountName}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{deleteConfirmAccount.username}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This will only remove the saved account entry from your website directory. Your external account is not affected.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAccount(deleteConfirmAccount)}
                className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MANAGE DISPLAY ORDER                                    */}
      {/* ============================================================== */}
      {manageOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <MoveVertical className="h-4 w-4 text-primary" />
                <h3 className="font-display text-base font-black text-foreground">Manage Public Display Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setManageOrderModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Arrange the exact sequence in which social media links will be rendered on the public website footer &amp; contact channels.
            </p>

            <div className="space-y-2">
              {orderedIds.map((id, index) => {
                const acc = socialAccounts.find((a) => a.id === id);
                if (!acc) return null;
                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-300 bg-neutral-50/70"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-primary w-5">#{index + 1}</span>
                      <PlatformBrandIcon platform={acc.platform} className="h-4 w-4" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{acc.accountName}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{acc.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveOrder(index, "up")}
                        className="p-1.5 rounded border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === orderedIds.length - 1}
                        onClick={() => moveOrder(index, "down")}
                        className="p-1.5 rounded border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setManageOrderModalOpen(false)}
                className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                className="btn-red !py-2 !px-5 text-xs cursor-pointer"
              >
                Save Display Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

