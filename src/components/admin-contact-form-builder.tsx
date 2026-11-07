import React, { useState } from "react";
import { toast } from "sonner";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Code2,
  Columns2,
  Eye,
  EyeOff,
  Hash,
  Inbox,
  LayoutTemplate,
  ListFilter,
  Mail,
  Maximize2,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  Trash2,
  Type,
  UploadCloud,
  UserCheck,
} from "lucide-react";
import {
  CMS_FORM_FIELD_TYPES,
  type CmsContactFormConfig,
  type CmsCrmFieldMapping,
  type CmsFormField,
  type CmsFormFieldType,
  type CmsFormSubmissionRecord,
  type CrmLeadStage,
} from "@/lib/cms-schema";
import { CmsDynamicContactForm } from "@/lib/cms-client";
import {
  saveCmsContactFormServerFn,
  updateCmsSubmissionCrmServerFn,
} from "@/lib/cms-server";

const MAX_BUILDER_FIELDS = 25;

const GENERIC_PALETTE: {
  type: CmsFormFieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "date", label: "Date", icon: Calendar },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "radio", label: "Radio", icon: CircleDot },
  { type: "yes_no", label: "Yes / No", icon: ToggleLeft },
  { type: "select", label: "Dropdown", icon: ChevronDown },
  { type: "textarea", label: "Long Answer", icon: AlignLeft },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Phone", icon: Phone },
  { type: "number", label: "Number", icon: Hash },
  { type: "section_header", label: "Section", icon: LayoutTemplate },
];

const STAGE_PRESET_PALETTE: {
  key: string;
  label: string;
  field: Omit<CmsFormField, "id">;
}[] = [
  {
    key: "preset_crowd",
    label: "Audience Size",
    field: {
      name: "crowdSize",
      label: "Expected Audience Size",
      type: "select",
      placeholder: "Select Expected Crowd Size",
      tooltip: "Helps estimate sound/stage dynamics.",
      required: false,
      visible: true,
      width: "half",
      maxLength: 80,
      options: [
        "Under 250 VIPs",
        "250 – 800 Delegates",
        "800 – 2,500 Attendees",
        "2,500 – 15,000+ Arena Crowd",
      ],
      crmMapping: "crowdSize",
      conditionalRule: null,
    },
  },
  {
    key: "preset_budget",
    label: "Budget Range",
    field: {
      name: "budget",
      label: "Allocated Emcee Budget",
      type: "select",
      placeholder: "Select Budget Band",
      tooltip: "Indicative hosting fee allocation.",
      required: false,
      visible: true,
      width: "half",
      maxLength: 80,
      options: [
        "₹2,00,000 - ₹3,00,000",
        "₹3,50,000 - ₹5,00,000",
        "₹5,00,000 - ₹8,00,000",
        "Custom Multi-City Retainer",
      ],
      crmMapping: "budget",
      conditionalRule: null,
    },
  },
  {
    key: "preset_language",
    label: "Stage Languages",
    field: {
      name: "stageLanguage",
      label: "Preferred Hosting Language",
      type: "radio",
      placeholder: "",
      tooltip: "Sid hosts fluently in English, Hindi, and Hinglish.",
      required: false,
      visible: true,
      width: "full",
      maxLength: 60,
      options: ["English", "Hindi", "Hinglish (Blend)"],
      crmMapping: "custom",
      conditionalRule: null,
    },
  },
  {
    key: "preset_hybrid",
    label: "Livestream / Hybrid?",
    field: {
      name: "isLivestreamed",
      label: "Will this event be televised or livestreamed?",
      type: "yes_no",
      placeholder: "",
      tooltip: "Lets us align broadcast & cue-sheet requirements.",
      required: false,
      visible: true,
      width: "full",
      maxLength: 20,
      options: ["No", "Yes"],
      crmMapping: "custom",
      conditionalRule: null,
    },
  },
];

