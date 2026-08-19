import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare } from "lucide-react";

export function SuggestionFab({ onClick }: { onClick: () => void }) {
  const [expanded, setExpanded] = useState(true);

  // Thu gọn thành nút tròn sau 6 giây để không che nội dung
  useEffect(() => {
    const t = setTimeout(() => setExpanded(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.94 }}
      className="absolute right-3.5 bottom-[86px] z-40 flex items-center gap-2 rounded-full bg-[#1565C0] text-white shadow-lg shadow-blue-900/25 pl-3.5 pr-4 py-3 active:opacity-90"
      style={{ paddingRight: expanded ? 16 : 12, paddingLeft: expanded ? 14 : 12 }}
    >
      <MessageSquare size={18} className="shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="text-[12.5px] font-extrabold whitespace-nowrap overflow-hidden"
          >
            Góp ý hệ thống
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
