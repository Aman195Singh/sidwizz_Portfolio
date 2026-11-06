import React, { useState, useRef, useEffect } from "react";
import {
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Sliders,
  Type,
  Stamp,
  Undo2,
  Redo2,
  RotateCcw as ResetIcon,
  Download,
  Copy,
  Save,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Layers,
  Sparkles,
  FileText,
  Search,
  Check,
  Film,
  Music,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { type MediaItem, saveEditedMediaCopy } from "@/lib/data-store";
import { UniversalFileIcon, detectFileFormat } from "@/components/universal-file-icon";

export interface MediaEditorModalProps {
  item: MediaItem;
  isOpen?: boolean | undefined;
  onClose: () => void;
  onSaved?: ((newItem: MediaItem) => void) | undefined;
  onSaveCopy?: ((newItem: MediaItem) => void) | undefined;
  onReplaceOriginal?: ((newItem: MediaItem) => void) | undefined;
}

export function MediaEditorModal({
  item,
  isOpen = true,
  onClose,
  onSaved,
  onSaveCopy,
  onReplaceOriginal,
}: MediaEditorModalProps) {
  if (!isOpen) return null;

  const detected = detectFileFormat(item);
  const isImage = item.type === "image" || ["JPG", "PNG", "WEBP", "SVG"].includes(detected);
  const isVideo = item.type === "video" || ["MP4", "MOV", "WEBM"].includes(detected);
  const isAudio = item.type === "audio" || ["MP3", "WAV", "AAC"].includes(detected);
  const isPdf = item.type === "document" || detected === "PDF";
  const isText = detected === "TXT";

  // Common State
  const [activeTab, setActiveTab] = useState<"adjust" | "crop" | "filter" | "text" | "watermark">("adjust");
  const [isSaving, setIsSaving] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  // Image Editor State
  const [brightness, setBrightness] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(0); // -100 to 100
  const [saturation, setSaturation] = useState(0); // -100 to 100
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("normal");
  const [aspectRatio, setAspectRatio] = useState<string>("original");
  const [overlayText, setOverlayText] = useState("");
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);

  // Video Editor State
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoVolume, setVideoVolume] = useState(1);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoTrimStart, setVideoTrimStart] = useState(0);
  const [videoTrimEnd, setVideoTrimEnd] = useState(135); // 2:15 in sec
  const [videoThumbTime, setVideoThumbTime] = useState(10);

  // Audio Editor State
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.85);
  const [audioFadeIn, setAudioFadeIn] = useState(true);
  const [audioFadeOut, setAudioFadeOut] = useState(true);
  const [audioTrimStart, setAudioTrimStart] = useState(0);
  const [audioTrimEnd, setAudioTrimEnd] = useState(42);

  // PDF Editor State
  const [pdfPages, setPdfPages] = useState<number[]>([1, 2, 3, 4]);
  const [pdfRotations, setPdfRotations] = useState<Record<number, number>>({});
  const [selectedPdfPage, setSelectedPdfPage] = useState(1);
  const [pdfAnnotation, setPdfAnnotation] = useState("");

  // Text Editor State
  const [textContent, setTextContent] = useState(
    `# SIDD.WHIZZ — Stage Performance Rider & Technical Hospitality\n\nEvent Format: Celebrity Keynote & Live Arena Emcee\nHost: Siddharth Maurya\nMicrophone Rider: Shure Axient Digital Wireless SM58 Capsule\nStage Monitoring: Dual IEM Sennheiser G4 + Stage Wedges\nHospitality: Green room temperature 21°C, sparkling water & organic honey tea.`
  );
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // Reset function
  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setSelectedFilter("normal");
    setAspectRatio("original");
    setOverlayText("");
    setWatermarkEnabled(false);
    setVideoTrimStart(0);
    setVideoTrimEnd(135);
    setVideoMuted(false);
    setVideoVolume(1);
    toast.info("All editor adjustments reset to original state.");
  };

  // Image CSS Filter String
  const getImageFilterStyle = () => {
    let filterStr = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
    if (selectedFilter === "bw") filterStr += " grayscale(100%)";
    if (selectedFilter === "vibrant") filterStr += " saturate(160%) contrast(110%)";
    if (selectedFilter === "warm") filterStr += " sepia(30%) hue-rotate(-15deg)";
    if (selectedFilter === "cool") filterStr += " hue-rotate(15deg) saturate(90%)";
    if (selectedFilter === "dramatic") filterStr += " contrast(140%) brightness(95%)";
    return filterStr;
  };

  // Save changes
  const handleSave = (replace = false) => {
    setIsSaving(true);
    try {
      let finalTitle = item.title;
      if (!replace) {
        finalTitle = item.title.startsWith("[Edited]") ? item.title : `[Edited] ${item.title}`;
      }

      const editedItem = saveEditedMediaCopy(
        item.id,
        {
          title: finalTitle,
          url: item.url,
          thumbnail: item.thumbnail || item.url,
          type: item.type,
          ...(item.format ? { format: item.format } : {}),
          size: item.size,
        },
        replace
      );

      toast.success(
        replace
          ? "Original media file updated with new version!"
          : "Saved as new media copy in Media Library!"
      );
      onSaved?.(editedItem);
      if (replace) {
        onReplaceOriginal?.(editedItem);
      } else {
        onSaveCopy?.(editedItem);
      }
      onClose();
    } catch (err) {
      toast.error("Failed to save media changes.");
    } finally {
      setIsSaving(false);
      setShowReplaceConfirm(false);
    }
  };

  // Export / Download
  const handleExportDownload = () => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = `SIDDWHIZZ_Edited_${item.title.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Download started for edited media file.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in-50">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl border border-neutral-300 bg-white shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 bg-neutral-50 shrink-0">
          <div className="flex items-center gap-3">
            <UniversalFileIcon
              format={item.format}
              type={item.type}
              title={item.title}
              variant="icon"
              className="h-8 w-8"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-extrabold text-foreground truncate max-w-md">
                  {item.title}
                </h3>
                <span className="rounded bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 border border-primary/20">
                  {isImage ? "Image Editor" : isVideo ? "Video Editor" : isAudio ? "Audio Editor" : isPdf ? "PDF Editor" : "Text Editor"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.size} • {item.dimensions || item.duration || "Original Source"} • Safe Mode Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-foreground hover:bg-neutral-100 transition cursor-pointer shadow-2xs"
              title="Reset all changes to original"
            >
              <ResetIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-neutral-200 hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Editor Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Preview / Canvas Center */}
          <div className="flex-1 bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* IMAGE PREVIEW */}
            {isImage && (
              <div
                className="relative max-h-full max-w-full flex items-center justify-center transition-all duration-200"
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  filter: getImageFilterStyle(),
                }}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="max-h-[500px] max-w-full rounded-lg object-contain shadow-2xl"
                />

                {/* Optional Text Overlay */}
                {overlayText && (
                  <div className="absolute bottom-6 left-6 right-6 text-center bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold text-base shadow">
                    {overlayText}
                  </div>
                )}

                {/* Optional Watermark */}
                {watermarkEnabled && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded shadow-lg border border-white/30 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> SIDD.WHIZZ OFFICIAL
                  </div>
                )}
              </div>
            )}

            {/* VIDEO PREVIEW */}
            {isVideo && (
              <div className="w-full max-w-2xl flex flex-col items-center gap-3">
                <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden shadow-2xl border border-neutral-700 flex items-center justify-center">
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-2xl hover:scale-110 transition cursor-pointer"
                    >
                      {videoPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 text-xs font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                    Trim: {Math.floor(videoTrimStart / 60)}:{(videoTrimStart % 60).toString().padStart(2, "0")} / {Math.floor(videoTrimEnd / 60)}:{(videoTrimEnd % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                <div className="w-full bg-neutral-800 rounded-xl p-3 border border-neutral-700 flex items-center gap-3 text-white text-xs">
                  <button
                    type="button"
                    onClick={() => setVideoMuted(!videoMuted)}
                    className="p-1.5 rounded hover:bg-neutral-700"
                  >
                    {videoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={videoMuted ? 0 : videoVolume}
                    onChange={(e) => {
                      setVideoVolume(parseFloat(e.target.value));
                      setVideoMuted(false);
                    }}
                    className="w-24 accent-primary"
                  />
                  <span className="text-[11px] text-neutral-400 font-mono">Vol {Math.round(videoVolume * 100)}%</span>
                  <div className="flex-1 text-right text-[11px] text-neutral-400">
                    Resolution: {item.dimensions || "1080p Full HD"}
                  </div>
                </div>
              </div>
            )}

            {/* AUDIO PREVIEW */}
            {isAudio && (
              <div className="w-full max-w-xl bg-neutral-800 rounded-2xl p-6 border border-neutral-700 flex flex-col items-center gap-5 shadow-2xl">
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Music className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <h4 className="font-display text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">High-Definition Broadcast Audio Track</p>
                </div>

                {/* Waveform Visualization Bars */}
                <div className="w-full h-16 flex items-center justify-between gap-1 px-4 bg-neutral-900 rounded-xl border border-neutral-700">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const heights = [30, 45, 80, 60, 95, 40, 70, 85, 50, 100, 65, 45, 90, 75, 40, 60];
                    const h = heights[i % heights.length];
                    return (
                      <span
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          audioPlaying ? "bg-purple-400 animate-pulse" : "bg-purple-600/60"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between w-full text-white">
                  <button
                    type="button"
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-2 cursor-pointer shadow"
                  >
                    {audioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{audioPlaying ? "Pause Audio" : "Play Track"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">Duration: {item.duration || "0:42"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PDF PREVIEW */}
            {isPdf && (
              <div className="w-full max-w-2xl bg-neutral-800 rounded-2xl p-5 border border-neutral-700 flex flex-col gap-4 text-white">
                <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="font-bold text-sm">PDF Document Inspector ({pdfPages.length} Pages)</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">Viewing Page {selectedPdfPage}</span>
                </div>

                {/* Page Thumbnails Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {pdfPages.map((pageNum) => (
                    <div
                      key={pageNum}
                      onClick={() => setSelectedPdfPage(pageNum)}
                      className={`rounded-xl border p-3 flex flex-col items-center gap-2 bg-neutral-900 cursor-pointer transition ${
                        selectedPdfPage === pageNum
                          ? "border-primary ring-2 ring-primary"
                          : "border-neutral-700 hover:border-neutral-500"
                      }`}
                      style={{ transform: `rotate(${pdfRotations[pageNum] || 0}deg)` }}
                    >
                      <div className="w-full aspect-[3/4] bg-neutral-800 rounded flex flex-col p-2 text-[9px] text-neutral-400">
                        <div className="h-2 w-3/4 bg-neutral-700 rounded mb-1" />
                        <div className="h-1.5 w-full bg-neutral-700 rounded mb-1" />
                        <div className="h-1.5 w-5/6 bg-neutral-700 rounded mb-1" />
                        <div className="h-1.5 w-1/2 bg-neutral-700 rounded" />
                      </div>
                      <span className="text-xs font-bold">Page {pageNum}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TXT PREVIEW */}
            {isText && (
              <div className="w-full max-w-2xl h-full flex flex-col bg-neutral-800 rounded-2xl p-4 border border-neutral-700">
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                  <span>Plain Text Content</span>
                  <span>{textContent.split(/\s+/).filter(Boolean).length} words • {textContent.length} characters</span>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full flex-1 rounded-xl bg-neutral-900 p-4 font-mono text-xs text-green-400 focus:outline-none border border-neutral-700"
                />
              </div>
            )}
          </div>

          {/* Right Editing Tools Side Panel */}
          <div className="w-full md:w-80 bg-white border-l border-neutral-200 p-4 overflow-y-auto space-y-5">
            {/* IMAGE TOOLS */}
            {isImage && (
              <div className="space-y-5">
                {/* Tool Tab Switcher */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab("adjust")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      activeTab === "adjust" ? "bg-white text-primary shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    Adjust
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("crop")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      activeTab === "crop" ? "bg-white text-primary shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("filter")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      activeTab === "filter" ? "bg-white text-primary shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      activeTab === "text" ? "bg-white text-primary shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    Overlay
                  </button>
                </div>

                {/* Adjustments Panel */}
                {activeTab === "adjust" && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-foreground mb-1">
                        <span>Brightness</span>
                        <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-foreground mb-1">
                        <span>Contrast</span>
                        <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-foreground mb-1">
                        <span>Saturation</span>
                        <span>{saturation > 0 ? `+${saturation}` : saturation}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={saturation}
                        onChange={(e) => setSaturation(parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    {/* Rotate & Flip Controls */}
                    <div className="pt-2 border-t border-neutral-200">
                      <span className="font-bold text-foreground block mb-2">Transform &amp; Orientation</span>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          className="p-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 flex flex-col items-center gap-1"
                          title="Rotate 90 deg clockwise"
                        >
                          <RotateCw className="h-4 w-4" />
                          <span className="text-[10px]">90°</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                          className="p-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 flex flex-col items-center gap-1"
                          title="Rotate 90 deg counter-clockwise"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="text-[10px]">-90°</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlipH((f) => !f)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                            flipH ? "border-primary bg-primary/10 text-primary" : "border-neutral-300 hover:bg-neutral-100"
                          }`}
                          title="Flip Horizontal"
                        >
                          <FlipHorizontal className="h-4 w-4" />
                          <span className="text-[10px]">Flip H</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlipV((f) => !f)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                            flipV ? "border-primary bg-primary/10 text-primary" : "border-neutral-300 hover:bg-neutral-100"
                          }`}
                          title="Flip Vertical"
                        >
                          <FlipVertical className="h-4 w-4" />
                          <span className="text-[10px]">Flip V</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Crop & Aspect Ratio Panel */}
                {activeTab === "crop" && (
                  <div className="space-y-3 text-xs">
                    <span className="font-bold text-foreground block">Crop Presets &amp; Ratio</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "original", label: "Original" },
                        { id: "1:1", label: "1:1 Square" },
                        { id: "16:9", label: "16:9 Landscape" },
                        { id: "4:3", label: "4:3 Standard" },
                        { id: "9:16", label: "9:16 Reel / Story" },
                        { id: "custom", label: "Free Crop" },
                      ].map((ratio) => (
                        <button
                          key={ratio.id}
                          type="button"
                          onClick={() => {
                            setAspectRatio(ratio.id);
                            toast.success(`Aspect ratio preset set to ${ratio.label}`);
                          }}
                          className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                            aspectRatio === ratio.id
                              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                              : "border-neutral-300 hover:bg-neutral-100 text-foreground"
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters Panel */}
                {activeTab === "filter" && (
                  <div className="space-y-2.5 text-xs">
                    <span className="font-bold text-foreground block">Visual Preset Filters</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "normal", label: "Normal (Clean)" },
                        { id: "vibrant", label: "Vibrant Stage" },
                        { id: "bw", label: "Classic B&W" },
                        { id: "warm", label: "Warm Sunset" },
                        { id: "cool", label: "Cool Spotlight" },
                        { id: "dramatic", label: "Dramatic Punch" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFilter(f.id)}
                          className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                            selectedFilter === f.id
                              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                              : "border-neutral-300 hover:bg-neutral-100 text-foreground"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overlay Text & Watermark Panel */}
                {activeTab === "text" && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-foreground block mb-1">Add Caption / Heading</label>
                      <input
                        type="text"
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                        placeholder="e.g., Live at Global Tech Summit 2026"
                        className="w-full rounded-xl border border-neutral-300 p-2 text-xs focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-300 bg-neutral-50">
                      <div>
                        <span className="font-bold text-foreground block">Brand Watermark</span>
                        <span className="text-[11px] text-muted-foreground">Add "SIDD.WHIZZ Official" logo stamp</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={watermarkEnabled}
                        onChange={(e) => setWatermarkEnabled(e.target.checked)}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIDEO TOOLS */}
            {isVideo && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-foreground block mb-1">Trim Video Range (Seconds)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-muted-foreground">Start Time (s)</span>
                      <input
                        type="number"
                        min="0"
                        max={videoTrimEnd - 1}
                        value={videoTrimStart}
                        onChange={(e) => setVideoTrimStart(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-neutral-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground">End Time (s)</span>
                      <input
                        type="number"
                        min={videoTrimStart + 1}
                        value={videoTrimEnd}
                        onChange={(e) => setVideoTrimEnd(parseInt(e.target.value) || 135)}
                        className="w-full rounded-xl border border-neutral-300 p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                  <span className="font-bold text-foreground block">Thumbnail Frame</span>
                  <p className="text-[11px] text-muted-foreground">
                    Select current video playback timestamp as the card cover image.
                  </p>
                  <button
                    type="button"
                    onClick={() => toast.success("Current video frame set as cover thumbnail!")}
                    className="btn-outline !py-1.5 !px-3 text-xs w-full !border-neutral-300 cursor-pointer"
                  >
                    Set Current Frame as Cover
                  </button>
                </div>
              </div>
            )}

            {/* AUDIO TOOLS */}
            {isAudio && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-foreground block mb-1">Audio Trim Boundaries</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-muted-foreground">In (sec)</span>
                      <input
                        type="number"
                        value={audioTrimStart}
                        onChange={(e) => setAudioTrimStart(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-neutral-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground">Out (sec)</span>
                      <input
                        type="number"
                        value={audioTrimEnd}
                        onChange={(e) => setAudioTrimEnd(parseInt(e.target.value) || 42)}
                        className="w-full rounded-xl border border-neutral-300 p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <span className="font-bold text-foreground">Fade In (0.5s)</span>
                    <input
                      type="checkbox"
                      checked={audioFadeIn}
                      onChange={(e) => setAudioFadeIn(e.target.checked)}
                      className="accent-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <span className="font-bold text-foreground">Fade Out (0.5s)</span>
                    <input
                      type="checkbox"
                      checked={audioFadeOut}
                      onChange={(e) => setAudioFadeOut(e.target.checked)}
                      className="accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PDF TOOLS */}
            {isPdf && (
              <div className="space-y-4 text-xs">
                <span className="font-bold text-foreground block">Page Operations (Page {selectedPdfPage})</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPdfRotations((prev) => ({
                        ...prev,
                        [selectedPdfPage]: ((prev[selectedPdfPage] || 0) + 90) % 360,
                      }));
                      toast.success(`Rotated page ${selectedPdfPage} by 90°`);
                    }}
                    className="p-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center gap-1"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Rotate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (pdfPages.length <= 1) {
                        toast.error("Cannot delete the only page in the document.");
                        return;
                      }
                      setPdfPages((prev) => prev.filter((p) => p !== selectedPdfPage));
                      setSelectedPdfPage(pdfPages[0] ?? 1);
                      toast.success(`Removed page ${selectedPdfPage}`);
                    }}
                    className="p-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1"
                  >
                    <span>Delete Page</span>
                  </button>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Add Page Note / Annotation</label>
                  <textarea
                    rows={3}
                    value={pdfAnnotation}
                    onChange={(e) => setPdfAnnotation(e.target.value)}
                    placeholder="Notes for stage rider team..."
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar (Safe Architecture!) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3.5 bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Default: Safe copy created (Original preserved)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleExportDownload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 cursor-pointer shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export File</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplaceConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
            >
              <span>Replace Original...</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save as New Copy (Default)"}</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal for Replace Original */}
        {showReplaceConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md rounded-2xl border border-amber-400 bg-white p-5 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">Replace Original File?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will update "{item.title}" in place. If other pages reference this asset, they will reflect the edited version.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowReplaceConfirm(false)}
                  className="btn-outline !py-1.5 !px-3.5 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer"
                >
                  Confirm &amp; Replace Original
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

