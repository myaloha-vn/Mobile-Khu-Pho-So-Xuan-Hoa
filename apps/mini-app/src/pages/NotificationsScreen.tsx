import { useState } from "react";
import { useNavigate } from "react-router";

// ─── SCREEN: NOTIFICATIONS ───────────────────────────────────────────────────
export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([
    { emoji: "📋", title: "Nhắc nhở nộp thuế đất quý III/2024, hạn cuối 31/08/2024", time: "30 phút trước", unread: true },
    { emoji: "✅", title: "Phản ánh #PK002 của bạn đã được xử lý hoàn thành", time: "2 giờ trước", unread: true },
    { emoji: "📢", title: "Thông báo: Họp tổ dân phố KP 3 lúc 19:00 ngày 05/08/2024", time: "5 giờ trước", unread: false },
    { emoji: "🎉", title: "Ngày hội Toàn dân đoàn kết xây dựng đời sống văn hoá ngày 04/08/2024", time: "1 ngày trước", unread: false },
    { emoji: "🔔", title: "Lịch tiếp dân: Thứ 3 ngày 06/08 và Thứ 5 ngày 08/08/2024", time: "2 ngày trước", unread: false },
    { emoji: "🏆", title: "Phường Xuân Hoà được công nhận đạt chuẩn tiếp cận pháp luật năm 2024", time: "3 ngày trước", unread: false },
  ]);

  const hasUnread = notifs.some((n) => n.unread);

  // Đánh dấu đã đọc xong thì về thẳng trang chủ luôn.
  const markAllRead = () => {
    setNotifs((cur) => cur.map((n) => ({ ...n, unread: false })));
    navigate("/");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] px-4 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold text-white">Thông báo</h2>
          <button type="button" onClick={markAllRead} disabled={!hasUnread}
            className="text-[12px] text-blue-200 font-semibold active:opacity-60 disabled:opacity-40">
            Đọc tất cả
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100" style={{ scrollbarWidth: "none" }}>
        {notifs.map((n, i) => (
          <div key={i} className={`flex gap-3 px-4 py-4 active:bg-gray-50 ${n.unread ? "bg-blue-50/60" : "bg-white"}`}>
            <span className="text-2xl shrink-0">{n.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-[12.5px] leading-snug ${n.unread ? "font-semibold text-gray-800" : "text-gray-500"}`}>{n.title}</p>
              <p className="text-[10.5px] text-gray-400 mt-1.5">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 bg-[#1565C0] rounded-full mt-1.5 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
