import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, ChevronRight, Edit3 } from "lucide-react";
import { useNavigate } from "react-router";
import { BANNERS, NEWS, TICKER_ITEMS, newsById } from "../data";
import { useHousehold } from "../hooks/useAppStorage";
import logoXuanHoa from "../assets/logo-xuan-hoa.png";
import iconKhuPho from "../assets/icon-khu-pho.png";
import iconPhanAnh from "../assets/icon-phan-anh.png";
import { RobotIcon } from "../components/shared/RobotIcon";
import { XuanHoaMapSection } from "../components/shared/XuanHoaMapSection";

// ─── SCREEN: HOME ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigate = useNavigate();
  const [household] = useHousehold();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER_ITEMS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Đã khai báo hộ gia đình rồi thì vào thẳng khu phố của mình, khỏi qua danh sách
  const neighborhoodPath = household ? `/neighborhood/${household.hoodId}` : "/neighborhood";

  const utilities = [
    { path: "/assistant", icon: <RobotIcon size={96} />, bare: true, label: "Trợ lý ảo" },
    { path: neighborhoodPath, icon: <img src={iconKhuPho} alt="Khu phố số" className="w-[62px] h-[62px] object-contain" />, bare: true, label: "Khu phố số" },
    { path: "/feedback", icon: <img src={iconPhanAnh} alt="Phản ánh kiến nghị" className="w-[58px] h-[58px] object-contain" />, bare: true, label: "Phản ánh kiến nghị" },
  ];

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain bg-white" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="bg-white px-4 pt-2 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logoXuanHoa} alt="Logo phường Xuân Hoà"
            className="w-11 h-11 rounded-full object-contain bg-white shrink-0" />
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-gray-900 leading-tight">Xuân Hoà Số</p>
            <p className="text-[11.5px] text-gray-500 leading-tight mt-0.5">Phường Xuân Hoà, TP. Hồ Chí Minh</p>
          </div>
        </div>
        <button onClick={() => navigate("/notifications")} className="relative p-2 active:opacity-60">
          <Bell size={22} className="text-[#1565C0]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white" />
        </button>
      </div>

      {/* Banner Carousel */}
      <div className="px-3">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-blue-900 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div key={bannerIdx}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }} className="absolute inset-0">
              <img src={BANNERS[bannerIdx].image} alt={BANNERS[bannerIdx].title} className="w-full h-full object-cover" />
              {!BANNERS[bannerIdx].plain && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0D47A1]/70 via-[#0D47A1]/45 to-[#0D47A1]/70" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                    <p className="text-white/85 text-[11px] font-semibold tracking-[0.18em]">{BANNERS[bannerIdx].kicker}</p>
                    <p className="text-white font-extrabold text-[26px] leading-tight tracking-wide mt-1 drop-shadow">{BANNERS[bannerIdx].title}</p>
                    <p className="text-white/90 text-[13px] italic mt-1.5">{BANNERS[bannerIdx].tagline}</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-1.5 items-center py-3">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              className={`rounded-full transition-all ${i === bannerIdx ? "w-4 h-1.5 bg-[#1565C0]" : "w-1.5 h-1.5 bg-gray-300"}`} />
          ))}
        </div>
      </div>

      {/* 3 Main Utilities */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {utilities.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
              <div className={`w-[96px] h-[80px] flex items-center justify-center ${item.bare ? "" : "rounded-[18px] shadow-md"}`}>
                {item.icon}
              </div>
              <span className="text-[11.5px] font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Điểm tin */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-extrabold text-gray-900">Điểm tin</h3>
          <button onClick={() => navigate("/news")}
            className="text-[12px] text-[#1565C0] font-semibold flex items-center gap-0.5 active:opacity-60">
            Xem tất cả <ChevronRight size={13} />
          </button>
        </div>
        <button onClick={() => navigate(`/news/${newsById(TICKER_ITEMS[tickerIdx].newsId).id}`)}
          className="w-full rounded-xl bg-white border border-gray-200 shadow-sm flex items-center gap-2 px-3 py-2.5 overflow-hidden active:bg-gray-50">
          <span className="text-[#1565C0] text-[15px] leading-none shrink-0">•</span>
          <AnimatePresence mode="wait">
            <motion.p key={tickerIdx}
              initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.28 }}
              className="flex-1 text-[12px] text-gray-700 font-medium truncate text-left">
              {TICKER_ITEMS[tickerIdx].text}
            </motion.p>
          </AnimatePresence>
          <span className="shrink-0 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider">HOT</span>
        </button>
      </div>

      {/* Tin tức nổi bật */}
      <div className="px-4 pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-extrabold text-gray-900">Tin tức nổi bật</h3>
          <button onClick={() => navigate("/news/new")}
            className="w-8 h-8 rounded-full bg-[#1565C0] flex items-center justify-center shadow active:scale-90 transition-transform">
            <Edit3 size={14} className="text-white" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {NEWS.map((item) => (
            <button key={item.id} onClick={() => navigate(`/news/${item.id}`)}
              className="w-full flex gap-3 py-3 text-left active:opacity-70">
              <img src={item.image} alt="" className="w-[104px] h-[72px] rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{item.title}</p>
                <span className="text-[11px] text-gray-400">{item.time}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <XuanHoaMapSection />
    </div>
  );
}
