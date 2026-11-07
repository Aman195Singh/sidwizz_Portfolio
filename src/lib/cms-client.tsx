import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Gem,
  Handshake,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Images,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Mic,
  MoreVertical,
  Music,
  Phone,
  Play,
  PlaySquare,
  Quote,
  RefreshCw,
  Rocket,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  BrandMark,
  CtaBanner,
  Lightbox,
  PageHero,
  Reveal,
  SectionHead,
  SocialIcons,
  StatsBar,
} from "@/components/site";
import {
  CaseStudyModal,
  PressKitModal,
  VideoShowreelModal,
  type CaseStudyItem,
} from "@/components/LiveBookingAndModals";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  isFormFieldActive,
  validateDynamicFormSubmission,
  type CmsContactFormConfig,
  type CmsFormField,
  type CmsPageSection,
  type CmsPageSlug,
} from "@/lib/cms-schema";
import {
  submitPublicContactFormServerFn,
} from "@/lib/cms-server";
import {
  getLockedEventDates,
  getSiteSettings,
  saveEnquiry,
  type LockedDateInfo,
} from "@/lib/data-store";

/* ========================================================================== */
/* ICON RESOLVER MAP                                                          */
/* ========================================================================== */

const CMS_ICONS: Record<string, LucideIcon> = {
  Mic,
  CalendarDays,
  Users,
  TrendingUp,
  Trophy,
  Star,
  Zap,
  MessagesSquare,
  Target,
  Gem,
  Rocket,
  ArrowLeftRight,
  Layers,
  Award,
  Building2,
  Music,
  Heart,
  MessageCircle,
  BarChart3,
  SlidersHorizontal,
  ShieldCheck,
  Handshake,
  Camera,
  PlaySquare,
  Image: ImageIcon,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  HelpCircle,
};

export function resolveCmsIcon(key: string): LucideIcon {
  return CMS_ICONS[key] ?? Sparkles;
}

/* ========================================================================== */
/* PUBLISHED SITE CMS CONTEXT (Re-exported from acyclic `cms-context.tsx`)    */
/* ========================================================================== */

export {
  CmsSiteProvider,
  usePublishedCms,
  CmsThemedSurface,
} from "@/lib/cms-context";

/* ========================================================================== */
/* DYNAMIC PUBLIC CONTACT FORM RENDERER                                       */
/* ========================================================================== */

function matchInitialFormatOption(options: string[], formatParam?: string): string {
  if (!formatParam) return "";
  const lower = formatParam.toLowerCase();
  const direct = options.find((o) => o.toLowerCase() === lower);
  if (direct) return direct;
  if (lower.includes("summit") || lower.includes("corporate")) {
    return options.find((o) => o.toLowerCase().includes("corporate")) ?? options[0] ?? "";
  }
  if (lower.includes("award") || lower.includes("gala")) {
    return options.find((o) => o.toLowerCase().includes("award")) ?? options[0] ?? "";
  }
  if (lower.includes("panel") || lower.includes("conclave")) {
    return options.find((o) => o.toLowerCase().includes("conclave")) ?? options[0] ?? "";
  }
  if (lower.includes("festival") || lower.includes("live")) {
    return options.find((o) => o.toLowerCase().includes("festival")) ?? options[0] ?? "";
  }
  if (lower.includes("wedding") || lower.includes("sangeet")) {
    return options.find((o) => o.toLowerCase().includes("wedding")) ?? options[0] ?? "";
  }
  if (lower.includes("launch")) {
    return options.find((o) => o.toLowerCase().includes("launch")) ?? options[0] ?? "";
  }
  return options[0] ?? "";
}

function fieldLeadingIcon(field: CmsFormField) {
  if (field.crmMapping === "clientName") return <User />;
  if (field.crmMapping === "phone" || field.type === "phone") return <Phone />;
  if (field.crmMapping === "email" || field.type === "email") return <Mail />;
  if (field.crmMapping === "date" || field.type === "date") return <CalendarDays />;
  if (field.crmMapping === "organization") return <Building />;
  if (field.crmMapping === "city") return <MapPin />;
  if (field.crmMapping === "packageTier") return <Sparkles />;
  if (field.type === "textarea") return <MessageSquare />;
  return <CalendarDays />;
}

