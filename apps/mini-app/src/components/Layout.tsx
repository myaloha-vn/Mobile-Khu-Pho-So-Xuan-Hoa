import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { StatusBar } from "./shared/StatusBar";
import { BottomNav } from "./shared/BottomNav";
import { PopupNoticeModal } from "./shared/PopupNoticeModal";
import { SuggestionFab } from "./shared/SuggestionFab";
import { POPUP_NOTICES, SHOW_SUGGESTION_FAB, type TabName } from "../data";

/** Suy ra tab nào đang sáng ở thanh điều hướng dưới cùng, dựa trên URL hiện tại.
 *  Trả về null cho các trang "con" (chi tiết tin, chat...) - khi đó tab đang
 *  sáng vẫn giữ nguyên như trước, giống hệt hành vi bản gốc. */
function tabForPath(pathname: string): TabName | null {
  if (pathname === "/") return "home";
  if (pathname === "/notifications") return "notifications";
  if (pathname === "/profile") return "profile";
  if (pathname === "/utilities" || pathname === "/map" || pathname === "/waste") return "utilities";
  return null;
}

/** Các trang ẩn thanh điều hướng dưới cùng (bàn phím chat / form cần toàn màn hình) */
const HIDE_NAV_PATHS = new Set(["/chat", "/feedback/new"]);

/**
 * Khung ứng dụng dùng chung cho mọi trang: thanh trạng thái giả lập điện thoại,
 * khung nội dung (nơi <Outlet /> render trang hiện tại theo route), thanh điều
 * hướng dưới cùng, nút nổi Góp ý hệ thống và popup thông báo xuyên trang.
 */
export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabName>("home");

  useEffect(() => {
    const t = tabForPath(location.pathname);
    if (t) setActiveTab(t);
  }, [location.pathname]);

  // ── Thông báo xuyên trang: hiện lại sau mỗi vài lần chuyển trang ──────────
  const notice = POPUP_NOTICES[0];
  const snoozeKey = `xhs_popup_${notice.id}`;
  const isSnoozed = () => {
    try { return localStorage.getItem(snoozeKey) === new Date().toDateString(); } catch { return false; }
  };
  const [popupOpen, setPopupOpen] = useState(() => !isSnoozed());
  const navCount = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    navCount.current += 1;
    if (!popupOpen && !isSnoozed() && navCount.current % notice.repeatEvery === 0) setPopupOpen(true);
    // Chỉ cần theo dõi mỗi khi đường dẫn đổi (tức mỗi lần chuyển trang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleTab = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/");
    else if (tab === "notifications") navigate("/notifications");
    else if (tab === "utilities") navigate("/utilities");
    else if (tab === "profile") navigate("/profile");
  };

  const hideBottomNav = HIDE_NAV_PATHS.has(location.pathname);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1565C0 0%, #42A5F5 50%, #E3F2FD 100%)", fontFamily: "'Be Vietnam Pro', Inter, system-ui, sans-serif" }}
    >
      <div className="relative w-[390px] h-[844px] rounded-[44px] overflow-hidden shadow-2xl flex flex-col bg-[#F5F7FA]"
        style={{ boxShadow: "0 32px 80px rgba(21,101,192,0.35), 0 8px 24px rgba(0,0,0,0.2)" }}>
        <StatusBar />

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col overflow-hidden will-change-transform"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {SHOW_SUGGESTION_FAB && !hideBottomNav && location.pathname !== "/suggestion" && (
          <SuggestionFab onClick={() => navigate("/suggestion")} />
        )}

        {!hideBottomNav && <BottomNav active={activeTab} onNavigate={handleTab} />}

        <AnimatePresence>
          {popupOpen && (
            <PopupNoticeModal
              notice={notice}
              onClose={() => setPopupOpen(false)}
              onSnooze={() => {
                try { localStorage.setItem(snoozeKey, new Date().toDateString()); } catch { /* bỏ qua */ }
                setPopupOpen(false);
              }}
              onOpen={() => {
                setPopupOpen(false);
                if (notice.newsId) navigate(`/news/${notice.newsId}`);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
