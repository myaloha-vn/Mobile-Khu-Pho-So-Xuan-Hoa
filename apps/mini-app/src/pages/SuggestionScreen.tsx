import { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Camera, CheckCircle2, ChevronDown, Edit3, Info, X } from "lucide-react";
import { useNavigate } from "react-router";
import { SUGGESTION_STATUS, SUGGESTION_TOPICS, type Suggestion } from "../data";
import { useHousehold, useSuggestions } from "../hooks/useAppStorage";
import { AppHeader } from "../components/shared/AppHeader";
import { EmptyState } from "../components/shared/EmptyState";

// ─── SCREEN: GÓP Ý HỆ THỐNG ─────────────────────────────────────────────────
export default function SuggestionScreen() {
  const navigate = useNavigate();
  const [household] = useHousehold();
  const [list, setList] = useSuggestions();
  const [tab, setTab] = useState<"send" | "track">("send");

  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState(household?.name ?? "");
  const [phone, setPhone] = useState(household?.phone ?? "");
  const [unit, setUnit] = useState(household ? `Khu phố ${household.hoodId}` : "");
  const [err, setErr] = useState("");
  const [sentId, setSentId] = useState("");

  const submit = () => {
    if (!topic) return setErr("Vui lòng chọn nội dung góp ý");
    if (content.trim().length < 10) return setErr("Nội dung góp ý cần ít nhất 10 ký tự");
    if (!name.trim()) return setErr("Vui lòng nhập họ tên người góp ý");
    setErr("");
    const id = `GY${String(Date.now()).slice(-4)}`;
    const now = new Date().toISOString();
    const item: Suggestion = {
      id, topic, content: content.trim(), images,
      senderName: name.trim(), senderPhone: phone.trim(), senderUnit: unit.trim() || "Chưa cập nhật",
      createdAt: now, status: "received",
      timeline: [{ at: now, by: "Hệ thống", action: "Tiếp nhận góp ý" }],
    };
    setList([item, ...list]);
    setSentId(id);
    setTopic(""); setContent(""); setImages([]);
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const field = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-[13px] outline-none focus:border-[#1565C0] transition-colors";
  const label = "block text-[12px] font-bold text-gray-700 mb-1.5";

  if (sentId) {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="bg-[#1565C0] shrink-0">
          <AppHeader title="Góp ý hệ thống" onBack={() => setSentId("")} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={44} className="text-green-600" />
          </motion.div>
          <div className="text-center space-y-2">
            <p className="text-xl font-extrabold text-gray-800">Đã gửi góp ý</p>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Góp ý của bạn đã được tiếp nhận. Bộ phận quản trị sẽ xem xét và phản hồi trong thời gian sớm nhất.
            </p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mt-2">
              <p className="text-[11px] text-gray-500">Mã góp ý</p>
              <p className="text-[16px] font-extrabold text-[#1565C0] tracking-wider">#{sentId}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setSentId(""); setTab("track"); }}
              className="flex-1 py-3.5 border border-[#1565C0] rounded-xl text-[#1565C0] text-[13px] font-bold active:bg-blue-50">
              Theo dõi góp ý
            </button>
            <button onClick={() => navigate("/profile")}
              className="flex-1 py-3.5 bg-[#1565C0] rounded-xl text-white text-[13px] font-bold active:opacity-80">
              Về trang cá nhân
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Góp ý hệ thống" onBack={() => navigate("/profile")} />
        <div className="px-4 pb-3 flex gap-1 bg-[#1565C0]">
          {([["send", "Gửi góp ý"], ["track", `Góp ý của tôi (${list.length})`]] as const).map(([key, l]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-colors ${
                tab === key ? "bg-white text-[#1565C0]" : "bg-white/15 text-white"
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5" style={{ scrollbarWidth: "none" }}>
        {tab === "send" ? (
          <>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3.5 flex gap-2.5">
              <Info size={17} className="text-[#1565C0] shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-gray-600 leading-relaxed">
                Đơn vị và người dân gửi góp ý về giao diện, chức năng hoặc lỗi gặp phải khi sử dụng Xuân Hoà Số.
                Mỗi góp ý có mã riêng để theo dõi tiến trình tiếp nhận và xử lý.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3.5">
              <div>
                <label className={label}>Nội dung góp ý về <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${field} appearance-none pr-9`}>
                    <option value="">-- Chọn nhóm góp ý --</option>
                    {SUGGESTION_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={label}>Chi tiết góp ý <span className="text-red-500">*</span></label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
                  placeholder="Mô tả vấn đề bạn gặp phải hoặc đề xuất cải tiến..."
                  className={`${field} resize-none leading-relaxed`} />
                <p className="text-[10.5px] text-gray-400 mt-1">{content.length}/500 ký tự</p>
              </div>

              <div>
                <label className={label}>Ảnh đính kèm <span className="text-gray-400 font-normal">(tuỳ chọn, tối đa 3 ảnh)</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center active:scale-90">
                        <X size={9} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50">
                      <Camera size={18} />
                      <span className="text-[9.5px] font-semibold">Thêm ảnh</span>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []).slice(0, 3 - images.length);
                          if (files.length) setImages((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
                        }} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="text-[13px] font-extrabold text-gray-800">Thông tin người góp ý</p>
              <div>
                <label className={label}>Họ và tên <span className="text-red-500">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="VD: Nguyễn Văn An" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={label}>Số điện thoại</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={field} />
                </div>
                <div>
                  <label className={label}>Đơn vị / khu phố</label>
                  <input value={unit} onChange={(e) => setUnit(e.target.value)} className={field} placeholder="VD: Khu phố 3" />
                </div>
              </div>
            </div>

            {err && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3 text-[12px] text-red-600">
                <AlertCircle size={14} className="shrink-0" /> {err}
              </div>
            )}

            <button onClick={submit}
              className={`w-full py-4 rounded-xl font-extrabold text-[15px] transition-all active:scale-[0.98] ${
                topic && content.trim().length >= 10 && name.trim()
                  ? "bg-[#1565C0] text-white shadow-md shadow-blue-200"
                  : "bg-gray-200 text-gray-400"
              }`}>
              Gửi góp ý
            </button>
          </>
        ) : list.length === 0 ? (
          <EmptyState icon={<Edit3 size={26} />} text="Chưa có góp ý nào" sub="Góp ý của bạn sẽ hiển thị tại đây để theo dõi" />
        ) : (
          list.map((sg) => (
            <div key={sg.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wide">#{sg.id}</span>
                    <p className="text-[13.5px] font-extrabold text-gray-800 mt-0.5">{sg.topic}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${SUGGESTION_STATUS[sg.status].tone}`}>
                    {SUGGESTION_STATUS[sg.status].label}
                  </span>
                </div>
                <p className="text-[12.5px] text-gray-600 leading-relaxed mt-2">{sg.content}</p>
                {sg.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    {sg.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full aspect-square rounded-lg object-cover" />
                    ))}
                  </div>
                )}
                <p className="text-[10.5px] text-gray-400 mt-2">
                  {sg.senderName} · {sg.senderUnit} · {fmt(sg.createdAt)}
                </p>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-2.5">
                {sg.timeline.map((t, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#1565C0] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-gray-700">{t.action}</p>
                      {t.note && <p className="text-[11.5px] text-gray-600 mt-0.5 leading-relaxed">{t.note}</p>}
                      <p className="text-[10.5px] text-gray-400 mt-0.5">{t.by} · {fmt(t.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
