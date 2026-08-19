import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, ChevronDown, ChevronRight, MapPin, Navigation, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { MAP_CENTER, MAP_PLACES, MY_MAPS_ID, mapsLink } from "../../data";
import { useSavedPlaces } from "../../hooks/useAppStorage";

// ─── SECTION: BẢN ĐỒ XUÂN HOÀ (dùng chung trang chủ và tiện ích) ────────────
export function XuanHoaMapSection() {
  const navigate = useNavigate();
  const { isSaved, toggle } = useSavedPlaces();
  const [active, setActive] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-extrabold text-gray-900">Bản đồ Xuân Hoà</h3>
        <a href={`https://www.google.com/maps/d/viewer?mid=${MY_MAPS_ID}`} target="_blank" rel="noreferrer"
          className="text-[12px] text-[#1565C0] font-semibold flex items-center gap-0.5 active:opacity-60">
          Mở bản đồ lớn <ChevronRight size={13} />
        </a>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="relative">
          <iframe
            title="Bản đồ phường Xuân Hoà"
            src={`https://www.google.com/maps/d/embed?mid=${MY_MAPS_ID}&ll=${MAP_CENTER.lat}%2C${MAP_CENTER.lng}&z=15`}
            className="w-full h-[300px] border-0"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5 bg-white/95 rounded-xl px-2.5 py-1.5 shadow-sm pointer-events-none">
            <p className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1">
              <MapPin size={11} className="text-[#1565C0]" /> Phường Xuân Hoà
            </p>
            <p className="text-[10px] text-gray-500">TP. Hồ Chí Minh · 18 khu phố</p>
          </div>
        </div>

        <div className="p-3">
          {MAP_PLACES.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-extrabold text-gray-800">Địa điểm trên bản đồ</p>
            <span className="text-[10.5px] text-gray-400">{MAP_PLACES.length} điểm</span>
          </div>
          )}

          <div className="space-y-1.5 max-h-[268px] overflow-y-auto pr-0.5" style={{ scrollbarWidth: "none" }}>
            {MAP_PLACES.map((pl) => {
              const on = active === pl.id;
              const saved = isSaved(pl.id);
              return (
                <div key={pl.id}
                  className={`rounded-xl border transition-colors ${on ? "border-[#1565C0] bg-blue-50" : "border-gray-100 bg-white"}`}>
                  <button onClick={() => setActive(on ? null : pl.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${on ? "bg-[#1565C0]" : "bg-blue-50"}`}>
                      <MapPin size={15} className={on ? "text-white" : "text-[#1565C0]"} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12.5px] font-bold text-gray-800 truncate">{pl.name}</span>
                      <span className="block text-[10.5px] text-gray-500 truncate">{pl.group} · {pl.venue}</span>
                    </span>
                    {saved && <Star size={14} className="text-amber-500 shrink-0" fill="currentColor" />}
                    <ChevronDown size={14} className={`text-gray-300 shrink-0 transition-transform ${on ? "rotate-180" : ""}`} />
                  </button>

                  {on && (
                    <div className="px-3 pb-3 space-y-2">
                      <p className="text-[11.5px] text-gray-600 leading-relaxed">{pl.venue}</p>
                      <p className="text-[10.5px] text-gray-400">Toạ độ: {pl.lat.toFixed(6)}, {pl.lng.toFixed(6)}</p>
                      <div className="flex gap-2">
                        <a href={mapsLink(pl.lat, pl.lng)} target="_blank" rel="noreferrer"
                          className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-90">
                          <Navigation size={13} /> Chỉ đường
                        </a>
                        <button onClick={() => showToast(toggle(pl) ? "Đã lưu địa điểm vào Mục đã lưu" : "Đã bỏ khỏi Mục đã lưu")}
                          className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 border active:opacity-80 ${
                            saved ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-[#1565C0]/30 text-[#1565C0]"
                          }`}>
                          <Star size={13} fill={saved ? "currentColor" : "none"} /> {saved ? "Đã lưu" : "Lưu"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={() => navigate("/neighborhood")}
            className="w-full mt-3 py-3 rounded-xl border border-[#1565C0]/30 bg-blue-50 text-[#1565C0] text-[12.5px] font-bold flex items-center justify-center gap-1.5 active:bg-blue-100">
            <Building2 size={15} /> Xem 18 khu phố trên địa bàn
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 bg-gray-900/90 text-white text-[12px] font-semibold px-4 py-2.5 rounded-full shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
