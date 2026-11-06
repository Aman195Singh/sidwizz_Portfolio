import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BarChart3,
  Inbox,
  FolderOpen,
  User,
  Settings,
  HelpCircle,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Phone,
  Mail,
  MessageCircle,
  Search,
  CheckCircle2,
  Copy,
  Plus,
  Upload,
  Calendar,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Database,
  ArrowRight,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Send,
  Lock,
  Users,
  Camera,
  ImagePlus,
  Trash2,
  KeyRound,
  Check,
  IndianRupee,
  Play,
  Maximize2,
  Volume2,
  Download,
  Clock,
  AlertTriangle,
  ChevronRight,
  Share2,
  MoreVertical,
  Heart,
  Bookmark,
  Eye,
  Edit3,
  Tag,
  Folder,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Archive,
  HardDrive,
  Layers,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/site";
import {
  SocialAccountsManager,
  PlatformBrandIcon,
  PLATFORM_CATALOG,
} from "@/components/social-accounts-manager";
import { UniversalFileIcon, detectFileFormat } from "@/components/universal-file-icon";
import { MediaEditorModal } from "@/components/media-editor-modal";
import { downloadMediaAsZip } from "@/lib/zip-export";
import {
  getStoredEnquiries,
  updateEnquiryStatus,
  addEnquiryNote,
  getStoredMedia,
  addMediaItem,
  deleteMediaItem,
  approveEnquiryToContract,
  getStoredTickets,
  saveSupportTicket,
  updateTicketStatus,
  getSiteSettings,
  updateSiteSettings,
  getDefaultThumbnail,
  updateMediaThumbnail,
  toggleMediaLike,
  toggleMediaWishlist,
  updateMediaDetails,
  duplicateMediaItem,
  bulkDeleteMedia,
  bulkWishlistMedia,
  bulkMoveMedia,
  type SupportTicket,
  type MediaItem,
} from "@/lib/data-store";
import hostBowtie from "@/assets/host-bowtie.jpg";
import hostPurple from "@/assets/host-purple.jpg";
import hostSmileRed from "@/assets/host-smile-red.jpg";
import stageBeams from "@/assets/stage-beams.jpg";
import confettiConcert from "@/assets/confetti-concert.jpg";
import festivalCrowd from "@/assets/festival-crowd.jpg";
import techSummit from "@/assets/tech-summit.jpg";
import conclaveStage from "@/assets/conclave-stage.jpg";
import conferenceHall from "@/assets/conference-hall.jpg";
import micDark from "@/assets/mic-dark.jpg";
import starTrophy from "@/assets/star-trophy.jpg";

export type AdminTab =
  | "overview"
  | "analytics"
  | "enquiries"
  | "media"
  | "account"
  | "settings"
  | "support";

interface Enquiry {
  id: string;
  eventName: string;
  clientName: string;
  organization: string;
  email: string;
  phone: string;
  cleanPhone: string;
  date: string;
  city: string;
  venue: string;
  crowdSize: string;
  format: string;
  budget: string;
  status: "New" | "In Discussion" | "Confirmed" | "Declined";
  createdAt: string;
  notes?: string[];
  brief: string;
}

const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-101",
    eventName: "Global FinTech Summit 2026",
    clientName: "Arjun Nair",
    organization: "FinTech India Association",
    email: "arjun.nair@fintechsummit.in",
    phone: "+91 98201 54321",
    cleanPhone: "919820154321",
    date: "2026-12-14",
    city: "Mumbai",
    venue: "Jio World Convention Centre, BKC",
    crowdSize: "1,500+ CXOs & Founders",
    format: "Tech Summit & Keynotes",
    budget: "₹3,50,000 - ₹5,00,000",
    status: "New",
    createdAt: "2026-11-04 10:30 AM",
    brief: "Looking for high energy hosting for 2 full days, opening keynote moderation, and evening gala awards.",
    notes: ["Client requested host showreel video link", "Preferred date is firm"],
  },
  {
    id: "ENQ-102",
    eventName: "Deloitte Leadership Conclave & Gala",
    clientName: "Rohan Kapoor",
    organization: "Deloitte India Events",
    email: "rohan.kapoor@deloitte.com",
    phone: "+91 98112 99887",
    cleanPhone: "919811299887",
    date: "2026-11-28",
    city: "Bengaluru",
    venue: "The Leela Palace Ballroom",
    crowdSize: "800 Senior Partners",
    format: "Corporate Gala & Awards",
    budget: "₹2,50,000 - ₹4,00,000",
    status: "In Discussion",
    createdAt: "2026-11-03 04:15 PM",
    brief: "Annual leadership meet requiring polished stage delivery, partner award distribution, and interactive audience segments.",
    notes: ["Commercial quotation sent on Nov 3", "Awaiting confirmation from executive sponsor"],
  },
  {
    id: "ENQ-103",
    eventName: "Sunburn Arena Live Festival Showcase",
    clientName: "Karan Mehta",
    organization: "Percept Live Entertainment",
    email: "karan.mehta@perceptlive.in",
    phone: "+91 99300 44556",
    cleanPhone: "919930044556",
    date: "2026-12-31",
    city: "Goa",
    venue: "Vagator Main Arena",
    crowdSize: "15,000+ Music Lovers",
    format: "Music Festival & Live Arena",
    budget: "₹5,00,000+",
    status: "Confirmed",
    createdAt: "2026-11-01 11:00 AM",
    brief: "Prime NYE stage crowd hyping, international DJ artist introductions, and midnight countdown.",
    notes: ["Advance deposit received", "Tech rider signed"],
  },
  {
    id: "ENQ-104",
    eventName: "Tata Motors National Dealer Convention",
    clientName: "Meera Sen",
    organization: "Tata Motors Commercial",
    email: "meera.sen@tatamotors.com",
    phone: "+91 98450 12345",
    cleanPhone: "919845012345",
    date: "2026-12-05",
    city: "New Delhi",
    venue: "Bharat Mandapam (IECC)",
    crowdSize: "2,000 Attendees",
    format: "Product Launch & Dealer Expo",
    budget: "₹4,00,000 - ₹6,00,000",
    status: "New",
    createdAt: "2026-11-04 01:20 PM",
    brief: "EV vehicle launch showcase followed by national dealer recognition evening.",
    notes: [],
  },
  {
    id: "ENQ-105",
    eventName: "Royal Palace Wedding Sangeet",
    clientName: "Vikramaditya Singhania",
    organization: "Private Family Office",
    email: "singhania.events@gmail.com",
    phone: "+91 98765 43210",
    cleanPhone: "919876543210",
    date: "2026-12-20",
    city: "Udaipur",
    venue: "Jagmandir Island Palace",
    crowdSize: "600 VIP Guests",
    format: "Celebrity Wedding & Sangeet",
    budget: "₹6,00,000+",
    status: "In Discussion",
    createdAt: "2026-11-02 06:40 PM",
    brief: "High-octane family performances host, celebrity entry announcements, and dance floor momentum.",
    notes: ["Flight and suite accommodation confirmed"],
  },
];

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "med-1",
    title: "Sid Stage Crowd Beams — Conclave 2026",
    type: "image",
    category: "Stage Moments",
    size: "2.8 MB",
    dimensions: "3840 x 2160",
    url: stageBeams,
    createdAt: "2026-10-15",
  },
  {
    id: "med-2",
    title: "Official Host Emcee Showreel (4K 60fps)",
    type: "video",
    category: "Showreels",
    size: "84.2 MB",
    duration: "2:45 min",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: "2026-10-20",
  },
  {
    id: "med-3",
    title: "Concert Finale Confetti Blast Arena",
    type: "image",
    category: "Festivals",
    size: "3.1 MB",
    dimensions: "4000 x 2667",
    url: confettiConcert,
    createdAt: "2026-10-18",
  },
  {
    id: "med-4",
    title: "Siddharth Maurya Technical Stage Rider & Hospitality Guide (PDF)",
    type: "document",
    category: "Riders & Specs",
    size: "1.2 MB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    createdAt: "2026-11-01",
  },
  {
    id: "med-5",
    title: "High-Impact Emcee Intro Voiceover & BGM",
    type: "audio",
    category: "Audio Clips",
    size: "4.8 MB",
    duration: "0:42 sec",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    createdAt: "2026-09-12",
  },
  {
    id: "med-6",
    title: "Black Bowtie Gala Host Portrait",
    type: "image",
    category: "Headshots",
    size: "1.8 MB",
    dimensions: "2400 x 3000",
    url: hostBowtie,
    createdAt: "2026-10-05",
  },
  {
    id: "med-7",
    title: "Sunburn Arena Massive Crowd Atmosphere",
    type: "image",
    category: "Festivals",
    size: "3.5 MB",
    dimensions: "3840 x 2400",
    url: festivalCrowd,
    createdAt: "2026-10-22",
  },
  {
    id: "med-8",
    title: "Purple Stage Lighting Anchor Portrait",
    type: "image",
    category: "Headshots",
    size: "2.4 MB",
    dimensions: "3840 x 2160",
    url: hostPurple,
    createdAt: "2026-11-02",
  },
];

