import { MapPin, Navigation, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { mapsLink } from "../data";
import { useSavedPlaces } from "../hooks/useAppStorage";
import { AppHeader } from "../components/shared/AppHeader";
import { EmptyState } from "../components/shared/EmptyState";

// ─── SCREEN: MỤC ĐÃ LƯU ─────────────────────────────────────────────────────
export default function SavedScreen() {
  const navigate = useNavigate();
  const { saved, remove } = useSavedPlaces();

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Mục đã lưu" onBack={() => navigate("/profile")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5" style={{ scrollbarWidth: "none" }}>
        {saved.length === 0 ? (
          <EmptyState icon={<Star size={26} />} text="Chưa lưu địa điểm nào"
            sub="Mở Bản đồ Xuân Hoà, chọn một địa điểm rồi bấm Lưu" />
        ) : (
          saved.map((pl) => (
            <div key={pl.id} className="bg-white rounded-2xl border border-gray-100 p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Star size={16} className="text-amber-500" fill="currentColor" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-extrabold text-gray-800">{pl.name}</p>
                  <p className="text-[11.5px] text-gray-500 leading-snug mt-0.5">{pl.venue}</p>
                  <p className="text-[10.5px] text-gray-400 mt-1">{pl.group} · Lưu ngày {fmt(pl.savedAt)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <a href={mapsLink(pl.lat, pl.lng)} target="_blank" rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#1565C0] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-90">
                  <Navigation size={13} /> Chỉ đường
                </a>
                <button onClick={() => remove(pl.id)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[12px] font-bold active:bg-gray-50">
                  Bỏ lưu
                </button>
              </div>
            </div>
          ))
        )}

        <button onClick={() => navigate("/map")}
          className="w-full py-3.5 rounded-xl border border-[#1565C0]/30 bg-blue-50 text-[#1565C0] text-[12.5px] font-bold flex items-center justify-center gap-1.5 active:bg-blue-100">
          <MapPin size={15} /> Mở bản đồ Xuân Hoà
        </button>
      </div>
    </div>
  );
}
