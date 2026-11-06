import React from "react";
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Film,
  Music,
  Image as ImageIcon,
  Archive,
  File,
  Presentation,
  CheckCircle2,
} from "lucide-react";

export type SupportedFormat =
  | "JPG"
  | "JPEG"
  | "PNG"
  | "WEBP"
  | "SVG"
  | "GIF"
  | "MP4"
  | "MOV"
  | "WEBM"
  | "AVI"
  | "MP3"
  | "WAV"
  | "AAC"
  | "M4A"
  | "PDF"
  | "DOCX"
  | "DOC"
  | "XLSX"
  | "XLS"
  | "CSV"
  | "PPTX"
  | "PPT"
  | "ZIP"
  | "RAR"
  | "TXT"
  | "JSON"
  | "HTML"
  | "OTHER";

export function detectFileFormat(
  itemOrUrl?:
    | {
        title?: string | undefined;
        type?: string | undefined;
        format?: string | undefined;
        url?: string | undefined;
      }
    | string,
  titleArg?: string,
  typeArg?: string
): SupportedFormat {
  const item =
    typeof itemOrUrl === "string"
      ? { url: itemOrUrl, title: titleArg, type: typeArg, format: undefined }
      : itemOrUrl || {};

  if (item.format) {
    const f = item.format.toUpperCase().trim();
    if (f) return f as SupportedFormat;
  }
  const str = `${item.title || ""} ${item.url || ""}`.toLowerCase();
  if (str.includes(".pdf") || str.includes("pdf")) return "PDF";
  if (str.includes(".docx") || str.includes(".doc")) return "DOCX";
  if (str.includes(".xlsx") || str.includes(".xls") || str.includes(".csv")) return "XLSX";
  if (str.includes(".pptx") || str.includes(".ppt")) return "PPTX";
  if (str.includes(".mp3") || str.includes(".wav") || str.includes(".m4a") || item.type === "audio") return "MP3";
  if (str.includes(".mp4") || str.includes(".mov") || str.includes(".webm") || item.type === "video") return "MP4";
  if (str.includes(".zip") || str.includes(".rar") || str.includes(".7z")) return "ZIP";
  if (str.includes(".txt")) return "TXT";
  if (str.includes(".png")) return "PNG";
  if (str.includes(".svg")) return "SVG";
  if (str.includes(".webp")) return "WEBP";
  if (item.type === "image" || str.includes(".jpg") || str.includes(".jpeg")) return "JPG";
  if (item.type === "document") return "PDF";
  return "OTHER";
}

export interface UniversalFileIconProps {
  format?: string | undefined;
  type?: string | undefined;
  title?: string | undefined;
  url?: string | undefined;
  variant?: "badge" | "card-art" | "icon" | undefined;
  className?: string | undefined;
}

