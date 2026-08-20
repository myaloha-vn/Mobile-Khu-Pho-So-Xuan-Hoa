import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  MessageSquareWarning, AlarmClock, FileClock, CalendarDays, ClipboardList,
  Plus, Megaphone, Newspaper, ArrowUpRight, History, Building2, TrendingUp, TrendingDown,
  User, MapPin,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardHeader, Badge, StatusBadge, PriorityBadge, EmptyState, Button } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Select } from "../../components/common/Filters";
import { useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { useTable, pushLog } from "../../services/store";
import { useScopedContents, useScopedFeedbacks, useScopedNeighborhoods } from "../../hooks/useScoped";
import { fmtDate, fmtDateTime, fromNow, greeting, daysLeft, slaState, pad } from "../../utils/format";
import { CONTENT_TYPE_LABEL } from "../../data/mock";
import type { Feedback, ContentItem } from "../../types";

/** Gộp mốc thời gian ISO về khoá "YYYY-MM-DD" theo giờ địa phương, dùng để xếp vào từng ngày trên biểu đồ xu hướng. */
const dayKeyOf = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Số ngày đã trôi qua kể từ mốc ISO tới hiện tại (0 = hôm nay). */
const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

const CHART_RANGE_OPTIONS = [
  { value: "7", label: "7 ngày qua" },
  { value: "14", label: "14 ngày qua" },
  { value: "30", label: "30 ngày qua" },
  { value: "90", label: "90 ngày qua" },
];

export default function Overview() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const feedbacks = useScopedFeedbacks();
  const contents = useScopedContents();
  const [allContents, setAllContents] = useTable("contents");
  const hoods = useScopedNeighborhoods();
  const [users] = useTable("users");
  const [logs] = useTable("logs");
  const [hoodFilter, setHoodFilter] = useState("all");
  const [reviewPopup, setReviewPopup] = useState<{ id: string } | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  // Khoảng thời gian lọc dùng chung cho các biểu đồ theo ngày trên trang (xu hướng, lĩnh vực, khu phố)
  const [chartRange, setChartRange] = useState("7");
  const chartRangeDays = Number(chartRange);
  // Biểu đồ "Tình hình phản ánh kiến nghị" dùng chung 1 khung, chuyển đổi giữa xem theo thời gian / theo lĩnh vực
  const [chartView, setChartView] = useState<"time" | "field">("time");

  const stats = useMemo(() => {
    const open = feedbacks.filter((f) => !["resolved", "rejected"].includes(f.status));
    return {
      pendingReview: feedbacks.filter((f) => f.status === "pending_review").length,
      processing: feedbacks.filter((f) => ["pending", "processing"].includes(f.status)).length,
      resolved: feedbacks.filter((f) => f.status === "resolved").length,
      overdue: open.filter((f) => slaState(f.dueAt, f.status) === "overdue").length,
      pendingContent: contents.filter((c) => c.status === "pending").length,
      upcomingEvents: contents.filter((c) => c.type === "event" && c.startAt && daysLeft(c.startAt) >= 0 && daysLeft(c.startAt) <= 7).length,
    };
  }, [feedbacks, contents]);

  const [surveys] = useTable("surveys");
  const openSurveys = surveys.filter((s) => s.status === "open").length;

  // Chỉ giữ các số liệu KHÔNG trùng với khối "Tình hình phản ánh kiến nghị" bên dưới —
  // số liệu phản ánh (mới/quá hạn) đã có đầy đủ và chi tiết hơn ở đó.
  const cards = [
    { key: "pending", label: "Nội dung chờ duyệt", value: stats.pendingContent, desc: "Cần duyệt trước khi xuất bản", Icon: FileClock, tone: "bg-violet-50 text-violet-600", to: "/workspace/content/news?status=pending" },
    { key: "event", label: "Hoạt động sắp diễn ra", value: stats.upcomingEvents, desc: "Trong 7 ngày tới", Icon: CalendarDays, tone: "bg-emerald-50 text-emerald-600", to: "/workspace/content/events" },
    { key: "survey", label: "Khảo sát đang mở", value: openSurveys, desc: "Đang nhận phản hồi", Icon: ClipboardList, tone: "bg-teal-50 text-teal-600", to: "/workspace/surveys" },
  ];

  // ─── Việc cần làm ngay — tách riêng phản ánh và nội dung, quy trình và người phụ trách khác nhau ──
  type FbTask = {
    id: string; title: string; hoodId: number | null;
    assignee: string; due: string; priority: string; status: string; link: string;
  };
  const fbTasks: FbTask[] = useMemo(() => feedbacks
    .filter((f) => !["resolved", "rejected"].includes(f.status))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 6)
    .map((f) => ({
      id: f.id, title: `${f.code} - ${f.summary}`, hoodId: f.hoodId,
      assignee: users.find((u) => u.id === f.assigneeId)?.fullName ?? "Chưa phân công",
      due: f.dueAt, priority: f.priority, status: f.status, link: `/workspace/feedback/${f.id}`,
    })), [feedbacks, users]);

  const fbTaskColumns: Column<FbTask>[] = [
    { key: "title", header: "Phản ánh", mobile: "title", render: (r) => <span className="font-medium text-slate-800 line-clamp-2">{r.title}</span> },
    { key: "hood", header: "Khu phố", mobile: "meta", render: (r) => (r.hoodId ? `Khu phố ${r.hoodId}` : "Toàn phường") },
    { key: "assignee", header: "Phụ trách", mobile: "meta", render: (r) => r.assignee },
    {
      key: "due", header: "Thời hạn", mobile: "meta",
      render: (r) => {
        const d = daysLeft(r.due);
        return (
          <span className={d < 0 ? "text-red-600 font-medium" : d <= 2 ? "text-orange-600 font-medium" : ""}>
            {fmtDate(r.due)}{d < 0 ? ` (quá ${-d} ngày)` : d <= 2 ? ` (còn ${d} ngày)` : ""}
          </span>
        );
      },
    },
    { key: "priority", header: "Ưu tiên", mobile: "badge", render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} kind="feedback" /> },
    {
      key: "act", header: "Thao tác",
      render: (r) => <Button size="sm" variant="secondary" onClick={() => navigate(r.link)}>Xử lý</Button>,
    },
  ];

  type CtTask = {
    id: string; title: string; kind: string; hoodId: number | null;
    author: string; due: string; status: string; link: string;
  };
  const ctTasks: CtTask[] = useMemo(() => contents
    .filter((c) => c.status === "pending")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 6)
    .map((c) => ({
      id: c.id, title: c.title, kind: CONTENT_TYPE_LABEL[c.type], hoodId: c.hoodId,
      author: users.find((u) => u.id === c.authorId)?.fullName ?? "-",
      due: c.scheduledAt ?? c.createdAt, status: c.status, link: `/workspace/content/${c.id}/edit`,
    })), [contents, users]);

  const ctTaskColumns: Column<CtTask>[] = [
    { key: "title", header: "Nội dung", mobile: "title", render: (r) => <span className="font-medium text-slate-800 line-clamp-2">{r.title}</span> },
    { key: "kind", header: "Loại", mobile: "meta", render: (r) => <Badge tone="slate">{r.kind}</Badge> },
    { key: "hood", header: "Khu phố", mobile: "meta", render: (r) => (r.hoodId ? `Khu phố ${r.hoodId}` : "Toàn phường") },
    { key: "author", header: "Tác giả", mobile: "meta", render: (r) => r.author },
    { key: "due", header: "Ngày tạo", mobile: "meta", render: (r) => fmtDate(r.due) },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "act", header: "Thao tác",
      render: (r) => <Button size="sm" variant="secondary" onClick={() => setReviewPopup({ id: r.id })}>Duyệt</Button>,
    },
  ];

  // ─── Phản ánh gần nhất ─────────────────────────────────────────────────────
  const recent = [...feedbacks].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  const fbColumns: Column<Feedback>[] = [
    { key: "code", header: "Mã", mobile: "title", render: (r) => <span className="font-mono text-[12.5px] text-slate-500">{r.code}</span> },
    { key: "summary", header: "Nội dung", render: (r) => <span className="line-clamp-2">{r.summary}</span> },
    { key: "hood", header: "Khu phố", mobile: "meta", render: (r) => `Khu phố ${r.hoodId}` },
    { key: "createdAt", header: "Tiếp nhận", mobile: "meta", render: (r) => fmtDate(r.createdAt) },
    { key: "assignee", header: "Người xử lý", mobile: "meta", render: (r) => users.find((u) => u.id === r.assigneeId)?.fullName ?? "Chưa phân công" },
    {
      key: "due", header: "Hạn xử lý", mobile: "meta",
      render: (r) => {
        const s = slaState(r.dueAt, r.status);
        return <span className={s === "overdue" ? "text-red-600 font-medium" : s === "due_soon" ? "text-orange-600 font-medium" : ""}>{fmtDate(r.dueAt)}</span>;
      },
    },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} kind="feedback" /> },
  ];

  // ─── Nội dung sắp hiển thị ─────────────────────────────────────────────────
  const upcoming = contents
    .filter((c) => ["draft", "pending", "scheduled", "published"].includes(c.status))
    .slice(0, 6);

  // ─── Tình hình 18 khu phố ──────────────────────────────────────────────────
  // "Phản ánh đang mở" / "Quá hạn" lọc theo khoảng thời gian tiếp nhận (chartRange) đang chọn;
  // "Tin trong tháng" giữ nguyên mốc lịch tháng vì là chỉ số khác bản chất.
  const hoodRows = useMemo(() => {
    const rows = hoods.map((h) => {
      const open = feedbacks.filter((f) =>
        f.hoodId === h.id && !["resolved", "rejected"].includes(f.status) && daysSince(f.createdAt) <= chartRangeDays
      );
      const overdue = open.filter((f) => slaState(f.dueAt, f.status) === "overdue").length;
      const monthNews = contents.filter(
        (c) => c.hoodId === h.id && c.type === "news" && daysLeft(c.createdAt) > -31
      ).length;
      const events = contents.filter(
        (c) => c.hoodId === h.id && c.type === "event" && c.startAt && daysLeft(c.startAt) >= 0
      ).length;
      return { hood: h, open: open.length, overdue, monthNews, events };
    });
    if (hoodFilter === "overdue") return rows.filter((r) => r.overdue > 0);
    if (hoodFilter === "stale") return rows.filter((r) => r.monthNews === 0);
    if (hoodFilter === "events") return rows.filter((r) => r.events > 0);
    return rows;
  }, [hoods, feedbacks, contents, hoodFilter, chartRangeDays]);

  // Bảng phân bố theo lĩnh vực chỉ tính phản ánh tiếp nhận trong khoảng thời gian đang chọn (chartRange)
  const fieldChart = useMemo(() => {
    const m = new Map<string, number>();
    feedbacks.filter((f) => daysSince(f.createdAt) <= chartRangeDays).forEach((f) => m.set(f.field, (m.get(f.field) ?? 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [feedbacks, chartRangeDays]);

  // ─── Xu hướng phản ánh theo thời gian ────────────────────────────────────────
  // Số liệu ở trên chỉ là ảnh chụp thời điểm hiện tại; biểu đồ này cho thấy khối lượng
  // phản ánh mới nhận và đã xử lý mỗi ngày để nhận biết xu hướng tăng/giảm.
  const trendData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: chartRangeDays }, (_, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (chartRangeDays - 1 - idx));
      return { key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, name: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` };
    });
    const buckets = new Map(days.map((d) => [d.key, { name: d.name, "Phản ánh mới": 0, "Đã xử lý": 0 }]));
    feedbacks.forEach((f) => {
      const createdBucket = buckets.get(dayKeyOf(f.createdAt));
      if (createdBucket) createdBucket["Phản ánh mới"] += 1;
      const resolvedEvent = f.timeline.find((e) => e.action === "Đã xử lý");
      if (resolvedEvent) {
        const resolvedBucket = buckets.get(dayKeyOf(resolvedEvent.at));
        if (resolvedBucket) resolvedBucket["Đã xử lý"] += 1;
      }
    });
    return Array.from(buckets.values());
  }, [feedbacks, chartRangeDays]);

  const trendDelta = useMemo(() => {
    const half = Math.floor(trendData.length / 2);
    if (!half) return null;
    const sum = (arr: typeof trendData) => arr.reduce((s, d) => s + d["Phản ánh mới"], 0);
    const prev = sum(trendData.slice(0, half));
    const curr = sum(trendData.slice(trendData.length - half));
    if (prev === 0 && curr === 0) return null;
    if (prev === 0) return { pct: 100, up: true };
    return { pct: Math.round((Math.abs(curr - prev) / prev) * 100), up: curr >= prev };
  }, [trendData]);

  const summary = `Hôm nay có ${stats.pendingReview} phản ánh cần duyệt, ${stats.pendingContent} nội dung chờ duyệt và ${stats.upcomingEvents} hoạt động sắp diễn ra.`;

  const applyContent = (id: string, patch: Partial<ContentItem>, action: ContentItem["history"][0]["action"], label: string) => {
    const item = allContents.find((c) => c.id === id);
    if (!item) return;
    setAllContents(allContents.map((c) => c.id === id
      ? { ...c, ...patch, history: [...c.history, { at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action }] }
      : c));
    if (user) pushLog(user.id, label, item.title, null);
    toast(`${label} thành công`);
  };

  const runReview = () => {
    if (!reviewPopup) return;
    const { id } = reviewPopup;
    if (scheduleDate) {
      applyContent(id, { status: "scheduled", scheduledAt: new Date(scheduleDate).toISOString() }, "scheduled", "Lên lịch xuất bản");
    } else {
      applyContent(id, { status: "published", publishedAt: new Date().toISOString() }, "published", "Xuất bản");
    }
    setReviewPopup(null);
    setScheduleDate("");
  };

  return (
    <>
      {/* Khối chào mừng */}
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold text-slate-900">
              {greeting()}, {user?.fullName}
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {user?.unit} · {fmtDate(new Date().toISOString())}
            </p>
            <p className="text-[13.5px] text-slate-700 mt-2">{summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Allow module="content" action="create">
              <Button icon={<Megaphone size={15} />} variant="secondary"
                onClick={() => navigate("/workspace/content/create?type=announcement")}>Tạo thông báo</Button>
            </Allow>
            <Allow module="content" action="create">
              <Button icon={<Newspaper size={15} />} variant="secondary"
                onClick={() => navigate("/workspace/content/create?type=news")}>Đăng tin</Button>
            </Allow>
            <Allow module="feedback" action="edit">
              <Button icon={<Plus size={15} />} onClick={() => navigate("/workspace/feedback?tab=pending_review")}>Tiếp nhận phản ánh</Button>
            </Allow>
          </div>
        </div>
      </Card>

      {/* Thẻ tổng quan nhanh — không lặp số liệu phản ánh (đã có ở khối "Tình hình phản ánh kiến nghị") */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ key, label, value, desc, Icon, tone, to }) => (
          <button key={key} onClick={() => navigate(to)} className="text-left">
            <Card className="p-4 h-full hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
                  <Icon size={17} />
                </span>
              </div>
              <p className="mt-2 text-[26px] font-semibold text-slate-900 leading-none">{value}</p>
              <p className="mt-1.5 text-[11.5px] text-slate-400">{desc}</p>
            </Card>
          </button>
        ))}
      </div>

      {/* Việc cần làm ngay — tách riêng theo loại việc, quy trình và người phụ trách khác nhau */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Phản ánh cần xử lý" icon={<AlarmClock size={16} className="text-orange-500" />}
            action={<Button size="sm" variant="ghost" icon={<ArrowUpRight size={14} />} onClick={() => navigate("/workspace/feedback")}>Xem tất cả</Button>} />
          <DataTable columns={fbTaskColumns} rows={fbTasks} rowKey={(r) => r.id}
            emptyTitle="Không có phản ánh cần xử lý" emptyDescription="Toàn bộ phản ánh đã được xử lý." />
        </Card>
        <Card>
          <CardHeader title="Nội dung chờ duyệt" icon={<FileClock size={16} className="text-violet-600" />}
            action={<Button size="sm" variant="ghost" icon={<ArrowUpRight size={14} />} onClick={() => navigate("/workspace/content/news?status=pending")}>Xem tất cả</Button>} />
          <DataTable columns={ctTaskColumns} rows={ctTasks} rowKey={(r) => r.id}
            emptyTitle="Không có nội dung chờ duyệt" emptyDescription="Toàn bộ nội dung đã được xử lý." />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Tình hình phản ánh — gộp chung khối snapshot + xu hướng theo thời gian + phân loại lĩnh vực vào 1 section,
            dùng chung 1 bộ lọc ngày và 1 khung biểu đồ chuyển đổi qua lại (thời gian / lĩnh vực) */}
        <Card className="xl:col-span-2">
          <CardHeader title="Tình hình phản ánh kiến nghị" icon={<MessageSquareWarning size={16} className="text-blue-600" />}
            action={
              <div className="flex items-center gap-2">
                <Select value={chartRange} onChange={setChartRange} options={CHART_RANGE_OPTIONS} />
                <Button size="sm" variant="ghost" onClick={() => navigate("/workspace/feedback")}>Xem tất cả</Button>
              </div>
            } />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4">
            {[
              { label: "Chờ duyệt", value: stats.pendingReview, tone: "text-blue-600" },
              { label: "Đang xử lý", value: stats.processing, tone: "text-amber-600" },
              { label: "Đã xử lý", value: stats.resolved, tone: "text-emerald-600" },
              { label: "Quá hạn", value: stats.overdue, tone: "text-red-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <p className={`text-[20px] font-semibold leading-none ${s.tone}`}>{s.value}</p>
                <p className="text-[11.5px] text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {trendDelta && (
            <p className={`px-5 pb-2 text-[12.5px] font-medium flex items-center gap-1 ${trendDelta.up ? "text-red-600" : "text-emerald-600"}`}>
              {trendDelta.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              Phản ánh mới {trendDelta.up ? "tăng" : "giảm"} {trendDelta.pct}% so với nửa đầu giai đoạn {chartRangeDays} ngày gần đây
            </p>
          )}

          <div className="flex items-center justify-between px-5">
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5">
              {([
                { key: "time" as const, label: "Theo thời gian" },
                { key: "field" as const, label: "Theo lĩnh vực" },
              ]).map((v) => (
                <button key={v.key} onClick={() => setChartView(v.key)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                    chartView === v.key ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 pt-2 pb-2 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "time" ? (
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="trendDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false}
                    interval={chartRangeDays > 14 ? Math.ceil(chartRangeDays / 10) : 0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={26} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Phản ánh mới" stroke="#2563EB" strokeWidth={2} fill="url(#trendIn)" />
                  <Area type="monotone" dataKey="Đã xử lý" stroke="#059669" strokeWidth={2} fill="url(#trendDone)" />
                </AreaChart>
              ) : (
                <BarChart data={fieldChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#64748B" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={26} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Bar dataKey="value" name="Số phản ánh" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={26} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <DataTable columns={fbColumns} rows={recent} rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/workspace/feedback/${r.id}`)}
            emptyTitle="Chưa có phản ánh" pageSizeOptions={[5, 10]} />
        </Card>

        {/* Hoạt động gần đây — kéo cao bằng khối bên trái, tránh dư khoảng trắng phía dưới.
            Dùng div "relative" rỗng để làm chiều cao neo theo khối bên trái (không tự phình theo nội dung),
            danh sách thật nằm "absolute inset-0" bên trong nên không đẩy ngược lại chiều cao hàng lưới. */}
        <Card className="h-full flex flex-col">
          <CardHeader title="Hoạt động gần đây" icon={<History size={16} className="text-violet-600" />} />
          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-0 divide-y divide-slate-100 overflow-y-auto">
              {logs.slice(0, 12).map((l) => {
                const actor = users.find((u) => u.id === l.actorId);
                return (
                  <div key={l.id} className="px-5 py-3">
                    <p className="text-[13px] text-slate-700">
                      <span className="font-medium text-slate-900">{actor?.fullName ?? "Người dùng"}</span> {l.action}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{l.target}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{fromNow(l.at)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Nội dung sắp hiển thị */}
      <Card>
        <CardHeader title="Nội dung sắp hiển thị cho người dân" icon={<Newspaper size={16} className="text-violet-600" />} />
        {upcoming.length === 0 ? (
          <EmptyState title="Chưa có nội dung chờ hiển thị" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {upcoming.map((c) => {
              return (
                <div key={c.id} className="rounded-xl border border-slate-100 overflow-hidden">
                  <img src={c.image} alt="" className="w-full h-[150px] object-cover" />
                  <div className="p-3.5">
                    <p className="text-[14px] font-semibold text-slate-800 line-clamp-2">{c.title}</p>
                    <p className="text-[12px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <span className="flex items-center gap-1"><User size={12} className="shrink-0" />{users.find((u) => u.id === c.authorId)?.fullName ?? "-"}</span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1"><MapPin size={12} className="shrink-0" />{c.hoodId ? `Khu phố ${c.hoodId}` : "Toàn phường"}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tình hình khu phố */}
      <Card>
        <CardHeader title="Tình hình khu phố" icon={<Building2 size={16} className="text-emerald-600" />}
          action={
            <div className="flex items-center gap-2">
              <Select value={chartRange} onChange={setChartRange} options={CHART_RANGE_OPTIONS} />
              <Select value={hoodFilter} onChange={setHoodFilter}
                options={[
                  { value: "all", label: "Tất cả khu phố" },
                  { value: "overdue", label: "Có phản ánh quá hạn" },
                  { value: "stale", label: "Chưa cập nhật tin" },
                  { value: "events", label: "Có hoạt động sắp diễn ra" },
                ]} />
            </div>
          } />
        <p className="px-5 pt-3 text-[11.5px] text-slate-400">
          "Phản ánh đang mở" và "Quá hạn" tính theo phản ánh tiếp nhận trong {chartRangeDays} ngày qua; "Tin trong tháng" tính theo tháng hiện tại.
        </p>
        <div className="px-3 pt-2 pb-1 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hoodRows.map((r) => ({
              name: `KP ${r.hood.id}`,
              "Phản ánh đang mở": r.open,
              "Quá hạn": r.overdue,
              "Tin trong tháng": r.monthNews,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={26} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Phản ánh đang mở" stackId="a" fill="#2563EB" barSize={16} />
              <Bar dataKey="Quá hạn" stackId="a" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Tin trong tháng" fill="#059669" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <DataTable
          rows={hoodRows}
          rowKey={(r) => String(r.hood.id)}
          onRowClick={(r) => navigate(`/workspace/neighborhoods/${r.hood.id}`)}
          emptyTitle="Không có khu phố phù hợp bộ lọc"
          columns={[
            { key: "name", header: "Khu phố", mobile: "title", render: (r) => <span className="font-medium text-slate-800">{r.hood.name}</span> },
            { key: "open", header: "Phản ánh đang mở", mobile: "meta", render: (r) => (
              <span className={r.overdue > 0 ? "text-red-600 font-medium" : ""}>
                {r.open}{r.overdue > 0 ? ` (${r.overdue} quá hạn)` : ""}
              </span>
            ) },
            { key: "news", header: "Tin trong tháng", mobile: "meta", render: (r) => r.monthNews },
            { key: "events", header: "Lịch sắp diễn ra", mobile: "meta", render: (r) => r.events },
            { key: "last", header: "Cập nhật gần nhất", mobile: "meta", render: (r) => fmtDateTime(r.hood.lastUpdate) },
            { key: "leader", header: "Người phụ trách", mobile: "meta", render: (r) => r.hood.leaderName },
            { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => (
              <Badge tone={r.hood.active ? "green" : "slate"}>{r.hood.active ? "Đang hoạt động" : "Tạm ngưng"}</Badge>
            ) },
          ]}
        />
      </Card>

      {/* Popup duyệt nội dung */}
      {reviewPopup && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 flex items-center justify-center p-4" onClick={() => { setReviewPopup(null); setScheduleDate(""); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5">
            <h3 className="text-[16px] font-semibold text-slate-900">Duyệt nội dung</h3>
            <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">
              Chọn ngày xuất bản hoặc xuất bản ngay.
            </p>
            <div className="mt-4">
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Ngày xuất bản (để trống = xuất bản ngay)</label>
              <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setReviewPopup(null); setScheduleDate(""); }}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                Huỷ
              </button>
              <button onClick={runReview}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700">
                {scheduleDate ? "Lên lịch" : "Xuất bản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