const CRM_MAPPING_OPTIONS: { value: CmsCrmFieldMapping; label: string }[] = [
  { value: "custom", label: "Custom Extra Field (Stored in JSON Payload)" },
  { value: "clientName", label: "CRM: Client / Organizer Name" },
  { value: "email", label: "CRM: Client Email Address" },
  { value: "phone", label: "CRM: Direct Phone / WhatsApp" },
  { value: "date", label: "CRM: Event Target Date (Live Conflict Lock)" },
  { value: "organization", label: "CRM: Organization / Brand Name" },
  { value: "city", label: "CRM: Event City / Destination" },
  { value: "format", label: "CRM: Event Format / Category" },
  { value: "packageTier", label: "CRM: Engagement Package Tier" },
  { value: "crowdSize", label: "CRM: Expected Audience Size" },
  { value: "budget", label: "CRM: Budget Indicator" },
  { value: "brief", label: "CRM: Run-of-Show / Event Brief" },
];

export interface AdminContactFormBuilderProps {
  draftForm: CmsContactFormConfig;
  formVersion: number;
  submissions: CmsFormSubmissionRecord[];
  canEditForms: boolean;
  canPublish: boolean;
  onDraftFormChange: (next: CmsContactFormConfig) => void;
  onSavedOrPublished: (result: {
    draftContactForm: CmsContactFormConfig;
    publishedContactForm: CmsContactFormConfig;
    version: number;
  }) => void;
  onSubmissionUpdated: (updated: CmsFormSubmissionRecord) => void;
}