export function UniversalFileIcon({
  format,
  type,
  title,
  url,
  variant = "badge",
  className = "",
}: UniversalFileIconProps) {
  const detected = detectFileFormat({ format, type, title, url });

  // Color schemes for badge & art
  const config: Record<
    string,
    {
      bg: string;
      text: string;
      border: string;
      badgeText: string;
      Icon: typeof File;
      glow: string;
      accentBg: string;
    }
  > = {
    PDF: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-500/30",
      badgeText: "PDF",
      Icon: FileText,
      glow: "from-red-500/20 to-red-600/5",
      accentBg: "bg-red-600",
    },
    DOCX: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-500/30",
      badgeText: "DOCX",
      Icon: FileText,
      glow: "from-blue-500/20 to-blue-600/5",
      accentBg: "bg-blue-600",
    },
    XLSX: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      border: "border-emerald-500/30",
      badgeText: "XLSX",
      Icon: FileSpreadsheet,
      glow: "from-emerald-500/20 to-emerald-600/5",
      accentBg: "bg-emerald-600",
    },
    PPTX: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      border: "border-amber-500/30",
      badgeText: "PPTX",
      Icon: Presentation,
      glow: "from-amber-500/20 to-amber-600/5",
      accentBg: "bg-amber-600",
    },
    MP3: {
      bg: "bg-purple-500/10",
      text: "text-purple-600",
      border: "border-purple-500/30",
      badgeText: "MP3",
      Icon: Music,
      glow: "from-purple-500/20 to-purple-600/5",
      accentBg: "bg-purple-600",
    },
    MP4: {
      bg: "bg-rose-500/10",
      text: "text-rose-600",
      border: "border-rose-500/30",
      badgeText: "MP4",
      Icon: Film,
      glow: "from-rose-500/20 to-rose-600/5",
      accentBg: "bg-rose-600",
    },
    JPG: {
      bg: "bg-pink-500/10",
      text: "text-pink-600",
      border: "border-pink-500/30",
      badgeText: "JPG",
      Icon: ImageIcon,
      glow: "from-pink-500/20 to-pink-600/5",
      accentBg: "bg-pink-600",
    },
    PNG: {
      bg: "bg-pink-500/10",
      text: "text-pink-600",
      border: "border-pink-500/30",
      badgeText: "PNG",
      Icon: ImageIcon,
      glow: "from-pink-500/20 to-pink-600/5",
      accentBg: "bg-pink-600",
    },
    WEBP: {
      bg: "bg-pink-500/10",
      text: "text-pink-600",
      border: "border-pink-500/30",
      badgeText: "WEBP",
      Icon: ImageIcon,
      glow: "from-pink-500/20 to-pink-600/5",
      accentBg: "bg-pink-600",
    },
    SVG: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-600",
      border: "border-indigo-500/30",
      badgeText: "SVG",
      Icon: FileCode,
      glow: "from-indigo-500/20 to-indigo-600/5",
      accentBg: "bg-indigo-600",
    },
    ZIP: {
      bg: "bg-amber-500/10",
      text: "text-amber-700",
      border: "border-amber-500/30",
      badgeText: "ZIP",
      Icon: Archive,
      glow: "from-amber-500/20 to-amber-600/5",
      accentBg: "bg-amber-600",
    },
    TXT: {
      bg: "bg-slate-500/10",
      text: "text-slate-600",
      border: "border-slate-500/30",
      badgeText: "TXT",
      Icon: FileText,
      glow: "from-slate-500/20 to-slate-600/5",
      accentBg: "bg-slate-600",
    },
    OTHER: {
      bg: "bg-neutral-500/10",
      text: "text-neutral-600",
      border: "border-neutral-500/30",
      badgeText: "FILE",
      Icon: File,
      glow: "from-neutral-500/20 to-neutral-600/5",
      accentBg: "bg-neutral-600",
    },
  };

  const fallbackConfig = {
    bg: "bg-neutral-500/10",
    text: "text-neutral-600",
    border: "border-neutral-500/30",
    badgeText: "FILE",
    Icon: File,
    glow: "from-neutral-500/20 to-neutral-600/5",
    accentBg: "bg-neutral-600",
  };

  const c = config[detected] ?? fallbackConfig;
  const IconComponent = c.Icon;

  // 1. Badge Variant (Tiny pill overlaid on thumbnails)
  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-2xs ${c.bg} ${c.text} ${c.border} ${className}`}
      >
        <IconComponent className="h-2.5 w-2.5" />
        <span>{c.badgeText}</span>
      </span>
    );
  }

  // 2. Icon Variant (Simple standalone icon)
  if (variant === "icon") {
    return (
      <div
        className={`grid h-8 w-8 place-items-center rounded-lg border ${c.bg} ${c.text} ${c.border} ${className}`}
      >
        <IconComponent className="h-4 w-4" />
      </div>
    );
  }

  // 3. Card-Art Variant (Used when an audio, PDF, docx, or zip has no real visual photo thumbnail)
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br ${c.glow} bg-white select-none ${className}`}
    >
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          className={`grid h-16 w-16 place-items-center rounded-2xl shadow-md border ${c.bg} ${c.text} ${c.border}`}
        >
          <IconComponent className="h-8 w-8" />
        </div>

        {/* Animated waveform bars for Audio */}
        {detected === "MP3" && (
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1 h-3 rounded-full bg-purple-500 animate-pulse" />
            <span className="w-1 h-6 rounded-full bg-purple-500 animate-pulse delay-75" />
            <span className="w-1 h-4 rounded-full bg-purple-500 animate-pulse delay-150" />
            <span className="w-1 h-7 rounded-full bg-purple-500 animate-pulse delay-100" />
            <span className="w-1 h-5 rounded-full bg-purple-500 animate-pulse delay-200" />
            <span className="w-1 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
        )}

        {/* Extension Pill */}
        <span
          className={`rounded-md px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-sm ${c.accentBg}`}
        >
          {c.badgeText}
        </span>
      </div>
    </div>
  );
}