export function CmsDynamicContactForm({
  formConfig,
  heading,
  subheading,
  availabilityActiveLabel,
  availabilityPausedLabel,
  showLiveStageCalendarStrip,
  initialFormatParam,
  previewMode = false,
}: {
  formConfig: CmsContactFormConfig;
  heading: string;
  subheading: string;
  availabilityActiveLabel: string;
  availabilityPausedLabel: string;
  showLiveStageCalendarStrip: boolean;
  initialFormatParam?: string | undefined;
  previewMode?: boolean | undefined;
}) {
  const [sending, setSending] = useState(false);
  const [lockedDates, setLockedDates] = useState<LockedDateInfo[]>(() => getLockedEventDates());
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const buildInitialValues = useCallback(() => {
    const init: Record<string, string> = {};
    for (const f of formConfig.fields) {
      if (f.type === "section_header") continue;
      if (f.crmMapping === "format" && initialFormatParam) {
        init[f.name] = matchInitialFormatOption(f.options, initialFormatParam);
      } else if (f.crmMapping === "packageTier" && f.options[1]) {
        init[f.name] = f.options[1];
      } else if (f.type === "yes_no") {
        init[f.name] = "Yes";
      } else {
        init[f.name] = "";
      }
    }
    return init;
  }, [formConfig.fields, initialFormatParam]);

  const [values, setValues] = useState<Record<string, string>>(buildInitialValues);

  useEffect(() => {
    setValues(buildInitialValues());
  }, [buildInitialValues]);

  useEffect(() => {
    const sync = () => {
      setLockedDates(getLockedEventDates());
      setSiteSettings(getSiteSettings());
    };
    window.addEventListener("siddwhizz_enquiries_updated", sync);
    window.addEventListener("siddwhizz_bookings_updated", sync);
    window.addEventListener("siddwhizz_settings_updated", sync);
    return () => {
      window.removeEventListener("siddwhizz_enquiries_updated", sync);
      window.removeEventListener("siddwhizz_bookings_updated", sync);
      window.removeEventListener("siddwhizz_settings_updated", sync);
    };
  }, []);

  const dateField = formConfig.fields.find(
    (f) => f.crmMapping === "date" || f.type === "date"
  );
  const selectedDate = dateField ? (values[dateField.name] ?? "") : "";
  const dateConflict = selectedDate
    ? lockedDates.find((d) => d.date === selectedDate)
    : undefined;

  const inputCls =
    "w-full rounded-lg border border-input bg-card py-3 pl-12 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/15";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (previewMode) {
      toast.info("Live Preview Mode: Form submission is simulated in the CMS editor.");
      return;
    }

    const clientCheck = validateDynamicFormSubmission(formConfig, values);
    if (!clientCheck.valid) {
      setFieldErrors(clientCheck.errors);
      const firstErr = Object.values(clientCheck.errors)[0];
      if (firstErr) toast.error(firstErr);
      return;
    }

    setFieldErrors({});
    setSending(true);
    try {
      const res = await submitPublicContactFormServerFn({ data: { values } });
      if (!res.ok) {
        setFieldErrors(res.fieldErrors);
        toast.error(res.message);
        setSending(false);
        return;
      }

      const v = clientCheck.sanitizedValues;
      const pick = (mapping: string, fallback: string) => {
        const f = formConfig.fields.find((item) => item.crmMapping === mapping);
        return (f ? v[f.name] : v[fallback]) ?? "";
      };
      const clientName = pick("clientName", "name") || "Website Visitor";
      const organization = pick("organization", "organization");
      const format = pick("format", "type") || "Corporate Summit";
      const city = pick("city", "city") || "Mumbai / Pan-India";
      const packageLabel = pick("packageTier", "packageTier") || "Full-Day Summit / Gala";
      const budgetMatch = packageLabel.match(/₹[^)]+/);

      saveEnquiry({
        eventName: organization ? `${organization} — ${format}` : `${clientName}'s ${format}`,
        clientName,
        organization: organization || "Direct Enquiry via Website",
        email: pick("email", "email"),
        phone: pick("phone", "phone"),
        date: pick("date", "date") || "Upcoming Date",
        city,
        venue: city ? `${city} Venue` : "Client Specified Venue",
        format,
        crowdSize: pick("crowdSize", "crowdSize") || "500 - 1,000 Attendees",
        budget: pick("budget", "budget") || (budgetMatch ? budgetMatch[0] : "₹3,50,000 - ₹5,00,000"),
        packageTier: packageLabel,
        status: "New",
        brief: pick("brief", "message") || "Submitted via dynamic website contact form.",
      });

      setValues(buildInitialValues());
      setLockedDates(getLockedEventDates());
      toast.success(`Thanks ${clientName}! ${res.message}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit enquiry.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      id="enquiry"
      onSubmit={handleSubmit}
      noValidate
      className="cms-branded-controls scroll-mt-24 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="eyebrow !text-2xl !normal-case">{heading}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <span
            className={`h-2 w-2 rounded-full ${
              siteSettings.bookingAvailable ? "bg-primary animate-pulse" : "bg-muted-foreground"
            }`}
          />
          {siteSettings.bookingAvailable ? availabilityActiveLabel : availabilityPausedLabel}
        </span>
      </div>
      <p className="mt-1 pl-8 text-sm text-foreground/75">{subheading}</p>

      {showLiveStageCalendarStrip && (
        <div className="mt-5 rounded-xl border border-border bg-accent/40 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Locked Stage Dates:
            </span>
            <span className="text-muted-foreground">
              Select a date below to verify instant availability
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {lockedDates.slice(0, 5).map((d) => (
              <span
                key={d.date}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-mono font-semibold text-foreground"
                title={`${d.eventName} (${d.city})`}
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {d.date} • {d.city} ({d.status})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Anti-spam Honeypot (hidden from humans & screen readers) */}
      {formConfig.honeypotEnabled && (
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="cms_hp_company_site">Leave this field blank</label>
          <input
            id="cms_hp_company_site"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values["_company_website_hp"] ?? ""}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, _company_website_hp: e.target.value }))
            }
          />
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {formConfig.fields.map((field) => {
          if (!isFormFieldActive(field, values)) return null;
          const colSpan = field.width === "full" ? "sm:col-span-2" : "";
          const err = fieldErrors[field.name];
          const val = values[field.name] ?? "";

          if (field.type === "section_header") {
            return (
              <div key={field.id} className="sm:col-span-2 pt-2 border-t border-border">
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-primary">
                  {field.label}
                </p>
                {field.tooltip && (
                  <p className="text-xs text-muted-foreground mt-0.5">{field.tooltip}</p>
                )}
              </div>
            );
          }

          return (
            <div key={field.id} className={colSpan}>
              {field.type === "textarea" ? (
                <label className="group relative block">
                  <span className="pointer-events-none absolute left-4 top-3.5 text-foreground/70 transition-colors group-focus-within:text-primary [&_svg]:h-5 [&_svg]:w-5">
                    {fieldLeadingIcon(field)}
                  </span>
                  <textarea
                    name={field.name}
                    rows={4}
                    value={val}
                    maxLength={field.maxLength || 2000}
                    placeholder={
                      field.placeholder || `${field.label}${field.required ? " *" : ""}`
                    }
                    aria-label={field.label}
                    aria-invalid={Boolean(err)}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    className={`${inputCls} resize-y`}
                  />
                </label>
              ) : field.type === "select" ? (
                <label className="group relative block">
                  <span className="pointer-events-none absolute left-4 top-3.5 text-foreground/70 transition-colors group-focus-within:text-primary [&_svg]:h-5 [&_svg]:w-5">
                    {fieldLeadingIcon(field)}
                  </span>
                  <select
                    name={field.name}
                    value={val}
                    aria-label={field.label}
                    aria-invalid={Boolean(err)}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="">
                      {field.placeholder || `${field.label}${field.required ? " *" : ""}`}
                    </option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-5 w-5" />
                </label>
              ) : field.type === "yes_no" ? (
                <div className="rounded-lg border border-input bg-card px-4 py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {field.label}
                      {field.required && <span className="text-primary ml-0.5">*</span>}
                    </p>
                    {field.tooltip && (
                      <p className="text-[11px] text-muted-foreground">{field.tooltip}</p>
                    )}
                  </div>
                  <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/50">
                    {["No", "Yes"].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() =>
                          setValues((prev) => ({ ...prev, [field.name]: choice }))
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                          val === choice
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              ) : field.type === "checkbox" ? (
                <label className="cms-check-label flex items-center gap-2.5 rounded-lg border border-input bg-card px-4 py-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val === "true"}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.name]: e.target.checked ? "true" : "",
                      }))
                    }
                    className="cms-native-check h-4 w-4 shrink-0"
                  />
                  <span>
                    {field.label}
                    {field.required && <span className="text-primary ml-0.5">*</span>}
                  </span>
                </label>
              ) : field.type === "radio" ? (
                <fieldset className="rounded-lg border border-input bg-card px-4 py-3">
                  <legend className="px-1 text-xs font-bold text-foreground">
                    {field.label}
                    {field.required && <span className="text-primary ml-0.5">*</span>}
                  </legend>
                  <div className="mt-1.5 flex flex-wrap gap-4">
                    {field.options.map((opt) => (
                      <label
                        key={opt}
                        className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={opt}
                          checked={val === opt}
                          onChange={() =>
                            setValues((prev) => ({ ...prev, [field.name]: opt }))
                          }
                          className="h-4 w-4"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <label className="group relative block">
                  <span className="pointer-events-none absolute left-4 top-3.5 text-foreground/70 transition-colors group-focus-within:text-primary [&_svg]:h-5 [&_svg]:w-5">
                    {fieldLeadingIcon(field)}
                  </span>
                  <input
                    name={field.name}
                    type={
                      field.type === "phone"
                        ? "tel"
                        : field.type === "email"
                        ? "email"
                        : field.type === "date"
                        ? "date"
                        : field.type === "number"
                        ? "number"
                        : "text"
                    }
                    value={val}
                    maxLength={field.maxLength || 200}
                    placeholder={
                      field.placeholder || `${field.label}${field.required ? " *" : ""}`
                    }
                    aria-label={field.label}
                    aria-invalid={Boolean(err)}
                    autoComplete={
                      field.type === "email"
                        ? "email"
                        : field.type === "phone"
                        ? "tel"
                        : field.crmMapping === "clientName"
                        ? "name"
                        : field.crmMapping === "organization"
                        ? "organization"
                        : "off"
                    }
                    {...(field.type === "email" || field.type === "phone"
                      ? {
                          autoCorrect: "off",
                          autoCapitalize: "off",
                          spellCheck: false,
                        }
                      : {})}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    className={inputCls}
                  />
                </label>
              )}

              {/* Live Stage Lock Feedback on Date Field */}
              {(field.crmMapping === "date" || field.type === "date") && val && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
                  {dateConflict ? (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-primary">
                        {val} has a {dateConflict.status.toLowerCase()} lock in{" "}
                        {dateConflict.city} — Alternate slot / Waitlist available
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{val} is Available for Direct Stage Lock!</span>
                    </>
                  )}
                </p>
              )}

              {field.tooltip &&
                field.type !== "yes_no" &&
                !err && (
                  <p className="mt-1 text-[11px] text-muted-foreground pl-1">
                    {field.tooltip}
                  </p>
                )}

              {err && (
                <p
                  role="alert"
                  className="mt-1 flex items-center gap-1 text-xs font-semibold text-destructive pl-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{err}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="btn-red mt-5 w-full !py-3.5 !text-base !normal-case disabled:opacity-70 cursor-pointer"
      >
        <Send className={`h-5 w-5 ${sending ? "animate-pulse" : ""}`} />{" "}
        {sending ? formConfig.submittingButtonLabel : formConfig.submitButtonLabel}
      </button>
    </form>
  );
}

/* ========================================================================== */
/* UNIVERSAL PAGE & SECTION RENDERER (Shared by Live Website + CMS Canvas)    */
/* ========================================================================== */

function CmsHeroButtonLink({
  label,
  href,
  primary,
  onOpenEpk,
}: {
  label: string;
  href: string;
  primary: boolean;
  onOpenEpk: () => void;
}) {
  if (!label) return null;
  const cls = primary ? "btn-red !normal-case !text-base" : "btn-outline !normal-case !text-base";
  if (href === "#epk") {
    return (
      <button type="button" onClick={onOpenEpk} className={`${cls} cursor-pointer`}>
        <FileText className="h-4 w-4 text-primary" /> {label}
      </button>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls}>
        {primary ? <Play className="h-4 w-4" /> : <Send className="h-4 w-4" />} {label}
      </a>
    );
  }
  const safeRoute = (
    ["/", "/about", "/services", "/portfolio", "/gallery", "/contact"].includes(href)
      ? href
      : "/contact"
  ) as "/" | "/about" | "/services" | "/portfolio" | "/gallery" | "/contact";
  return (
    <Link to={safeRoute} className={cls}>
      {primary ? <Play className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />} {label}
    </Link>
  );
}

function CmsHighlightsBlock({
  data,
  onPlayReel,
  onOpenCaseStudy,
  onOpenLightbox,
}: {
  data: Extract<CmsPageSection["data"], { kind: "highlights_gallery" }>;
  onPlayReel: (title: string, duration: string) => void;
  onOpenCaseStudy: (item: CaseStudyItem) => void;
  onOpenLightbox: (images: { src: string; alt: string }[], index: number) => void;
}) {
  const [cat, setCat] = useState(data.categories[0] || "All Events");
  const [showAllMosaic, setShowAllMosaic] = useState(false);

  if (data.displayMode === "home_highlights") {
    const shown = data.items
      .filter((h) => cat === "All Events" || h.category === cat)
      .slice(0, 5);
    return (
      <section className="container-x py-16">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHead eyebrow={data.eyebrow} title={data.title} />
          <Reveal className="flex flex-wrap gap-2">
            {data.categories.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCat(f)}
                className={`chip ${cat === f ? "chip-active" : ""}`}
              >
                {f}
              </button>
            ))}
          </Reveal>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((h, i) => (
            <div
              key={h.id + cat}
              role={h.isVideo ? "button" : undefined}
              tabIndex={h.isVideo ? 0 : undefined}
              onClick={() => {
                if (h.isVideo) {
                  onPlayReel(`${h.category} Stage Highlight Reel`, "02:15");
                }
              }}
              onKeyDown={(e) => {
                if (h.isVideo && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onPlayReel(`${h.category} Stage Highlight Reel`, "02:15");
                }
              }}
              className={`animate-rise img-zoom group relative aspect-[4/3] overflow-hidden rounded-lg ${
                h.isVideo ? "cursor-pointer" : ""
              }`}
              style={{ "--d": `${i * 80}ms` } as CSSProperties}
            >
              <img
                src={h.image}
                alt={h.title || `${h.category} event`}
                loading="lazy"
                width={1280}
                height={896}
                className="h-full w-full object-cover"
              />
              {h.isVideo && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="animate-pulse-ring grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
        {data.ctaLabel && (
          <div className="mt-6 text-center">
            <Link to="/portfolio" className="btn-outline">
              <LayoutGrid className="h-4 w-4 text-primary" /> {data.ctaLabel}
            </Link>
          </div>
        )}
      </section>
    );
  }

  if (data.displayMode === "portfolio_full") {
    const filtered = data.items
      .filter((i) => cat === "All Events" || i.category === cat)
      .slice(0, 5);
    const snapImages = data.snapshots.map((s) => ({ src: s.src, alt: s.alt }));
    return (
      <>
        <section id="showreel" className="container-x scroll-mt-24 py-14">
          <div className="grid gap-4 md:grid-cols-2 md:items-end">
            <SectionHead eyebrow={data.eyebrow} title={data.title} />
            {data.subtitle && (
              <Reveal>
                <p className="text-foreground/80">{data.subtitle}</p>
              </Reveal>
            )}
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <Reveal className="img-zoom group relative overflow-hidden rounded-2xl">
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  onPlayReel(
                    data.featuredVideoTitle || "Event Hosting Showreel 2026",
                    data.featuredVideoDuration || "04:28"
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPlayReel(
                      data.featuredVideoTitle || "Event Hosting Showreel 2026",
                      data.featuredVideoDuration || "04:28"
                    );
                  }
                }}
                className="relative cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none"
              >
                <img
                  src={data.featuredVideoImage}
                  alt={data.featuredVideoTitle}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="ink-fade-bottom absolute inset-0" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="animate-pulse-ring grid h-16 w-16 place-items-center rounded-full bg-background text-primary transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-7 w-7 fill-current" />
                  </span>
                </span>
                <div className="absolute bottom-5 left-5 text-ink-foreground">
                  <p className="font-display text-lg font-black">SIDD.WHIZZ</p>
                  <p className="text-sm">{data.featuredVideoTitle} — Click to Play</p>
                </div>
                <span className="absolute bottom-5 right-5 rounded bg-ink/80 px-2 py-0.5 text-xs font-bold text-ink-foreground">
                  {data.featuredVideoDuration}
                </span>
              </div>
            </Reveal>
            <div className="flex flex-col gap-4">
              {data.reels.map((r, i) => (
                <Reveal key={r.id} delay={i * 120}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onPlayReel(r.title, r.duration)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onPlayReel(r.title, r.duration);
                      }
                    }}
                    className="card-lift group flex items-center gap-4 p-2.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none"
                  >
                    <div className="img-zoom relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={r.image}
                        alt={r.title}
                        loading="lazy"
                        width={1280}
                        height={896}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-background text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Play className="h-4 w-4 fill-current" />
                        </span>
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
                        {r.title}
                      </p>
                      <span className="mt-1 inline-block rounded bg-ink px-2 py-0.5 text-[11px] font-bold text-ink-foreground">
                        {r.duration}
                      </span>
                    </div>
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="container-x">
          <SectionHead eyebrow="Browse by event type" />
          <Reveal className="mt-4 flex overflow-x-auto pb-2 flex-nowrap sm:flex-wrap gap-2.5">
            {data.categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`chip shrink-0 inline-flex items-center gap-2 ${
                  cat === c ? "chip-active" : ""
                }`}
              >
                {c === "All Events" && <LayoutGrid className="h-4 w-4" />} {c}
              </button>
            ))}
          </Reveal>
          <div className="mt-8">
            <SectionHead eyebrow="Event Highlights" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {filtered.length === 0 && (
                <p className="text-muted-foreground">
                  More events coming soon in this category.
                </p>
              )}
              {filtered.map((it, i) => (
                <div
                  key={it.id + cat}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    onOpenCaseStudy({
                      t: it.title,
                      s: it.subtitle,
                      c: it.category,
                      img: it.image,
                      audience: it.audience || "1,000+ Attendees",
                      location: it.location || "India",
                      summary: it.summary || it.subtitle,
                      quote: it.clientQuote || "Memorable stage hosting.",
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenCaseStudy({
                        t: it.title,
                        s: it.subtitle,
                        c: it.category,
                        img: it.image,
                        audience: it.audience || "1,000+ Attendees",
                        location: it.location || "India",
                        summary: it.summary || it.subtitle,
                        quote: it.clientQuote || "Memorable stage hosting.",
                      });
                    }
                  }}
                  className="animate-rise card-lift img-zoom group overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none"
                  style={{ "--d": `${i * 80}ms` } as CSSProperties}
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={it.image}
                      alt={it.title}
                      loading="lazy"
                      width={1280}
                      height={896}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-end justify-between p-3">
                    <div>
                      <p className="text-sm font-extrabold group-hover:text-primary transition-colors">
                        {it.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{it.subtitle}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {snapImages.length > 0 && (
          <section className="container-x py-14">
            <SectionHead eyebrow="Event Snapshots" />
            <Reveal className="mt-5 grid grid-cols-4 grid-rows-2 gap-3">
              {snapImages.map((s, i) => (
                <div
                  role="button"
                  tabIndex={0}
                  key={s.src + i}
                  onClick={() => onOpenLightbox(snapImages, i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenLightbox(snapImages, i);
                    }
                  }}
                  className={`img-zoom relative cursor-pointer overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="lazy"
                    className="h-full min-h-28 w-full object-cover"
                  />
                  {i === 0 && data.ctaLabel && (
                    <Link
                      to="/gallery"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg border-2 border-ink-foreground bg-ink/40 px-4 py-2 text-sm font-bold text-ink-foreground backdrop-blur transition-colors hover:bg-primary"
                    >
                      <Images className="h-4 w-4" /> {data.ctaLabel}
                    </Link>
                  )}
                </div>
              ))}
            </Reveal>
          </section>
        )}
      </>
    );
  }

  // gallery_mosaic mode
  const basePool = showAllMosaic ? data.items : data.items.slice(0, 13);
  const list = basePool.filter((p) => cat === "All Events" || p.category === cat);
  const isAll = cat === "All Events";
  const lightboxPool = list.map((p) => ({ src: p.image, alt: p.title }));

  return (
    <>
      <section className="container-x py-8">
        <Reveal className="flex overflow-x-auto pb-2 flex-nowrap sm:flex-wrap gap-3">
          {data.categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`chip shrink-0 inline-flex items-center gap-2 !rounded-lg !px-4 !py-2 ${
                cat === c ? "chip-active" : ""
              }`}
            >
              <LayoutGrid className="h-4 w-4" /> {c}
            </button>
          ))}
        </Reveal>
      </section>
      <section className="px-3 md:px-4">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-2.5 md:grid-cols-12">
          {list.map((p, i) => (
            <button
              key={p.id + cat}
              type="button"
              onClick={() => onOpenLightbox(lightboxPool, i)}
              className={`animate-rise img-zoom group relative h-44 overflow-hidden rounded-lg md:h-56 cursor-pointer ${
                isAll && p.span ? p.span : "md:col-span-4"
              }`}
              style={{ "--d": `${(i % 6) * 70}ms` } as CSSProperties}
            >
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="ink-fade-bottom absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 translate-y-3 text-left text-sm font-bold text-ink-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {p.title}
              </span>
            </button>
          ))}
        </div>
        {list.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            More photos from this category are coming soon.
          </p>
        )}
        {data.items.length > 13 && (
          <div className="mt-8 text-center">
            {!showAllMosaic ? (
              <button
                type="button"
                onClick={() => setShowAllMosaic(true)}
                className="btn-outline !rounded-full !px-8 !normal-case cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-primary" /> Load More Photos
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">You've seen all the photos.</p>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export function CmsPageRenderer({
  pageSlug,
  sections,
  signatureText,
  contactFormConfig,
  initialContactFormat,
  previewMode = false,
  selectedSectionId,
  onSelectSection,
}: {
  pageSlug: CmsPageSlug;
  sections: CmsPageSection[];
  signatureText: string;
  contactFormConfig: CmsContactFormConfig;
  initialContactFormat?: string | undefined;
  previewMode?: boolean | undefined;
  selectedSectionId?: string | undefined;
  onSelectSection?: ((sectionId: string) => void) | undefined;
}) {
  const [epkOpen, setEpkOpen] = useState(false);
  const [activeReel, setActiveReel] = useState<{ title: string; duration: string } | null>(
    null
  );
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudyItem | null>(null);
  const [lbState, setLbState] = useState<{
    images: { src: string; alt: string }[];
    index: number | null;
  }>({ images: [], index: null });

  const visibleSections = sections.filter((s) => s.visible);

  const surfaceCls = (s: CmsPageSection["surface"]) => {
    if (s === "blush") return "bg-blush";
    if (s === "muted") return "bg-muted/60";
    if (s === "ink") return "bg-ink text-ink-foreground";
    if (s === "accent") return "bg-accent/60";
    return "";
  };

  return (
    <>
      {visibleSections.map((sec) => {
        const d = sec.data;
        const isSelected = previewMode && selectedSectionId === sec.id;

        const wrapInteractive = (node: React.ReactNode) => {
          if (!previewMode || !onSelectSection) return <React.Fragment key={sec.id}>{node}</React.Fragment>;
          return (
            <div
              key={sec.id}
              onClickCapture={(e) => {
                // Select section in CMS inspector without breaking internal tabs/accordions
                onSelectSection(sec.id);
                const anchor = (e.target as HTMLElement | null)?.closest("a");
                if (anchor) {
                  e.preventDefault();
                }
              }}
              className={`relative group/cmssec transition-all ${
                isSelected
                  ? "ring-2 ring-primary ring-inset"
                  : "hover:ring-1 hover:ring-primary/50 hover:ring-inset"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSection(sec.id);
                }}
                className={`absolute right-3 top-3 z-30 rounded-full px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider shadow-md transition cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-ink/85 text-ink-foreground opacity-0 group-hover/cmssec:opacity-100"
                }`}
              >
                {isSelected ? `Editing: ${sec.label}` : `Click to Edit: ${sec.label}`}
              </button>
              {node}
            </div>
          );
        };

        if (d.kind === "hero") {
          return wrapInteractive(
            <PageHero
              big={d.big}
              eyebrow={d.eyebrow}
              lines={d.lines.length > 0 ? d.lines : [pageSlug.toUpperCase()]}
              redFrom={d.redFrom}
              image={d.image}
              position={d.imagePosition || "center"}
              text={d.description}
              actions={
                d.primaryCtaLabel || d.secondaryCtaLabel ? (
                  <>
                    <CmsHeroButtonLink
                      label={d.primaryCtaLabel}
                      href={d.primaryCtaHref}
                      primary
                      onOpenEpk={() => setEpkOpen(true)}
                    />
                    <CmsHeroButtonLink
                      label={d.secondaryCtaLabel}
                      href={d.secondaryCtaHref}
                      primary={false}
                      onOpenEpk={() => setEpkOpen(true)}
                    />
                  </>
                ) : undefined
              }
            />
          );
        }

        if (d.kind === "stats") {
          return wrapInteractive(
            <StatsBar
              className={d.overlapHero ? "md:-mt-14" : "mt-10"}
              items={d.items.map((it) => {
                const Icon = resolveCmsIcon(it.iconKey);
                return {
                  icon: <Icon />,
                  ...(it.value ? { value: it.value } : {}),
                  label: it.label,
                };
              })}
            />
          );
        }

        if (d.kind === "service_cards") {
          const isHomeSplit = pageSlug === "home" && sec.id === "home_about_services";
          if (isHomeSplit) {
            return wrapInteractive(
              <section className={`container-x grid gap-10 py-16 lg:grid-cols-[300px_1fr] ${surfaceCls(sec.surface)}`}>
                <Reveal className="lg:border-r lg:pr-8">
                  <p className="eyebrow">About SIDD.WHIZZ</p>
                  <h2 className="display mt-3 text-3xl lg:text-[34px]">
                    {d.title} <span className="block text-primary">{d.highlightText}</span>
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                    {d.subtitle}
                  </p>
                  <div className="mt-5">
                    <p
                      className="text-4xl text-primary"
                      style={{ fontFamily: "var(--cms-signature-font, 'Great Vibes', cursive)" }}
                    >
                      {signatureText}
                    </p>
                    <p className="mt-1 text-xs font-bold tracking-[0.3em]">SIDD.WHIZZ</p>
                  </div>
                  <Link
                    to="/about"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                  >
                    Know more <ArrowRight className="h-4 w-4" />
                  </Link>
                </Reveal>
                <div>
                  <SectionHead eyebrow={d.eyebrow} />
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {d.cards.map((s, i) => {
                      const Icon = resolveCmsIcon(s.iconKey);
                      return (
                        <Reveal key={s.id} delay={i * 100}>
                          <Link
                            to="/contact"
                            search={{ format: s.formatQuery || s.title }}
                            className="card-lift img-zoom group block h-full overflow-hidden"
                          >
                            <div className="relative h-36 overflow-hidden">
                              <img
                                src={s.image}
                                alt={s.title}
                                loading="lazy"
                                width={1280}
                                height={896}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="relative p-4 pt-7">
                              <span className="icon-badge absolute -top-6 left-4 h-11 w-11">
                                <Icon className="h-5 w-5" />
                              </span>
                              <h3 className="font-display text-base font-extrabold leading-tight">
                                {s.title}
                              </h3>
                              <span className="icon-badge mt-4 ml-auto h-7 w-7 transition-transform duration-300 group-hover:translate-x-1">
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </Link>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          return wrapInteractive(
            <section className={`container-x py-14 ${surfaceCls(sec.surface)}`}>
              <div className="grid gap-4 md:grid-cols-2 md:items-end">
                <SectionHead
                  eyebrow={d.eyebrow}
                  title={d.title}
                  {...(d.highlightText ? { red: d.highlightText } : {})}
                />
                {d.subtitle && (
                  <Reveal>
                    <p className="text-foreground/80 md:text-right">{d.subtitle}</p>
                  </Reveal>
                )}
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {d.cards.map((s, i) => {
                  const Icon = resolveCmsIcon(s.iconKey);
                  return (
                    <Reveal key={s.id} delay={i * 110}>
                      <article className="card-lift img-zoom group flex h-full flex-col overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={s.image}
                            alt={s.title}
                            loading="lazy"
                            width={1280}
                            height={896}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="relative flex flex-1 flex-col p-5 pt-7">
                          <span className="icon-badge absolute -top-6 left-5 h-11 w-11 rounded-lg">
                            <Icon className="h-5 w-5" />
                          </span>
                          <h3 className="font-display text-lg font-extrabold">{s.title}</h3>
                          <p className="mt-2 flex-1 text-sm text-foreground/75">
                            {s.description}
                          </p>
                          <Link
                            to="/contact"
                            search={{ format: s.formatQuery || s.title }}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3"
                          >
                            {s.ctaLabel || "Book This Format"}{" "}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          );
        }

        if (d.kind === "split_story") {
          return wrapInteractive(
            <section className={`container-x grid items-center gap-10 py-12 md:grid-cols-2 ${surfaceCls(sec.surface)}`}>
              <Reveal className="img-zoom overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
                <img
                  src={d.image}
                  alt={d.imageAlt || d.title}
                  loading="lazy"
                  width={1920}
                  height={1080}
                  className="aspect-[16/9] w-full object-cover"
                />
              </Reveal>
              <Reveal delay={150}>
                <p className="eyebrow eyebrow-line">{d.eyebrow}</p>
                <h2 className="display mt-3 text-3xl lg:text-[40px]">
                  {d.title}{" "}
                  {d.highlightText && (
                    <span className="block text-primary">{d.highlightText}</span>
                  )}
                </h2>
                {d.body && (
                  <p className="mt-4 leading-relaxed text-foreground/80">{d.body}</p>
                )}
                {d.bullets.length > 0 && (
                  <div className="mt-6 grid gap-5 sm:grid-cols-3">
                    {d.bullets.map((b) => {
                      const Icon = resolveCmsIcon(b.iconKey);
                      return (
                        <div key={b.id}>
                          <Icon className="h-7 w-7 text-primary" />
                          <h3 className="mt-2 text-sm font-bold">{b.title}</h3>
                          <p className="text-xs text-muted-foreground">{b.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                {d.showSignature && (
                  <div className="mt-5">
                    <p
                      className="text-4xl text-primary"
                      style={{ fontFamily: "var(--cms-signature-font, 'Great Vibes', cursive)" }}
                    >
                      {signatureText}
                    </p>
                    <p className="mt-1 text-xs font-bold tracking-[0.3em]">SIDD.WHIZZ</p>
                  </div>
                )}
                {(d.primaryCtaLabel || d.secondaryCtaLabel) && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {d.primaryCtaLabel && (
                      <CmsHeroButtonLink
                        label={d.primaryCtaLabel}
                        href={d.primaryCtaHref}
                        primary
                        onOpenEpk={() => setEpkOpen(true)}
                      />
                    )}
                    {d.secondaryCtaLabel && (
                      <CmsHeroButtonLink
                        label={d.secondaryCtaLabel}
                        href={d.secondaryCtaHref}
                        primary={false}
                        onOpenEpk={() => setEpkOpen(true)}
                      />
                    )}
                  </div>
                )}
              </Reveal>
            </section>
          );
        }

        if (d.kind === "feature_grid") {
          if (d.variant === "timeline") {
            return wrapInteractive(
              <section id="journey" className={`container-x scroll-mt-24 py-10 ${surfaceCls(sec.surface)}`}>
                <SectionHead eyebrow={d.eyebrow} title={d.title} />
                <div className="relative mt-10 grid gap-8 md:grid-cols-4">
                  <div className="absolute left-[12%] right-[12%] top-7 hidden h-0.5 bg-primary md:block" />
                  {d.items.map((j, i) => {
                    const Icon = resolveCmsIcon(j.iconKey);
                    return (
                      <Reveal key={j.id} delay={i * 150} className="relative text-center">
                        <span className="icon-badge relative mx-auto h-14 w-14 transition-transform duration-500 hover:scale-110">
                          <Icon className="h-6 w-6" />
                        </span>
                        {i < d.items.length - 1 && (
                          <span className="icon-badge absolute -right-4 top-5 hidden h-5 w-5 md:grid">
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        )}
                        <h3 className="mt-4 font-display text-base font-extrabold uppercase">
                          {j.title}
                        </h3>
                        <p className="mx-auto mt-1 max-w-[220px] text-sm text-muted-foreground">
                          {j.description}
                        </p>
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (d.variant === "cards") {
            return wrapInteractive(
              <section className={`container-x py-12 ${surfaceCls(sec.surface)}`}>
                <SectionHead eyebrow={d.eyebrow} title={d.title} />
                <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {d.items.map((p, i) => {
                    const Icon = resolveCmsIcon(p.iconKey);
                    return (
                      <Reveal key={p.id} delay={i * 90}>
                        <div className="card-lift h-full p-5 text-center">
                          <Icon className="mx-auto h-9 w-9 text-primary" />
                          <h3 className="mt-3 font-display text-sm font-extrabold uppercase">
                            {p.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {p.description}
                          </p>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (d.variant === "formats_strip") {
            return wrapInteractive(
              <section className="container-x py-6">
                <Reveal className="grid gap-6 rounded-2xl bg-muted p-7 md:grid-cols-[280px_1fr] md:items-center">
                  <div className="md:border-r md:pr-6">
                    <p className="eyebrow">{d.eyebrow}</p>
                    {d.title && <h2 className="display mt-2 text-2xl">{d.title}</h2>}
                  </div>
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
                    {d.items.map((f) => {
                      const Icon = resolveCmsIcon(f.iconKey);
                      return (
                        <Link
                          key={f.id}
                          to="/contact"
                          search={{ format: f.title }}
                          className="group text-center transition-colors hover:text-primary"
                        >
                          <Icon className="mx-auto h-8 w-8 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
                          <p className="mt-2 text-sm font-semibold leading-tight">
                            {f.title}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </Reveal>
              </section>
            );
          }

          if (d.variant === "steps") {
            return wrapInteractive(
              <section className={`container-x py-14 ${surfaceCls(sec.surface)}`}>
                <SectionHead eyebrow={d.eyebrow} title={d.title} />
                <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
                  {d.items.map((s, i) => {
                    const Icon = resolveCmsIcon(s.iconKey);
                    return (
                      <Reveal key={s.id} delay={i * 130} className="relative">
                        <div className="card-lift h-full p-6 pt-8 text-center">
                          <span className="icon-badge absolute -top-4 left-1/2 h-9 w-9 -translate-x-1/2 font-display text-sm font-black">
                            0{i + 1}
                          </span>
                          <Icon className="mx-auto h-8 w-8 text-primary" />
                          <h3 className="mt-3 font-display text-base font-extrabold">
                            {s.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {s.description}
                          </p>
                        </div>
                        {i < d.items.length - 1 && (
                          <ArrowRight className="absolute -right-8 top-1/2 hidden h-5 w-5 text-primary lg:block" />
                        )}
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            );
          }

          // pillars
          return wrapInteractive(
            <section className={`py-14 ${surfaceCls(sec.surface)}`}>
              <div className="container-x">
                <SectionHead
                  center={d.centerHeader}
                  eyebrow={d.eyebrow}
                  title={d.title}
                  {...(d.highlightText ? { red: d.highlightText } : {})}
                />
                <div className="mt-10 grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                  {d.items.map((w, i) => {
                    const Icon = resolveCmsIcon(w.iconKey);
                    return (
                      <Reveal
                        key={w.id}
                        delay={i * 90}
                        className={`px-4 text-center ${i > 0 ? "lg:border-l" : ""}`}
                      >
                        <Icon className="mx-auto h-9 w-9 text-primary transition-transform duration-500 hover:scale-125" />
                        <h3 className="mt-3 font-display text-sm font-extrabold">
                          {w.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {w.description}
                        </p>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        if (d.kind === "highlights_gallery") {
          return wrapInteractive(
            <CmsHighlightsBlock
              data={d}
              onPlayReel={(title, duration) => setActiveReel({ title, duration })}
              onOpenCaseStudy={(item) => setActiveCaseStudy(item)}
              onOpenLightbox={(images, index) => setLbState({ images, index })}
            />
          );
        }

        if (d.kind === "packages_addons") {
          return wrapInteractive(
            <section className="container-x grid gap-8 pb-12 lg:grid-cols-2">
              <Reveal className="relative overflow-hidden rounded-2xl bg-ink p-8 text-ink-foreground">
                {d.addonsImage && (
                  <img
                    src={d.addonsImage}
                    alt=""
                    loading="lazy"
                    width={1280}
                    height={768}
                    className="absolute inset-0 h-full w-full object-cover object-right"
                  />
                )}
                <div className="relative max-w-sm">
                  <p className="eyebrow text-ink-foreground">{d.addonsEyebrow}</p>
                  <h2 className="display mt-2 text-2xl md:text-3xl">{d.addonsTitle}</h2>
                  <ul className="mt-5 space-y-2.5 text-sm">
                    {d.addonsList.map((a) => (
                      <li key={a} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 fill-primary text-ink" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={150}>
                <p className="eyebrow">{d.packagesEyebrow}</p>
                <h2 className="display mt-2 text-2xl md:text-3xl">{d.packagesTitle}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {d.packages.map((o) => {
                    const Icon = resolveCmsIcon(o.iconKey);
                    return (
                      <div
                        key={o.id}
                        className={`card-lift relative flex flex-col p-5 text-center ${
                          o.popular ? "border-2 border-primary bg-blush" : ""
                        }`}
                      >
                        {o.popular && (
                          <span className="absolute -top-3 right-3 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            Popular
                          </span>
                        )}
                        <Icon className="mx-auto h-8 w-8 text-primary" />
                        <h3 className="mt-2 font-display text-sm font-extrabold">
                          {o.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs font-black text-primary">
                          {o.fee}
                        </p>
                        <p className="mt-1 flex-1 text-xs text-muted-foreground">
                          {o.description}
                        </p>
                        <Link
                          to="/contact"
                          search={{ format: o.formatQuery || o.title }}
                          className={`mt-4 ${
                            o.popular
                              ? "btn-red"
                              : "btn border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          } !px-3 !py-1.5 !text-xs !normal-case`}
                        >
                          {o.ctaLabel} <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </section>
          );
        }

        if (d.kind === "languages_strengths") {
          return wrapInteractive(
            <section className="container-x grid gap-6 py-10 md:grid-cols-2">
              <Reveal className="rounded-2xl bg-ink p-8 text-ink-foreground">
                <p className="eyebrow text-ink-foreground">{d.languagesEyebrow}</p>
                <h2 className="display mt-2 text-2xl md:text-3xl">{d.languagesTitle}</h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {d.languages.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-2 rounded-lg border border-ink-foreground/80 px-5 py-2 text-sm font-bold transition-colors hover:border-primary hover:bg-primary"
                    >
                      <MessageCircle className="h-4 w-4 text-primary" /> {l}
                    </span>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={150} className="rounded-2xl border p-6 sm:p-8">
                <p className="eyebrow">{d.strengthsEyebrow}</p>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                  {d.strengths.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-sm font-semibold">
                      <CheckCircle2 className="h-5 w-5 shrink-0 fill-primary text-primary-foreground" />{" "}
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </section>
          );
        }

        if (d.kind === "faq") {
          return wrapInteractive(
            <section className="container-x grid gap-8 pb-8 lg:grid-cols-[320px_1fr]">
              <Reveal>
                <p className="eyebrow eyebrow-line">{d.eyebrow}</p>
                <h2 className="display mt-2 text-3xl md:text-4xl">{d.title}</h2>
                {d.subtitle && (
                  <p className="mt-2 text-sm text-muted-foreground">{d.subtitle}</p>
                )}
              </Reveal>
              <Reveal delay={120}>
                <Accordion type="single" collapsible className="space-y-3">
                  {d.items.map((f) => (
                    <AccordionItem
                      key={f.id}
                      value={f.id}
                      className="rounded-lg border bg-card px-4 shadow-[var(--shadow-card)]"
                    >
                      <AccordionTrigger className="text-sm font-bold hover:no-underline hover:text-primary">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            </section>
          );
        }

        if (d.kind === "testimonials") {
          return wrapInteractive(
            <section className="container-x pb-12">
              <SectionHead eyebrow={d.eyebrow} title={d.title} className="mb-7" />
              <div className="grid gap-5 md:grid-cols-3">
                {d.items.map((t, i) => (
                  <Reveal key={t.id} delay={i * 120}>
                    <figure className="card-lift flex h-full flex-col p-6">
                      <div className="flex gap-3">
                        <Quote className="h-8 w-8 shrink-0 fill-primary text-primary" />
                        <blockquote className="text-sm leading-relaxed text-foreground/85">
                          “{t.quote}”
                        </blockquote>
                      </div>
                      <figcaption className="mt-5 flex items-center gap-3">
                        <img
                          src={t.avatar}
                          alt={t.author}
                          loading="lazy"
                          width={816}
                          height={816}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold">{t.author}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                        <div className="flex text-star">
                          {Array.from({ length: t.rating || 5 }).map((_, k) => (
                            <Star key={k} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </section>
          );
        }

        if (d.kind === "brands") {
          return wrapInteractive(
            <section className="container-x pb-8">
              <SectionHead eyebrow={d.eyebrow} title={d.title} />
              <Reveal className="mt-6 flex flex-wrap items-center justify-between gap-6 border-y py-6">
                {d.brands.map((b) => (
                  <BrandMark key={b} name={b} />
                ))}
              </Reveal>
            </section>
          );
        }

        if (d.kind === "contact_hub") {
          return wrapInteractive(
            <>
              <section className="container-x grid gap-6 py-10 lg:grid-cols-[1.5fr_1fr]">
                <Reveal>
                  <CmsDynamicContactForm
                    formConfig={contactFormConfig}
                    heading={d.formHeading}
                    subheading={d.formSubheading}
                    availabilityActiveLabel={d.availabilityActiveLabel}
                    availabilityPausedLabel={d.availabilityPausedLabel}
                    showLiveStageCalendarStrip={d.showLiveStageCalendarStrip}
                    initialFormatParam={initialContactFormat}
                    previewMode={previewMode}
                  />
                </Reveal>
                <Reveal delay={150}>
                  <div
                    id="touch"
                    className="h-full scroll-mt-24 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] md:p-8"
                  >
                    <h2 className="eyebrow !text-2xl !normal-case">{d.directHeading}</h2>
                    <p className="mt-1 pl-8 text-sm text-foreground/75">
                      {d.directSubheading}
                    </p>
                    <div className="mt-5 divide-y">
                      {d.channels.map((c) => {
                        const Icon = resolveCmsIcon(c.iconKey);
                        return (
                          <a
                            key={c.id}
                            href={c.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-4 py-3.5"
                          >
                            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                              <Icon className="h-6 w-6" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-bold">{c.label}</span>
                              <span className="block text-sm text-foreground/85 break-words">
                                {c.value}
                              </span>
                            </span>
                            <ArrowUpRight className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                          </a>
                        );
                      })}
                    </div>
                    <h3 className="eyebrow mt-6 !text-xl !normal-case">{d.socialHeading}</h3>
                    <div className="mt-4">
                      <SocialIcons variant="card" />
                    </div>
                  </div>
                </Reveal>
              </section>

              {d.quickResponseItems.length > 0 && (
                <section className="container-x pt-4 pb-4">
                  <Reveal className="grid items-center gap-6 rounded-2xl bg-accent p-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3">
                      <Zap className="h-10 w-10 fill-primary text-primary" />
                      <p className="display text-2xl normal-case">{d.quickResponseTitle}</p>
                    </div>
                    {d.quickResponseItems.map((q) => {
                      const Icon = resolveCmsIcon(q.iconKey);
                      return (
                        <div
                          key={q.id}
                          className="flex items-center gap-4 lg:border-l lg:pl-6"
                        >
                          <Icon className="h-9 w-9 shrink-0 text-primary" />
                          <p className="font-semibold">{q.text}</p>
                        </div>
                      );
                    })}
                  </Reveal>
                </section>
              )}
            </>
          );
        }

        if (d.kind === "cta_banner") {
          return wrapInteractive(
            <CtaBanner
              variant={d.variant}
              title={d.title}
              red={<span className="text-ink-foreground">{d.highlightText}</span>}
              sub={d.subtitle}
              primaryLabel={d.primaryLabel || "Book Sid Now"}
              secondary={{
                label: d.secondaryLabel || "Get in Touch",
                to: d.secondaryTo || "/contact",
              }}
            />
          );
        }

        return null;
      })}

      {/* Shared Interactive Modals */}
      <PressKitModal open={epkOpen} onClose={() => setEpkOpen(false)} />
      <VideoShowreelModal
        open={Boolean(activeReel)}
        onClose={() => setActiveReel(null)}
        title={activeReel?.title || "SIDD.WHIZZ Official Stage Showreel"}
        duration={activeReel?.duration || "02:15"}
      />
      <CaseStudyModal
        open={Boolean(activeCaseStudy)}
        onClose={() => setActiveCaseStudy(null)}
        item={activeCaseStudy}
      />
      <Lightbox
        images={lbState.images}
        index={lbState.index}
        onClose={() => setLbState((prev) => ({ ...prev, index: null }))}
        onIndex={(idx) => setLbState((prev) => ({ ...prev, index: idx }))}
      />
    </>
  );
}
