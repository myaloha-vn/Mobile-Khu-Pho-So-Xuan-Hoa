import { AlertCircle, CheckCircle2, ChevronDown, Clock, Phone, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { GUIDE_FLOW, GUIDE_STEPS } from "../data";
import { AppHeader } from "../components/shared/AppHeader";

// ─── SCREEN: HƯỚNG DẪN GỬI PHẢN ÁNH ────────────────────────────────────────
export default function FeedbackGuideScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Hướng dẫn gửi phản ánh" onBack={() => navigate("/feedback")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5" style={{ scrollbarWidth: "none" }}>
        <div className="rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#1E88E5] p-4 shadow-md shadow-blue-200">
          <p className="text-[14px] font-extrabold text-white">Gửi phản ánh đúng cách</p>
          <p className="text-[12px] text-blue-50 leading-relaxed mt-1.5">
            Phản ánh của người dân là kênh thông tin quan trọng giúp UBND phường Xuân Hoà xử lý kịp thời các vấn đề
            trên địa bàn. Phản ánh đầy đủ thông tin sẽ được giải quyết nhanh hơn.
          </p>
        </div>

        {/* Các bước thực hiện */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">Các bước thực hiện</p>
          <div className="space-y-3.5">
            {GUIDE_STEPS.map((st, i) => (
              <div key={st.title} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-[#1565C0] text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-extrabold text-gray-800">{st.title}</p>
                  <p className="text-[12px] text-gray-600 leading-relaxed mt-1">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quy trình xử lý */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">Quy trình tiếp nhận và xử lý</p>
          <div className="space-y-2.5">
            {GUIDE_FLOW.map((f, i) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 w-[104px] text-center ${f.tone}`}>
                  {f.label}
                </span>
                <span className="text-[12px] text-gray-600 flex-1 leading-snug">{f.desc}</span>
                {i < GUIDE_FLOW.length - 1 && <ChevronDown size={14} className="text-gray-300 shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 text-[11.5px] text-gray-500 leading-relaxed">
            <Clock size={13} className="text-[#1565C0] shrink-0 mt-0.5" />
            Thời hạn xử lý thông thường là 07 ngày làm việc. Trường hợp phức tạp cần phối hợp nhiều đơn vị,
            phường sẽ thông báo gia hạn và nêu rõ lý do.
          </div>
        </div>

        {/* Nên và không nên */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white rounded-2xl border border-green-100 p-4">
            <p className="text-[12.5px] font-extrabold text-green-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Nên làm
            </p>
            <ul className="space-y-1.5">
              {[
                "Ghi rõ số nhà, tên đường, khu phố nơi xảy ra sự việc.",
                "Chụp ảnh hiện trường ngay khi phát hiện, còn nguyên trạng.",
                "Để lại số điện thoại để cán bộ liên hệ xác minh khi cần.",
                "Theo dõi mã phản ánh và bổ sung thông tin nếu được yêu cầu.",
              ].map((t) => (
                <li key={t} className="text-[12px] text-gray-600 leading-relaxed flex gap-2">
                  <span className="text-green-600 shrink-0">•</span>{t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 p-4">
            <p className="text-[12.5px] font-extrabold text-red-600 mb-2 flex items-center gap-1.5">
              <AlertCircle size={15} /> Không tiếp nhận
            </p>
            <ul className="space-y-1.5">
              {[
                "Nội dung sai sự thật, xúc phạm tổ chức, cá nhân.",
                "Phản ánh trùng lặp nhiều lần về cùng một sự việc đang xử lý.",
                "Tranh chấp dân sự giữa các hộ, thuộc thẩm quyền toà án.",
                "Nội dung không thuộc địa bàn phường Xuân Hoà.",
              ].map((t) => (
                <li key={t} className="text-[12px] text-gray-600 leading-relaxed flex gap-2">
                  <span className="text-red-500 shrink-0">•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cam kết bảo mật */}
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex gap-2.5">
          <ShieldCheck size={17} className="text-[#1565C0] shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-gray-600 leading-relaxed">
            Thông tin người gửi được bảo mật và chỉ cung cấp cho cán bộ có thẩm quyền xử lý hồ sơ.
            Người dân có thể yêu cầu không công khai danh tính trong nội dung phản hồi.
          </p>
        </div>

        <div className="flex gap-2.5 pb-2">
          <a href="tel:02513123456"
            className="flex-1 py-3.5 rounded-xl border border-[#1565C0] text-[#1565C0] text-[13px] font-bold flex items-center justify-center gap-2 active:bg-blue-50">
            <Phone size={15} /> Đường dây nóng
          </a>
          <button onClick={() => navigate("/feedback/new")}
            className="flex-1 py-3.5 rounded-xl bg-[#1565C0] text-white text-[13px] font-bold active:opacity-90">
            Gửi phản ánh ngay
          </button>
        </div>
      </div>
    </div>
  );
}
