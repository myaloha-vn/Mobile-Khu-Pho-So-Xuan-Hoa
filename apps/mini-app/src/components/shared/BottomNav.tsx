import { Bell, Grid3X3, Home, User } from "lucide-react";
import type { TabName } from "../../data";

export function BottomNav({ active, onNavigate }: { active: TabName; onNavigate: (t: TabName) => void }) {
  const tabs: { id: TabName; label: string; Icon: typeof Home }[] = [
    { id: "home", label: "Trang chủ", Icon: Home },
    { id: "notifications", label: "Thông báo", Icon: Bell },
    { id: "utilities", label: "Tiện ích", Icon: Grid3X3 },
    { id: "profile", label: "Cá nhân", Icon: User },
  ];
  return (
    <div className="flex border-t border-gray-100 bg-white shrink-0">
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onNavigate(id)}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors active:opacity-60 ${active === id ? "text-[#1565C0]" : "text-gray-400"}`}>
          <Icon size={20} />
          <span className="text-[9.5px] font-semibold">{label}</span>
          {active === id && <div className="w-1 h-1 rounded-full bg-[#1565C0]" />}
        </button>
      ))}
    </div>
  );
}
