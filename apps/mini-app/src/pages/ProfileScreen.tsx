import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, CheckCircle2, ChevronRight, Edit3, MapPin, Phone, User } from "lucide-react";
import { useNavigate } from "react-router";
import { NEIGHBORHOODS, ZALO_USER } from "../data";
import { useHousehold } from "../hooks/useAppStorage";
import logoXuanHoa from "../assets/logo-xuan-hoa.png";

// ─── SCREEN: PROFILE ─────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigate = useNavigate();
  const [household, setHousehold] = useHousehold();
  const [confirmOut, setConfirmOut] = useState(false);
  const myHood = household ? NEIGHBORHOODS[household.hoodId - 1] : null;

  const logout = () => {
    setHousehold(null);      // xoá khai báo -> lần sau phải khai báo lại
    setConfirmOut(false);
    navigate("/neighborhood");
  };

  return (
    <div className="relative flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-gradient-to-b from-[#1565C0] to-[#1976D2] px-4 pt-4 pb-12 shrink-0">
        <h2 className="text-[17px] font-extrabold text-white mb-5">Cá nhân</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-white/30 flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logoXuanHoa} alt="Logo phường Xuân Hoà" className="w-14 h-14 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-extrabold text-[16px] truncate">{household?.name ?? ZALO_USER.name}</p>
            <p className="text-blue-200 text-[12px] truncate">
              {myHood ? `${myHood.name}, Phường Xuân Hoà` : "Chưa khai báo hộ gia đình"}
            </p>
            <p className="text-blue-200/80 text-[11px] mt-0.5 flex items-center gap-1">
              <Phone size={9} /> {household?.phone ?? ZALO_USER.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Tài khoản Zalo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0068FF] flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-[12px]">Zalo</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold text-gray-800">Đã đăng nhập bằng Zalo</p>
              <p className="text-[11px] text-gray-400">Số điện thoại Zalo: {ZALO_USER.phone}</p>
            </div>
            <CheckCircle2 size={17} className="text-green-500 shrink-0" />
          </div>
        </div>

        {/* Thông tin chủ hộ đã khai báo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-extrabold text-gray-800">Thông tin chủ hộ</p>
            {household && (
              <button onClick={() => navigate("/profile/edit")}
                className="text-[11px] text-[#1565C0] font-semibold flex items-center gap-1 active:opacity-60">
                <Edit3 size={11} /> Cập nhật
              </button>
            )}
          </div>

          {household ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[12.5px] text-gray-700">
                <User size={13} className="text-[#1565C0] shrink-0" />
                <span className="font-semibold">{household.name}</span>
                <span className="text-gray-400">· {household.role === "member" ? "Thành viên" : "Chủ hộ"}</span>
              </div>
              <div className="flex items-center gap-2 text-[12.5px] text-gray-600">
                <Phone size={13} className="text-[#1565C0] shrink-0" /> {household.phone}
              </div>
              <div className="flex items-start gap-2 text-[12.5px] text-gray-600">
                <MapPin size={13} className="text-[#1565C0] shrink-0 mt-0.5" />
                <span className="leading-snug">{household.address}</span>
              </div>
              <button onClick={() => navigate(`/neighborhood/${myHood!.id}`)}
                className="w-full mt-1 pt-2.5 border-t border-gray-100 flex items-center gap-2 text-[12.5px] text-gray-600 active:opacity-60">
                <Building2 size={13} className="text-[#1565C0] shrink-0" />
                <span className="font-semibold text-gray-800">{myHood!.name}</span>
                <ChevronRight size={14} className="text-gray-300 ml-auto" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Bạn chưa khai báo thông tin chủ hộ. Khai báo một lần để hệ thống xác định khu phố và tự điền
                thông tin khi gửi phản ánh.
              </p>
              <button onClick={() => navigate("/neighborhood")}
                className="w-full py-3 rounded-xl bg-[#1565C0] text-white text-[13px] font-bold active:scale-[0.98] transition-transform">
                Khai báo chủ hộ
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { emoji: "📣", label: "Phản ánh của tôi", action: () => navigate("/feedback/track") },
            { emoji: "🔖", label: "Mục đã lưu", action: () => navigate("/saved") },
            { emoji: "💬", label: "Góp ý hệ thống", action: () => navigate("/suggestion") },
            { emoji: "🔔", label: "Cài đặt thông báo", action: () => {} },
            { emoji: "❓", label: "Hỗ trợ & Hướng dẫn", action: () => {} },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-0 text-left active:bg-gray-50 transition-colors">
              <span className="text-xl shrink-0">{item.emoji}</span>
              <span className="flex-1 text-[13px] font-semibold text-gray-700">{item.label}</span>
              <ChevronRight size={15} className="text-gray-300" />
            </button>
          ))}
        </div>

        {household && (
          <button onClick={() => setConfirmOut(true)}
            className="w-full mt-3 py-3.5 bg-red-50 rounded-xl border border-red-100 text-red-500 text-[13px] font-bold flex items-center justify-center gap-2 active:bg-red-100">
            🚪 Đăng xuất
          </button>
        )}
        <p className="text-center text-[10.5px] text-gray-400 mt-3">Xuân Hoà Số · Zalo Mini App · Phiên bản 1.0</p>
      </div>

      {/* Xác nhận đăng xuất */}
      <AnimatePresence>
        {confirmOut && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-end z-50" onClick={() => setConfirmOut(false)}>
            <motion.div initial={{ y: 220 }} animate={{ y: 0 }} exit={{ y: 220 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-5 pb-7 space-y-3">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
              <p className="text-[15px] font-extrabold text-gray-900 text-center">Đăng xuất khỏi ứng dụng?</p>
              <p className="text-[12.5px] text-gray-500 text-center leading-relaxed">
                Thông tin chủ hộ đã khai báo sẽ bị xoá. Lần sau bạn cần khai báo lại để sử dụng
                Khu phố số và gửi phản ánh nhanh.
              </p>
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => setConfirmOut(false)}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 active:bg-gray-50">
                  Huỷ
                </button>
                <button onClick={logout}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-[13px] font-bold active:opacity-80">
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
