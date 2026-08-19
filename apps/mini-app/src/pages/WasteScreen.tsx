import { useState } from "react";
import { ChevronDown, Clock, Info, Phone, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { NEIGHBORHOODS, WASTE_SCHEDULE } from "../data";
import { useHousehold } from "../hooks/useAppStorage";
import { AppHeader } from "../components/shared/AppHeader";
import { EmptyState } from "../components/shared/EmptyState";

// ─── SCREEN: LỊCH GOM RÁC ───────────────────────────────────────────────────
export default function WasteScreen() {
  const navigate = useNavigate();
  const [household] = useHousehold();
  const [hoodId, setHoodId] = useState<number>(household?.hoodId ?? 1);
  const list = WASTE_SCHEDULE.filter((w) => w.hoodId === hoodId);
  const hood = NEIGHBORHOODS[hoodId - 1];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Lịch gom rác" onBack={() => navigate("/utilities")} />
        <div className="px-4 pb-3">
          <div className="relative">
            <select value={hoodId} onChange={(e) => setHoodId(Number(e.target.value))}
              className="w-full appearance-none bg-white/20 text-white rounded-xl pl-3.5 pr-9 py-2.5 text-[13px] font-semibold outline-none">
              {NEIGHBORHOODS.map((n) => (
                <option key={n.id} value={n.id} className="text-gray-800">{n.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5 flex gap-2.5">
          <Info size={17} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-gray-600 leading-relaxed">
            Người dân để rác đúng giờ và đúng nơi quy định. Rác cồng kềnh liên hệ trước với đơn vị thu gom
            để được hướng dẫn thời gian tiếp nhận.
          </p>
        </div>

        {list.length === 0 ? (
          <EmptyState icon={<Trash2 size={26} />} text="Chưa có lịch thu gom" sub="Lịch của khu phố sẽ được cập nhật sớm" />
        ) : (
          list.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Trash2 size={17} className="text-emerald-600" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-extrabold text-gray-800 leading-snug">{w.route}</p>
                  <p className="text-[11.5px] text-gray-500 mt-0.5">{hood.name}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full shrink-0">
                  {w.type}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-[12.5px] text-gray-700">
                  <Clock size={13} className="text-[#1565C0] shrink-0" />
                  <span className="font-semibold">{w.days}</span>
                  <span className="text-gray-400">·</span>
                  <span>{w.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Users size={13} className="text-[#1565C0] shrink-0" /> {w.provider}
                </div>
              </div>
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Phone size={13} className="text-[#1565C0] shrink-0" /> {w.providerPhone}
                </span>
                <a href={`tel:${w.providerPhone.replace(/\s/g, "")}`}
                  className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm active:scale-90 transition-transform shrink-0">
                  <Phone size={14} className="text-white" />
                </a>
              </div>
            </div>
          ))
        )}

        <button onClick={() => navigate("/feedback/new")}
          className="w-full py-3.5 rounded-xl border border-[#1565C0]/30 bg-blue-50 text-[#1565C0] text-[12.5px] font-bold active:bg-blue-100">
          Phản ánh về việc thu gom rác
        </button>
      </div>
    </div>
  );
}
