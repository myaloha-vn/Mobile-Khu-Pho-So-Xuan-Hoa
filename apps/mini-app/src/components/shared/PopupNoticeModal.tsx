import { motion } from "motion/react";
import { X } from "lucide-react";
import type { PopupNotice } from "../../data";

// ─── POPUP THÔNG BÁO XUYÊN TRANG ────────────────────────────────────────────
export function PopupNoticeModal({ notice, onClose, onSnooze, onOpen }: {
  notice: PopupNotice; onClose: () => void; onSnooze: () => void; onOpen: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] bg-black/55 flex items-center justify-center px-6"
      onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-[300px]">
        <button onClick={onClose}
          className="absolute -top-11 right-0 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow active:scale-90">
          <X size={18} className="text-gray-700" />
        </button>

        <div className="rounded-[22px] overflow-hidden bg-white shadow-2xl">
          <div className="relative">
            <img src={notice.image} alt={notice.title} className="w-full aspect-video object-cover" />
            <span className="absolute top-2.5 left-2.5 bg-[#1565C0] text-white text-[9.5px] font-extrabold tracking-wider px-2 py-1 rounded-full">
              {notice.badge}
            </span>
          </div>
          <div className="px-4 pt-3.5 pb-4">
            <p className="text-[15px] font-extrabold text-gray-900 leading-snug">{notice.title}</p>
            <p className="text-[12px] text-gray-600 leading-relaxed mt-1.5">{notice.desc}</p>
            <button onClick={onOpen}
              className="w-full mt-3.5 py-3 rounded-xl bg-[#1565C0] text-white text-[13.5px] font-extrabold active:scale-[0.98] transition-transform">
              {notice.cta}
            </button>
            <button onClick={onSnooze}
              className="w-full mt-2 py-2 text-[11.5px] text-gray-400 font-semibold active:opacity-60">
              Không hiển thị lại hôm nay
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
