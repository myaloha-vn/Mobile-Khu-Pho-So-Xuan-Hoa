import { Check, Clock, MapPin, XCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { FEEDBACKS, statusColor, statusLabel } from "../data";
import { AppHeader } from "../components/shared/AppHeader";

// ─── SCREEN: FEEDBACK TRACK ──────────────────────────────────────────────────
export default function FeedbackTrackScreen() {
  const navigate = useNavigate();
  // "Từ chối" không nằm trong tiến trình - đó là nhánh kết thúc riêng, xử lý bên dưới
  const STEPS = ["pending", "assigned", "processing", "resolved"];
  const STEP_LABELS = ["Chờ xử lý", "Đã phân công", "Đang xử lý", "Đã giải quyết"];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Theo dõi phản ánh" onBack={() => navigate("/feedback")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        {FEEDBACKS.map((fb) => {
          const isRejected = fb.status === "rejected";
          const stepIdx = STEPS.indexOf(fb.status);
          return (
            <div key={fb.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wide">#{fb.id}</span>
                    <p className="text-[13.5px] font-extrabold text-gray-800 mt-0.5">{fb.type}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColor(fb.status)}`}>
                    {statusLabel(fb.status)}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed">{fb.content}</p>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1"><MapPin size={10} />{fb.address}</p>
              </div>

              {/* Nhánh từ chối: hiện lý do thay cho thanh tiến trình */}
              {isRejected ? (
              <div className="border-t border-gray-100 px-4 pt-3 pb-1">
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 mb-3">
                  <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold text-red-700">Phản ánh không được tiếp nhận</p>
                    {fb.note && (
                      <p className="text-[11px] text-red-600 leading-relaxed mt-0.5">{fb.note}</p>
                    )}
                  </div>
                </div>
              </div>
              ) : (
              <div className="border-t border-gray-100 px-4 pt-3 pb-1">
                <div className="flex items-center">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        stepIdx >= i ? "bg-[#1565C0]" : "bg-gray-200"
                      }`}>
                        {stepIdx >= i
                          ? <Check size={13} className="text-white" />
                          : <span className="text-[10px] text-gray-400 font-bold">{i + 1}</span>
                        }
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 transition-colors ${stepIdx > i ? "bg-[#1565C0]" : "bg-gray-200"}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5 mb-3">
                  {STEP_LABELS.map((label, i) => (
                    <span key={i} className={`text-[9px] font-semibold whitespace-nowrap ${stepIdx >= i ? "text-[#1565C0]" : "text-gray-400"}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              )}

              <div className="px-4 pb-3">
                <p className="text-[10.5px] text-gray-400 flex items-center gap-1.5">
                  <Clock size={10} /> Ngày gửi: {fb.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
