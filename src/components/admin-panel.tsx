import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/site";
import {
  getStoredEnquiries,
  updateEnquiryStatus,
  addEnquiryNote,
  getStoredMedia,
  addMediaItem,
  deleteMediaItem,
} from "@/lib/data-store";
import hostBowtie from "@/assets/host-bowtie.jpg";
import hostPurple from "@/assets/host-purple.jpg";
import hostSmileRed from "@/assets/host-smile-red.jpg";

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

interface MediaItem {
  id: string;
  title: string;
  type: "image" | "video" | "audio" | "document";
  category: string;
  size: string;
  dimensions?: string;
  duration?: string;
  url: string;
  createdAt: string;
}

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "med-1",
    title: "Sid Stage Crowd Beams — Conclave 2026",
    type: "image",
    category: "Stage Moments",
    size: "2.4 MB",
    dimensions: "3840 x 2160",
    url: "https://sidwizz-portfolio.vercel.app/assets/stage-beams.jpg",
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
    title: "Concert Finale Confetti Blast",
    type: "image",
    category: "Festivals",
    size: "3.1 MB",
    dimensions: "4000 x 2667",
    url: "https://sidwizz-portfolio.vercel.app/assets/confetti-concert.jpg",
    createdAt: "2026-10-18",
  },
  {
    id: "med-4",
    title: "Siddharth Maurya Technical Stage Rider & Hospitality Guide (PDF)",
    type: "document",
    category: "Riders & Specs",
    size: "1.2 MB",
    url: "https://sidwizz-portfolio.vercel.app/assets/siddharth-rider.pdf",
    createdAt: "2026-11-01",
  },
  {
    id: "med-5",
    title: "High-Impact Emcee Intro Voiceover & BGM",
    type: "audio",
    category: "Audio Clips",
    size: "4.8 MB",
    duration: "0:42 sec",
    url: "https://sidwizz-portfolio.vercel.app/assets/sid-voiceover-intro.mp3",
    createdAt: "2026-09-12",
  },
  {
    id: "med-6",
    title: "Black Bowtie Gala Host Portrait",
    type: "image",
    category: "Headshots",
    size: "1.8 MB",
    dimensions: "2400 x 3000",
    url: "https://sidwizz-portfolio.vercel.app/assets/host-bowtie.jpg",
    createdAt: "2026-10-05",
  },
  {
    id: "med-7",
    title: "Tech Summit Keynote Moderation Highlight Reel",
    type: "video",
    category: "Showreels",
    size: "62.4 MB",
    duration: "1:30 min",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: "2026-10-22",
  },
  {
    id: "med-8",
    title: "Official Media Press Kit & Bio 2026 (PDF)",
    type: "document",
    category: "Media Kit",
    size: "4.5 MB",
    url: "https://sidwizz-portfolio.vercel.app/assets/sid-media-kit-2026.pdf",
    createdAt: "2026-11-02",
  },
];

