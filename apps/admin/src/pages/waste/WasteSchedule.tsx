import { useState, useEffect, useRef } from "react";
import { CalendarDays, Clock, Copy, List, MapPin, Plus, Trash2, Truck } from "lucide-react";
import { Card, CardHeader, Badge, Button, EmptyState } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { FilterBar, SearchInput, Select } from "../../components/common/Filters";
import { ConfirmDialog, RightDrawer, useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { pushLog, useTable } from "../../services/store";
import { WEEKDAY_LABEL } from "../../utils/format";
import type { WasteSchedule as WS, WasteScheduleStop } from "../../types";

const EMPTY: WS = {
  id: "", routeName: "", hoodIds: [], weekdays: [2, 5],
  stops: [{ time: "", location: "" }],
  provider: "Công ty Dịch vụ công ích", phone: "",
  effectiveFrom: new Date().toISOString(), status: "active",
};

/* ---------- Route Playback Timeline Component ---------- */
function RoutePlaybackTimeline({ routeId, stops }: { routeId: string; stops: WasteScheduleStop[] }) {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-start
  const [progress, setProgress] = useState(0);
  const [currentStopIndex, setCurrentStopIndex] = useState(-1);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const stopPercents = stops.length === 0 ? [] : stops.length === 1 ? [50] : stops.map((_, i) => +(5 + (i / (stops.length - 1)) * 90).toFixed(2));
  const totalDuration = 8000; // 8 seconds for full route

  // Auto-start animation on mount and loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update current stop index
      const nextStopIdx = stopPercents.findIndex((p) => p > newProgress);
      if (nextStopIdx === -1) {
        setCurrentStopIndex(stops.length - 1);
      } else {
        setCurrentStopIndex(nextStopIdx - 1);
      }

      if (newProgress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Loop: reset and continue
        setTimeout(() => {
          setProgress(0);
          setCurrentStopIndex(-1);
          startTimeRef.current = null;
          animationRef.current = requestAnimationFrame(animate);
        }, 1000); // Pause 1 second before looping
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stopPercents, stops.length, totalDuration]);

  return (
    <div className="relative w-full px-4" style={{ minHeight: 120 }}>
      {/* Row 1: Time and location labels */}
      <div className="relative w-full" style={{ height: 36 }}>
        {stops.map((stop, i) => (
          <div
            key={stop.id || i}
            className="absolute text-center"
            style={{
              left: `${stopPercents[i]}%`,
              transform: "translateX(-50%)",
              top: 0,
            }}
          >
            <div className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
              {stop.time}
            </div>
            <div className="text-[10px] text-slate-500 truncate max-w-[70px]">
              {stop.location}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Timeline with line and waypoints */}
      <div className="relative w-full" style={{ height: 24, marginTop: 8 }}>
        {/* Base line */}
        <div
          className="absolute bg-slate-200 rounded-full"
          style={{
            top: "50%",
            left: "5%",
            right: "5%",
            height: 3,
            transform: "translateY(-50%)",
          }}
        />

        {/* Progress line */}
        <div
          className="absolute bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          style={{
            top: "50%",
            left: "5%",
            width: `${Math.min(progress, 100) * 0.9}%`,
            height: 3,
            transform: "translateY(-50%)",
          }}
        />

        {/* Waypoint dots */}
        {stops.map((stop, i) => {
          const isCollected = i <= currentStopIndex;
          const isCurrent = i === currentStopIndex;
          return (
            <div
              key={stop.id || i}
              className={`absolute w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                isCollected
                  ? "bg-emerald-500 border-emerald-600"
                  : "bg-white border-slate-300"
              } ${isCurrent ? "ring-2 ring-emerald-300" : ""}`}
              style={{
                left: `${stopPercents[i]}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>

      {/* Row 3: Truck marker */}
      <div className="relative w-full" style={{ height: 36, marginTop: 8 }}>
        <div
          className="absolute"
          style={{
            left: `${Math.max(5, Math.min(95, progress))}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
            <Truck size={16} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WasteSchedulePage() {
  const toast = useToast();
  const { user, hoodScope } = useAuth();
  const [rawWaste, setWaste] = useTable("waste");
  const [hoods] = useTable("neighborhoods");
  // Migrate old data format (hoodId -> hoodIds, route -> routeName, etc.)
  const waste = rawWaste.map(w => ({
    ...w,
    hoodIds: w.hoodIds ?? (w as any).hoodId ? [(w as any).hoodId] : [],
    routeName: w.routeName ?? (w as any).route ?? "",
    stops: w.stops ?? ((w as any).timeRange ? [{ time: (w as any).timeRange.split(" - ")[0] ?? "", location: (w as any).route ?? "" }] : []),
    phone: w.phone ?? (w as any).phone ?? "",
  }));
  const [view, setView] = useState<"list" | "calendar">("list");
  const [q, setQ] = useState("");
  const [hood, setHood] = useState("");
  const [editing, setEditing] = useState<WS | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const rows = waste.filter((w) =>
    (!hoodScope || w.hoodIds.includes(hoodScope)) &&
    (!q || w.routeName.toLowerCase().includes(q.toLowerCase()) || w.stops.some(s => s.location.toLowerCase().includes(q.toLowerCase()))) &&
    (!hood || w.hoodIds.includes(Number(hood)))
  );

  const save = () => {
    if (!editing) return;
    if (!editing.routeName.trim()) { toast("Vui lòng nhập tên tuyến", "error"); return; }
    const validStops = editing.stops.filter(s => s.time.trim() && s.location.trim());
    if (validStops.length === 0) { toast("Vui lòng nhập ít nhất 1 địa điểm", "error"); return; }
    const updatedEditing = { ...editing, stops: validStops };
    if (updatedEditing.id) setWaste(rawWaste.map((w) => (w.id === updatedEditing.id ? updatedEditing : w)));
    else setWaste([{ ...updatedEditing, id: `ws-${Date.now()}` }, ...rawWaste]);
    if (user) pushLog(user.id, "cập nhật lịch thu gom rác", updatedEditing.routeName, updatedEditing.hoodIds[0]);
    setEditing(null);
    toast("Đã lưu lịch thu gom rác");
  };

  const toggleHood = (id: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      hoodIds: editing.hoodIds.includes(id)
        ? editing.hoodIds.filter(h => h !== id)
        : [...editing.hoodIds, id],
    });
  };

  const updateStop = (index: number, field: keyof WasteScheduleStop, value: string) => {
    if (!editing) return;
    const next = [...editing.stops];
    next[index] = { ...next[index], [field]: value };
    
    // Auto-suggest next stop time as current time + 30 minutes
    if (field === "time" && value && index === next.length - 1 && next.length < 20) {
      const [h, m] = value.split(":").map(Number);
      const totalMinutes = h * 60 + m + 30;
      const nextH = Math.floor(totalMinutes / 60) % 24;
      const nextM = totalMinutes % 60;
      const nextTime = `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
      next.push({ time: nextTime, location: "" });
    }
    // Auto-add new stop when typing in last row
    else if (index === next.length - 1 && next[index].time.trim() && next[index].location.trim() && next.length < 20) {
      next.push({ time: "", location: "" });
    }
    
    setEditing({ ...editing, stops: next });
  };

  const removeStop = (index: number) => {
    if (!editing) return;
    const next = editing.stops.filter((_, i) => i !== index);
    if (next.length === 0) next.push({ time: "", location: "" });
    setEditing({ ...editing, stops: next });
  };

  const columns: Column<WS>[] = [
    { key: "routeName", header: "Tên tuyến", mobile: "title", render: (r) => <span className="font-medium">{r.routeName}</span> },
    { key: "hoods", header: "Khu phố", render: (r) => (
      <div className="flex flex-wrap gap-1">
        {r.hoodIds.map(id => <Badge key={id} tone="blue">{hoods.find(h => h.id === id)?.name ?? `KP ${id}`}</Badge>)}
      </div>
    )},
    { key: "days", header: "Ngày trong tuần", mobile: "meta", render: (r) => r.weekdays.map((d) => WEEKDAY_LABEL[d]).join(", ") },
    { key: "stops", header: "Lịch trình", mobile: "meta", render: (r) => (
      <div className="text-[12px] text-slate-600">
        {r.stops.slice(0, 3).map((s, i) => (
          <div key={i}>{s.time} – {s.location}</div>
        ))}
        {r.stops.length > 3 && <div className="text-slate-400">+{r.stops.length - 3} điểm khác</div>}
      </div>
    )},
    { key: "provider", header: "Đơn vị thu gom", mobile: "meta", render: (r) => (
      <div>
        <div>{r.provider}</div>
        {r.phone && <div className="text-[11px] text-slate-500">{r.phone}</div>}
      </div>
    )},
    {
      key: "act", header: "Thao tác",
      render: (r) => (
        <div className="flex gap-1">
          <Allow module="waste" action="edit">
            <button title="Sửa" onClick={() => setEditing(r)} className="px-2 py-1 rounded-lg text-[12px] text-blue-600 hover:bg-blue-50">Sửa</button>
            <button title="Sao chép" onClick={() => setEditing({ ...r, id: "" })}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Copy size={13} /></button>
          </Allow>
          <Allow module="waste" action="delete">
            <button title="Xoá" onClick={() => setConfirmDelete(r.id)}
              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"><Trash2 size={13} /></button>
          </Allow>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader title="Lịch thu gom rác" icon={<CalendarDays size={16} className="text-emerald-600" />}
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" icon={view === "list" ? <CalendarDays size={14} /> : <List size={14} />}
                onClick={() => setView(view === "list" ? "calendar" : "list")}>
                {view === "list" ? "Dạng tuyến" : "Dạng danh sách"}
              </Button>
              <Allow module="waste" action="create">
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setEditing({ ...EMPTY, hoodIds: hoodScope ? [hoodScope] : [] })}>Tạo lịch</Button>
              </Allow>
            </div>
          } />
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Tìm tuyến đường, địa điểm..." />
          <Select value={hood} onChange={setHood} placeholder="Tất cả khu phố" options={hoods.map((h) => ({ value: String(h.id), label: h.name }))} />
        </FilterBar>

        {view === "list" ? (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} emptyTitle="Chưa có lịch thu gom rác" />
        ) : rows.length === 0 ? (
          <EmptyState title="Chưa có lịch thu gom rác" />
        ) : (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rows.map((r) => {
              const hoodNames = r.hoodIds.map(id => hoods.find(h => h.id === id)?.name).filter(Boolean);
              const validStops = r.stops.filter(s => s.time && s.location);
              return (
                <div key={r.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13.5px] font-semibold text-slate-800 break-words">{r.routeName}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11.5px] text-slate-500">{r.provider}</span>
                          {r.phone && <span className="text-[11px] text-slate-400">· {r.phone}</span>}
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium">
                        <Clock size={10} />
                        {validStops.length} điểm
                      </span>
                    </div>
                    {/* Weekdays */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.weekdays.map((d) => (
                        <span key={d} className="px-1.5 py-0.5 rounded-md bg-blue-100/80 text-blue-700 text-[10.5px] font-medium">
                          {WEEKDAY_LABEL[d]}
                        </span>
                      ))}
                    </div>
                    {/* Neighborhoods */}
                    {hoodNames.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {hoodNames.map((name, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10.5px] border border-amber-200/60">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Horizontal Timeline with Route Playback */}
                  <div className="px-4 py-3">
                    {validStops.length > 0 ? (
                      <RoutePlaybackTimeline routeId={r.id} stops={validStops} />
                    ) : (
                      <p className="text-sm text-slate-400">Không có điểm dừng</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <RightDrawer open={!!editing} title={editing?.id ? "Cập nhật lịch thu gom" : "Tạo lịch thu gom"} onClose={() => setEditing(null)}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Huỷ</Button><Button onClick={save}>Lưu lịch</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Tên tuyến <span className="text-red-500">*</span></label>
              <input value={editing.routeName} onChange={(e) => setEditing({ ...editing, routeName: e.target.value })}
                placeholder="VD: Tuyến Hai Bà Trưng"
                className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Khu phố đi qua</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2.5">
                {hoods.map((h) => (
                  <label key={h.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] border cursor-pointer transition-colors ${
                    editing.hoodIds.includes(h.id) ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                    <input type="checkbox" checked={editing.hoodIds.includes(h.id)} onChange={() => toggleHood(h.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    {h.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Ngày trong tuần</label>
              <div className="flex flex-wrap gap-1.5">
                {[2, 3, 4, 5, 6, 7, 8].map((d) => (
                  <button key={d}
                    onClick={() => setEditing({
                      ...editing,
                      weekdays: editing.weekdays.includes(d) ? editing.weekdays.filter((x) => x !== d) : [...editing.weekdays, d].sort(),
                    })}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] border ${
                      editing.weekdays.includes(d) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
                    }`}>
                    {WEEKDAY_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Đơn vị thu gom</label>
                <input value={editing.provider} onChange={(e) => setEditing({ ...editing, provider: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  placeholder="VD: 0901234567"
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Lịch trình các điểm <span className="text-red-500">*</span></label>
              <p className="text-[11.5px] text-slate-500 mb-2">Nhập giờ và tên địa điểm. Tự động thêm dòng mới khi nhập dòng cuối (tối đa 20 điểm).</p>
              <div className="space-y-2">
                {editing.stops.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={s.time} onChange={(e) => updateStop(i, "time", e.target.value)}
                      placeholder="Giờ" type="time"
                      className="w-28 h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500" />
                    <input value={s.location} onChange={(e) => updateStop(i, "location", e.target.value)}
                      placeholder={`Địa điểm ${i + 1}`}
                      className="flex-1 h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500" />
                    {editing.stops.length > 1 && (
                      <button onClick={() => removeStop(i)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </RightDrawer>

      <ConfirmDialog open={!!confirmDelete} title="Xoá lịch thu gom" description="Lịch sẽ bị xoá khỏi hệ thống."
        confirmLabel="Xoá" tone="danger" onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { setWaste(rawWaste.filter((w) => w.id !== confirmDelete)); setConfirmDelete(null); toast("Đã xoá lịch"); }} />
    </>
  );
}
