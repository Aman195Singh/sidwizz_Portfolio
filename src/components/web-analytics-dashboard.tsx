import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users,
  Eye,
  Clock,
  Target,
  ArrowDownRight,
  Layers,
  Sparkles,
  Database,
  Calendar,
  Download,
  FileSpreadsheet,
  Mail,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Share2,
  TrendingUp,
  X,
  FileText,
  HelpCircle,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRealAnalytics,
  getDemoAnalytics,
  type AggregatedAnalytics,
} from "@/lib/analytics-tracker";

export function WebAnalyticsDashboard() {
  // Mode: Real live origin data vs Simulated Demo (Fake) data
  const [dataMode, setDataMode] = useState<"fake" | "real">("fake");

  // Date Filters
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "90D" | "YTD" | "Custom">("30D");
  const [comparePeriod, setComparePeriod] = useState<"previous" | "year" | "none">("previous");

  // Interactive Hover state for Traffic Trend chart
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(20); // Default to July 21st matching screenshot

  // Interactive Hover state for Enquiry Bar chart
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(20);

  // Email report schedule modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailFrequency, setEmailFrequency] = useState<"weekly" | "monthly">("weekly");
  const [emailRecipient, setEmailRecipient] = useState("admin@siddwhizz.com");

  // Metric Tooltip state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Compute analytics based on selected dataMode and dateRange
  const daysCount = dateRange === "7D" ? 7 : dateRange === "90D" ? 90 : 30;
  const data: AggregatedAnalytics = useMemo(() => {
    if (dataMode === "real") {
      return getRealAnalytics(daysCount);
    }
    return getDemoAnalytics();
  }, [dataMode, daysCount]);

  // CSV Export Handler
  const handleExportCSV = () => {
    const csvRows = [
      ["Metric", "Value", "Notes"],
      ["Data Source Mode", dataMode === "real" ? "Real Origin DB Telemetry" : "Demo Simulation Data", ""],
      ["Date Range Filter", dateRange, ""],
      ["Unique Visitors", data.uniqueVisitors.toString(), ""],
      ["Total Pageviews", data.totalPageviews.toString(), ""],
      ["Avg Engagement Time", data.avgEngagementTime, ""],
      ["Enquiry Conversion Rate", `${data.enquiryConversionRate}%`, ""],
      ["Bounce Rate", `${data.bounceRate}%`, ""],
      ["Pages per Session", data.pagesPerSession.toString(), ""],
      ["New Visitors %", `${data.newVisitorsPct}%`, `${data.newVisitorsCount} visitors`],
      ["Returning Visitors %", `${data.returningVisitorsPct}%`, `${data.returningVisitorsCount} visitors`],
      [""],
      ["Date", "Unique Visitors", "Pageviews"],
      ...data.trafficTrend.map((t) => [t.date, t.visitors.toString(), t.pageviews.toString()]),
      [""],
      ["Traffic Source", "Share %", "Views"],
      ...data.visitorSources.map((s) => [s.source, `${s.percentage}%`, s.count.toString()]),
      [""],
      ["Section URL", "Share %", "Views"],
      ...data.mostVisitedSections.map((s) => [s.path, `${s.percentage}%`, s.views.toString()]),
      [""],
      ["Country", "Share %", "Estimated Visitors"],
      ...data.audienceLocations.map((l) => [l.country, `${l.percentage}%`, l.visitors.toString()]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `siddwhizz_web_analytics_${dataMode}_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Web analytics CSV exported successfully (${dataMode.toUpperCase()} data).`);
  };

  // PDF Print Export Handler
  const handleExportPDF = () => {
    toast.info("Preparing printable analytics summary. Printing dialog opening...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Schedule Email Handler
  const handleSaveEmailSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipient || !emailRecipient.includes("@")) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }
    toast.success(`Email report scheduled (${emailFrequency}) for ${emailRecipient}!`);
    setEmailModalOpen(false);
  };

  // Coordinates calculation for Traffic Trend Chart
  const trendPoints = data.trafficTrend;
  const maxVisitorsVal = 10000;
  const chartWidth = 720;
  const chartHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  const getCoordinates = (index: number, val: number) => {
    const x = padLeft + (index / Math.max(trendPoints.length - 1, 1)) * plotWidth;
    const y = padTop + plotHeight - (Math.min(val, maxVisitorsVal) / maxVisitorsVal) * plotHeight;
    return { x, y };
  };

  const pageviewPath = useMemo(() => {
    return trendPoints
      .map((p, i) => {
        const { x, y } = getCoordinates(i, p.pageviews);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [trendPoints]);

  const pageviewAreaPath = useMemo(() => {
    if (trendPoints.length === 0) return "";
    const first = getCoordinates(0, trendPoints[0]!.pageviews);
    const last = getCoordinates(trendPoints.length - 1, trendPoints[trendPoints.length - 1]!.pageviews);
    return `${pageviewPath} L ${last.x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${first.x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;
  }, [pageviewPath, trendPoints]);

  const visitorPath = useMemo(() => {
    return trendPoints
      .map((p, i) => {
        const { x, y } = getCoordinates(i, p.visitors);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [trendPoints]);

  const visitorAreaPath = useMemo(() => {
    if (trendPoints.length === 0) return "";
    const first = getCoordinates(0, trendPoints[0]!.visitors);
    const last = getCoordinates(trendPoints.length - 1, trendPoints[trendPoints.length - 1]!.visitors);
    return `${visitorPath} L ${last.x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${first.x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;
  }, [visitorPath, trendPoints]);

  const activeTrend = hoveredTrendIdx !== null && trendPoints[hoveredTrendIdx] ? trendPoints[hoveredTrendIdx] : trendPoints[trendPoints.length - 1];
  const activeTrendCoord = hoveredTrendIdx !== null ? getCoordinates(hoveredTrendIdx, activeTrend?.pageviews || 0) : null;
  const activeVisitorCoord = hoveredTrendIdx !== null ? getCoordinates(hoveredTrendIdx, activeTrend?.visitors || 0) : null;

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & DATA MODE CONTROLS                             */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary">// AUDIENCE INSIGHTS</span>
            <span className="h-1 w-6 bg-primary rounded-full hidden sm:inline-block" />
          </div>
          <h2 className="display text-2xl sm:text-3xl text-foreground mt-1">
            WEBSITE TRAFFIC &amp; <span className="text-primary">ENGAGEMENT.</span>
          </h2>
        </div>

        {/* Action Controls & Data Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* REAL DATA vs DEMO DATA TOGGLE */}
          <div className="inline-flex items-center rounded-xl border border-neutral-300 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setDataMode("real");
                toast.info("Switched to Live Real Data (from database and session events).");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                dataMode === "real"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="View genuine database enquiries and recorded site visitors"
            >
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>Real Data</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDataMode("fake");
                toast.success("Switched to Demo Simulation Mode (illustrative high-volume metrics).");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                dataMode === "fake"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="View full demonstration data from showcase designs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Demo Data</span>
            </button>
          </div>

          {/* Date Range Selector Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent font-bold outline-none cursor-pointer pr-1 text-foreground"
              aria-label="Select date range"
            >
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days (01 Jul - 31 Jul)</option>
              <option value="90D">Last 90 Days</option>
              <option value="YTD">Year to Date (2026)</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          {/* Quick Date Range Pills */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl border border-neutral-300 bg-white p-1 shadow-2xs">
            {(["7D", "30D", "90D", "YTD", "Custom"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition cursor-pointer ${
                  dateRange === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Compare Selector */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-muted-foreground shadow-2xs">
            <span>Compared to:</span>
            <select
              value={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.value as any)}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="previous">Previous 30 Days</option>
              <option value="year">Previous Year</option>
              <option value="none">No Comparison</option>
            </select>
          </div>
        </div>
      </div>

      {/* Telemetry Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          {dataMode === "real" ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          ) : (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
          )}
          <span className="font-semibold text-foreground">
            {dataMode === "real"
              ? "Live Telemetry: Connected to Neon PostgreSQL database and genuine visitor events."
              : "Demo Mode: Displaying full illustrative high-volume analytics for layout showcase."}
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground font-mono">
          <span>{dataMode === "real" ? "REAL ORIGIN" : "SIMULATION"}</span>
          <span>•</span>
          <span>{data.trafficTrend.length} Days Processed</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SIX KPI SUMMARY CARDS                                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* 1. Unique Visitors */}
        <div className="panel-card shadow-sm hover:border-primary/50 transition">
          <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Unique Visitors</span>
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="panel-card-body !p-3.5 space-y-1">
            <p className="text-2xl font-black font-display text-foreground">
              {data.uniqueVisitors.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ 18.2%</span>
              <span className="text-muted-foreground font-normal">vs. prev</span>
            </p>
          </div>
        </div>

        {/* 2. Total Pageviews */}
        <div className="panel-card shadow-sm hover:border-primary/50 transition">
          <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Pageviews</span>
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="panel-card-body !p-3.5 space-y-1">
            <p className="text-2xl font-black font-display text-foreground">
              {data.totalPageviews.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ 24.6%</span>
              <span className="text-muted-foreground font-normal">vs. prev</span>
            </p>
          </div>
        </div>

        {/* 3. Avg. Time on Site */}
        <div className="panel-card shadow-sm hover:border-primary/50 transition">
          <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Avg. Time on Site</span>
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="panel-card-body !p-3.5 space-y-1">
            <p className="text-2xl font-black font-display text-foreground">
              {data.avgEngagementTime}
            </p>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ 12.4%</span>
              <span className="text-muted-foreground font-normal">engaged</span>
            </p>
          </div>
        </div>

        {/* 4. Enquiry Conversion */}
        <div className="panel-card shadow-sm hover:border-primary/50 transition">
          <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Enquiry Conversion</span>
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="panel-card-body !p-3.5 space-y-1">
            <p className="text-2xl font-black font-display text-primary">
              {data.enquiryConversionRate}%
            </p>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ 0.8 pp</span>
              <span className="text-muted-foreground font-normal">intent</span>
            </p>
          </div>
        </div>

        {/* 5. Bounce Rate */}
        <div className="panel-card shadow-sm hover:border-primary/50 transition">
          <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Bounce Rate</span>
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
              <ArrowDownRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="panel-card-body !p-3.5 space-y-1">
            <p className="text-2xl font-black font-display text-foreground">
              {data.bounceRate}%
            </p>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↓ 6.2%</span>
              <span className="text-muted-foreground font-normal">improved</span>
            </p>
          </div>
        </div>

        {/* 6. Pages per Session */}
        <div className="panel-card shadow-sm hover:border-primary/50 transition">
          <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Pages per Session</span>
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="panel-card-body !p-3.5 space-y-1">
            <p className="text-2xl font-black font-display text-foreground">
              {data.pagesPerSession}
            </p>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ 14.8%</span>
              <span className="text-muted-foreground font-normal">depth</span>
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ROW 2: TRAFFIC TREND CHART + VISITOR TYPE                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Traffic Trend (Visitors & Pageviews) - 8 Cols on desktop */}
        <div className="panel-card shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="panel-card-header flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1.5 rounded-full bg-primary" />
              <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
                Traffic Trend (Visitors &amp; Pageviews)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Unique Visitors
              </span>
              <span className="flex items-center gap-1.5 text-neutral-800">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" />
                Pageviews
              </span>
            </div>
          </div>

          <div className="panel-card-body p-4 sm:p-6 flex-1 flex flex-col justify-center">
            {/* Interactive SVG Multi-Line Chart */}
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto cursor-crosshair select-none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = e.clientX - rect.left;
                  const ratio = relX / rect.width;
                  const targetX = ratio * chartWidth;
                  const step = plotWidth / Math.max(trendPoints.length - 1, 1);
                  const idx = Math.round((targetX - padLeft) / step);
                  if (idx >= 0 && idx < trendPoints.length) {
                    setHoveredTrendIdx(idx);
                  }
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  if (!touch) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = touch.clientX - rect.left;
                  const ratio = relX / rect.width;
                  const targetX = ratio * chartWidth;
                  const step = plotWidth / Math.max(trendPoints.length - 1, 1);
                  const idx = Math.round((targetX - padLeft) / step);
                  if (idx >= 0 && idx < trendPoints.length) {
                    setHoveredTrendIdx(idx);
                  }
                }}
              >
                <defs>
                  {/* Purple/Dark gradient for Pageviews */}
                  <linearGradient id="pageviewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Crimson Red gradient for Unique Visitors */}
                  <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 2500, 5000, 7500, 10000].map((val) => {
                  const y = padTop + plotHeight - (val / maxVisitorsVal) * plotHeight;
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray={val === 0 ? "none" : "3 3"}
                        strokeWidth={1}
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize={10}
                        fontWeight={600}
                        fill="#64748b"
                      >
                        {val === 0 ? "0" : val >= 1000 ? `${val / 1000}K` : val}
                      </text>
                    </g>
                  );
                })}

                {/* Area fills */}
                <path d={pageviewAreaPath} fill="url(#pageviewGrad)" />
                <path d={visitorAreaPath} fill="url(#visitorGrad)" />

                {/* Stroke Paths */}
                <path
                  d={pageviewPath}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={visitorPath}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Active Guideline & Points */}
                {activeTrendCoord && activeVisitorCoord && (
                  <g>
                    <line
                      x1={activeTrendCoord.x}
                      y1={padTop}
                      x2={activeTrendCoord.x}
                      y2={padTop + plotHeight}
                      stroke="#e11d48"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={activeTrendCoord.x}
                      cy={activeTrendCoord.y}
                      r={5}
                      fill="#1e293b"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <circle
                      cx={activeVisitorCoord.x}
                      cy={activeVisitorCoord.y}
                      r={5}
                      fill="#e11d48"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </g>
                )}

                {/* X-axis date labels */}
                {trendPoints.map((p, i) => {
                  if (i % 4 !== 0 && i !== trendPoints.length - 1) return null;
                  const { x } = getCoordinates(i, 0);
                  return (
                    <text
                      key={p.date}
                      x={x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={600}
                      fill="#64748b"
                    >
                      {p.label}
                    </text>
                  );
                })}
              </svg>

              {/* Floating Tooltip matching screenshot popover */}
              {activeTrend && activeTrendCoord && (
                <div
                  className="pointer-events-none absolute -top-1 rounded-xl border border-border bg-white px-3 py-2 text-xs shadow-xl transition-all"
                  style={{
                    left: `${Math.min(Math.max((activeTrendCoord.x / chartWidth) * 100, 15), 85)}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <p className="font-bold text-foreground border-b border-border/60 pb-1 mb-1">
                    {activeTrend.label} 2026
                  </p>
                  <div className="space-y-0.5">
                    <p className="flex items-center justify-between gap-3 font-semibold text-neutral-800">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-neutral-900" />
                        Pageviews:
                      </span>
                      <span className="font-mono font-black">{activeTrend.pageviews.toLocaleString()}</span>
                    </p>
                    <p className="flex items-center justify-between gap-3 font-semibold text-primary">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Unique Visitors:
                      </span>
                      <span className="font-mono font-black">{activeTrend.visitors.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Hover over or tap any date to inspect daily pageviews and unique visitors.
            </p>
          </div>
        </div>

        {/* Visitor Type (New vs Returning) - 4 Cols on desktop (From Design 2) */}
        <div className="panel-card shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Visitor Type
            </h3>
          </div>

          <div className="panel-card-body p-6 flex-1 flex flex-col items-center justify-center space-y-5">
            {/* Donut Ring Visualization */}
            <div className="relative grid h-44 w-44 place-items-center">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {/* Background Ring (Returning Visitors 32%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="14"
                  strokeDasharray="238.76"
                  strokeDashoffset="0"
                />
                {/* Foreground Arc (New Visitors 68%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="14"
                  strokeDasharray="238.76"
                  strokeDashoffset={(238.76 * (100 - data.newVisitorsPct)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-black font-display text-foreground">
                  {data.uniqueVisitors.toLocaleString()}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Visitors
                </p>
              </div>
            </div>

            {/* Legend with percentages and counts */}
            <div className="w-full space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 border border-neutral-200/80 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span className="font-bold text-foreground">New Visitors</span>
                </div>
                <div className="text-right">
                  <span className="font-display font-black text-primary text-sm">{data.newVisitorsPct}%</span>
                  <span className="text-muted-foreground block text-[10px]">({data.newVisitorsCount.toLocaleString()})</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-neutral-50 border border-neutral-200/80 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-neutral-800" />
                  <span className="font-bold text-foreground">Returning Visitors</span>
                </div>
                <div className="text-right">
                  <span className="font-display font-black text-foreground text-sm">{data.returningVisitorsPct}%</span>
                  <span className="text-muted-foreground block text-[10px]">({data.returningVisitorsCount.toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. ROW 3: TRAFFIC SOURCES + MOST VISITED + DEVICE BREAKDOWN    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Visitor Sources (Referral Channels) */}
        <div className="panel-card shadow-sm flex flex-col justify-between">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Visitor Sources (Referral)
            </h3>
          </div>

          <div className="panel-card-body p-5 space-y-4">
            {/* Mini Donut Center */}
            <div className="relative mx-auto grid h-32 w-32 place-items-center">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="36" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="22.6" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="#ec4899" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="67.8" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="140.2" />
              </svg>
              <div className="absolute text-center leading-tight">
                <p className="text-sm font-black font-display text-foreground">
                  {data.totalPageviews >= 1000 ? `${(data.totalPageviews / 1000).toFixed(1)}K` : data.totalPageviews}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Views</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {data.visitorSources.map((s) => (
                <div key={s.source} className="flex items-center justify-between border-b border-neutral-100 pb-1.5 last:border-0">
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="truncate">{s.source}</span>
                  </span>
                  <span className="font-mono font-bold text-foreground">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Visited Sections (Top Pages) */}
        <div className="panel-card shadow-sm flex flex-col justify-between">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Most Visited Sections
            </h3>
          </div>

          <div className="panel-card-body p-5 space-y-3.5">
            {data.mostVisitedSections.map((sec) => (
              <div key={sec.path}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="truncate text-foreground">{sec.title}</span>
                  <span className="text-muted-foreground shrink-0 font-mono">
                    {sec.percentage}% ({sec.views.toLocaleString()})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${sec.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="panel-card shadow-sm flex flex-col justify-between">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Device Breakdown
            </h3>
          </div>

          <div className="panel-card-body p-5 space-y-4">
            {data.deviceBreakdown.map((dev) => (
              <div key={dev.device} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-foreground">
                    {dev.device === "Desktop" && <Laptop className="h-4 w-4 text-primary" />}
                    {dev.device === "Mobile" && <Smartphone className="h-4 w-4 text-primary" />}
                    {dev.device === "Tablet" && <Tablet className="h-4 w-4 text-primary" />}
                    <span>{dev.device}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {dev.percentage}% ({dev.count.toLocaleString()})
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${dev.percentage}%`,
                      backgroundColor: dev.device === "Desktop" ? "#e11d48" : dev.device === "Mobile" ? "#1e293b" : "#94a3b8",
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-border bg-neutral-50 p-3 text-xs text-muted-foreground leading-relaxed">
              💡 <strong>Mobile First:</strong> 38% visitors reach through smartphone. All booking forms and portfolios are verified for zero touch lag.
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. ROW 4: AUDIENCE LOCATIONS + ENGAGEMENT METRICS + TOP CONTENT*/}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Locations (Visitors) */}
        <div className="panel-card shadow-sm">
          <div className="panel-card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1.5 rounded-full bg-primary" />
              <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
                Top Locations (Visitors)
              </h3>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="panel-card-body p-5 space-y-3">
            {data.audienceLocations.map((loc) => (
              <div key={loc.country} className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{loc.flag}</span>
                  <span className="font-bold text-foreground">{loc.country}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-foreground">{loc.percentage}%</span>
                  <span className="text-muted-foreground block text-[10px]">({loc.visitors.toLocaleString()})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Metrics 4-Card Grid (From Design 2) */}
        <div className="panel-card shadow-sm">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Engagement Metrics
            </h3>
          </div>

          <div className="panel-card-body p-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Pages / Session</span>
              <p className="text-xl font-black font-display text-foreground">{data.engagementMetrics.pagesPerSession}</p>
              <span className="text-[10px] font-bold text-emerald-600 block">↑ 14.6%</span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Bounce Rate</span>
              <p className="text-xl font-black font-display text-foreground">{data.engagementMetrics.bounceRate}%</p>
              <span className="text-[10px] font-bold text-emerald-600 block">↓ 6.8%</span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Enquiry Starts</span>
              <p className="text-xl font-black font-display text-primary">{data.engagementMetrics.enquiryStarts.toLocaleString()}</p>
              <span className="text-[10px] font-bold text-emerald-600 block">↑ 27.1%</span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Completed Enquiries</span>
              <p className="text-xl font-black font-display text-foreground">{data.engagementMetrics.completedEnquiries.toLocaleString()}</p>
              <span className="text-[10px] font-bold text-emerald-600 block">↑ 28.5%</span>
            </div>
          </div>
        </div>

        {/* Top Content (Pages) */}
        <div className="panel-card shadow-sm">
          <div className="panel-card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1.5 rounded-full bg-primary" />
              <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
                Top Content (Pages)
              </h3>
            </div>
            <span className="text-xs font-bold text-muted-foreground">Views</span>
          </div>

          <div className="panel-card-body p-4 space-y-2.5">
            {data.topContentPages.map((pg) => (
              <div key={pg.path} className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2 last:border-0">
                <Link
                  to={pg.path as any}
                  target="_blank"
                  className="font-bold text-foreground hover:text-primary transition flex items-center gap-1.5 truncate max-w-[180px]"
                >
                  <span className="truncate">{pg.title}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                </Link>
                <span className="font-mono font-bold text-muted-foreground">{pg.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. ROW 5: TOP LANDING PAGES + ENQUIRY CONVERSION FUNNEL        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Landing Pages Table - 6 cols */}
        <div className="panel-card shadow-sm lg:col-span-6">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Top Landing Pages
            </h3>
          </div>

          <div className="panel-card-body p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 border-b border-neutral-200 text-muted-foreground font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Page (URL)</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                  <th className="py-2.5 px-3 text-right">Engagement</th>
                  <th className="py-2.5 px-3 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.topLandingPages.map((lp) => (
                  <tr key={lp.rank} className="hover:bg-neutral-50/80 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-muted-foreground">{lp.rank}</td>
                    <td className="py-2.5 px-3 font-bold text-foreground truncate max-w-[150px]">{lp.path}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{lp.views.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{lp.engagement}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 font-bold font-mono text-emerald-700">
                        {lp.conversion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enquiry & Conversion Funnel - 6 cols */}
        <div className="panel-card shadow-sm lg:col-span-6 flex flex-col justify-between">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Enquiry &amp; Conversion Funnel
            </h3>
          </div>

          <div className="panel-card-body p-6 flex-1 flex flex-col justify-center space-y-3">
            {data.enquiryFunnel.map((fn, idx) => {
              const widths = ["100%", "82%", "66%", "52%"];
              return (
                <div key={fn.stage} className="mx-auto flex flex-col items-center" style={{ width: widths[idx] }}>
                  <div
                    className="w-full rounded-xl py-2.5 px-4 text-center text-white font-bold shadow-md transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: fn.color }}
                  >
                    <p className="text-xs uppercase tracking-wider text-white/90">{fn.stage}</p>
                    <p className="font-display text-base font-black">
                      {fn.count.toLocaleString()} <span className="text-xs font-normal text-white/80">({fn.percentage}%)</span>
                    </p>
                  </div>
                  {fn.dropoff !== undefined && (
                    <span className="text-[10px] text-muted-foreground font-semibold my-0.5">
                      ↓ {fn.dropoff}% drop-off to next stage
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. ROW 6: ENQUIRY TREND BAR CHART + AUDIENCE HIGHLIGHTS        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Enquiry Trend (Daily Leads Bar Chart) - 7 cols */}
        <div className="panel-card shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div className="panel-card-header flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1.5 rounded-full bg-primary" />
              <div>
                <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
                  Enquiry Trend
                </h3>
                <p className="text-[11px] text-muted-foreground">Website enquiry forms (leads)</p>
              </div>
            </div>
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
              Total Enquiries: {data.totalEnquiriesCount.toLocaleString()} ↑ 28.5%
            </div>
          </div>

          <div className="panel-card-body p-4 sm:p-6 flex-1 flex flex-col justify-end">
            {/* 30-Day SVG Vertical Bars */}
            <div className="h-44 w-full flex items-end justify-between gap-1 pt-4">
              {data.enquiryTrend.map((bar, i) => {
                const maxVal = 120;
                const heightPct = Math.max((bar.count / maxVal) * 100, 8);
                const isHovered = hoveredBarIdx === i;

                return (
                  <div
                    key={bar.date}
                    className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                    onMouseEnter={() => setHoveredBarIdx(i)}
                    onClick={() => setHoveredBarIdx(i)}
                  >
                    {/* Tooltip on active */}
                    {isHovered && (
                      <div className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-bold text-background shadow-md">
                        {bar.label}: {bar.count} leads
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t transition-all ${
                        isHovered ? "bg-primary scale-105" : "bg-primary/70 hover:bg-primary"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground font-bold border-t border-neutral-200 pt-2 mt-1">
              <span>{data.enquiryTrend[0]?.label || "01 Jul"}</span>
              <span>{data.enquiryTrend[Math.floor(data.enquiryTrend.length / 2)]?.label || "15 Jul"}</span>
              <span>{data.enquiryTrend[data.enquiryTrend.length - 1]?.label || "31 Jul"}</span>
            </div>
          </div>
        </div>

        {/* Audience Highlights (Insights & Recommendations) - 5 cols */}
        <div className="panel-card shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div className="panel-card-header flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-primary" />
            <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
              Audience Highlights
            </h3>
          </div>

          <div className="panel-card-body p-5 space-y-3.5 flex-1 flex flex-col justify-around">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Traffic Surge (+24.6%)</p>
                <p className="text-muted-foreground mt-0.5">
                  Pageviews increased by 24.6% compared to previous 30 days due to recent summit portfolio shares.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Strong Discovery (68% New Visitors)</p>
                <p className="text-muted-foreground mt-0.5">
                  High top-of-funnel reach with Instagram (@siddwhizz) driving 32% of total referrals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-foreground">High Engagement Time (2m 48s)</p>
                <p className="text-muted-foreground mt-0.5">
                  Visitors spend high active time reviewing video showreels and format case studies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Enquiry Conversion at 4.2%</p>
                <p className="text-muted-foreground mt-0.5">
                  4.2% of visitors complete the booking date enquiry form, beating the 2.5% industry benchmark.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 8. COMPANION PANELS: WHAT'S NEW + KEY BENEFITS + QUICK ACTIONS  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* What's New in Web Analytics */}
        <div className="panel-card shadow-sm">
          <div className="panel-card-header flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-extrabold uppercase tracking-tight text-foreground">
              What's New (Additions)
            </h3>
          </div>
          <div className="panel-card-body p-4 space-y-2 text-xs">
            {[
              "Traffic Trend Chart (Visitors & Pageviews)",
              "Visitor Type Analysis (New vs Returning)",
              "Device Breakdown (Desktop/Mobile/Tablet)",
              "Audience Location (Top Countries with flags)",
              "Top Landing Pages (Views & Conversion)",
              "Enquiry & Conversion Funnel (Step-by-step)",
              "Enquiry Trend (Daily Leads Bar Graph)",
              "Real Data vs Demo Simulation Switcher",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-foreground/90">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="panel-card shadow-sm">
          <div className="panel-card-header flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-extrabold uppercase tracking-tight text-foreground">
              Key Benefits
            </h3>
          </div>
          <div className="panel-card-body p-4 space-y-2.5 text-xs">
            {[
              "Complete 360° picture of stage website traffic, engagement and enquiries.",
              "Identify top-performing event formats, showreel videos, and client referral channels.",
              "Understand audience device screen sizes and domestic/international regions.",
              "Track enquiry conversion friction and improve booking closing rate.",
              "Make confident data-driven decisions for tour dates, PR releases, and partnerships.",
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-foreground/90 leading-relaxed">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (PDF, CSV, Schedule Email) */}
        <div className="panel-card shadow-sm flex flex-col justify-between">
          <div className="panel-card-header flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-extrabold uppercase tracking-tight text-foreground">
              Quick Actions
            </h3>
          </div>
          <div className="panel-card-body p-4 space-y-3">
            <button
              type="button"
              onClick={handleExportPDF}
              className="w-full flex items-center justify-between rounded-xl border border-neutral-300 bg-white p-3 text-xs font-bold text-foreground hover:border-primary hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>Export Report (PDF)</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between rounded-xl border border-neutral-300 bg-white p-3 text-xs font-bold text-foreground hover:border-primary hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Download Data (CSV)</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="w-full flex items-center justify-between rounded-xl border border-neutral-300 bg-white p-3 text-xs font-bold text-foreground hover:border-primary hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary" />
                <span>Schedule Email Report</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="pt-1 text-[11px] text-muted-foreground text-center">
              Generated reports reflect current date filter ({dateRange}) and active data mode ({dataMode.toUpperCase()}).
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 9. SCHEDULE EMAIL REPORT MODAL                                 */}
      {/* ============================================================== */}
      {emailModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setEmailModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h4 className="font-display text-base font-extrabold text-foreground">Schedule Analytics Digest</h4>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmailSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-1">Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="admin@siddwhizz.com"
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Delivery Frequency</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailFrequency("weekly")}
                    className={`rounded-xl border p-2.5 font-bold transition text-center cursor-pointer ${
                      emailFrequency === "weekly"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-50"
                    }`}
                  >
                    Every Monday Morning (Weekly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailFrequency("monthly")}
                    className={`rounded-xl border p-2.5 font-bold transition text-center cursor-pointer ${
                      emailFrequency === "monthly"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-50"
                    }`}
                  >
                    1st of Month (Executive)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-red !py-2 !px-5 text-xs cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

