import { useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  ArrowLeftRight, ChevronDown, ChevronLeft, ChevronRight, Clock, FileText, GraduationCap, Home,
  MapPin, Megaphone, Phone, Search, Trash2, Users, X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { FEEDBACKS, LITERACY, NEIGHBORHOODS, NEWS, WASTE_SCHEDULE, statusColor, statusLabel } from "../data";
import { useSafeBack } from "../hooks/useSafeBack";
import { EmptyState } from "../components/shared/EmptyState";
import { NeighborhoodSwitcherModal } from "../components/shared/NeighborhoodSwitcherModal";

// ─── SCREEN: NEIGHBORHOOD DETAIL ─────────────────────────────────────────────
export default function NeighborhoodDetailScreen() {
  const navigate = useNavigate();
  const { hoodId: hoodIdParam } = useParams();
  const hood = NEIGHBORHOODS.find((n) => n.id === Number(hoodIdParam)) ?? NEIGHBORHOODS[0];
  // Về đúng trang vừa đến từ đó (Home, danh sách khu phố...); nếu mở thẳng
  // link này (không có lịch sử) thì về danh sách khu phố cho chắc.
  const goBack = useSafeBack("/neighborhood");

  const [switching, setSwitching] = useState(false);
  const [tab, setTab] = useState<"news" | "literacy" | "waste" | "feedback">("news");
  const [hSearch, setHSearch] = useState("");
  const [hHood, setHHood] = useState<string>(String(hood.id));
  const [hStreet, setHStreet] = useState("");

  const hoodNews = NEWS.filter((n) => n.hoodId === hood.id);
  const hoodFeedbacks = FEEDBACKS.filter((f) => f.address.includes(`KP ${hood.id}`));
  const hoodWaste = WASTE_SCHEDULE.filter((w) => w.hoodId === hood.id);

  // Nguồn hộ gia đình: theo khu phố đang chọn hoặc toàn phường
  const houseScope = hHood === "all"
    ? NEIGHBORHOODS.flatMap((n) => n.households_list)
    : NEIGHBORHOODS[Number(hHood) - 1].households_list;

  const streetOptions = Array.from(new Set(houseScope.map((h) => h.street)));

  const filtered = houseScope.filter((h) => {
    const q = hSearch.trim().toLowerCase();
    const matchQ = !q
      || h.representative.toLowerCase().includes(q)
      || h.phone.includes(q.replace(/[^0-9]/g, ""))
      || h.address.toLowerCase().includes(q);
    const matchStreet = !hStreet || h.street === hStreet;
    return matchQ && matchStreet;
  });

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-[#F5F7FA]" style={{ scrollbarWidth: "none" }}>
        {/* Cover */}
        <div className="relative h-40 bg-blue-900 shrink-0">
          <img src={hood.image} alt={hood.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 to-black/70" />
          <button onClick={goBack}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/35 flex items-center justify-center backdrop-blur-sm active:opacity-60">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button onClick={() => setSwitching(true)}
            className="absolute top-3 right-3 h-9 px-3 rounded-full bg-black/35 flex items-center gap-1.5 backdrop-blur-sm active:opacity-60">
            <ArrowLeftRight size={13} className="text-white" />
            <span className="text-white text-[11.5px] font-bold">Đổi khu phố</span>
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-white font-extrabold text-[19px] leading-tight">{hood.name}</h2>
            <p className="text-white/75 text-[11.5px] flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="shrink-0" /> Phường Xuân Hoà, TP. Hồ Chí Minh
            </p>
          </div>
        </div>

        {/* Stats card */}
        <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-2 py-3.5 grid grid-cols-3">
          {[
            { Icon: Users, label: "Dân số", value: `${hood.population.toLocaleString()} người` },
            { Icon: Home, label: "Hộ gia đình", value: `${hood.households} hộ` },
            { Icon: MapPin, label: "Khu vực", value: "Nội ô" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="min-w-0 px-1.5 flex flex-col items-center gap-1 border-r border-gray-100 last:border-0">
              <Icon size={15} className="text-[#1565C0] shrink-0" />
              <span className="w-full text-[12.5px] font-extrabold text-gray-800 text-center leading-tight break-words">{value}</span>
              <span className="text-[9.5px] text-gray-400 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Management Board */}
        <div className="mx-4 mt-4">
          <h4 className="text-[13px] font-extrabold text-gray-800 mb-2.5">👥 Điều hành khu phố</h4>
          <div className="space-y-2">
            {hood.board.map((m, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  {m.name.split(" ").pop()![0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-800 truncate">{m.name}</p>
                  <p className="text-[11px] text-gray-500">{m.role}</p>
                  <p className="text-[11px] text-[#1565C0] font-medium">{m.phone}</p>
                </div>
                <a href={`tel:${m.phone}`}
                  className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                  <Phone size={15} className="text-white" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-4 mt-4">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-0.5">
            {(["news","literacy","waste","feedback"] as const).map((key) => {
              const labels = { news: "Tin tức", literacy: "Học vụ số", waste: "Lịch gom rác", feedback: "Phản ánh" };
              return (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${tab === key ? "bg-[#1565C0] text-white shadow-sm" : "text-gray-500"}`}>
                  {labels[key]}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            {tab === "news" && (
              <div className="space-y-2">
                {hoodNews.slice(0, 5).map((n) => (
                  <button key={n.id} onClick={() => navigate(`/news/${n.id}`)}
                    className="w-full text-left bg-white rounded-xl p-3 border border-gray-100 flex gap-3 active:bg-gray-50">
                    <img src={n.image} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-800 line-clamp-2">{n.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} />{n.time}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 shrink-0 self-center" />
                  </button>
                ))}
                {hoodNews.length === 0 && <EmptyState icon={<FileText size={24} />} text="Chưa có tin tức" sub="Tin của khu phố sẽ được cập nhật sớm" />}
              </div>
            )}
            {tab === "literacy" && (
              <div className="space-y-2">
                {LITERACY.slice(0, 5).map((l) => (
                  <button key={l.id} onClick={() => navigate(`/news/${l.news.id}`)}
                    className="w-full text-left bg-white rounded-xl p-3 border border-gray-100 flex gap-3 active:bg-gray-50">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <GraduationCap size={17} className="text-[#1565C0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-800 line-clamp-2">{l.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{l.topic}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 shrink-0 self-center" />
                  </button>
                ))}
              </div>
            )}
            {tab === "waste" && (
              <div className="space-y-2">
                {hoodWaste.slice(0, 5).map((w) => (
                  <div key={w.id} className="bg-white rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Trash2 size={15} className="text-emerald-600 shrink-0" />
                      <p className="text-[12.5px] font-semibold text-gray-800 flex-1 min-w-0">{w.route}</p>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5">{w.days} · {w.time}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{w.type} · {w.provider}</p>
                  </div>
                ))}
                {hoodWaste.length === 0 && <EmptyState icon={<Trash2 size={24} />} text="Chưa có lịch thu gom rác" sub="Lịch sẽ được cập nhật sớm" />}
              </div>
            )}
            {tab === "feedback" && (
              <div className="space-y-2">
                {hoodFeedbacks.slice(0, 5).map((f) => (
                  <button key={f.id} onClick={() => navigate("/feedback/track")}
                    className="w-full text-left bg-white rounded-xl p-3 border border-gray-100 active:bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-gray-400">#{f.id}</span>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold ${statusColor(f.status)}`}>
                        {statusLabel(f.status)}
                      </span>
                    </div>
                    <p className="text-[12px] font-semibold text-gray-800 mt-1 line-clamp-2">{f.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{f.type} · {f.date}</p>
                  </button>
                ))}
                {hoodFeedbacks.length === 0 && (
                  <EmptyState icon={<Megaphone size={24} />} text="Chưa có phản ánh" sub="Khu phố chưa có phản ánh nào được ghi nhận" />
                )}
                <button onClick={() => navigate("/feedback/new")}
                  className="w-full py-3 rounded-xl bg-[#1565C0] text-white text-[12.5px] font-bold active:opacity-90">
                  Gửi phản ánh cho khu phố này
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Households */}
        <div className="mx-4 mt-4 mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-[13px] font-extrabold text-gray-800">🏠 Tra cứu hộ gia đình</h4>
            <span className="text-[11px] text-gray-400">{filtered.length} hộ</span>
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 mb-2">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input value={hSearch} onChange={(e) => setHSearch(e.target.value)}
              placeholder="Tên chủ hộ, số điện thoại hoặc địa chỉ..."
              className="flex-1 text-[12px] outline-none" />
            {hSearch && <button onClick={() => setHSearch("")} className="text-gray-400 active:opacity-60"><X size={12} /></button>}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="relative">
              <select value={hHood} onChange={(e) => { setHHood(e.target.value); setHStreet(""); }}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-7 py-2.5 text-[12px] outline-none focus:border-[#1565C0]">
                <option value={hood.id}>{hood.name}</option>
                <option value="all">Tất cả khu phố</option>
                {NEIGHBORHOODS.filter((n) => n.id !== hood.id).map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={hStreet} onChange={(e) => setHStreet(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-7 py-2.5 text-[12px] outline-none focus:border-[#1565C0]">
                <option value="">Tất cả tuyến đường</option>
                {streetOptions.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {(hSearch || hStreet || hHood !== String(hood.id)) && (
            <button onClick={() => { setHSearch(""); setHStreet(""); setHHood(String(hood.id)); }}
              className="mb-2 text-[11.5px] text-[#1565C0] font-semibold active:opacity-60">
              Xoá bộ lọc
            </button>
          )}
          {filtered.length === 0 ? (
            <EmptyState icon={<Users size={22} />} text="Không tìm thấy hộ gia đình" sub="Thử đổi tuyến đường, khu phố hoặc từ khoá khác" />
          ) : (
            <div className="space-y-1.5">
              {filtered.slice(0, 30).map((h) => (
                <div key={`${h.hoodId}-${h.id}`} className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Home size={13} className="text-[#1565C0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-bold text-gray-800 truncate">{h.representative}</p>
                      {hHood === "all" && (
                        <span className="text-[9px] font-bold text-[#1565C0] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full shrink-0">
                          KP {h.hoodId}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-gray-400 truncate">{h.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11.5px] text-[#1565C0] font-semibold">{h.phone}</p>
                    <p className="text-[9.5px] text-gray-400">{h.members} thành viên</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {switching && (
          <NeighborhoodSwitcherModal
            currentId={hood.id}
            onClose={() => setSwitching(false)}
            onSelect={(id) => { setSwitching(false); navigate(`/neighborhood/${id}`); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
