import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { AppHeader } from "../components/shared/AppHeader";

// ─── SCREEN: FEEDBACK MAIN ───────────────────────────────────────────────────
export default function FeedbackScreen() {
  const navigate = useNavigate();

  const items = [
    { path: "/feedback/new", emoji: "📝", label: "Gửi phản ánh", desc: "Gửi kiến nghị, phản ánh đến chính quyền phường", grad: "from-[#1565C0] to-[#1976D2]" },
    { path: "/feedback/track", emoji: "🔍", label: "Theo dõi phản ánh", desc: "Tra cứu tiến độ xử lý phản ánh của bạn", grad: "from-green-500 to-teal-600" },
    { path: "/feedback/guide", emoji: "📖", label: "Hướng dẫn gửi phản ánh", desc: "5 bước gửi phản ánh, quy trình và thời hạn xử lý", grad: "from-purple-500 to-indigo-600" },
    { path: "/feedback", emoji: "📞", label: "Đường dây nóng", desc: "Liên hệ trực tiếp: 02513.123.456", grad: "from-orange-400 to-rose-500" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Phản ánh kiến nghị" onBack={() => navigate("/")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)}
            className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform text-left">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-2xl shadow-md shrink-0`}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-800 text-[13.5px]">{item.label}</p>
              <p className="text-gray-500 text-[11.5px] mt-0.5 leading-snug">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>
        ))}

        {/* Stats */}
        <div className="bg-[#1565C0] rounded-2xl p-4 mt-1">
          <p className="text-[12px] font-bold text-white/80 mb-3">📊 Thống kê tháng 7/2024</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: "47", label: "Tiếp nhận", color: "text-white" },
              { num: "39", label: "Đã xử lý", color: "text-green-300" },
              { num: "8", label: "Đang xử lý", color: "text-yellow-300" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.num}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
