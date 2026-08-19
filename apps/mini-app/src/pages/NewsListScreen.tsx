import { useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { useNavigate } from "react-router";
import { NEIGHBORHOODS, NEWS, TICKER_ITEMS, newsById } from "../data";
import { AppHeader } from "../components/shared/AppHeader";
import { EmptyState } from "../components/shared/EmptyState";

// ─── SCREEN: NEWS LIST ───────────────────────────────────────────────────────
export default function NewsListScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const list = NEWS.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Tin tức - Điểm tin" onBack={() => navigate("/")} />
        <div className="px-4 pb-3">
          <div className="flex items-center bg-white/20 rounded-xl px-3 py-2.5 gap-2">
            <Search size={15} className="text-white/60" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tin tức..."
              className="flex-1 bg-transparent text-white placeholder-white/55 text-[13px] outline-none" />
            {query && <button onClick={() => setQuery("")} className="text-white/70"><X size={14} /></button>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
        <h3 className="text-[13px] font-extrabold text-gray-800 mb-2">Điểm tin</h3>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-4">
          {TICKER_ITEMS.map((t, i) => (
            <button key={i} onClick={() => navigate(`/news/${newsById(t.newsId).id}`)}
              className="w-full text-left px-3.5 py-3 flex items-center gap-2 active:bg-gray-50">
              <span className="flex-1 text-[12px] text-gray-700 leading-snug">{t.text}</span>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>

        <h3 className="text-[13px] font-extrabold text-gray-800 mb-2">Tất cả tin tức</h3>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {list.map((n) => (
            <button key={n.id} onClick={() => navigate(`/news/${n.id}`)}
              className="w-full flex gap-3 p-3 text-left active:bg-gray-50">
              <img src={n.image} alt="" className="w-[92px] h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <p className="text-[12.5px] font-semibold text-gray-900 leading-snug line-clamp-2">{n.title}</p>
                <span className="text-[10.5px] text-gray-400">{n.time} · {NEIGHBORHOODS[(n.hoodId ?? 1) - 1].name}</span>
              </div>
            </button>
          ))}
        </div>
        {list.length === 0 && <EmptyState icon={<Search size={26} />} text="Không tìm thấy tin tức" />}
      </div>
    </div>
  );
}