export function AdminPanel({ initialTab = "overview" }: { initialTab?: AdminTab }) {
  const { user, logout, updateProfilePhoto, updatePassword, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Enquiries live state synced with persistent DataStore
  const [enquiries, setEnquiries] = useState<Enquiry[]>(getStoredEnquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [expandedBriefIds, setExpandedBriefIds] = useState<Record<string, boolean>>({});

  const toggleBriefExpanded = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setExpandedBriefIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Communication draft modals
  const [emailModalEnquiry, setEmailModalEnquiry] = useState<Enquiry | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [whatsappModalEnquiry, setWhatsappModalEnquiry] = useState<Enquiry | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  // Media live state synced with persistent DataStore
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(getStoredMedia);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaType, setNewMediaType] = useState<"image" | "video" | "audio" | "document">("image");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [selectedMediaPreview, setSelectedMediaPreview] = useState<string | null>(null);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);

  // Media viewing modal state (Lightbox)
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null);

  // Media delete confirmation modal state
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);

  // Thumbnail management modal state
  const [thumbnailModalMedia, setThumbnailModalMedia] = useState<MediaItem | null>(null);
  const [selectedThumbnailPreview, setSelectedThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const uploadThumbnailInputRef = useRef<HTMLInputElement>(null);
  const [uploadMediaThumbnail, setUploadMediaThumbnail] = useState<string | null>(null);

  // Enhanced Media Library states (Search, Sort, Multi-select, Wishlist, Editor, Actions)
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaSort, setMediaSort] = useState<"newest" | "oldest" | "name" | "size">("newest");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [mediaActiveTab, setMediaActiveTab] = useState<"all" | "image" | "video" | "audio" | "document" | "other" | "wishlist">("all");
  const [mediaViewMode, setMediaViewMode] = useState<"grid" | "list">("grid");
  const [editorModalItem, setEditorModalItem] = useState<MediaItem | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [renameModalItem, setRenameModalItem] = useState<MediaItem | null>(null);
  const [newTitleVal, setNewTitleVal] = useState("");
  const [tagsModalItem, setTagsModalItem] = useState<MediaItem | null>(null);
  const [tagsVal, setTagsVal] = useState("");
  const [folderModalItem, setFolderModalItem] = useState<MediaItem | null>(null);
  const [folderVal, setFolderVal] = useState("Stage Assets");
  const [detailsModalItem, setDetailsModalItem] = useState<MediaItem | null>(null);
  const [bulkActionFolderModalOpen, setBulkActionFolderModalOpen] = useState(false);
  const [bulkFolderVal, setBulkFolderVal] = useState("Press & Media");

  // Account merged state
  const [adminName, setAdminName] = useState(user?.name || "Siddharth Maurya");
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@siddwhizz.com");
  const [adminPhone, setAdminPhone] = useState("+91 98200 88776");
  const [adminTitle, setAdminTitle] = useState("Celebrity Event Host, Emcee & Moderator");
  const [adminBio, setAdminBio] = useState("15+ years of live stage hosting across tech summits, global corporate galas, and arena music festivals.");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileAccountSection, setMobileAccountSection] = useState<"menu" | "photo" | "info" | "security" | "team" | "social">("menu");

  // Keep state synchronized with live DataStore events
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets);
  const [contractModalEnquiry, setContractModalEnquiry] = useState<Enquiry | null>(null);
  const [contractFee, setContractFee] = useState("₹4,00,000");
  const [contractTimeSlot, setContractTimeSlot] = useState("09:30 AM - 06:00 PM");
  const [contractAdvancePaid, setContractAdvancePaid] = useState(false);

  // Settings state persisted via SiteSettings
  const initialSettings = getSiteSettings();
  const [bookingAvailable, setBookingAvailable] = useState(initialSettings.bookingAvailable);
  const [whatsappNotifications, setWhatsappNotifications] = useState(initialSettings.whatsappNotifications);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(initialSettings.autoReplyEnabled);
  const [hotlinePhone, setHotlinePhone] = useState(initialSettings.hotlinePhone);

  useEffect(() => {
    const handleSync = () => {
      setEnquiries(getStoredEnquiries());
      setMediaItems(getStoredMedia());
      setTickets(getStoredTickets());
      const latestSettings = getSiteSettings();
      setBookingAvailable(latestSettings.bookingAvailable);
      setWhatsappNotifications(latestSettings.whatsappNotifications);
      setAutoReplyEnabled(latestSettings.autoReplyEnabled);
    };
    window.addEventListener("siddwhizz_enquiries_updated", handleSync);
    window.addEventListener("siddwhizz_media_updated", handleSync);
    window.addEventListener("siddwhizz_tickets_updated", handleSync);
    window.addEventListener("siddwhizz_settings_updated", handleSync);
    return () => {
      window.removeEventListener("siddwhizz_enquiries_updated", handleSync);
      window.removeEventListener("siddwhizz_media_updated", handleSync);
      window.removeEventListener("siddwhizz_tickets_updated", handleSync);
      window.removeEventListener("siddwhizz_settings_updated", handleSync);
    };
  }, []);

  // Developer Support Ticket Form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketSeverity, setTicketSeverity] = useState("Medium");
  const [ticketMessage, setTicketMessage] = useState("");

  // Profile Photo Upload Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateProfilePhoto(dataUrl);
      toast.success("Profile photo uploaded and saved successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetPhoto = async (photoUrl: string) => {
    await updateProfilePhoto(photoUrl);
    toast.success("Stage photo set as profile picture!");
  };

  const handleRemovePhoto = async () => {
    await updateProfilePhoto("");
    toast.success("Profile photo removed.");
  };

  // Password Change Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    const res = await updatePassword(currentPassword, newPassword);
    if (res.success) {
      toast.success("Account password changed and saved successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to update password.");
    }
  };

  // Profile Information Save Handler
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: adminName,
      email: adminEmail,
      organization: adminTitle,
    });
    toast.success("Host profile & contact details updated and saved successfully!");
  };

  // WhatsApp reply modal handler
  const handleWhatsAppReply = (enquiry: Enquiry) => {
    setWhatsappModalEnquiry(enquiry);
    setWhatsappMessage(
      `Hello ${enquiry.clientName}! This is Siddharth "Sid" Maurya's management team regarding your stage booking enquiry for "${enquiry.eventName}" on ${enquiry.date} in ${enquiry.city}. We are pleased to check stage availability and discuss Run-of-Show alignment. Are you available for a brief conversation today?`
    );
  };

  const handleSendWhatsApp = () => {
    if (!whatsappModalEnquiry) return;
    const url = `https://wa.me/${whatsappModalEnquiry.cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
    toast.success(`Opening WhatsApp chat with ${whatsappModalEnquiry.clientName}...`);
    setWhatsappModalEnquiry(null);
  };

  // Direct Phone Call handler
  const handlePhoneCall = (enquiry: Enquiry) => {
    window.location.href = `tel:${enquiry.phone.replace(/\s+/g, "")}`;
    toast.info(`Dialing ${enquiry.phone}...`);
  };

  // Email reply modal handler
  const handleEmailReply = (enquiry: Enquiry) => {
    setEmailModalEnquiry(enquiry);
    setEmailSubject(`Siddharth Maurya (Emcee) — Availability for ${enquiry.eventName}`);
    setEmailBody(
`Hi ${enquiry.clientName},

Thank you for reaching out to book Siddharth Maurya for "${enquiry.eventName}" on ${enquiry.date} at ${enquiry.venue}, ${enquiry.city}.

We have reviewed your event format (${enquiry.format}) and crowd estimation (${enquiry.crowdSize}). We are pleased to confirm that Siddharth is available for this date.

Key Next Steps:
1. Schedule a brief 10-minute Run-of-Show alignment call.
2. Technical stage rider & emcee hospitality briefing.
3. Formal contract execution and advance lock.

Please let us know your preferred time to connect!

Warm regards,
Siddharth Maurya Stage Management
SIDD.WHIZZ Official
Hotline: +91 98200 88776 | admin@siddwhizz.com
https://sidwizz-portfolio.vercel.app`
    );
  };

  const handleSendDraftEmail = () => {
    if (!emailModalEnquiry) return;
    window.location.href = `mailto:${emailModalEnquiry.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    toast.success(`Opening default mail app with drafted email for ${emailModalEnquiry.email}...`);
    setEmailModalEnquiry(null);
  };

  // Change Enquiry Status
  const handleStatusChange = (id: string, newStatus: Enquiry["status"]) => {
    updateEnquiryStatus(id, newStatus);
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(`Enquiry ${id} updated to ${newStatus}`);
  };

  // Add Note to Enquiry
  const handleAddNote = (id: string) => {
    if (!newNoteText.trim()) return;
    addEnquiryNote(id, newNoteText.trim());
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, notes: [...(e.notes || []), newNoteText.trim()] } : e
      )
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) =>
        prev ? { ...prev, notes: [...(prev.notes || []), newNoteText.trim()] } : null
      );
    }
    setNewNoteText("");
    toast.success("Internal note added and saved!");
  };

  // Real Media File Select Handler with Base64 Conversion
  const handleMediaFileSelect = (file: File) => {
    setSelectedMediaFile(file);
    let inferredType: "image" | "video" | "audio" | "document" = "document";
    if (file.type.startsWith("image/")) inferredType = "image";
    else if (file.type.startsWith("video/")) inferredType = "video";
    else if (file.type.startsWith("audio/")) inferredType = "audio";
    setNewMediaType(inferredType);

    if (!newMediaTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewMediaTitle(cleanName);
    }

    // Convert file to Base64 data URL so it persists permanently in localStorage
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (inferredType === "image" && file.size > 800 * 1024) {
        // Compress large image via canvas to save localStorage space while keeping high resolution
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          setSelectedMediaPreview(compressed);
        };
        img.src = dataUrl;
      } else {
        setSelectedMediaPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Media Handler (Real file + DataStore persistent save)
  const handleUploadMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim()) {
      toast.error("Please enter a media title.");
      return;
    }
    const fileSizeStr = selectedMediaFile
      ? (selectedMediaFile.size / (1024 * 1024)).toFixed(1) + " MB"
      : "2.4 MB";

    const finalThumbnail =
      uploadMediaThumbnail ||
      (newMediaType === "image"
        ? (selectedMediaPreview || stageBeams)
        : getDefaultThumbnail({ type: newMediaType }));

    const newItem: MediaItem = {
      id: `med-${Date.now().toString(36)}`,
      title: newMediaTitle.trim(),
      type: newMediaType,
      category:
        newMediaType === "image"
          ? "Stage Moments"
          : newMediaType === "video"
          ? "Showreels"
          : newMediaType === "audio"
          ? "Soundtrack"
          : "Technical Riders",
      size: fileSizeStr,
      ...(newMediaType === "image" ? { dimensions: "High Resolution" } : {}),
      ...(newMediaType === "video" ? { duration: "Show Clip" } : newMediaType === "audio" ? { duration: "Audio Clip" } : {}),
      url: selectedMediaPreview || stageBeams,
      thumbnail: finalThumbnail,
      createdAt: new Date().toISOString().split("T")[0] ?? "2026-11-05",
    };

    addMediaItem(newItem);
    setMediaItems(getStoredMedia());
    setUploadModalOpen(false);
    setSelectedMediaFile(null);
    setSelectedMediaPreview(null);
    setUploadMediaThumbnail(null);
    setNewMediaTitle("");
    toast.success(`"${newItem.title}" uploaded and indexed into Media Library!`);
  };

  // Save custom or preset thumbnail
  const handleSaveThumbnail = (thumbnailUrl: string) => {
    if (!thumbnailModalMedia) return;
    updateMediaThumbnail(thumbnailModalMedia.id, thumbnailUrl);
    setMediaItems(getStoredMedia());
    if (viewingMedia?.id === thumbnailModalMedia.id) {
      setViewingMedia({ ...viewingMedia, thumbnail: thumbnailUrl });
    }
    toast.success(`Thumbnail updated for "${thumbnailModalMedia.title}"!`);
    setThumbnailModalMedia(null);
    setSelectedThumbnailPreview(null);
  };

  // Thumbnail file select for custom thumbnail upload
  const handleThumbnailFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP) for the thumbnail.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedThumbnailPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Open asset modal for viewing
  const handleOpenAssetModal = (item: MediaItem) => {
    setViewingMedia(item);
  };

  // Delete media click
  const handleDeleteClick = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setMediaToDelete(item);
  };

  // Confirm permanent delete
  const handleConfirmDelete = () => {
    if (!mediaToDelete) return;
    deleteMediaItem(mediaToDelete.id);
    setMediaItems(getStoredMedia());
    if (viewingMedia?.id === mediaToDelete.id) {
      setViewingMedia(null);
    }
    toast.success(`"${mediaToDelete.title}" permanently deleted from Media Library and database!`);
    setMediaToDelete(null);
  };

  // Copy Media Link
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Public media link copied to clipboard!");
  };

  // Media Handlers for Multi-Select, Likes, Wishlist, Bulk Actions, Rename, Tags, Folder, Duplicate
  const handleToggleSelectMedia = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredMedia = () => {
    if (selectedMediaIds.length === filteredMedia.length) {
      setSelectedMediaIds([]);
    } else {
      setSelectedMediaIds(filteredMedia.map((m) => m.id));
    }
  };

  const handleLikeMedia = (m: MediaItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = toggleMediaLike(m.id);
    setMediaItems(getStoredMedia());
    if (updated?.isLiked) {
      toast.success(`Liked "${m.title}"! ❤️`);
    }
  };

  const handleWishlistMedia = (m: MediaItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isNowWishlisted = toggleMediaWishlist(m.id);
    setMediaItems(getStoredMedia());
    if (isNowWishlisted) {
      toast.success(`Added "${m.title}" to your Wishlist! ⭐`);
    } else {
      toast.info(`Removed "${m.title}" from Wishlist.`);
    }
  };

  const handleBulkDownload = () => {
    const items = mediaItems.filter((m) => selectedMediaIds.includes(m.id));
    if (items.length === 0) {
      toast.error("Please select at least 1 media file to download.");
      return;
    }
    toast.info(`Preparing ZIP archive for ${items.length} items...`);
    downloadMediaAsZip(items);
  };

  const handleBulkAddToWishlist = () => {
    if (selectedMediaIds.length === 0) return;
    bulkWishlistMedia(selectedMediaIds, true);
    setMediaItems(getStoredMedia());
    toast.success(`Added ${selectedMediaIds.length} items to your Wishlist!`);
    setSelectedMediaIds([]);
  };

  const handleBulkDeleteSelected = () => {
    if (selectedMediaIds.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedMediaIds.length} selected items?`)) {
      bulkDeleteMedia(selectedMediaIds);
      setMediaItems(getStoredMedia());
      setSelectedMediaIds([]);
      toast.success("Selected items deleted permanently.");
    }
  };

  const handleBulkMoveConfirm = () => {
    if (selectedMediaIds.length === 0) return;
    bulkMoveMedia(selectedMediaIds, bulkFolderVal);
    setMediaItems(getStoredMedia());
    toast.success(`Moved ${selectedMediaIds.length} files to folder "${bulkFolderVal}"!`);
    setBulkActionFolderModalOpen(false);
    setSelectedMediaIds([]);
  };

  const handleDuplicateMedia = (m: MediaItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const copy = duplicateMediaItem(m.id);
    if (copy) {
      setMediaItems(getStoredMedia());
      toast.success(`Created duplicate copy "${copy.title}"!`);
    }
  };

  const handleConfirmRename = () => {
    if (!renameModalItem || !newTitleVal.trim()) return;
    updateMediaDetails(renameModalItem.id, { title: newTitleVal.trim() });
    setMediaItems(getStoredMedia());
    toast.success(`Renamed file to "${newTitleVal.trim()}"!`);
    setRenameModalItem(null);
  };

  const handleConfirmSaveTags = () => {
    if (!tagsModalItem) return;
    const tagList = tagsVal
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateMediaDetails(tagsModalItem.id, { tags: tagList });
    setMediaItems(getStoredMedia());
    toast.success("Tags updated successfully!");
    setTagsModalItem(null);
  };

  const handleConfirmSaveFolder = () => {
    if (!folderModalItem) return;
    updateMediaDetails(folderModalItem.id, { folder: folderVal.trim() });
    setMediaItems(getStoredMedia());
    toast.success(`File moved to folder "${folderVal.trim()}"!`);
    setFolderModalItem(null);
  };

  // Submit Developer Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Please fill in subject and description.");
      return;
    }
    saveSupportTicket({
      userEmail: adminEmail,
      userName: adminName,
      organization: "SIDD.WHIZZ Management",
      subject: ticketSubject.trim(),
      priority:
        ticketSeverity === "Critical"
          ? "Urgent"
          : (ticketSeverity as "Low" | "Medium" | "High"),
      description: ticketMessage.trim(),
    });
    setTickets(getStoredTickets());
    toast.success("Support ticket saved to database & logged to engineering team!");
    setTicketSubject("");
    setTicketMessage("");
  };

  // Issue formal contract from enquiry
  const handleIssueContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractModalEnquiry) return;
    const created = approveEnquiryToContract({
      enquiryId: contractModalEnquiry.id,
      agreedFee: contractFee.trim() || "₹4,00,000",
      timeSlot: contractTimeSlot.trim() || "09:30 AM - 06:00 PM",
      advancePaid: contractAdvancePaid,
    });
    const refreshed = getStoredEnquiries();
    setEnquiries(refreshed);
    if (selectedEnquiry?.id === contractModalEnquiry.id) {
      setSelectedEnquiry(refreshed.find((item) => item.id === contractModalEnquiry.id) || null);
    }
    setContractModalEnquiry(null);
    if (created) {
      toast.success(
        `Executed Contract (${created.contractRef}) issued for ${created.eventName} and synced to Organizer Portal!`
      );
    }
  };

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Enhanced filtered and sorted media
  const filteredMedia = useMemo(() => {
    return mediaItems
      .filter((m) => {
        // Tab filter
        if (mediaActiveTab === "wishlist") {
          if (!m.isWishlist) return false;
        } else if (mediaActiveTab !== "all") {
          if (m.type !== mediaActiveTab) return false;
        }

        // Search query
        if (mediaSearchQuery.trim()) {
          const q = mediaSearchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchCategory = m.category.toLowerCase().includes(q);
          const matchType = m.type.toLowerCase().includes(q);
          const matchTags = m.tags ? m.tags.some((t) => t.toLowerCase().includes(q)) : false;
          if (!matchTitle && !matchCategory && !matchType && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (mediaSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (mediaSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (mediaSort === "name") return a.title.localeCompare(b.title);
        if (mediaSort === "size") {
          const parseSize = (s: string) => parseFloat(s) * (s.includes("GB") ? 1024 : 1);
          return parseSize(b.size) - parseSize(a.size);
        }
        return 0;
      });
  }, [mediaItems, mediaActiveTab, mediaSearchQuery, mediaSort]);

  const pendingCount = enquiries.filter((e) => e.status === "New").length;

  // Compute dynamic pipeline value in Lakhs from active enquiries
  const pipelineLakhs = enquiries
    .filter((e) => e.status !== "Declined")
    .reduce((acc, e) => {
      const nums = (e.budget.match(/[\d,]+/g) || [])
        .map((n) => parseInt(n.replace(/,/g, ""), 10))
        .filter((n) => !Number.isNaN(n) && n > 0);
      if (nums.length === 0) return acc + 3.5;
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      return acc + (avg > 1000 ? avg / 100000 : avg);
    }, 0)
    .toFixed(1);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Mobile & Tablet Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR (Fixed, Non-Scrolling with Page)      */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:h-full lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Tag */}
        <div className="shrink-0 px-5 py-4 border-b border-border bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Admin Panel
            </span>
            <span className="rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[11px] font-bold border border-primary/30">
              Active
            </span>
          </div>
          <p className="font-display text-sm font-extrabold text-foreground mt-1.5 truncate">{adminName}</p>
          <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 text-sm">
          <button
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("analytics");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "analytics"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4" /> Web Analytics
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("enquiries");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "enquiries"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <Inbox className="h-4 w-4" /> Enquiries
            </span>
            {pendingCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-black ${
                  activeTab === "enquiries"
                    ? "bg-white text-primary"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {pendingCount} New
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("media");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "media"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <FolderOpen className="h-4 w-4" /> Media Library
            </span>
            <span className={`text-xs font-bold ${activeTab === "media" ? "text-primary-foreground" : "text-muted-foreground"}`}>{mediaItems.length}</span>
          </button>

          {/* Merged Account & Profile Tab */}
          <button
            onClick={() => {
              setActiveTab("account");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "account"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <User className="h-4 w-4" /> Account & Profile
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("settings");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings className="h-4 w-4" /> Settings
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("support");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "support"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <HelpCircle className="h-4 w-4" /> Support & Help
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${
              activeTab === "support"
                ? "bg-white/20 text-white border-white/30"
                : "bg-primary/15 text-primary border-primary/30"
            }`}>
              Dev
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 border-t border-border p-3 space-y-1 text-sm">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold text-foreground/80 hover:bg-accent hover:text-foreground transition"
          >
            <ExternalLink className="h-4 w-4 text-primary" />
            <span>View Public Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold text-foreground/80 hover:bg-accent hover:text-foreground transition"
          >
            <LogOut className="h-4 w-4 text-primary" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN DASHBOARD CANVAS (Fixed Header + Scrollable Content)     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar (Fixed at Top) */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg border border-border p-2 text-foreground lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate font-display text-lg sm:text-xl font-black uppercase tracking-tight text-foreground">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "analytics" && "Web Page Traffic & Analytics"}
              {activeTab === "enquiries" && "Client Enquiries & Fast Outreach"}
              {activeTab === "media" && "Media Asset Library"}
              {activeTab === "account" && "Host Account & Profile Settings"}
              {activeTab === "settings" && "Website & Booking Settings"}
              {activeTab === "support" && "Developer Support & Assistance"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Availability status badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-accent px-3.5 py-1.5 text-xs font-bold text-foreground">
              <span className={`h-2 w-2 rounded-full ${bookingAvailable ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
              <span>{bookingAvailable ? "Accepting Stage Dates" : "Bookings Paused"}</span>
            </div>

            {/* Neon DB indicator */}
            <Link
              to="/db-status"
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
            >
              <Database className="h-3.5 w-3.5" />
              <span>NeonDB Connected</span>
            </Link>

            {/* Circular Account Icon (Far Right) */}
            <button
              onClick={() => setActiveTab("account")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full overflow-hidden border-2 border-primary/60 bg-card font-display text-sm font-extrabold text-foreground hover:border-primary hover:scale-105 transition cursor-pointer shadow-sm"
              title="Open Account & Profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span>SM</span>
              )}
            </button>
          </div>
        </header>

        {/* Tab Content Body (Independently Scrollable) */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-6 panel-canvas">
          {/* ========================================================= */}
          {/* 1. OVERVIEW VIEW                                          */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <p className="eyebrow eyebrow-line">Stage Command Center</p>
                <h2 className="display mt-2 text-2xl sm:text-3xl">
                  Performance &amp; <span className="text-primary">Booking Overview.</span>
                </h2>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground">New Enquiries</span>
                    <Inbox className="h-4 w-4 text-primary" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">{enquiries.length}</p>
                    <p className="text-xs text-primary font-bold mt-1">
                      {pendingCount} requiring immediate response
                    </p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Historical Shows</span>
                    <Calendar className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">600+</p>
                    <p className="text-xs text-muted-foreground mt-1">15+ Years Live Experience</p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Audience Reach</span>
                    <Users className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">1.2M+</p>
                    <p className="text-xs text-muted-foreground mt-1">Tech summits, festivals, galas</p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Pipeline Est.</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-primary">₹{pipelineLakhs} L</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {enquiries.filter((e) => e.status === "Confirmed").length} Confirmed • {enquiries.length} Total Leads
                    </p>
                  </div>
                </div>
              </div>

              {/* Speed-to-lead alert */}
              {pendingCount > 0 && (
                <div className="panel-card shadow-sm border-primary/40 bg-primary/10">
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-primary/20 p-3 text-primary border border-primary/30 shrink-0">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground">
                          {pendingCount} Fresh Event Enquiries Need Follow-up
                        </h3>
                        <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                          High-value planners from FinTech Summit and Tata Motors are waiting. Reach out via WhatsApp or Direct Call within 15 minutes to maximize booking rate.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("enquiries")}
                      className="btn-red !py-2.5 !px-5 text-sm whitespace-nowrap self-start sm:self-auto cursor-pointer"
                    >
                      <span>Open Enquiries</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Enquiries Table Preview */}
              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="eyebrow text-xs">Live Pipeline</p>
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground mt-0.5">Recent Booking Inquiries</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("enquiries")}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All ({enquiries.length}) →
                  </button>
                </div>

                <div className="panel-card-body p-3 sm:p-4">
                  {/* Desktop / Tablet Table View (hidden on mobile) */}
                  <div className="hidden sm:block overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                    <table className="w-full min-w-[780px] text-left text-sm">
                      <thead className="border-b border-neutral-300 bg-neutral-100 font-display text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5 whitespace-nowrap">Ref</th>
                          <th className="p-3.5 whitespace-nowrap">Event &amp; Organizer</th>
                          <th className="p-3.5 whitespace-nowrap">Date &amp; Venue</th>
                          <th className="p-3.5 whitespace-nowrap">Budget</th>
                          <th className="p-3.5 whitespace-nowrap">Status</th>
                          <th className="p-3.5 text-right whitespace-nowrap">Quick Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-300">
                      {enquiries.slice(0, 4).map((e) => (
                        <tr key={e.id} className="hover:bg-accent/40 transition">
                          <td className="p-3.5 font-mono text-sm font-bold text-primary whitespace-nowrap">{e.id}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            <p className="font-display font-bold text-foreground whitespace-nowrap">{e.eventName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">{e.clientName} • {e.organization}</p>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <p className="font-semibold text-foreground whitespace-nowrap">{e.date}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">{e.city}</p>
                          </td>
                          <td className="p-3.5 font-mono text-sm text-foreground font-bold whitespace-nowrap">{e.budget}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                                e.status === "New"
                                  ? "bg-primary/20 text-primary border border-primary/30"
                                  : e.status === "Confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold"
                                  : "bg-neutral-100 text-neutral-600 border border-neutral-300"
                              }`}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleWhatsAppReply(e)}
                              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white p-2 text-foreground transition-all duration-200 hover:scale-110 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95 shadow-2xs cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handlePhoneCall(e)}
                              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white p-2 text-foreground transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-white hover:border-primary active:scale-95 shadow-2xs cursor-pointer"
                              title="Direct Phone Call"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEmailReply(e)}
                              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white p-2 text-foreground transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-white hover:border-primary active:scale-95 shadow-2xs cursor-pointer"
                              title="Send Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View (shown only on small screens <sm) - No wrapping or overflowing */}
                  <div className="block sm:hidden space-y-3">
                    {enquiries.slice(0, 4).map((e) => (
                      <div
                        key={e.id}
                        className="rounded-xl border border-neutral-300 bg-white p-3.5 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            {e.id}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              e.status === "New"
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : e.status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : "bg-neutral-100 text-neutral-600 border border-neutral-300"
                            }`}
                          >
                            {e.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-extrabold text-sm text-foreground leading-snug">
                            {e.eventName}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {e.clientName} • {e.organization}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-neutral-200">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary shrink-0" />
                            <span className="font-mono">{e.date}</span>
                            <span>•</span>
                            <span>{e.city}</span>
                          </div>
                          <span className="font-mono font-bold text-foreground">{e.budget}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-200">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppReply(e)}
                            className="min-h-[38px] flex items-center justify-center gap-1 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs font-bold text-foreground hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition shadow-2xs cursor-pointer"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[11px]">WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePhoneCall(e)}
                            className="min-h-[38px] flex items-center justify-center gap-1 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                          >
                            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-[11px]">Call</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEmailReply(e)}
                            className="min-h-[38px] flex items-center justify-center gap-1 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-[11px]">Email</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. WEB PAGE ANALYTICS VIEW                                */}
          {/* ========================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                <div>
                  <p className="eyebrow eyebrow-line">Audience Insights</p>
                  <h2 className="display mt-2 text-2xl sm:text-3xl">
                    Website Traffic & <span className="text-primary">Engagement.</span>
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1.5 shadow-2xs self-start sm:self-auto">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    Live Telemetry Active • {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold text-muted-foreground uppercase">Unique Visitors</span>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">42,500</p>
                    <p className="text-xs text-primary font-bold mt-1">↑ 18.2% this month</p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold text-muted-foreground uppercase">Total Pageviews</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">118,200</p>
                    <p className="text-xs text-primary font-bold mt-1">↑ 24.6% this month</p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold text-muted-foreground uppercase">Avg. Time</span>
                    <Clock className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">2m 48s</p>
                    <p className="text-xs text-muted-foreground mt-1">High audience retention</p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="font-display text-xs font-extrabold text-muted-foreground uppercase">Enquiry Rate</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">4.2%</p>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">High booking intent</p>
                  </div>
                </div>
              </div>

              {/* Section Popularity Breakdown */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="panel-card shadow-sm">
                  <div className="panel-card-header flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground uppercase tracking-tight">Most Visited Sections</h3>
                  </div>
                  <div className="panel-card-body p-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span>Homepage &amp; Hero Showreel (/)</span>
                        <span className="text-muted-foreground">45% (53,190 views)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span>Portfolio &amp; Summits (/portfolio)</span>
                        <span className="text-muted-foreground">28% (33,096 views)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "28%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span>Event Formats &amp; Packages (/services)</span>
                        <span className="text-muted-foreground">15% (17,730 views)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "15%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-bold mb-1.5">
                        <span>Live Stage Moments Gallery (/gallery)</span>
                        <span className="text-muted-foreground">12% (14,184 views)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "12%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-card shadow-sm">
                  <div className="panel-card-header flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground uppercase tracking-tight">Traffic Referral Channels</h3>
                  </div>
                  <div className="panel-card-body p-6 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-300 pb-2.5 text-sm">
                      <span className="font-semibold text-foreground">Direct &amp; Bookmark</span>
                      <span className="font-mono font-bold text-muted-foreground">38%</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-300 pb-2.5 text-sm">
                      <span className="font-semibold text-foreground">Instagram (@siddwhizz)</span>
                      <span className="font-mono font-bold text-foreground">32%</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-300 pb-2.5 text-sm">
                      <span className="font-semibold text-foreground">LinkedIn (Siddharth Maurya)</span>
                      <span className="font-mono font-bold text-muted-foreground">20%</span>
                    </div>
                    <div className="flex items-center justify-between pb-1 text-sm">
                      <span className="font-semibold text-foreground">Word-of-Mouth &amp; Agency Referrals</span>
                      <span className="font-mono font-bold text-muted-foreground">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. ENQUIRY MANAGEMENT VIEW                                */}
          {/* ========================================================= */}
          {activeTab === "enquiries" && (
            <div className="space-y-6">
              <div>
                <p className="eyebrow mb-1">Lead & Booking Pipeline</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Enquiry <span className="text-primary">Management</span>
                </h2>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                <div className="relative flex-1 min-w-0 max-w-full lg:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event, client, organization, or city..."
                    aria-label="Search enquiries"
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter buttons - single horizontally scrollable row on mobile without breaking or dropping last button */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
                  {["All", "New", "In Discussion", "Confirmed", "Declined"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`shrink-0 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition cursor-pointer min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        statusFilter === st
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enquiries Grid & Details */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* List Column */}
                <div className={`space-y-4 ${selectedEnquiry ? "lg:col-span-7" : "lg:col-span-12"}`}>
                  {filteredEnquiries.length === 0 ? (
                    <div className="panel-card p-12 text-center">
                      <Inbox className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-base font-bold text-foreground">No enquiries found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search query or filter.</p>
                    </div>
                  ) : (
                    filteredEnquiries.map((e) => {
                      const isSelected = selectedEnquiry?.id === e.id;
                      const isExpanded = !!expandedBriefIds[e.id];
                      const isLongBrief = e.brief && e.brief.length > 90;

                      return (
                        <div
                          key={e.id}
                          onClick={() => setSelectedEnquiry(e)}
                          className={`panel-card transition-all duration-200 cursor-pointer p-4 sm:p-5 lg:p-6 space-y-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isSelected
                              ? "ring-2 ring-primary border-primary shadow-md"
                              : "hover:border-primary/40 hover:shadow-md"
                          }`}
                          tabIndex={0}
                          role="button"
                          aria-label={`Enquiry ${e.id}: ${e.eventName}`}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              setSelectedEnquiry(e);
                            }
                          }}
                        >
                          {/* 1. Top Row:
                              Desktop: Left (ID + Status) | Right (Budget + Date)
                              Mobile / Tablet: Flex wrap without overlap */}
                          <div className="flex flex-wrap items-center justify-between gap-2.5">
                            {/* Left: ID + Status */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-xs sm:text-sm font-bold text-primary tracking-wide whitespace-nowrap bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                                {e.id}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${
                                  e.status === "New"
                                    ? "bg-primary/15 text-primary border border-primary/30"
                                    : e.status === "Confirmed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold"
                                    : e.status === "In Discussion"
                                    ? "bg-amber-50 text-amber-700 border border-amber-300"
                                    : "bg-neutral-100 text-neutral-600 border border-neutral-300"
                                }`}
                              >
                                {e.status}
                              </span>
                            </div>

                            {/* Right: Budget + Event Date */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {e.budget && (
                                <div className="inline-flex items-center gap-1 font-mono font-bold text-foreground bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200 shadow-2xs">
                                  <IndianRupee className="h-3 w-3 text-primary shrink-0" />
                                  <span className="tracking-tight whitespace-nowrap">{e.budget.replace(/^₹\s*/, "")}</span>
                                </div>
                              )}
                              {e.date && (
                                <div className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-200">
                                  <Calendar className="h-3 w-3 text-primary shrink-0" />
                                  <span className="font-mono whitespace-nowrap">{e.date}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 2. Event Title: Full width, prominent typography, never competes horizontally with budget/date */}
                          <div className="w-full min-w-0">
                            <h4 className="font-display text-base sm:text-lg lg:text-xl font-black text-foreground tracking-tight leading-snug break-words">
                              {e.eventName}
                            </h4>
                          </div>

                          {/* 3. Client Information: Contact person + Organization */}
                          <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm min-w-0">
                            <span className="font-bold text-foreground whitespace-nowrap">{e.clientName}</span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="text-muted-foreground font-medium truncate">{e.organization}</span>
                            {e.format && (
                              <>
                                <span className="text-muted-foreground/60 hidden sm:inline">•</span>
                                <span className="text-primary font-semibold text-xs hidden sm:inline">{e.format}</span>
                              </>
                            )}
                          </div>

                          {/* 4. Description: Full-width readable text with expandable View Details */}
                          {e.brief && (
                            <div className="w-full text-xs sm:text-sm text-foreground/80 leading-relaxed min-w-0">
                              <p className={isExpanded ? "break-words" : "line-clamp-2 break-words"}>
                                {e.brief}
                              </p>
                              {isLongBrief && (
                                <button
                                  type="button"
                                  onClick={(ev) => toggleBriefExpanded(e.id, ev)}
                                  className="text-xs font-bold text-primary hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                  aria-label={isExpanded ? `Show less description for ${e.id}` : `View details description for ${e.id}`}
                                >
                                  {isExpanded ? "Show less" : "View details →"}
                                </button>
                              )}
                            </div>
                          )}

                          {/* 5. Divider */}
                          <div className="border-t border-neutral-200 !my-3" />

                          {/* 6. Bottom Row: Left (Location) | Right (WhatsApp, Call, Email actions) */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                            {/* Location */}
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground min-w-0">
                              <MapPin className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">{e.city || "Venue TBA"}</span>
                            </div>

                            {/* Actions: Equal widths on mobile (grid-cols-3), compact flex on desktop */}
                            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  handleWhatsAppReply(e);
                                }}
                                aria-label={`Chat with ${e.clientName} on WhatsApp`}
                                className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-foreground transition-all duration-200 hover:scale-105 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600 group-hover:text-white" />
                                <span className="text-xs">WhatsApp</span>
                              </button>

                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  handlePhoneCall(e);
                                }}
                                aria-label={`Call ${e.clientName}`}
                                className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-foreground transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary active:scale-95 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <Phone className="h-4 w-4 shrink-0 text-primary" />
                                <span className="text-xs">Call</span>
                              </button>

                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  handleEmailReply(e);
                                }}
                                aria-label={`Email ${e.clientName}`}
                                className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-foreground transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary active:scale-95 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <Mail className="h-4 w-4 shrink-0 text-primary" />
                                <span className="text-xs">Email</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Detailed Enquiry Drawer */}
                {selectedEnquiry && (
                  <div className="lg:col-span-5 panel-card shadow-xl space-y-5 sticky top-4 self-start">
                    <div className="panel-card-header flex items-start justify-between">
                      <div>
                        <span className="font-mono text-sm font-bold text-primary">{selectedEnquiry.id}</span>
                        <h3 className="font-display text-xl font-extrabold text-foreground mt-0.5">{selectedEnquiry.eventName}</h3>
                        <p className="text-sm text-muted-foreground">{selectedEnquiry.organization}</p>
                      </div>
                      <button
                        onClick={() => setSelectedEnquiry(null)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="panel-card-body p-6 space-y-5">
                      {/* Status Changer */}
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                          Update Pipeline Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["New", "In Discussion", "Confirmed"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(selectedEnquiry.id, st)}
                              className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                                selectedEnquiry.status === st
                                  ? "bg-primary text-primary-foreground shadow"
                                  : "border border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-100"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setContractModalEnquiry(selectedEnquiry);
                            setContractFee(
                              selectedEnquiry.budget.includes("-")
                                ? (selectedEnquiry.budget.split("-")[0] ?? "").trim()
                                : selectedEnquiry.budget || "₹4,00,000"
                            );
                          }}
                          className="btn-red w-full !py-2.5 !px-4 text-xs mt-2.5 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Approve &amp; Issue Formal Contract to Organizer</span>
                        </button>
                      </div>

                      {/* Quick Outreach Tools */}
                      <div className="panel-inner-tile p-4 space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instant Client Outreach</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleWhatsAppReply(selectedEnquiry)}
                            className="flex flex-col items-center justify-center rounded-xl border border-neutral-300 bg-white p-3 text-foreground transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary active:scale-95 text-center cursor-pointer shadow-2xs"
                          >
                            <MessageCircle className="h-4 w-4 mb-1" />
                            <span className="text-xs font-bold">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handlePhoneCall(selectedEnquiry)}
                            className="flex flex-col items-center justify-center rounded-xl border border-neutral-300 bg-white p-3 text-foreground transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary active:scale-95 text-center cursor-pointer shadow-2xs"
                          >
                            <Phone className="h-4 w-4 mb-1" />
                            <span className="text-xs font-bold">Direct Call</span>
                          </button>
                          <button
                            onClick={() => handleEmailReply(selectedEnquiry)}
                            className="flex flex-col items-center justify-center rounded-xl border border-neutral-300 bg-white p-3 text-foreground transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-white hover:border-primary active:scale-95 text-center cursor-pointer shadow-2xs"
                          >
                            <Mail className="h-4 w-4 mb-1" />
                            <span className="text-xs font-bold">Send Mail</span>
                          </button>
                        </div>
                      </div>

                      {/* Event Specifications */}
                      <div className="space-y-2 text-sm border-t border-neutral-300 pt-3">
                        <div className="flex justify-between py-2 border-b border-neutral-300 items-center">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-primary" /> Target Date:
                          </span>
                          <span className="font-mono font-bold text-foreground text-sm bg-white px-2.5 py-0.5 rounded-md border border-neutral-300">
                            {selectedEnquiry.date}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-300 items-center">
                          <span className="text-muted-foreground">City &amp; Venue:</span>
                          <span className="font-semibold text-foreground text-right">{selectedEnquiry.venue}, {selectedEnquiry.city}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-300 items-center">
                          <span className="text-muted-foreground">Event Format:</span>
                          <span className="font-semibold text-foreground">{selectedEnquiry.format}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-300 items-center">
                          <span className="text-muted-foreground">Audience Size:</span>
                          <span className="font-semibold text-foreground">{selectedEnquiry.crowdSize}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-300 items-center">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <IndianRupee className="h-4 w-4 text-primary" /> Budget Indicator:
                          </span>
                          <span className="font-mono font-extrabold text-foreground text-sm sm:text-base bg-white px-2.5 py-0.5 rounded-md border border-neutral-300">
                            {selectedEnquiry.budget}
                          </span>
                        </div>
                      </div>

                      {/* Special Brief */}
                      <div className="border-t border-neutral-300 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Organizer Event Brief
                        </p>
                        <p className="text-sm text-foreground bg-white p-3.5 rounded-xl border border-neutral-300 leading-relaxed">
                          {selectedEnquiry.brief}
                        </p>
                      </div>

                      {/* Internal Notes */}
                      <div className="border-t border-neutral-300 pt-3 space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Internal Management Notes
                        </p>
                        {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 ? (
                          <div className="space-y-1.5">
                            {selectedEnquiry.notes.map((n, idx) => (
                              <div key={idx} className="rounded-lg bg-white p-2.5 text-sm text-foreground flex items-start gap-2 border border-neutral-300">
                                <span className="text-primary font-bold">•</span>
                                <span>{n}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No notes added yet.</p>
                        )}

                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Add private note for Sid..."
                            className="flex-1 rounded-xl border border-neutral-300 bg-white py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddNote(selectedEnquiry.id)}
                            className="btn-red !py-2 !px-4 text-sm cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. MEDIA FILE LIBRARY VIEW (Redesigned with Editor & Tools) */}
          {/* ========================================================= */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Header: Eyebrow, Title & Storage Meter + Upload Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="eyebrow mb-1">Press, Stage &amp; Digital Assets</p>
                  <h2 className="display text-2xl sm:text-3xl text-foreground">
                    Media <span className="text-primary">Library</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {/* Storage Meter Pill */}
                  <div className="hidden md:flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 shadow-2xs">
                    <HardDrive className="h-4 w-4 text-primary shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-foreground">12.4 GB</span>
                      <span className="text-muted-foreground"> / 50 GB (24%)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="btn-red !py-2.5 !px-5 text-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Upload Media File
                  </button>
                </div>
              </div>

              {/* Navigation Tabs: All Media, Images, Videos, Audio, Documents, Others, Wishlist */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-neutral-300 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                {[
                  { id: "all", label: "All Media", count: mediaItems.length, icon: Layers },
                  { id: "image", label: "Images", count: mediaItems.filter((m) => m.type === "image").length, icon: ImageIcon },
                  { id: "video", label: "Videos", count: mediaItems.filter((m) => m.type === "video").length, icon: Video },
                  { id: "audio", label: "Audio", count: mediaItems.filter((m) => m.type === "audio").length, icon: Music },
                  { id: "document", label: "Documents", count: mediaItems.filter((m) => m.type === "document").length, icon: FileText },
                  { id: "other", label: "Others", count: mediaItems.filter((m) => m.type === "other").length, icon: Archive },
                  { id: "wishlist", label: "My Wishlist", count: mediaItems.filter((m) => m.isWishlist).length, icon: Heart, highlight: true },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = mediaActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMediaActiveTab(tab.id as any);
                        setSelectedMediaIds([]);
                      }}
                      className={`shrink-0 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? tab.highlight
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-primary text-primary-foreground shadow-sm"
                          : tab.highlight
                          ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                          : "border border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${tab.highlight && !isActive ? "text-rose-500 fill-rose-500" : ""}`} />
                      <span>{tab.label}</span>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? "bg-black/20 text-white" : "bg-neutral-100 text-muted-foreground"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search, Sort, View Mode & Multi-Select Toolbar */}
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                <div className="relative flex-1 min-w-0 max-w-full lg:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={mediaSearchQuery}
                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                    placeholder="Search by title, category, format, tags, or folder..."
                    aria-label="Search media files"
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  />
                  {mediaSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMediaSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground font-bold hidden sm:inline">Sort:</span>
                    <select
                      value={mediaSort}
                      onChange={(e) => setMediaSort(e.target.value as any)}
                      className="rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none shadow-2xs cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="size">Size (Largest)</option>
                    </select>
                  </div>

                  {/* Multi-Select Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMediaIds.length > 0) {
                        setSelectedMediaIds([]);
                      } else {
                        setSelectedMediaIds(filteredMedia.map((m) => m.id));
                      }
                    }}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                      selectedMediaIds.length > 0
                        ? "bg-primary text-white border-primary"
                        : "border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                    }`}
                  >
                    {selectedMediaIds.length > 0 ? (
                      <>
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>{selectedMediaIds.length} Selected</span>
                      </>
                    ) : (
                      <>
                        <Square className="h-3.5 w-3.5" />
                        <span>Select Mode</span>
                      </>
                    )}
                  </button>

                  {/* Grid / List Toggle */}
                  <div className="flex items-center rounded-xl border border-neutral-300 bg-white p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setMediaViewMode("grid")}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        mediaViewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Grid View"
                    >
                      <Layers className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaViewMode("list")}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        mediaViewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="List View"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Actions Floating Bar */}
              {selectedMediaIds.length > 0 && (
                <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary/50 bg-white p-3.5 shadow-xl animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-sm text-foreground">
                      {selectedMediaIds.length} of {filteredMedia.length} files selected
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllFilteredMedia}
                      className="text-xs font-bold text-primary hover:underline ml-2 cursor-pointer"
                    >
                      {selectedMediaIds.length === filteredMedia.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleBulkDownload}
                      className="btn-red !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" /> Download ZIP
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkAddToWishlist}
                      className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 !border-neutral-300 !text-foreground hover:!bg-neutral-100 cursor-pointer"
                    >
                      <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Add to Wishlist
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkActionFolderModalOpen(true)}
                      className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 !border-neutral-300 !text-foreground hover:!bg-neutral-100 cursor-pointer"
                    >
                      <Folder className="h-3.5 w-3.5 text-primary" /> Move to Folder
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDeleteSelected}
                      className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 !border-neutral-300 text-destructive hover:!bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* No Items Empty State */}
              {filteredMedia.length === 0 && (
                <div className="panel-card p-12 text-center space-y-3">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="font-display font-extrabold text-lg text-foreground">No media assets found</p>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    {mediaSearchQuery
                      ? `No files matched "${mediaSearchQuery}". Try adjusting your keywords or clearing the filter.`
                      : mediaActiveTab === "wishlist"
                      ? "You haven't added any media items to your wishlist yet. Tap the heart or star on any card to save it here!"
                      : "No files found in this category. Click '+ Upload Media File' to add stage photos, showreel videos, audio intros, or tech riders."}
                  </p>
                  {mediaSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMediaSearchQuery("")}
                      className="btn-outline !py-1.5 !px-4 text-xs !border-neutral-300 !text-foreground mt-2"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* GRID VIEW                                                     */}
              {/* ------------------------------------------------------------- */}
              {mediaViewMode === "grid" && filteredMedia.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredMedia.map((m) => {
                    const isSelected = selectedMediaIds.includes(m.id);
                    const format = m.format || detectFileFormat(m.url, m.title, m.type);
                    const isActionOpen = actionMenuOpenId === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`group panel-card p-4 sm:p-5 shadow-sm transition-all flex flex-col justify-between relative ${
                          isSelected ? "border-primary ring-2 ring-primary/40 bg-primary/5" : "hover:border-primary/50"
                        }`}
                      >
                        <div>
                          {/* Top Row: Select Checkbox, Format Badge, Size, and Wishlist/Like */}
                          <div className="flex items-center justify-between gap-1.5 mb-2.5">
                            <div className="flex items-center gap-2">
                              {/* Selection Checkbox */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleSelectMedia(m.id, e)}
                                className={`h-5 w-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                                  isSelected
                                    ? "bg-primary border-primary text-white"
                                    : "border-neutral-300 bg-white hover:border-primary"
                                }`}
                                aria-label="Select file"
                              >
                                {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                              </button>

                              {/* Format Badge using Universal File Icon */}
                              <UniversalFileIcon
                                format={format}
                                type={m.type}
                                variant="badge"
                                className="scale-90 origin-left"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Like Button */}
                              <button
                                type="button"
                                onClick={(e) => handleLikeMedia(m, e)}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition cursor-pointer border ${
                                  m.isLiked
                                    ? "bg-rose-50 text-rose-600 border-rose-300"
                                    : "bg-white text-muted-foreground border-neutral-200 hover:text-rose-500 hover:border-rose-200"
                                }`}
                                title={m.isLiked ? "Liked" : "Like asset"}
                              >
                                <Heart className={`h-3 w-3 ${m.isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                                <span>{m.likes || 0}</span>
                              </button>

                              {/* Wishlist Button */}
                              <button
                                type="button"
                                onClick={(e) => handleWishlistMedia(m, e)}
                                className={`p-1 rounded-full transition cursor-pointer border ${
                                  m.isWishlist
                                    ? "bg-amber-50 text-amber-600 border-amber-300"
                                    : "bg-white text-muted-foreground border-neutral-200 hover:text-amber-500 hover:border-amber-200"
                                }`}
                                title={m.isWishlist ? "In Wishlist" : "Add to Wishlist"}
                              >
                                <Bookmark className={`h-3 w-3 ${m.isWishlist ? "fill-amber-500 text-amber-500" : ""}`} />
                              </button>
                            </div>
                          </div>

                          {/* Visual Media Thumbnail or Universal File Icon Card Art */}
                          <div
                            onClick={() => handleOpenAssetModal(m)}
                            className="relative h-44 w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-300 flex items-center justify-center group/thumb mb-3 cursor-pointer"
                          >
                            {m.type === "image" || (m.type === "video" && m.thumbnail) ? (
                              <img
                                src={m.thumbnail || getDefaultThumbnail(m)}
                                alt={m.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(ev) => {
                                  (ev.target as HTMLImageElement).src = stageBeams;
                                }}
                              />
                            ) : (
                              <UniversalFileIcon
                                format={format}
                                type={m.type}
                                variant="card-art"
                                className="w-full h-full"
                              />
                            )}

                            {/* Play overlay for video */}
                            {m.type === "video" && (
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                <span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-white shadow-lg group-hover:scale-110 transition">
                                  <Play className="h-5 w-5 ml-0.5 fill-current" />
                                </span>
                              </div>
                            )}

                            {/* Hover Action Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xl">
                                <Maximize2 className="h-3.5 w-3.5" /> Preview
                              </span>
                            </div>

                            {/* Size badge overlay at bottom right */}
                            <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur">
                              {m.size}
                            </span>
                          </div>

                          {/* File Title */}
                          <h4
                            onClick={() => handleOpenAssetModal(m)}
                            className="font-display font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer"
                          >
                            {m.title}
                          </h4>

                          {/* Category & Folder */}
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                            <span>{m.category}</span>
                            <span>•</span>
                            <span className="text-primary font-semibold">{m.folder || "Stage Assets"}</span>
                            {m.dimensions && <span>• {m.dimensions}</span>}
                            {m.duration && <span>• {m.duration}</span>}
                          </p>

                          {/* Tags Pills */}
                          {m.tags && m.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {m.tags.slice(0, 3).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold text-muted-foreground bg-neutral-100 px-1.5 py-0.2 rounded border border-neutral-200"
                                >
                                  #{t}
                                </span>
                              ))}
                              {m.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                  +{m.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Date & Unified "Actions ▾" Menu */}
                        <div className="mt-4 border-t border-neutral-300 pt-3 flex items-center justify-between gap-2 relative">
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {m.createdAt}
                          </span>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpenId(isActionOpen ? null : m.id);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-bold text-foreground hover:bg-neutral-100 hover:border-primary transition cursor-pointer shadow-2xs"
                              aria-label="Actions menu"
                            >
                              <span>Actions</span>
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>

                            {/* Dropdown Menu Desktop / Tablet */}
                            {isActionOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setActionMenuOpenId(null)}
                                />
                                <div className="absolute right-0 bottom-full mb-1 z-40 w-52 rounded-xl border border-neutral-300 bg-white shadow-2xl p-1.5 text-xs text-foreground divide-y divide-neutral-100 animate-in fade-in-50 zoom-in-95">
                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        handleOpenAssetModal(m);
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>View / Preview</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        setEditorModalItem(m);
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary font-bold cursor-pointer"
                                    >
                                      <Edit3 className="h-3.5 w-3.5 text-primary" />
                                      <span>Edit Media File</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        setThumbnailModalMedia(m);
                                        setSelectedThumbnailPreview(m.thumbnail || getDefaultThumbnail(m));
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Set Custom Thumbnail</span>
                                    </button>
                                  </div>

                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        handleWishlistMedia(m);
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                                      <span>{m.isWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        setRenameModalItem(m);
                                        setNewTitleVal(m.title);
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Rename File</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        setTagsModalItem(m);
                                        setTagsVal((m.tags || []).join(", "));
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Tag className="h-3.5 w-3.5 text-primary" />
                                      <span>Edit Tags &amp; Metadata</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        setFolderModalItem(m);
                                        setFolderVal(m.folder || "Stage Assets");
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Move to Folder</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        handleDuplicateMedia(m);
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Duplicate Copy</span>
                                    </button>
                                  </div>

                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenId(null);
                                        handleCopyLink(m.url);
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Copy Public Link</span>
                                    </button>

                                    <a
                                      href={m.url}
                                      download={m.title}
                                      onClick={() => setActionMenuOpenId(null)}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                                    >
                                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Download File</span>
                                    </a>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        setActionMenuOpenId(null);
                                        handleDeleteClick(e, m);
                                      }}
                                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-destructive font-bold cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                      <span>Delete Asset</span>
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* LIST VIEW                                                     */}
              {/* ------------------------------------------------------------- */}
              {mediaViewMode === "list" && filteredMedia.length > 0 && (
                <div className="panel-card overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs sm:text-sm">
                      <thead className="border-b border-neutral-300 bg-neutral-100 font-display text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="p-3 w-10 text-center">
                            <button
                              type="button"
                              onClick={handleSelectAllFilteredMedia}
                              className={`h-4 w-4 rounded border inline-flex items-center justify-center ${
                                selectedMediaIds.length === filteredMedia.length
                                  ? "bg-primary border-primary text-white"
                                  : "border-neutral-300 bg-white"
                              }`}
                            >
                              {selectedMediaIds.length === filteredMedia.length && <Check className="h-3 w-3" />}
                            </button>
                          </th>
                          <th className="p-3">Asset</th>
                          <th className="p-3">Category &amp; Folder</th>
                          <th className="p-3">Format / Size</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-center">Likes</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {filteredMedia.map((m) => {
                          const isSelected = selectedMediaIds.includes(m.id);
                          const format = m.format || detectFileFormat(m.url, m.title, m.type);
                          return (
                            <tr key={m.id} className={`hover:bg-neutral-50 transition ${isSelected ? "bg-primary/5" : ""}`}>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleSelectMedia(m.id, e)}
                                  className={`h-4 w-4 rounded border inline-flex items-center justify-center cursor-pointer ${
                                    isSelected
                                      ? "bg-primary border-primary text-white"
                                      : "border-neutral-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                </button>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    onClick={() => handleOpenAssetModal(m)}
                                    className="h-10 w-12 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0 cursor-pointer"
                                  >
                                    {m.type === "image" || m.thumbnail ? (
                                      <img src={m.thumbnail || getDefaultThumbnail(m)} alt={m.title} className="h-full w-full object-cover" />
                                    ) : (
                                      <UniversalFileIcon format={format} type={m.type} variant="icon" className="scale-75 origin-top-left" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p
                                      onClick={() => handleOpenAssetModal(m)}
                                      className="font-bold text-foreground hover:text-primary transition truncate cursor-pointer"
                                    >
                                      {m.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {m.dimensions || m.duration || "Standard Media"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold text-foreground">{m.category}</span>
                                <p className="text-xs text-primary font-bold">{m.folder || "Stage Assets"}</p>
                              </td>
                              <td className="p-3 font-mono text-xs">
                                <span className="font-bold uppercase text-foreground">{format}</span>
                                <span className="text-muted-foreground ml-1">({m.size})</span>
                              </td>
                              <td className="p-3 font-mono text-xs text-muted-foreground">
                                {m.createdAt}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => handleLikeMedia(m, e)}
                                  className="inline-flex items-center gap-1 text-xs text-rose-500 font-bold hover:scale-110 transition cursor-pointer"
                                >
                                  <Heart className={`h-3 w-3 ${m.isLiked ? "fill-rose-500" : ""}`} />
                                  <span>{m.likes || 0}</span>
                                </button>
                              </td>
                              <td className="p-3 text-right space-x-1 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setEditorModalItem(m)}
                                  className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-primary/10 hover:text-primary transition shadow-2xs"
                                  title="Edit Media"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssetModal(m)}
                                  className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 transition shadow-2xs"
                                  title="Preview"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteClick(e, m)}
                                  className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-red-50 text-destructive transition shadow-2xs"
                                  title="Delete"
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
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MODALS: EDITOR, RENAME, TAGS, FOLDER, BULK FOLDER             */}
              {/* ------------------------------------------------------------- */}

              {/* 1. Multi-Type Unified Media Editor Modal */}
              {editorModalItem && (
                <MediaEditorModal
                  item={editorModalItem}
                  onClose={() => setEditorModalItem(null)}
                  onSaveCopy={() => {
                    setMediaItems(getStoredMedia());
                    setEditorModalItem(null);
                  }}
                  onReplaceOriginal={() => {
                    setMediaItems(getStoredMedia());
                    setEditorModalItem(null);
                  }}
                />
              )}

              {/* 2. Rename File Modal */}
              {renameModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
                  <div className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <h3 className="font-display text-base font-extrabold text-foreground">Rename Media File</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRenameModalItem(null)}
                        className="p-1 rounded-lg hover:bg-neutral-100 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">New File Title *</label>
                      <input
                        type="text"
                        value={newTitleVal}
                        onChange={(e) => setNewTitleVal(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setRenameModalItem(null)}
                        className="btn-outline !py-2 !px-4 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmRename}
                        className="btn-red !py-2 !px-5 text-xs font-bold"
                      >
                        Save Rename
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Edit Tags & Metadata Modal */}
              {tagsModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
                  <div className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <h3 className="font-display text-base font-extrabold text-foreground">Edit File Tags</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTagsModalItem(null)}
                        className="p-1 rounded-lg hover:bg-neutral-100 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Tags (comma-separated):</label>
                      <input
                        type="text"
                        value={tagsVal}
                        onChange={(e) => setTagsVal(e.target.value)}
                        placeholder="e.g. Stage, Keynote, Corporate, Gala, HighRes"
                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["StageMoments", "TechSummit", "Showreel", "Headshot", "CorporateGala", "4KMaster", "Official"].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              const existing = tagsVal.split(",").map((s) => s.trim()).filter(Boolean);
                              if (!existing.includes(sug)) {
                                setTagsVal(existing.concat(sug).join(", "));
                              }
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-300 bg-neutral-100 hover:border-primary text-foreground"
                          >
                            +{sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setTagsModalItem(null)}
                        className="btn-outline !py-2 !px-4 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSaveTags}
                        className="btn-red !py-2 !px-5 text-xs font-bold"
                      >
                        Save Tags
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Move to Folder Modal */}
              {folderModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
                  <div className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary" />
                        <h3 className="font-display text-base font-extrabold text-foreground">Move to Folder</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFolderModalItem(null)}
                        className="p-1 rounded-lg hover:bg-neutral-100 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Select or Type Folder Name:</label>
                      <select
                        value={folderVal}
                        onChange={(e) => setFolderVal(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none mb-2"
                      >
                        <option value="Stage Assets">Stage Assets</option>
                        <option value="Showreels">Showreels</option>
                        <option value="Press & Media">Press &amp; Media</option>
                        <option value="Riders & Tech">Riders &amp; Tech</option>
                        <option value="Brand Kits">Brand Kits</option>
                        <option value="Archive">Archive</option>
                      </select>
                      <input
                        type="text"
                        value={folderVal}
                        onChange={(e) => setFolderVal(e.target.value)}
                        placeholder="Or custom folder name..."
                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setFolderModalItem(null)}
                        className="btn-outline !py-2 !px-4 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSaveFolder}
                        className="btn-red !py-2 !px-5 text-xs font-bold"
                      >
                        Move File
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Bulk Move to Folder Modal */}
              {bulkActionFolderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
                  <div className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary" />
                        <h3 className="font-display text-base font-extrabold text-foreground">
                          Move {selectedMediaIds.length} Files to Folder
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBulkActionFolderModalOpen(false)}
                        className="p-1 rounded-lg hover:bg-neutral-100 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Destination Folder:</label>
                      <select
                        value={bulkFolderVal}
                        onChange={(e) => setBulkFolderVal(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="Stage Assets">Stage Assets</option>
                        <option value="Showreels">Showreels</option>
                        <option value="Press & Media">Press &amp; Media</option>
                        <option value="Riders & Tech">Riders &amp; Tech</option>
                        <option value="Brand Kits">Brand Kits</option>
                        <option value="Archive">Archive</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setBulkActionFolderModalOpen(false)}
                        className="btn-outline !py-2 !px-4 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkMoveConfirm}
                        className="btn-red !py-2 !px-5 text-xs font-bold"
                      >
                        Move Selected Files
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Upload Modal with Real File Drag-and-Drop and Preview */}
              {uploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div>
                        <h3 className="font-display text-lg font-extrabold text-foreground">Upload Media Asset</h3>
                        <p className="text-xs text-muted-foreground">Supported formats: Images, Videos, Audio, PDFs &amp; Documents</p>
                      </div>
                      <button
                        onClick={() => {
                          setUploadModalOpen(false);
                          setSelectedMediaFile(null);
                          setSelectedMediaPreview(null);
                        }}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-neutral-100"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUploadMedia} className="space-y-4">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={mediaFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaFileSelect(file);
                        }}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                        className="hidden"
                      />

                      {/* Interactive Drag & Drop Area */}
                      <div
                        onClick={() => mediaFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingMedia(true);
                        }}
                        onDragLeave={() => setIsDraggingMedia(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingMedia(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleMediaFileSelect(file);
                        }}
                        className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                          isDraggingMedia
                            ? "border-primary bg-primary/10"
                            : selectedMediaFile
                            ? "border-emerald-500/60 bg-emerald-500/5"
                            : "border-neutral-300 bg-neutral-50 hover:border-primary/50 hover:bg-neutral-100"
                        }`}
                      >
                        {selectedMediaPreview && newMediaType === "image" ? (
                          <div className="space-y-2">
                            <img
                              src={selectedMediaPreview}
                              alt="Upload preview"
                              className="mx-auto h-32 max-w-full rounded-xl object-cover border border-neutral-300 shadow-sm"
                            />
                            <p className="text-xs font-bold text-foreground">
                              {selectedMediaFile?.name} ({(selectedMediaFile?.size ? selectedMediaFile.size / (1024 * 1024) : 0).toFixed(2)} MB)
                            </p>
                            <span className="text-[11px] text-primary underline">Click to choose a different file</span>
                          </div>
                        ) : selectedMediaFile ? (
                          <div className="space-y-2 py-2">
                            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/20 text-primary">
                              {newMediaType === "video" ? <Video className="h-6 w-6" /> : newMediaType === "audio" ? <Music className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                            </div>
                            <p className="text-sm font-bold text-foreground">{selectedMediaFile.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {(selectedMediaFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedMediaFile.type || "Document"}
                            </p>
                            <span className="text-[11px] text-primary underline">Click to choose a different file</span>
                          </div>
                        ) : (
                          <div className="space-y-2 py-3">
                            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-neutral-200 text-muted-foreground">
                              <Upload className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-bold text-foreground">
                              Drag and drop your file here, or <span className="text-primary underline">browse</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Images (JPG, PNG), Videos (MP4), Audio (MP3), Documents (PDF)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">Media Type</label>
                          <select
                            value={newMediaType}
                            onChange={(e) => setNewMediaType(e.target.value as any)}
                            className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                          >
                            <option value="image">Image (Stage photo, portrait)</option>
                            <option value="video">Video (Showreel, keynote highlight)</option>
                            <option value="audio">Audio (Host voiceover, intro track)</option>
                            <option value="document">Document (PDF Rider, commercial kit)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">File Title</label>
                          <input
                            type="text"
                            required
                            value={newMediaTitle}
                            onChange={(e) => setNewMediaTitle(e.target.value)}
                            placeholder="e.g. Jio World Convention Keynote"
                            className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {newMediaType !== "image" && (
                        <div className="panel-inner-tile p-3 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                              <ImageIcon className="h-3.5 w-3.5 text-primary" /> Optional Custom Thumbnail
                            </label>
                            {uploadMediaThumbnail && (
                              <button
                                type="button"
                                onClick={() => setUploadMediaThumbnail(null)}
                                className="text-[11px] text-destructive hover:underline"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden border border-neutral-300 bg-neutral-200">
                              <img
                                src={uploadMediaThumbnail || getDefaultThumbnail({ type: newMediaType })}
                                alt="Thumb"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                ref={uploadThumbnailInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setUploadMediaThumbnail(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => uploadThumbnailInputRef.current?.click()}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 transition inline-flex items-center gap-1.5 text-foreground shadow-sm"
                              >
                                <Upload className="h-3.5 w-3.5 text-primary" />
                                {uploadMediaThumbnail ? "Change Custom Thumbnail" : "Upload Custom Thumbnail"}
                              </button>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Defaults to curated stage photography if left blank.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadModalOpen(false);
                            setSelectedMediaFile(null);
                            setSelectedMediaPreview(null);
                          }}
                          className="btn-outline !py-2 !px-4 text-sm"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-red !py-2 !px-5 text-sm flex items-center gap-2">
                          <Upload className="h-4 w-4" /> Upload &amp; Index
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. MERGED ACCOUNT & PROFILE VIEW                          */}
          {/* ========================================================= */}
          {activeTab === "account" && (() => {
            // Reusable Left Column Cards for Desktop & Mobile Sub-views
            const renderPhotoStudioCard = () => (
              <div className="panel-card shadow-sm space-y-0">
                <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div className="rounded-xl bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-foreground uppercase tracking-tight">
                        Profile Photo &amp; Stage Headshot
                      </h3>
                      <p className="text-xs text-muted-foreground">Upload your personal photo or select from curated stage presets.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-red !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload File
                    </button>
                    {user?.avatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="btn-outline !py-1.5 !px-3 text-xs !border-neutral-300 text-destructive hover:!bg-white cursor-pointer"
                        title="Remove custom photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="panel-card-body p-4 sm:p-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-2.5">
                      Quick Stage Presets:
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectPresetPhoto(hostBowtie)}
                        className={`group rounded-xl border p-2.5 flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          user?.avatar === hostBowtie
                            ? "border-primary bg-primary/15 ring-2 ring-primary"
                            : "border-neutral-300 bg-white hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={hostBowtie}
                          alt="Gala Bowtie"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-foreground group-hover:text-primary">
                          Gala Bowtie
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPresetPhoto(hostPurple)}
                        className={`group rounded-xl border p-2.5 flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          user?.avatar === hostPurple
                            ? "border-primary bg-primary/15 ring-2 ring-primary"
                            : "border-neutral-300 bg-white hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={hostPurple}
                          alt="Summit Anchor"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-foreground group-hover:text-primary">
                          Summit Anchor
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPresetPhoto(hostSmileRed)}
                        className={`group rounded-xl border p-2.5 flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          user?.avatar === hostSmileRed
                            ? "border-primary bg-primary/15 ring-2 ring-primary"
                            : "border-neutral-300 bg-white hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={hostSmileRed}
                          alt="Festival Energy"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-foreground group-hover:text-primary">
                          Live Energy
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );

            const renderBasicInfoCard = () => (
              <div className="panel-card shadow-sm space-y-0">
                <div className="panel-card-header flex items-center gap-2.5">
                  <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div className="rounded-xl bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-foreground uppercase tracking-tight">
                      Basic Profile Information
                    </h3>
                    <p className="text-xs text-muted-foreground">Update legal identity, direct stage line, and booking bio.</p>
                  </div>
                </div>

                <div className="panel-card-body p-4 sm:p-5">
                  <form onSubmit={handleSaveAccount} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5 text-xs">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5 text-xs">Official Host Email</label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5 text-xs">Direct Mobile (WhatsApp)</label>
                        <input
                          type="text"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5 text-xs">Display Title</label>
                        <input
                          type="text"
                          value={adminTitle}
                          onChange={(e) => setAdminTitle(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5 text-xs">Host Bio Summary</label>
                      <textarea
                        rows={3}
                        value={adminBio}
                        onChange={(e) => setAdminBio(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn-red !py-2.5 !px-5 text-sm cursor-pointer shadow-sm">
                        Save Profile Information
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );

            const renderPasswordCard = () => (
              <div className="panel-card shadow-sm space-y-0">
                <div className="panel-card-header flex items-center gap-2.5">
                  <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div className="rounded-xl bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-foreground uppercase tracking-tight">
                      Change Password &amp; Security
                    </h3>
                    <p className="text-xs text-muted-foreground">Keep your admin authentication credentials secure.</p>
                  </div>
                </div>

                <div className="panel-card-body p-4 sm:p-5">
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5 text-xs">Current Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                        <span className="text-[11px] text-muted-foreground mt-1 block">Default: sid123</span>
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5 text-xs">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5 text-xs">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-red !py-2.5 !px-5 text-sm cursor-pointer shadow-sm"
                    >
                      Update Password &amp; Save
                    </button>
                  </form>
                </div>
              </div>
            );

            const renderTeamPermissionsCard = () => (
              <div className="panel-card shadow-sm space-y-0">
                <div className="panel-card-header flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div className="rounded-xl bg-primary/10 p-2 text-primary border border-primary/20 shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-foreground uppercase tracking-tight">
                        Team Permissions &amp; Management
                      </h3>
                      <p className="text-xs text-muted-foreground">Authorized team members with access to the Admin Panel.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Invitation link generated for team manager.")}
                    className="btn-outline !py-2 !px-3.5 text-xs sm:text-sm flex items-center gap-1.5 !border-neutral-300 !text-foreground hover:!bg-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Team Member
                  </button>
                </div>

                <div className="panel-card-body p-0 sm:p-4">
                  <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                    <table className="w-full min-w-[500px] text-left text-xs">
                      <thead className="border-b border-neutral-300 bg-neutral-100 font-bold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="p-3 whitespace-nowrap">User</th>
                          <th className="p-3 whitespace-nowrap">Role</th>
                          <th className="p-3 whitespace-nowrap">Access Level</th>
                          <th className="p-3 text-right whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-300">
                        <tr>
                          <td className="p-3 whitespace-nowrap">
                            <p className="font-bold text-foreground">{adminName}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{adminEmail}</p>
                          </td>
                          <td className="p-3 font-semibold text-primary whitespace-nowrap">Super Admin (Host)</td>
                          <td className="p-3 text-muted-foreground whitespace-nowrap">Full Permissions</td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[10px] font-bold border border-primary/30">
                              Active
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 whitespace-nowrap">
                            <p className="font-bold text-foreground">Neha Sharma</p>
                            <p className="text-[11px] text-muted-foreground font-mono">neha.bookings@siddwhizz.com</p>
                          </td>
                          <td className="p-3 font-semibold text-foreground whitespace-nowrap">Booking Manager</td>
                          <td className="p-3 text-muted-foreground whitespace-nowrap">Enquiries &amp; Contracts</td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-neutral-100 text-foreground px-2.5 py-0.5 text-[10px] font-bold border border-neutral-300">
                              Active
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );

            return (
              <div className="w-full max-w-4xl mx-auto space-y-6">
                {/* Header matching Desktop & Mobile Reference */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-300 pb-4">
                  <div>
                    <p className="eyebrow mb-1">Host Identity &amp; Security</p>
                    <h2 className="display text-2xl sm:text-3xl text-foreground">
                      Host Account &amp; <span className="text-primary">Profile Settings</span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold border border-emerald-300 shadow-2xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Accepting Stage Dates
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-700 px-3 py-1 text-xs font-bold border border-neutral-300 shadow-2xs">
                      <Database className="h-3.5 w-3.5 text-primary" />
                      NeonDB Connected
                    </span>
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={adminName}
                        className="h-8 w-8 rounded-full object-cover border-2 border-primary shadow-sm"
                        title={adminName}
                      />
                    ) : (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-white shadow-sm">
                        SM
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate({ to: "/" });
                      }}
                      className="btn-outline !py-1.5 !px-3 text-xs !border-neutral-300 !text-foreground hover:!bg-white cursor-pointer ml-1"
                      title="Sign Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hidden file input for custom profile photo upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload profile photo"
                />

                {/* Card 1: Profile Photo & Stage Headshot */}
                {renderPhotoStudioCard()}

                {/* Card 2: Basic Profile Information */}
                {renderBasicInfoCard()}

                {/* Card 3: Change Password & Security */}
                {renderPasswordCard()}

                {/* Card 4: Team Permissions & Management */}
                {renderTeamPermissionsCard()}

                {/* Card 5: Social Media Accounts (Integrated 5-account card with Add Account, Details & View All Modals) */}
                <SocialAccountsManager />
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* 6. SETTINGS VIEW                                          */}
          {/* ========================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <p className="eyebrow mb-1">Platform Preferences</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  System <span className="text-primary">Settings</span>
                </h2>
              </div>

              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-primary" />
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
                      Website &amp; Booking Configuration
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">Control public calendar availability and lead routing rules.</p>
                  </div>
                </div>

                <div className="panel-card-body space-y-4 text-sm">
                  {/* Availability switch */}
                  <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
                    <div>
                      <p className="font-bold text-foreground">Live Booking Acceptance</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Show "Accepting Bookings" on the homepage and contact form.</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !bookingAvailable;
                        setBookingAvailable(next);
                        updateSiteSettings({ bookingAvailable: next });
                        toast.success(`Public booking availability changed to ${next ? "Active" : "Paused"}`);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                        bookingAvailable ? "bg-primary" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          bookingAvailable ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* WhatsApp Alerts switch */}
                  <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
                    <div>
                      <p className="font-bold text-foreground">Instant WhatsApp Lead Alerts</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Send immediate notification to host phone when new high-value enquiry lands.</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !whatsappNotifications;
                        setWhatsappNotifications(next);
                        updateSiteSettings({ whatsappNotifications: next });
                        toast.success("Notification preferences updated.");
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                        whatsappNotifications ? "bg-primary" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          whatsappNotifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Auto-reply email */}
                  <div className="flex items-center justify-between border-b border-neutral-300 pb-4">
                    <div>
                      <p className="font-bold text-foreground">Automated Organizer Acknowledgment Email</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Instantly email organizer with host tech rider and showreel link.</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !autoReplyEnabled;
                        setAutoReplyEnabled(next);
                        updateSiteSettings({ autoReplyEnabled: next });
                        toast.success("Auto-reply preferences updated.");
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                        autoReplyEnabled ? "bg-primary" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          autoReplyEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Direct Contact Phone */}
                  <div className="border-b border-neutral-300 pb-4">
                    <label className="font-bold text-foreground block mb-1.5 text-xs uppercase tracking-wide">Official Host Booking Hotline</label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={hotlinePhone}
                        onChange={(e) => setHotlinePhone(e.target.value)}
                        className="w-full max-w-sm rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateSiteSettings({ hotlinePhone });
                          toast.success("Official booking hotline saved!");
                        }}
                        className="btn-red !py-2 !px-4 text-xs cursor-pointer"
                      >
                        Save Hotline
                      </button>
                    </div>
                  </div>

                  {/* Neon Database Status */}
                  <div className="panel-inner-tile p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/20 p-2.5 text-primary border border-primary/30">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Neon PostgreSQL Database</p>
                        <p className="text-xs text-muted-foreground font-mono">Connected via DATABASE_URL (.env)</p>
                      </div>
                    </div>

                    <Link to="/db-status" className="btn-outline !py-2 !px-4 text-sm bg-white">
                      Diagnostics →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. SUPPORT & HELP (FROM DEVELOPER) VIEW                   */}
          {/* ========================================================= */}
          {activeTab === "support" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <p className="eyebrow mb-1">Technical Support</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Developer <span className="text-primary">Assistance</span>
                </h2>
              </div>

              {/* Dedicated Developer Hotline Card */}
              <div className="panel-card border-primary/40 shadow-sm">
                <div className="panel-card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1.5 rounded-full bg-primary" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/20 px-2 py-0.5 rounded border border-primary/30">
                        Direct Developer Support Channel
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-foreground mt-0.5">
                        Developer &amp; Technical Assistance
                      </h3>
                    </div>
                  </div>
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>

                <div className="panel-card-body space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Need custom features, database migration, or experiencing any issue on the live website? Your dedicated engineering team is directly accessible via WhatsApp and email.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href="https://wa.me/919999999999?text=Hi%20Developer,%20I%20need%20support%20with%20SiddWhizz%20portfolio%20website"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-primary/20 border border-primary/40 p-3.5 text-primary hover:bg-primary/30 transition text-sm font-bold shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp Developer</span>
                    </a>

                    <a
                      href="mailto:support@siddwhizz.com?subject=Developer%20Support%20Request%20-%20SiddWhizz"
                      className="flex items-center gap-2 rounded-xl bg-white border border-neutral-300 p-3.5 text-foreground hover:bg-neutral-100 transition text-sm font-bold shadow-sm"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email Technical Lead</span>
                    </a>

                    <Link
                      to="/db-status"
                      className="flex items-center gap-2 rounded-xl bg-white border border-neutral-300 p-3.5 text-primary hover:bg-neutral-100 transition text-sm font-bold shadow-sm"
                    >
                      <Database className="h-4 w-4" />
                      <span>Neon Database Check</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* System Diagnostics */}
              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-primary" />
                  <h4 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
                    System Health &amp; Runtime Diagnostics
                  </h4>
                </div>
                <div className="panel-card-body">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="p-3.5 rounded-xl panel-inner-tile">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Framework</p>
                      <p className="font-semibold text-foreground mt-0.5">TanStack Start v1.168</p>
                    </div>
                    <div className="p-3.5 rounded-xl panel-inner-tile">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Engine</p>
                      <p className="font-semibold text-foreground mt-0.5">Vite 8 &amp; Nitro SSR</p>
                    </div>
                    <div className="p-3.5 rounded-xl panel-inner-tile">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Database</p>
                      <p className="font-semibold text-primary mt-0.5">Neon PostgreSQL</p>
                    </div>
                    <div className="p-3.5 rounded-xl panel-inner-tile">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Production Node</p>
                      <p className="font-semibold text-foreground mt-0.5">v22.16 LTS</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Organizer Technical Rider & Support Tickets */}
              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1.5 rounded-full bg-primary" />
                    <div>
                      <h4 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
                        Organizer Rider &amp; Support Tickets ({tickets.length})
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        Live stage AV requests from Event Organizers and internal engineering tickets.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="panel-card-body space-y-3">
                  {tickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      className="panel-inner-tile p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">{tkt.id}</span>
                          <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 text-[11px] font-bold">
                            {tkt.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tkt.organization || tkt.userEmail} • {tkt.createdAt}
                          </span>
                        </div>
                        <p className="font-bold text-foreground">{tkt.subject}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tkt.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(["Open", "In Progress", "Resolved"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              updateTicketStatus(tkt.id, st);
                              setTickets(getStoredTickets());
                              toast.success(`Ticket ${tkt.id} marked ${st}`);
                            }}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                              tkt.status === st
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-neutral-300 bg-white text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Ticket Form */}
              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-primary" />
                  <h4 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
                    Log an Issue or Feature Request to Developer
                  </h4>
                </div>
                <div className="panel-card-body">
                  <form onSubmit={handleSubmitTicket} className="space-y-4 text-sm">
                    <div>
                      <label className="font-bold text-muted-foreground text-xs uppercase block mb-1.5">Issue / Feature Summary</label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="e.g. Need to add a new video embed format on portfolio page"
                        className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground text-xs uppercase block mb-1.5">Priority Level</label>
                      <select
                        value={ticketSeverity}
                        onChange={(e) => setTicketSeverity(e.target.value)}
                        className="w-full max-w-xs rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="Low">Low (General inquiry / suggestion)</option>
                        <option value="Medium">Medium (Feature enhancement)</option>
                        <option value="High">High (Stage booking flow impacted)</option>
                        <option value="Critical">Critical (Production blocker)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground text-xs uppercase block mb-1.5">Detailed Description</label>
                      <textarea
                        required
                        rows={3}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Describe what you want changed or what happened..."
                        className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <button type="submit" className="btn-red !py-2.5 !px-5 text-sm flex items-center gap-2 cursor-pointer shadow-md">
                      <Send className="h-4 w-4" /> Submit to Engineering Team
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* INTERACTIVE EMAIL DRAFT POPUP MODAL                       */}
          {/* ========================================================= */}
          {emailModalEnquiry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
              <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/20 text-primary px-2 py-0.5 text-xs font-bold font-mono">
                        {emailModalEnquiry.id}
                      </span>
                      <h3 className="font-display text-lg font-extrabold text-foreground">
                        Draft Email Reply
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      To: <span className="font-semibold text-foreground">{emailModalEnquiry.clientName}</span> ({emailModalEnquiry.email}) • Event: {emailModalEnquiry.eventName}
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailModalEnquiry(null)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    aria-label="Close Email Modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Subject Line</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Email Message Body</label>
                    <textarea
                      rows={10}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground focus:border-primary focus:outline-none font-sans leading-relaxed resize-y"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
                      toast.success("Draft email text copied to clipboard!");
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-accent/60 px-3 py-2 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Draft</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEmailModalEnquiry(null)}
                      className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendDraftEmail}
                      className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Open in Email App</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* INTERACTIVE WHATSAPP DRAFT POPUP MODAL                    */}
          {/* ========================================================= */}
          {whatsappModalEnquiry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs font-bold font-mono">
                        {whatsappModalEnquiry.id}
                      </span>
                      <h3 className="font-display text-lg font-extrabold text-foreground">
                        Draft WhatsApp Message
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client: <span className="font-semibold text-foreground">{whatsappModalEnquiry.clientName}</span> • Phone: <span className="font-mono text-foreground font-bold">{whatsappModalEnquiry.phone}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setWhatsappModalEnquiry(null)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    aria-label="Close WhatsApp Modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">WhatsApp Message</label>
                    <textarea
                      rows={6}
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground focus:border-primary focus:outline-none font-sans leading-relaxed resize-y"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(whatsappMessage);
                      toast.success("WhatsApp message copied to clipboard!");
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-accent/60 px-3 py-2 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Message</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWhatsappModalEnquiry(null)}
                      className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Open in WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FULL MEDIA ASSET VIEWER MODAL (LIGHTBOX)                  */}
          {/* ========================================================= */}
          {viewingMedia && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in-50">
              <div className="w-full max-w-4xl rounded-2xl border border-neutral-300 bg-card p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border pb-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                          viewingMedia.type === "image"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : viewingMedia.type === "video"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : viewingMedia.type === "audio"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        {viewingMedia.type}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {viewingMedia.size} • Added {viewingMedia.createdAt}
                      </span>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-foreground mt-1">
                      {viewingMedia.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Category: {viewingMedia.category} {viewingMedia.dimensions ? `• ${viewingMedia.dimensions}` : viewingMedia.duration ? `• ${viewingMedia.duration}` : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => setViewingMedia(null)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    aria-label="Close Media Viewer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Main Media Content Viewer - Seamless full width without ugly dark grey box framing */}
                <div className="flex-1 overflow-auto rounded-xl flex items-center justify-center min-h-[300px] w-full">
                  {viewingMedia.type === "image" ? (
                    <img
                      src={viewingMedia.url}
                      alt={viewingMedia.title}
                      className="w-full max-h-[68vh] rounded-xl object-contain shadow-2xl"
                    />
                  ) : viewingMedia.type === "video" ? (
                    viewingMedia.url.includes("youtube.com") || viewingMedia.url.includes("youtu.be") ? (
                      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
                        <iframe
                          src={
                            viewingMedia.url.includes("watch?v=")
                              ? viewingMedia.url.replace("watch?v=", "embed/")
                              : viewingMedia.url.replace("youtu.be/", "www.youtube.com/embed/")
                          }
                          title={viewingMedia.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video
                        src={viewingMedia.url}
                        controls
                        autoPlay
                        className="w-full max-h-[68vh] rounded-xl shadow-2xl bg-black"
                      />
                    )
                  ) : viewingMedia.type === "audio" ? (
                    <div className="w-full max-w-xl p-8 rounded-2xl bg-card border border-neutral-300 shadow-2xl text-center space-y-4">
                      <img
                        src={getDefaultThumbnail(viewingMedia)}
                        alt={viewingMedia.title}
                        className="h-44 w-full object-cover rounded-xl border border-neutral-300 shadow-sm"
                      />
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        <Volume2 className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-display text-base font-bold text-foreground">{viewingMedia.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">High-Impact Stage Audio Clip</p>
                      </div>
                      <audio src={viewingMedia.url} controls autoPlay className="w-full" />
                    </div>
                  ) : (
                    <div className="w-full max-w-xl p-8 rounded-2xl bg-card border border-neutral-300 shadow-2xl text-center space-y-4">
                      <img
                        src={getDefaultThumbnail(viewingMedia)}
                        alt={viewingMedia.title}
                        className="h-44 w-full object-cover rounded-xl border border-neutral-300 shadow-sm"
                      />
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/20 text-primary border border-primary/30">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-display text-base font-bold text-foreground">{viewingMedia.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Official Stage Rider &amp; Specification PDF</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <a
                          href={viewingMedia.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Open Document
                        </a>
                        <a
                          href={viewingMedia.url}
                          download
                          className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1.5 !border-neutral-300 !text-foreground hover:!bg-white"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaToDelete(viewingMedia)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete from Database</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailModalMedia(viewingMedia);
                        setSelectedThumbnailPreview(viewingMedia.thumbnail || getDefaultThumbnail(viewingMedia));
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition cursor-pointer shadow-2xs"
                    >
                      <ImagePlus className="h-3.5 w-3.5 text-primary" />
                      <span>Set / Change Thumbnail</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(viewingMedia.url)}
                      className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer !border-neutral-300 !text-foreground hover:!bg-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Link</span>
                    </button>
                    <a
                      href={viewingMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* THUMBNAIL PICKER & MANAGEMENT MODAL                       */}
          {/* ========================================================= */}
          {thumbnailModalMedia && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-50">
              <div className="w-full max-w-xl rounded-2xl border border-neutral-300 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-foreground">
                      Set Thumbnail for Media
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {thumbnailModalMedia.title}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setThumbnailModalMedia(null);
                      setSelectedThumbnailPreview(null);
                    }}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Current / Selected Preview */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Active Thumbnail Preview:
                  </label>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border-2 border-primary/60 bg-neutral-100 shadow-sm flex items-center justify-center">
                    <img
                      src={selectedThumbnailPreview || getDefaultThumbnail(thumbnailModalMedia)}
                      alt="Thumbnail Preview"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
                      Selected Thumbnail
                    </span>
                  </div>
                </div>

                {/* Option 1: Upload Custom File */}
                <div className="panel-inner-tile p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Upload Custom Image:
                    </span>
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailFileSelect(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="btn-red !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Choose Image File
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your own custom thumbnail from computer (JPG, PNG, WebP).
                  </p>
                </div>

                {/* Option 2: Curated Stage Presets */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Or Select from Siddharth's Stage Photography Presets:
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { name: "Tech Summit", img: techSummit },
                      { name: "Purple Anchor", img: hostPurple },
                      { name: "Stage Beams", img: stageBeams },
                      { name: "Gala Bowtie", img: hostBowtie },
                      { name: "Conclave Stage", img: conclaveStage },
                      { name: "Studio Mic", img: micDark },
                      { name: "Conference Hall", img: conferenceHall },
                      { name: "Festival Crowd", img: festivalCrowd },
                      { name: "Star Trophy", img: starTrophy },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSelectedThumbnailPreview(preset.img)}
                        className={`group rounded-xl border p-2 flex flex-col items-center gap-1.5 transition cursor-pointer text-center ${
                          (selectedThumbnailPreview || getDefaultThumbnail(thumbnailModalMedia)) === preset.img
                            ? "border-primary bg-primary/10 ring-2 ring-primary"
                            : "border-neutral-300 bg-white hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={preset.img}
                          alt={preset.name}
                          className="h-14 w-full rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-bold text-foreground truncate w-full">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save action */}
                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailModalMedia(null);
                      setSelectedThumbnailPreview(null);
                    }}
                    className="btn-outline !py-2 !px-4 text-xs !border-neutral-300 !text-foreground hover:!bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedThumbnailPreview) {
                        handleSaveThumbnail(selectedThumbnailPreview);
                      } else {
                        handleSaveThumbnail(getDefaultThumbnail(thumbnailModalMedia));
                      }
                    }}
                    className="btn-red !py-2 !px-5 text-xs cursor-pointer font-bold"
                  >
                    Save Thumbnail
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* DELETE MEDIA ASSET CONFIRMATION MODAL                     */}
          {/* ========================================================= */}
          {mediaToDelete && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in-50">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-foreground">
                      Delete Media Asset?
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-3.5 text-sm space-y-1">
                  <p className="font-bold text-foreground line-clamp-1">{mediaToDelete.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Type: {mediaToDelete.type.toUpperCase()} • Size: {mediaToDelete.size}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete this media asset from your local and database storage?
                </p>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setMediaToDelete(null)}
                    className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* APPROVE & ISSUE FORMAL CONTRACT MODAL                     */}
          {/* ========================================================= */}
          {contractModalEnquiry && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in-50">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div>
                    <p className="eyebrow">Stage Engagement Execution</p>
                    <h3 className="font-display text-lg font-extrabold text-foreground mt-1">
                      Issue Formal Contract — {contractModalEnquiry.eventName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Organizer: {contractModalEnquiry.clientName} ({contractModalEnquiry.organization})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContractModalEnquiry(null)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleIssueContract} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">
                        Agreed Commercial Fee (INR)
                      </label>
                      <input
                        type="text"
                        required
                        value={contractFee}
                        onChange={(e) => setContractFee(e.target.value)}
                        placeholder="e.g. ₹4,00,000"
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3.5 text-sm font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">
                        Stage Call &amp; Show Timing
                      </label>
                      <input
                        type="text"
                        required
                        value={contractTimeSlot}
                        onChange={(e) => setContractTimeSlot(e.target.value)}
                        placeholder="e.g. 09:30 AM - 06:00 PM"
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contractAdvancePaid}
                      onChange={(e) => setContractAdvancePaid(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-xs font-bold text-foreground">
                      Mark 50% Advance Retainer Deposit as Received
                    </span>
                  </label>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setContractModalEnquiry(null)}
                      className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-red !py-2 !px-5 text-xs cursor-pointer">
                      Confirm &amp; Issue Executed Contract
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
