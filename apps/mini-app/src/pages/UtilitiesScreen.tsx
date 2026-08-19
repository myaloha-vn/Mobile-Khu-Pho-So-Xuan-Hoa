import { MapPin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

// ─── UTILITIES SCREEN ────────────────────────────────────────────────────────
export default function UtilitiesScreen() {
  const navigate = useNavigate();

  const items = [
    {
      path: "/map",
      label: "Bản đồ khu phố Xuân Hoà",
      desc: "Tra cứu vị trí trụ sở, trường học, y tế, chợ và nhà văn hoá",
      icon: <MapPin size={34} className="text-white" />,
      grad: "from-[#1565C0] to-[#1E88E5]",
    },
    {
      path: "/waste",
      label: "Lịch gom rác",
      desc: "Xem lịch thu gom theo tuyến đường của từng khu phố",
      icon: <Trash2 size={34} className="text-white" />,
      grad: "from-[#159957] to-[#22B573]",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] px-4 py-4 shrink-0">
        <h2 className="text-[17px] font-extrabold text-white">Tiện ích</h2>
        <p className="text-[11.5px] text-blue-100 mt-0.5">Chọn tiện ích bạn muốn sử dụng</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "none" }}>
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {items.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="h-[176px] w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 flex flex-col items-center justify-start gap-2.5 active:scale-95 transition-transform">
              <span className={`w-[68px] h-[68px] rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow-md shrink-0`}>
                {item.icon}
              </span>
              <span className="h-[34px] flex items-center text-[13px] font-extrabold text-gray-800 text-center leading-tight line-clamp-2">
                {item.label}
              </span>
              <span className="text-[10.5px] text-gray-400 text-center leading-snug line-clamp-2">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