export function AdminPanel({ initialTab = "overview" }: { initialTab?: AdminTab }) {
  const { user, logout, updateProfilePhoto, updatePassword, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Enquiries live state synced with persistent DataStore
  const [enquiries, setEnquiries] = useState<Enquiry[]>(getStoredEnquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  // Media live state synced with persistent DataStore
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(getStoredMedia);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaType, setNewMediaType] = useState<"image" | "video" | "audio" | "document">("image");

  // Account merged state
  const [adminName, setAdminName] = useState(user?.name || "Siddharth Maurya");
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@siddwhizz.com");
  const [adminPhone, setAdminPhone] = useState("+91 98200 88776");
  const [adminTitle, setAdminTitle] = useState("Celebrity Event Host, Emcee & Moderator");
  const [adminBio, setAdminBio] = useState("15+ years of live stage hosting across tech summits, global corporate galas, and arena music festivals.");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Keep state synchronized with live DataStore events
  useEffect(() => {
    const handleSync = () => {
      setEnquiries(getStoredEnquiries());
      setMediaItems(getStoredMedia());
    };
    window.addEventListener("siddwhizz_enquiries_updated", handleSync);
    window.addEventListener("siddwhizz_media_updated", handleSync);
    return () => {
      window.removeEventListener("siddwhizz_enquiries_updated", handleSync);
      window.removeEventListener("siddwhizz_media_updated", handleSync);
    };
  }, []);

  // Developer Support Ticket Form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketSeverity, setTicketSeverity] = useState("Medium");
  const [ticketMessage, setTicketMessage] = useState("");

  // Settings state
  const [bookingAvailable, setBookingAvailable] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);

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

  // WhatsApp reply handler
  const handleWhatsAppReply = (enquiry: Enquiry) => {
    const text = `Hello ${enquiry.clientName}, this is Siddharth "Sid" Maurya's management team! We received your booking enquiry for "${enquiry.eventName}" on ${enquiry.date} in ${enquiry.city}. We are pleased to check stage availability and share our rate card with you. Are you available for a brief call today?`;
    const url = `https://wa.me/${enquiry.cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success(`Opening WhatsApp chat with ${enquiry.clientName}...`);
  };

  // Direct Phone Call handler
  const handlePhoneCall = (enquiry: Enquiry) => {
    window.location.href = `tel:${enquiry.phone.replace(/\s+/g, "")}`;
    toast.info(`Dialing ${enquiry.phone}...`);
  };

  // Email reply handler
  const handleEmailReply = (enquiry: Enquiry) => {
    const subject = `Siddharth Maurya (Emcee) — Availability for ${enquiry.eventName}`;
    const body = `Hi ${enquiry.clientName},\n\nThank you for reaching out to book Siddharth Maurya for "${enquiry.eventName}" on ${enquiry.date} at ${enquiry.venue}, ${enquiry.city}.\n\nWe have reviewed your event format (${enquiry.format}) and crowd estimation (${enquiry.crowdSize}). We are pleased to confirm that Siddharth is available for this date.\n\nPlease find attached our technical stage rider and commercial proposal.\n\nWarm regards,\nSiddharth Maurya Management Team\nhttps://sidwizz-portfolio.vercel.app`;
    window.location.href = `mailto:${enquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success(`Opening email draft for ${enquiry.email}...`);
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

  // Upload Media Simulator
  const handleUploadMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim()) {
      toast.error("Please enter a media title.");
      return;
    }
    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      title: newMediaTitle.trim(),
      type: newMediaType,
      category: newMediaType === "image" ? "Stage Moments" : newMediaType === "video" ? "Showreels" : newMediaType === "audio" ? "Soundtrack" : "Documentation",
      size: "3.2 MB",
      dimensions: newMediaType === "image" ? "3840 x 2160" : undefined,
      duration: newMediaType === "video" ? "2:10 min" : newMediaType === "audio" ? "0:45 sec" : undefined,
      url: "https://sidwizz-portfolio.vercel.app/assets/stage-beams.jpg",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setMediaItems([newItem, ...mediaItems]);
    setUploadModalOpen(false);
    setNewMediaTitle("");
    toast.success("Media file uploaded and indexed successfully!");
  };

  // Copy Media Link
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Public media link copied to clipboard!");
  };

  // Submit Developer Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Please fill in subject and description.");
      return;
    }
    toast.success("Developer ticket logged! The lead engineer will respond via WhatsApp.");
    setTicketSubject("");
    setTicketMessage("");
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

  // Filtered media
  const filteredMedia = mediaItems.filter((m) =>
    mediaTypeFilter === "all" ? true : m.type === mediaTypeFilter
  );

  const pendingCount = enquiries.filter((e) => e.status === "New").length;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR (Strict White, Red & Black Theme)     */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Tag */}
        <div className="px-5 py-3 border-b border-border bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Panel
            </span>
            <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[9px] font-bold border border-primary/30">
              Active
            </span>
          </div>
          <p className="text-xs font-bold text-foreground mt-1 truncate">{adminName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{adminEmail}</p>
        </div>

        {/* Navigation Menu (Strict White, Red, Black) */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-xs">
          <button
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("analytics");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "analytics"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4" /> Web Analytics
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("enquiries");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "enquiries"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4" /> Enquiries
            </span>
            {pendingCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
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
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "media"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FolderOpen className="h-4 w-4" /> Media Library
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">{mediaItems.length}</span>
          </button>

          {/* Merged Account & Profile Tab */}
          <button
            onClick={() => {
              setActiveTab("account");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "account"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User className="h-4 w-4" /> Account & Profile
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("settings");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings className="h-4 w-4" /> Settings
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("support");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "support"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4" /> Support & Help
            </span>
            <span className="rounded-full bg-primary/15 text-primary px-1.5 py-0.2 text-[9px] font-bold border border-primary/30">
              Dev
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-3 space-y-1 text-xs">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Public Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-medium text-primary hover:bg-primary/10 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN DASHBOARD CANVAS                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-border p-2 text-foreground md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-black font-display tracking-tight text-foreground capitalize">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "analytics" && "Web Page Traffic & Analytics"}
              {activeTab === "enquiries" && "Client Enquiries & Fast Outreach"}
              {activeTab === "media" && "Media Asset Library"}
              {activeTab === "account" && "Host Account & Profile Settings"}
              {activeTab === "settings" && "Website & Booking Settings"}
              {activeTab === "support" && "Developer Support & Assistance"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Availability status badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-bold text-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Accepting Stage Dates</span>
            </div>

            {/* Neon DB indicator */}
            <Link
              to="/db-status"
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20"
            >
              <Database className="h-3 w-3" />
              <span>NeonDB Connected</span>
            </Link>

            {/* Account Icon */}
            <button
              onClick={() => setActiveTab("account")}
              className="grid h-8 w-8 place-items-center rounded-full overflow-hidden border border-primary/30 hover:scale-105 transition cursor-pointer"
              title="Open Account & Profile"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">SM</span>
              )}
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================= */}
          {/* 1. OVERVIEW VIEW                                          */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Metric Cards (Strict White, Red, Black) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">New Enquiries</span>
                    <Inbox className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-3xl font-black font-display text-foreground">{enquiries.length}</p>
                  <p className="text-xs text-primary font-semibold mt-1">
                    {pendingCount} requiring immediate response
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Historical Shows</span>
                    <Calendar className="h-4 w-4 text-foreground" />
                  </div>
                  <p className="text-3xl font-black font-display text-foreground">600+</p>
                  <p className="text-xs text-muted-foreground mt-1">15+ Years Live Experience</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Audience Reach</span>
                    <Users className="h-4 w-4 text-foreground" />
                  </div>
                  <p className="text-3xl font-black font-display text-foreground">1.2M+</p>
                  <p className="text-xs text-muted-foreground mt-1">Tech summits, festivals, galas</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Pipeline Est.</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-3xl font-black font-display text-primary">₹24.5 L</p>
                  <p className="text-xs text-muted-foreground mt-1">Q4 Active Booking Discussions</p>
                </div>
              </div>

              {/* Speed-to-lead alert */}
              {pendingCount > 0 && (
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/20 p-2.5 text-primary border border-primary/30">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {pendingCount} Fresh Event Enquiries Need Follow-up
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        High-value planners from FinTech Summit and Tata Motors are waiting. Reach out via WhatsApp or Direct Call within 15 minutes to maximize booking rate.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("enquiries")}
                    className="btn-red !py-2 !px-4 text-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <span>Open Enquiries</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Recent Enquiries Table Preview */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Recent Booking Inquiries</h3>
                    <p className="text-xs text-muted-foreground">Incoming leads from the website's Contact and Booking forms</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("enquiries")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    View All ({enquiries.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/30 text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Ref</th>
                        <th className="p-3">Event & Organizer</th>
                        <th className="p-3">Date & Venue</th>
                        <th className="p-3">Budget</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Quick Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {enquiries.slice(0, 4).map((e) => (
                        <tr key={e.id} className="hover:bg-accent/40 transition">
                          <td className="p-3 font-mono font-bold text-primary">{e.id}</td>
                          <td className="p-3">
                            <p className="font-bold text-foreground">{e.eventName}</p>
                            <p className="text-[11px] text-muted-foreground">{e.clientName} • {e.organization}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-foreground">{e.date}</p>
                            <p className="text-[11px] text-muted-foreground">{e.city}</p>
                          </td>
                          <td className="p-3 font-mono text-foreground font-semibold">{e.budget}</td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                e.status === "New"
                                  ? "bg-primary/20 text-primary border border-primary/30"
                                  : e.status === "Confirmed"
                                  ? "bg-white text-black font-bold"
                                  : "bg-muted text-foreground border border-border"
                              }`}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleWhatsAppReply(e)}
                              className="rounded-lg bg-primary/15 border border-primary/30 p-1.5 text-primary hover:bg-primary/30 transition"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handlePhoneCall(e)}
                              className="rounded-lg bg-muted border border-border p-1.5 text-foreground hover:bg-accent transition"
                              title="Direct Phone Call"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleEmailReply(e)}
                              className="rounded-lg bg-primary/15 border border-primary/30 p-1.5 text-primary hover:bg-primary/30 transition"
                              title="Send Email"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. WEB PAGE ANALYTICS VIEW                                */}
          {/* ========================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Unique Visitors</span>
                  <p className="text-2xl font-black font-display text-foreground mt-1">42,500</p>
                  <p className="text-[11px] text-primary font-semibold">↑ 18.2% this month</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Total Pageviews</span>
                  <p className="text-2xl font-black font-display text-foreground mt-1">118,200</p>
                  <p className="text-[11px] text-primary font-semibold">↑ 24.6% this month</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Avg. Time on Site</span>
                  <p className="text-2xl font-black font-display text-foreground mt-1">2m 48s</p>
                  <p className="text-[11px] text-muted-foreground">High audience retention</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Enquiry Conversion</span>
                  <p className="text-2xl font-black font-display text-primary mt-1">4.2%</p>
                  <p className="text-[11px] text-primary font-semibold">High booking intent</p>
                </div>
              </div>

              {/* Section Popularity Breakdown */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-base font-bold text-foreground mb-4">Most Visited Sections</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Homepage & Hero Showreel (/)</span>
                        <span className="text-muted-foreground">45% (53,190 views)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Portfolio & Summits (/portfolio)</span>
                        <span className="text-muted-foreground">28% (33,096 views)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-foreground rounded-full" style={{ width: "28%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Event Formats & Packages (/services)</span>
                        <span className="text-muted-foreground">15% (17,730 views)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary/70 rounded-full" style={{ width: "15%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Live Stage Moments Gallery (/gallery)</span>
                        <span className="text-muted-foreground">12% (14,184 views)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-muted-foreground rounded-full" style={{ width: "12%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-base font-bold text-foreground mb-4">Traffic Referral Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                      <span className="font-semibold text-foreground">Direct & Bookmark</span>
                      <span className="font-mono text-muted-foreground">38%</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                      <span className="font-semibold text-foreground">Instagram (@siddwhizz)</span>
                      <span className="font-mono text-primary font-bold">32%</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                      <span className="font-semibold text-foreground">LinkedIn (Siddharth Maurya)</span>
                      <span className="font-mono text-muted-foreground">20%</span>
                    </div>
                    <div className="flex items-center justify-between pb-1 text-xs">
                      <span className="font-semibold text-foreground">Word-of-Mouth & Agency Referrals</span>
                      <span className="font-mono text-muted-foreground">10%</span>
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
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event, client, organization, or city..."
                    className="w-full rounded-xl border border-input bg-card py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {["All", "New", "In Discussion", "Confirmed", "Declined"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        statusFilter === st
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
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
                <div className={`space-y-3 ${selectedEnquiry ? "lg:col-span-7" : "lg:col-span-12"}`}>
                  {filteredEnquiries.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-12 text-center">
                      <Inbox className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-bold text-foreground">No enquiries found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search query or filter.</p>
                    </div>
                  ) : (
                    filteredEnquiries.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => setSelectedEnquiry(e)}
                        className={`rounded-2xl border p-5 transition cursor-pointer ${
                          selectedEnquiry?.id === e.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-primary">{e.id}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  e.status === "New"
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : e.status === "Confirmed"
                                    ? "bg-white text-black font-bold"
                                    : "bg-muted text-foreground border border-border"
                                }`}
                              >
                                {e.status}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-foreground mt-1">{e.eventName}</h4>
                            <p className="text-xs text-muted-foreground font-medium">
                              {e.clientName} • <span className="text-foreground">{e.organization}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-mono text-xs font-bold text-foreground">{e.budget}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">📅 {e.date}</p>
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{e.brief}</p>

                        {/* Action buttons inside card */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> {e.city}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleWhatsAppReply(e);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/30 transition"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handlePhoneCall(e);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-muted border border-border px-2.5 py-1 text-xs font-bold text-foreground hover:bg-accent transition"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Call</span>
                            </button>

                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleEmailReply(e);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/30 transition"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Detailed Enquiry Drawer */}
                {selectedEnquiry && (
                  <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5 sticky top-20">
                    <div className="flex items-start justify-between border-b border-border pb-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary">{selectedEnquiry.id}</span>
                        <h3 className="text-lg font-bold text-foreground mt-0.5">{selectedEnquiry.eventName}</h3>
                        <p className="text-xs text-muted-foreground">{selectedEnquiry.organization}</p>
                      </div>
                      <button
                        onClick={() => setSelectedEnquiry(null)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Status Changer */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        Update Pipeline Status
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["New", "In Discussion", "Confirmed"] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(selectedEnquiry.id, st)}
                            className={`rounded-lg py-1.5 text-xs font-bold transition ${
                              selectedEnquiry.status === st
                                ? "bg-primary text-primary-foreground shadow"
                                : "border border-border bg-background text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Outreach Tools */}
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                      <p className="text-xs font-bold text-foreground">Instant Client Outreach</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleWhatsAppReply(selectedEnquiry)}
                          className="flex flex-col items-center justify-center rounded-xl bg-primary/20 border border-primary/30 p-2 text-primary hover:bg-primary/30 transition text-center"
                        >
                          <MessageCircle className="h-4 w-4 mb-1" />
                          <span className="text-[11px] font-bold">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handlePhoneCall(selectedEnquiry)}
                          className="flex flex-col items-center justify-center rounded-xl bg-muted border border-border p-2 text-foreground hover:bg-accent transition text-center"
                        >
                          <Phone className="h-4 w-4 mb-1" />
                          <span className="text-[11px] font-bold">Direct Call</span>
                        </button>
                        <button
                          onClick={() => handleEmailReply(selectedEnquiry)}
                          className="flex flex-col items-center justify-center rounded-xl bg-primary/20 border border-primary/30 p-2 text-primary hover:bg-primary/30 transition text-center"
                        >
                          <Mail className="h-4 w-4 mb-1" />
                          <span className="text-[11px] font-bold">Send Mail</span>
                        </button>
                      </div>
                    </div>

                    {/* Event Specifications */}
                    <div className="space-y-2 text-xs border-t border-border pt-3">
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Target Date:</span>
                        <span className="font-semibold text-foreground">{selectedEnquiry.date}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">City & Venue:</span>
                        <span className="font-semibold text-foreground text-right">{selectedEnquiry.venue}, {selectedEnquiry.city}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Event Format:</span>
                        <span className="font-semibold text-foreground">{selectedEnquiry.format}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Audience Size:</span>
                        <span className="font-semibold text-foreground">{selectedEnquiry.crowdSize}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Budget Indicator:</span>
                        <span className="font-mono font-bold text-foreground">{selectedEnquiry.budget}</span>
                      </div>
                    </div>

                    {/* Special Brief */}
                    <div className="border-t border-border pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Organizer Event Brief
                      </p>
                      <p className="text-xs text-foreground bg-background p-3 rounded-xl border border-border leading-relaxed">
                        {selectedEnquiry.brief}
                      </p>
                    </div>

                    {/* Internal Notes */}
                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Internal Management Notes
                      </p>
                      {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 ? (
                        <div className="space-y-1">
                          {selectedEnquiry.notes.map((n, idx) => (
                            <div key={idx} className="rounded-lg bg-accent p-2 text-xs text-foreground flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>{n}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No notes added yet.</p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Add private note for Sid..."
                          className="flex-1 rounded-xl border border-input bg-background py-1.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddNote(selectedEnquiry.id)}
                          className="btn-red !py-1.5 !px-3 text-xs"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. MEDIA FILE LIBRARY VIEW (Sorted by Type)               */}
          {/* ========================================================= */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Type Filter Chips + Upload Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMediaTypeFilter("all")}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      mediaTypeFilter === "all"
                        ? "bg-primary text-primary-foreground shadow"
                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    All Media ({mediaItems.length})
                  </button>
                  <button
                    onClick={() => setMediaTypeFilter("image")}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                      mediaTypeFilter === "image"
                        ? "bg-primary text-primary-foreground shadow"
                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Stage Photos
                  </button>
                  <button
                    onClick={() => setMediaTypeFilter("video")}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                      mediaTypeFilter === "video"
                        ? "bg-primary text-primary-foreground shadow"
                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" /> Showreel Videos
                  </button>
                  <button
                    onClick={() => setMediaTypeFilter("audio")}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                      mediaTypeFilter === "audio"
                        ? "bg-primary text-primary-foreground shadow"
                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Music className="h-3.5 w-3.5" /> Audio Intros
                  </button>
                  <button
                    onClick={() => setMediaTypeFilter("document")}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                      mediaTypeFilter === "document"
                        ? "bg-primary text-primary-foreground shadow"
                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" /> Tech Riders & PDFs
                  </button>
                </div>

                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="btn-red !py-2 !px-4 text-xs flex items-center gap-2 self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> Upload Media File
                </button>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredMedia.map((m) => (
                  <div
                    key={m.id}
                    className="group rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Media Header Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            m.type === "image"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-muted text-foreground border border-border"
                          }`}
                        >
                          {m.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{m.size}</span>
                      </div>

                      {/* Icon Thumbnail Preview */}
                      <div className="h-28 w-full rounded-xl bg-ink border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition mb-3">
                        {m.type === "image" && <ImageIcon className="h-10 w-10 text-primary" />}
                        {m.type === "video" && <Video className="h-10 w-10 text-foreground" />}
                        {m.type === "audio" && <Music className="h-10 w-10 text-foreground" />}
                        {m.type === "document" && <FileText className="h-10 w-10 text-primary" />}
                      </div>

                      <h4 className="font-bold text-xs text-foreground line-clamp-2 leading-snug">{m.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {m.category} {m.dimensions ? `• ${m.dimensions}` : m.duration ? `• ${m.duration}` : ""}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-border pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{m.createdAt}</span>
                      <button
                        onClick={() => handleCopyLink(m.url)}
                        className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        <Copy className="h-3 w-3" /> Copy Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Modal Simulator */}
              {uploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-base font-bold text-foreground">Upload Media File to Neon Storage</h3>
                      <button onClick={() => setUploadModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUploadMedia} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Media Type</label>
                        <select
                          value={newMediaType}
                          onChange={(e) => setNewMediaType(e.target.value as any)}
                          className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="image">Image (Stage photo, portrait)</option>
                          <option value="video">Video (Showreel, keynote highlight)</option>
                          <option value="audio">Audio (Host voiceover, intro track)</option>
                          <option value="document">Document (PDF Rider, commercial kit)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">File Title</label>
                        <input
                          type="text"
                          required
                          value={newMediaTitle}
                          onChange={(e) => setNewMediaTitle(e.target.value)}
                          placeholder="e.g. Google Cloud Summit 2026 Keynote"
                          className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs font-bold text-foreground">Click to browse or drag file here</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, MP4, MP3, PDF up to 100MB</p>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setUploadModalOpen(false)}
                          className="btn-outline !py-2 !px-4 text-xs"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-red !py-2 !px-4 text-xs">
                          Upload & Index
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
          {activeTab === "account" && (
            <div className="space-y-6 max-w-4xl">
              {/* Hidden file input for custom profile photo upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
                aria-label="Upload profile photo"
              />

              {/* Host Profile & Photo Studio Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div className="flex items-center gap-4">
                    {/* Interactive Avatar with Camera Upload Badge */}
                    <div className="relative group">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={adminName}
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-primary shadow-xl"
                        />
                      ) : (
                        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/20 text-3xl font-black text-primary border-2 border-primary/30">
                          SM
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-white shadow-lg hover:scale-110 transition cursor-pointer"
                        title="Upload new profile photo"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black font-display text-foreground">{adminName}</h2>
                        <span className="rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[10px] font-bold border border-primary/30 uppercase tracking-wider">
                          Host & Super Admin
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{adminTitle}</p>
                      <p className="text-xs font-mono text-primary mt-0.5">{adminEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        logout();
                        navigate({ to: "/" });
                      }}
                      className="btn-outline !py-2 !px-3 text-xs text-primary hover:bg-primary/10"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>

                {/* Profile Photo Studio Section */}
                <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <ImagePlus className="h-4 w-4 text-primary" /> Profile Photo & Stage Headshot
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Upload your personal photo or select from Siddharth Maurya's curated stage portfolio presets.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-red !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload File
                      </button>
                      {user?.avatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="btn-outline !py-1.5 !px-2.5 text-xs text-destructive hover:bg-destructive/10"
                          title="Remove custom photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Photo Cards */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">
                      Quick Stage Presets:
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectPresetPhoto(hostBowtie)}
                        className={`group rounded-xl border p-2 flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          user?.avatar === hostBowtie
                            ? "border-primary bg-primary/15 ring-2 ring-primary"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={hostBowtie}
                          alt="Gala Bowtie"
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-semibold text-foreground group-hover:text-primary">
                          Gala Bowtie
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPresetPhoto(hostPurple)}
                        className={`group rounded-xl border p-2 flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          user?.avatar === hostPurple
                            ? "border-primary bg-primary/15 ring-2 ring-primary"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={hostPurple}
                          alt="Summit Anchor"
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-semibold text-foreground group-hover:text-primary">
                          Summit Anchor
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPresetPhoto(hostSmileRed)}
                        className={`group rounded-xl border p-2 flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                          user?.avatar === hostSmileRed
                            ? "border-primary bg-primary/15 ring-2 ring-primary"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={hostSmileRed}
                          alt="Festival Energy"
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-semibold text-foreground group-hover:text-primary">
                          Live Energy
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Edit Form */}
                <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Official Host Email</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Direct Mobile (WhatsApp)</label>
                      <input
                        type="text"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Display Title</label>
                      <input
                        type="text"
                        value={adminTitle}
                        onChange={(e) => setAdminTitle(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Host Bio Summary</label>
                    <textarea
                      rows={2}
                      value={adminBio}
                      onChange={(e) => setAdminBio(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn-red !py-2.5 !px-5 text-xs">
                      Save Profile Information
                    </button>
                  </div>
                </form>
              </div>

              {/* Password & Security Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Change Password & Security</h3>
                    <p className="text-[11px] text-muted-foreground">Keep your admin authentication credentials secure.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">Default: sid123</span>
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-red !py-2.5 !px-5 text-xs"
                  >
                    Update Password & Save
                  </button>
                </form>
              </div>

              {/* Management Team Members */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Team Permissions & Management</h3>
                    <p className="text-xs text-muted-foreground">Authorized team members with access to the Admin Panel.</p>
                  </div>
                  <button
                    onClick={() => toast.info("Invitation link generated for team manager.")}
                    className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Team Member
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/30 text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Access Level</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-3">
                          <p className="font-bold text-foreground">Siddharth Maurya</p>
                          <p className="text-[11px] text-muted-foreground font-mono">admin@siddwhizz.com</p>
                        </td>
                        <td className="p-3 font-semibold text-primary">Super Admin (Host)</td>
                        <td className="p-3 text-muted-foreground">Full Permissions</td>
                        <td className="p-3 text-right">
                          <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold border border-primary/30">
                            Active
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3">
                          <p className="font-bold text-foreground">Neha Sharma</p>
                          <p className="text-[11px] text-muted-foreground font-mono">neha.bookings@siddwhizz.com</p>
                        </td>
                        <td className="p-3 font-semibold text-foreground">Booking Manager</td>
                        <td className="p-3 text-muted-foreground">Enquiries & Contracts</td>
                        <td className="p-3 text-right">
                          <span className="rounded-full bg-muted text-foreground px-2 py-0.5 text-[10px] font-bold border border-border">
                            Active
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. SETTINGS VIEW                                          */}
          {/* ========================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Website & Booking Configuration</h3>
                  <p className="text-xs text-muted-foreground">Control public calendar availability and lead routing rules.</p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Availability switch */}
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-bold text-foreground">Live Booking Acceptance</p>
                      <p className="text-muted-foreground mt-0.5">Show "Accepting Bookings" on the homepage and contact form.</p>
                    </div>
                    <button
                      onClick={() => {
                        setBookingAvailable(!bookingAvailable);
                        toast.success(`Booking status changed to ${!bookingAvailable ? "Active" : "Paused"}`);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        bookingAvailable ? "bg-primary" : "bg-muted"
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
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-bold text-foreground">Instant WhatsApp Lead Alerts</p>
                      <p className="text-muted-foreground mt-0.5">Send immediate notification to host phone when new high-value enquiry lands.</p>
                    </div>
                    <button
                      onClick={() => {
                        setWhatsappNotifications(!whatsappNotifications);
                        toast.success("Notification preferences updated.");
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        whatsappNotifications ? "bg-primary" : "bg-muted"
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
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-bold text-foreground">Automated Organizer Acknowledgment Email</p>
                      <p className="text-muted-foreground mt-0.5">Instantly email organizer with host tech rider and showreel link.</p>
                    </div>
                    <button
                      onClick={() => {
                        setAutoReplyEnabled(!autoReplyEnabled);
                        toast.success("Auto-reply preferences updated.");
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        autoReplyEnabled ? "bg-primary" : "bg-muted"
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
                  <div>
                    <label className="font-bold text-foreground block mb-1">Official Host Booking Hotline</label>
                    <input
                      type="text"
                      defaultValue="+91 98200 88776"
                      className="w-full max-w-sm rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Neon Database Status */}
                  <div className="rounded-xl border border-border bg-background p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/20 p-2 text-primary border border-primary/30">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Neon PostgreSQL Database</p>
                        <p className="text-[11px] text-muted-foreground">Connected via DATABASE_URL (.env)</p>
                      </div>
                    </div>

                    <Link to="/db-status" className="btn-outline !py-1.5 !px-3 text-xs">
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
              {/* Dedicated Developer Hotline Card */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/20 p-3 text-primary border border-primary/30">
                    <HelpCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/20 px-2 py-0.5 rounded border border-primary/30">
                      Direct Developer Support Channel
                    </span>
                    <h3 className="text-xl font-black font-display text-foreground mt-1">
                      Developer & Technical Assistance
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Need custom features, database migration, or experiencing any issue on the live website? Your dedicated engineering team is directly accessible via WhatsApp and email.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <a
                    href="https://wa.me/919999999999?text=Hi%20Developer,%20I%20need%20support%20with%20SiddWhizz%20portfolio%20website"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-primary/20 border border-primary/40 p-3 text-primary hover:bg-primary/30 transition text-xs font-bold"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Developer</span>
                  </a>

                  <a
                    href="mailto:support@siddwhizz.com?subject=Developer%20Support%20Request%20-%20SiddWhizz"
                    className="flex items-center gap-2 rounded-xl bg-muted border border-border p-3 text-foreground hover:bg-accent transition text-xs font-bold"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Technical Lead</span>
                  </a>

                  <Link
                    to="/db-status"
                    className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/30 p-3 text-primary hover:bg-primary/20 transition text-xs font-bold"
                  >
                    <Database className="h-4 w-4" />
                    <span>Neon Database Check</span>
                  </Link>
                </div>
              </div>

              {/* System Diagnostics */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-foreground">System Health & Runtime Diagnostics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Framework</p>
                    <p className="font-semibold text-foreground mt-0.5">TanStack Start v1.168</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Engine</p>
                    <p className="font-semibold text-foreground mt-0.5">Vite 8 & Nitro SSR</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Database</p>
                    <p className="font-semibold text-primary mt-0.5">Neon PostgreSQL</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Production Node</p>
                    <p className="font-semibold text-foreground mt-0.5">v22.16 LTS</p>
                  </div>
                </div>
              </div>

              {/* Submit Ticket Form */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-foreground">Log an Issue or Feature Request to Developer</h4>
                <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Issue / Feature Summary</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Need to add a new video embed format on portfolio page"
                      className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Priority Level</label>
                    <select
                      value={ticketSeverity}
                      onChange={(e) => setTicketSeverity(e.target.value)}
                      className="w-full max-w-xs rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Low">Low (General inquiry / suggestion)</option>
                      <option value="Medium">Medium (Feature enhancement)</option>
                      <option value="High">High (Stage booking flow impacted)</option>
                      <option value="Critical">Critical (Production blocker)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Detailed Description</label>
                    <textarea
                      required
                      rows={3}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe what you want changed or what happened..."
                      className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <button type="submit" className="btn-red !py-2 !px-4 text-xs flex items-center gap-2">
                    <Send className="h-3.5 w-3.5" /> Submit to Engineering Team
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
