import { useNavigate } from "react-router";
import { AppHeader } from "../components/shared/AppHeader";
import { XuanHoaMapSection } from "../components/shared/XuanHoaMapSection";

// ─── SCREEN: BẢN ĐỒ KHU PHỐ ─────────────────────────────────────────────────
export default function MapScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Bản đồ khu phố Xuân Hoà" onBack={() => navigate("/utilities")} />
      </div>
      <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: "none" }}>
        <XuanHoaMapSection />
      </div>
    </div>
  );
}
