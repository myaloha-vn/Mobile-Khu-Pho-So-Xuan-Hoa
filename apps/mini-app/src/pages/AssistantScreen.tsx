import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { SUGGESTED } from "../data";
import { AppHeader } from "../components/shared/AppHeader";
import { RobotIcon } from "../components/shared/RobotIcon";

// ─── SCREEN: ASSISTANT ───────────────────────────────────────────────────────
export default function AssistantScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FA]" style={{ scrollbarWidth: "none" }}>
      <div className="bg-gradient-to-b from-[#1565C0] to-[#1E88E5] px-4 pt-2 pb-10">
        <AppHeader title="Trợ lý ảo" onBack={() => navigate("/")} />
        <div className="flex flex-col items-center mt-1 gap-2">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.6 }}
            className="w-[132px] h-[114px] flex items-center justify-center">
            <RobotIcon size={132} className="drop-shadow-xl" />
          </motion.div>
          <p className="text-white font-extrabold text-[17px]">Trợ lý ảo Xuân Hoà</p>
          <p className="text-blue-100 text-[11.5px] text-center px-8 leading-relaxed">
            Hỏi đáp thông minh về thủ tục hành chính và thông tin quy hoạch đất đai
          </p>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-3">
        {[
          { type: "public", emoji: "🏛️", title: "Dịch vụ công", desc: "Tra cứu thủ tục hành chính, hướng dẫn nộp hồ sơ trực tuyến", grad: "from-[#1565C0] to-[#1976D2]" },
          { type: "planning", emoji: "🗺️", title: "Thông tin quy hoạch", desc: "Tra cứu quy hoạch đất đai, chỉ giới xây dựng, dự án hạ tầng", grad: "from-indigo-500 to-purple-600" },
        ].map((item) => (
          <button key={item.type} onClick={() => navigate("/chat", { state: { chatType: item.type } })}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform text-left">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-3xl shadow-md shrink-0`}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-800 text-[14px]">{item.title}</p>
              <p className="text-gray-500 text-[12px] mt-0.5 leading-snug">{item.desc}</p>
            </div>
            <ChevronRight size={17} className="text-gray-300 shrink-0" />
          </button>
        ))}

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-[12px] font-bold text-[#1565C0] mb-3">💡 Câu hỏi thường gặp</p>
          {SUGGESTED.public.slice(0, 4).map((q, i) => (
            <button key={i} onClick={() => navigate("/chat", { state: { chatType: "public", initialQ: q } })}
              className="w-full text-left py-2.5 border-b border-blue-100 last:border-0 text-[12px] text-gray-700 flex items-center gap-2.5 active:opacity-60">
              <span className="w-5 h-5 rounded-full bg-[#1565C0]/10 text-[#1565C0] text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