export function AdminContactFormBuilder({
  draftForm,
  formVersion,
  submissions,
  canEditForms,
  canPublish,
  onDraftFormChange,
  onSavedOrPublished,
  onSubmissionUpdated,
}: AdminContactFormBuilderProps) {
  const [builderMode, setBuilderMode] = useState<"build" | "preview" | "submissions">(
    "build"
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    draftForm.fields[0]?.id ?? ""
  );
  const [inspectorTab, setInspectorTab] = useState<"settings" | "rules" | "mappings">(
    "settings"
  );
  const [saving, setSaving] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    submissions[0]?.id ?? ""
  );
  const [crmNoteDraft, setCrmNoteDraft] = useState("");

  const selectedField =
    draftForm.fields.find((f) => f.id === selectedFieldId) ?? draftForm.fields[0];

  const updateField = (fieldId: string, patch: Partial<CmsFormField>) => {
    if (!canEditForms) return;
    onDraftFormChange({
      ...draftForm,
      fields: draftForm.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
    });
  };

  const addGenericField = (type: CmsFormFieldType) => {
    if (!canEditForms) {
      toast.error("You need `cms.forms.manage` permission to modify form fields.");
      return;
    }
    if (draftForm.fields.length >= MAX_BUILDER_FIELDS) {
      toast.error(`Maximum of ${MAX_BUILDER_FIELDS} fields reached.`);
      return;
    }
    const idx = draftForm.fields.length + 1;
    const id = `fld_${type}_${Date.now().toString(36)}`;
    const newField: CmsFormField = {
      id,
      name: `custom_${type}_${idx}`,
      label:
        type === "section_header"
          ? "Additional Event Details"
          : `New ${type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} Field`,
      type,
      placeholder:
        type === "select" || type === "radio"
          ? "Choose an option"
          : `Enter ${type}...`,
      tooltip: "",
      required: false,
      visible: true,
      width: type === "textarea" || type === "section_header" ? "full" : "half",
      maxLength: type === "textarea" ? 1500 : 120,
      options:
        type === "select" || type === "radio"
          ? ["Option 1", "Option 2", "Option 3"]
          : type === "yes_no"
          ? ["No", "Yes"]
          : [],
      crmMapping: "custom",
      conditionalRule: null,
    };
    onDraftFormChange({
      ...draftForm,
      fields: [...draftForm.fields, newField],
    });
    setSelectedFieldId(id);
    toast.success(`Added "${newField.label}" to Contact Form.`);
  };

  const addPresetField = (preset: (typeof STAGE_PRESET_PALETTE)[number]) => {
    if (!canEditForms) return;
    if (draftForm.fields.some((f) => f.name === preset.field.name)) {
      toast.info(`"${preset.label}" is already on the form canvas.`);
      return;
    }
    const id = `fld_${preset.key}_${Date.now().toString(36)}`;
    const created: CmsFormField = { id, ...structuredClone(preset.field) };
    onDraftFormChange({
      ...draftForm,
      fields: [...draftForm.fields, created],
    });
    setSelectedFieldId(id);
    toast.success(`Added preset "${preset.label}" field.`);
  };

  const moveField = (fieldId: string, dir: -1 | 1) => {
    if (!canEditForms) return;
    const index = draftForm.fields.findIndex((f) => f.id === fieldId);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= draftForm.fields.length) return;
    const next = [...draftForm.fields];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    onDraftFormChange({ ...draftForm, fields: next });
  };

  const removeField = (fieldId: string) => {
    if (!canEditForms) return;
    if (draftForm.fields.length <= 2) {
      toast.error("Contact form must keep at least 2 fields.");
      return;
    }
    const next = draftForm.fields.filter((f) => f.id !== fieldId);
    onDraftFormChange({ ...draftForm, fields: next });
    if (selectedFieldId === fieldId && next[0]) {
      setSelectedFieldId(next[0].id);
    }
  };

  const handleSave = async (publishNow: boolean) => {
    setSaving(true);
    try {
      const res = await saveCmsContactFormServerFn({
        data: {
          formConfigJson: JSON.stringify(draftForm),
          publishNow,
        },
      });
      onSavedOrPublished(res);
      if (publishNow) {
        window.dispatchEvent(new Event("siddwhizz_cms_published"));
        toast.success(`Published Contact Form v${res.version} to live /contact page!`);
      } else {
        toast.success("Saved Contact Form draft.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save Contact Form.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCrm = async (
    sub: CmsFormSubmissionRecord,
    patch: {
      isRead?: boolean;
      crmStage?: CrmLeadStage;
      assignedStaffEmail?: string;
      note?: string;
    }
  ) => {
    try {
      const res = await updateCmsSubmissionCrmServerFn({
        data: {
          submissionId: sub.id,
          ...patch,
        },
      });
      onSubmissionUpdated(res.submission);
      toast.success("CRM lead record updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update CRM lead.");
    }
  };

  const unreadCount = submissions.filter((s) => !s.isRead).length;
  const activeSubmission =
    submissions.find((s) => s.id === selectedSubmissionId) ?? submissions[0];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* TOP BUILDER HEADER BAR (Modeled on Web Form Builder Reference) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary border border-primary/25">
              <LayoutTemplate className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-black uppercase tracking-tight text-foreground">
                Web Form Builder
              </p>
              <p className="text-[11px] text-muted-foreground">
                /contact • Version v{formVersion}
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="inline-flex rounded-xl border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setBuilderMode("build")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                builderMode === "build"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Build Canvas
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode("preview")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                builderMode === "preview"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Preview Form
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode("submissions")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                builderMode === "submissions"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" /> CRM Leads
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Field Usage Progress Meter */}
          <div className="hidden xl:flex items-center gap-2 pl-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {draftForm.fields.length} of {MAX_BUILDER_FIELDS} fields used
            </span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted border border-border">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((draftForm.fields.length / MAX_BUILDER_FIELDS) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Save / Publish Actions */}
        <div className="flex items-center gap-2">
          {canEditForms && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave(false)}
              className="btn-outline !py-1.5 !px-3.5 text-xs !normal-case cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-primary" /> Save Draft
            </button>
          )}
          {canEditForms && canPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave(true)}
              className="btn-red !py-1.5 !px-4 text-xs !normal-case cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5" /> Publish Form
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: 3-COLUMN VISUAL FORM BUILDER */}
      {builderMode === "build" && (
        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_320px] min-h-[620px] divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* LEFT COLUMN: COMPONENT PALETTE */}
          <div className="p-3.5 space-y-4 bg-muted/15 overflow-y-auto max-h-[700px]">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                Generic Fields
              </p>
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                {GENERIC_PALETTE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      disabled={!canEditForms}
                      onClick={() => addGenericField(item.type)}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card p-2.5 text-center text-xs font-semibold text-foreground shadow-2xs transition hover:border-primary hover:text-primary disabled:opacity-50 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-[11px] leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Stage Presets
              </p>
              <div className="space-y-1.5">
                {STAGE_PRESET_PALETTE.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    disabled={!canEditForms}
                    onClick={() => addPresetField(preset)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-xs font-semibold text-foreground transition hover:border-primary hover:bg-accent/50 cursor-pointer"
                  >
                    <span>{preset.label}</span>
                    <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: INTERACTIVE MULTI-ROW CANVAS */}
          <div className="p-5 bg-background/60 overflow-y-auto max-h-[700px] space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Form Title (Internal)
                  </label>
                  <input
                    type="text"
                    value={draftForm.name}
                    disabled={!canEditForms}
                    onChange={(e) =>
                      onDraftFormChange({ ...draftForm, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Submit CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={draftForm.submitButtonLabel}
                    disabled={!canEditForms}
                    onChange={(e) =>
                      onDraftFormChange({
                        ...draftForm,
                        submitButtonLabel: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Confirmation Toast Message
                </label>
                <input
                  type="text"
                  value={draftForm.successToastMessage}
                  disabled={!canEditForms}
                  onChange={(e) =>
                    onDraftFormChange({
                      ...draftForm,
                      successToastMessage: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* 2-Column Visual Field Grid */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {draftForm.fields.map((field, index) => {
                  const active = selectedField?.id === field.id;
                  return (
                    <div
                      key={field.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedFieldId(field.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedFieldId(field.id);
                        }
                      }}
                      className={`group relative rounded-xl p-3.5 transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        field.width === "full" ? "sm:col-span-2" : ""
                      } ${
                        active
                          ? "border-2 border-dashed border-primary bg-primary/5"
                          : "border border-border bg-background hover:border-primary/50"
                      } ${!field.visible ? "opacity-55" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span className="text-xs font-bold text-foreground truncate">
                            {field.label}
                          </span>
                          {field.required && (
                            <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[10px] font-extrabold text-primary">
                              Required
                            </span>
                          )}
                          {!field.visible && (
                            <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                              Hidden
                            </span>
                          )}
                          {field.conditionalRule && (
                            <span className="rounded bg-amber-500/15 px-1.5 py-0.2 text-[10px] font-bold text-amber-700">
                              If {field.conditionalRule.dependsOnFieldName}=
                              {field.conditionalRule.equalsValue}
                            </span>
                          )}
                        </div>

                        {/* Quick Row Actions */}
                        {canEditForms && (
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              title="Toggle 50% / 100% Width"
                              onClick={() =>
                                updateField(field.id, {
                                  width: field.width === "full" ? "half" : "full",
                                })
                              }
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                            >
                              {field.width === "full" ? (
                                <Columns2 className="h-3.5 w-3.5" />
                              ) : (
                                <Maximize2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              title="Move Up"
                              onClick={() => moveField(field.id, -1)}
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Move Down"
                              onClick={() => moveField(field.id, 1)}
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title={field.visible ? "Hide Field" : "Show Field"}
                              onClick={() =>
                                updateField(field.id, { visible: !field.visible })
                              }
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                            >
                              {field.visible ? (
                                <Eye className="h-3.5 w-3.5" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              title="Remove Field"
                              onClick={() => removeField(field.id)}
                              className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mock Field Input Preview */}
                      {field.type === "section_header" ? (
                        <div className="border-t border-border pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                          Section Divider Banner
                        </div>
                      ) : field.type === "textarea" ? (
                        <div className="h-14 rounded-lg border border-input bg-card px-3 py-2 text-xs text-muted-foreground">
                          {field.placeholder || field.label}
                        </div>
                      ) : field.type === "yes_no" ? (
                        <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-[11px] font-bold">
                          <span className="px-2.5 py-0.5 text-muted-foreground">No</span>
                          <span className="rounded bg-primary px-2.5 py-0.5 text-primary-foreground">
                            Yes
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-lg border border-input bg-card px-3 py-2 text-xs text-muted-foreground">
                          <span className="truncate">
                            {field.placeholder || field.label}
                          </span>
                          <span className="font-mono text-[10px] uppercase text-muted-foreground/70">
                            {field.type}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PROPERTIES INSPECTOR (`SETTINGS` | `RULES` | `MAPPINGS`) */}
          <div className="p-4 bg-card overflow-y-auto max-h-[700px] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-black uppercase tracking-tight text-foreground">
                Properties
              </h3>
              {selectedField && (
                <span className="font-mono text-[10px] rounded bg-muted px-2 py-0.5 text-muted-foreground">
                  {selectedField.type}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 border-b border-border text-xs font-bold">
              {(["settings", "rules", "mappings"] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setInspectorTab(tabKey)}
                  className={`pb-2 uppercase tracking-wider text-[11px] border-b-2 transition cursor-pointer ${
                    inspectorTab === tabKey
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tabKey}
                </button>
              ))}
            </div>

            {selectedField ? (
              <>
                {inspectorTab === "settings" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">
                        Field ID
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedField.id}
                        className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-[11px] text-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">
                        Field Key (`name`)
                      </label>
                      <input
                        type="text"
                        value={selectedField.name}
                        disabled={!canEditForms}
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            name: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                          })
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        disabled={!canEditForms}
                        onChange={(e) =>
                          updateField(selectedField.id, { label: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">
                        Field Input Type
                      </label>
                      <select
                        value={selectedField.type}
                        disabled={!canEditForms}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            type: e.target.value as CmsFormFieldType,
                          })
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                      >
                        {CMS_FORM_FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedField.type !== "section_header" && (
                      <>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={selectedField.placeholder}
                            disabled={!canEditForms}
                            onChange={(e) =>
                              updateField(selectedField.id, {
                                placeholder: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-muted-foreground block mb-1">
                            Tooltip / Helper Description
                          </label>
                          <textarea
                            rows={2}
                            value={selectedField.tooltip}
                            disabled={!canEditForms}
                            onChange={(e) =>
                              updateField(selectedField.id, { tooltip: e.target.value })
                            }
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">
                              Column Width
                            </label>
                            <select
                              value={selectedField.width}
                              disabled={!canEditForms}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  width: e.target.value as "half" | "full",
                                })
                              }
                              className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-semibold"
                            >
                              <option value="half">50% (Half Row)</option>
                              <option value="full">100% (Full Row)</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">
                              Max Characters
                            </label>
                            <input
                              type="number"
                              min={5}
                              max={5000}
                              value={selectedField.maxLength}
                              disabled={!canEditForms}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  maxLength: Number(e.target.value) || 120,
                                })
                              }
                              className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs"
                            />
                          </div>
                        </div>

                        {(selectedField.type === "select" ||
                          selectedField.type === "radio") && (
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">
                              Choices (One per line)
                            </label>
                            <textarea
                              rows={5}
                              value={selectedField.options.join("\n")}
                              disabled={!canEditForms}
                              onChange={(e) =>
                                updateField(selectedField.id, {
                                  options: e.target.value
                                    .split("\n")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
                            />
                          </div>
                        )}

                        <label className="flex items-center gap-2 pt-1 font-semibold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedField.required}
                            disabled={!canEditForms}
                            onChange={(e) =>
                              updateField(selectedField.id, {
                                required: e.target.checked,
                              })
                            }
                            className="h-4 w-4"
                          />
                          <span>Required field</span>
                        </label>
                      </>
                    )}
                  </div>
                )}

                {inspectorTab === "rules" && (
                  <div className="space-y-4 text-xs">
                    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <ListFilter className="h-3.5 w-3.5 text-primary" /> Conditional
                        Visibility Rule
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Only show "{selectedField.label}" when another field matches a
                        specific value.
                      </p>
                      <div>
                        <label className="font-semibold text-muted-foreground block mb-1">
                          Depends on Field
                        </label>
                        <select
                          value={selectedField.conditionalRule?.dependsOnFieldName ?? ""}
                          disabled={!canEditForms}
                          onChange={(e) => {
                            const dep = e.target.value;
                            updateField(selectedField.id, {
                              conditionalRule: dep
                                ? {
                                    dependsOnFieldName: dep,
                                    equalsValue:
                                      selectedField.conditionalRule?.equalsValue ?? "",
                                  }
                                : null,
                            });
                          }}
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs"
                        >
                          <option value="">Always Visible (No Condition)</option>
                          {draftForm.fields
                            .filter(
                              (f) =>
                                f.id !== selectedField.id &&
                                f.type !== "section_header"
                            )
                            .map((f) => (
                              <option key={f.id} value={f.name}>
                                {f.label} ({f.name})
                              </option>
                            ))}
                        </select>
                      </div>

                      {selectedField.conditionalRule && (
                        <div>
                          <label className="font-semibold text-muted-foreground block mb-1">
                            Equals Value
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Corporate Summit or Yes"
                            value={selectedField.conditionalRule.equalsValue}
                            disabled={!canEditForms}
                            onChange={(e) =>
                              updateField(selectedField.id, {
                                conditionalRule: {
                                  dependsOnFieldName:
                                    selectedField.conditionalRule!.dependsOnFieldName,
                                  equalsValue: e.target.value,
                                },
                              })
                            }
                            className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Anti-Spam &amp;
                        Abuse Protection
                      </p>
                      <label className="flex items-center gap-2 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draftForm.honeypotEnabled}
                          disabled={!canEditForms}
                          onChange={(e) =>
                            onDraftFormChange({
                              ...draftForm,
                              honeypotEnabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span>Enable hidden bot honeypot trap</span>
                      </label>
                      <div>
                        <label className="font-semibold text-muted-foreground block mb-1">
                          Max Submissions per IP (10 min window)
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={50}
                          value={draftForm.rateLimitPerTenMinutes}
                          disabled={!canEditForms}
                          onChange={(e) =>
                            onDraftFormChange({
                              ...draftForm,
                              rateLimitPerTenMinutes: Number(e.target.value) || 8,
                            })
                          }
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === "mappings" && (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-primary" /> Enquiries CRM Lead
                        Mapping
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Connect this form input directly to SiddWhizz's Enquiries &amp;
                        Contract Pipeline.
                      </p>
                      <select
                        value={selectedField.crmMapping}
                        disabled={!canEditForms}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            crmMapping: e.target.value as CmsCrmFieldMapping,
                          })
                        }
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-semibold"
                      >
                        {CRM_MAPPING_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Click any field on the canvas to configure its properties.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: LIVE INTERACTIVE FORM PREVIEW */}
      {builderMode === "preview" && (
        <div className="p-6 bg-background max-w-3xl mx-auto">
          <CmsDynamicContactForm
            formConfig={draftForm}
            heading="Send an Enquiry"
            subheading="Interactive draft preview — test conditional fields, validation rules, and date conflict badges."
            availabilityActiveLabel="Accepting 2026–27 Stage Dates"
            availabilityPausedLabel="Priority Waitlist Active"
            showLiveStageCalendarStrip
            previewMode
          />
        </div>
      )}

      {/* MODE 3: ENRICHED CRM SUBMISSIONS INBOX */}
      {builderMode === "submissions" && (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[520px] divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="divide-y divide-border overflow-y-auto max-h-[620px]">
            {submissions.length === 0 ? (
              <p className="p-6 text-xs text-muted-foreground text-center">
                No dynamic form submissions yet.
              </p>
            ) : (
              submissions.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubmissionId(sub.id);
                    if (!sub.isRead) {
                      void handleUpdateCrm(sub, { isRead: true });
                    }
                  }}
                  className={`w-full p-4 text-left transition cursor-pointer ${
                    activeSubmission?.id === sub.id
                      ? "bg-primary/8"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold text-foreground truncate">
                      {!sub.isRead && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary shrink-0"
                          title="Unread lead"
                        />
                      )}
                      {sub.clientName}
                    </span>
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {sub.crmStage}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {sub.organization || sub.eventFormat}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {sub.eventDate || "Date TBA"} • {sub.eventCity || "India"} • v
                    {sub.formVersion}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="p-5 space-y-4">
            {activeSubmission ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-black text-foreground">
                        {activeSubmission.clientName}
                      </h4>
                      <span className="font-mono text-xs text-primary font-bold">
                        {activeSubmission.mappedEnquiryId}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activeSubmission.clientEmail} • {activeSubmission.clientPhone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handleUpdateCrm(activeSubmission, {
                          isRead: !activeSubmission.isRead,
                        })
                      }
                      className="btn-outline !py-1.5 !px-3 text-xs !normal-case cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {activeSubmission.isRead ? "Mark Unread" : "Mark Read"}
                    </button>
                  </div>
                </div>

                {/* CRM Stage & Staff Assignment */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      CRM Lead Stage
                    </label>
                    <select
                      value={activeSubmission.crmStage}
                      onChange={(e) =>
                        void handleUpdateCrm(activeSubmission, {
                          crmStage: e.target.value as CrmLeadStage,
                        })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold"
                    >
                      {(
                        [
                          "New",
                          "Contacted",
                          "Qualified",
                          "Converted",
                          "Closed",
                        ] as CrmLeadStage[]
                      ).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-primary" /> Assigned Staff
                      Owner
                    </label>
                    <select
                      value={activeSubmission.assignedStaffEmail}
                      onChange={(e) =>
                        void handleUpdateCrm(activeSubmission, {
                          assignedStaffEmail: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                    >
                      <option value="admin@siddwhizz.com">
                        Siddharth Maurya (Super Admin)
                      </option>
                      <option value="ops@siddwhizz.com">
                        Neha Sharma (Operations Admin)
                      </option>
                      <option value="publisher@siddwhizz.com">
                        Aarav Mehta (CMS &amp; Brand Lead)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Submitted Dynamic Field Payload */}
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Submitted Form Fields (Form v{activeSubmission.formVersion})
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                    {Object.entries(activeSubmission.values).map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-lg border border-border bg-card p-2.5"
                      >
                        <span className="font-mono text-[10px] uppercase text-muted-foreground block">
                          {k}
                        </span>
                        <span className="font-semibold text-foreground break-words">
                          {v || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal CRM Notes */}
                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Internal CRM Notes
                  </p>
                  {activeSubmission.internalNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
                    >
                      {note}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={crmNoteDraft}
                      onChange={(e) => setCrmNoteDraft(e.target.value)}
                      placeholder="Add qualification or follow-up note..."
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!crmNoteDraft.trim()) return;
                        void handleUpdateCrm(activeSubmission, { note: crmNoteDraft });
                        setCrmNoteDraft("");
                      }}
                      className="btn-red !py-1.5 !px-3.5 text-xs !normal-case cursor-pointer"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Select a submission on the left to inspect its CRM record.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

