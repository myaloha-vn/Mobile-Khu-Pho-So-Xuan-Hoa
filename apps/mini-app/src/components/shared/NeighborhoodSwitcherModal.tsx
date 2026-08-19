import { useState } from "react";
import { motion } from "motion/react";
import { Search, X } from "lucide-react";
import { NEIGHBORHOODS } from "../../data";

// ─── POPUP: CHỌN KHU PHỐ KHÁC (dùng ở header trang Chi tiết khu phố) ────────
export function NeighborhoodSwitcherModal({
  currentId, onSelect, onClose,
}: { currentId: number; onSelect: (id: number) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const filtered = NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/45 flex items-end" onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ y: 420 }} animate={{ y: 0 }} exit={{ y: 420 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="w-full max-h-[78%] bg-white rounded-t-3xl flex flex-col overflow-hidden">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
        <div className="px-4 pt-2 pb-3 flex items-center justify-between shrink-0">
          <p className="text-[15px] font-extrabold text-gray-900">Chọn khu phố khác</p>
          <button onClick={onClose} className="p-1 -mr-1 text-gray-400 active:opacity-60"><X size={18} /></button>
        </div>
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 gap-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus
              placeholder="Tìm khu phố..."
              className="flex-1 bg-transparent text-[13px] outline-none" />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 active:opacity-60"><X size={13} /></button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-5" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-3 gap-2.5">
            {filtered.map((n) => {
              const active = n.id === currentId;
              return (
                <button key={n.id} onClick={() => onSelect(n.id)}
                  className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 border transition-colors ${
                    active ? "bg-[#1565C0] border-[#1565C0]" : "bg-white border-gray-100 shadow-sm active:bg-gray-50"
                  }`}>
                  <span className={`text-[11px] font-extrabold text-center leading-tight ${active ? "text-white" : "text-gray-800"}`}>
                    {n.name}
                  </span>
                  <span className={`text-[9.5px] ${active ? "text-blue-100" : "text-gray-400"}`}>{n.households} hộ</span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-[12px] text-gray-400 py-8">Không tìm thấy khu phố</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
