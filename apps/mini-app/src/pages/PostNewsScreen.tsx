import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, CheckCircle2, ChevronDown, Clock, X } from "lucide-react";
import { useNavigate } from "react-router";
import { NEWS } from "../data";
import { AppHeader } from "../components/shared/AppHeader";

// ─── SCREEN: POST NEWS ───────────────────────────────────────────────────────
export default function PostNewsScreen() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Hoạt động");
  const [success, setSuccess] = useState(false);
  const MAX = 300;

  const PLACEHOLDER_IMGS = [
    "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=200&fit=crop&auto=format",
  ];

  const addImage = () => { if (images.length < 4) setImages((p) => [...p, PLACEHOLDER_IMGS[p.length]]); };
  const removeImage = (i: number) => setImages((p) => p.filter((_, j) => j !== i));

  const submit = () => {
    if (!content.trim()) return;
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setContent(""); setImages([]); }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Đăng tin" onBack={() => navigate("/")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-600 shrink-0" />
              <p className="text-[12.5px] text-green-700 font-semibold">Bài đăng đã gửi, đang chờ kiểm duyệt!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image upload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">Ảnh đính kèm <span className="text-gray-400 font-normal">(tối đa 4 ảnh)</span></p>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm active:scale-90">
                  <X size={9} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button onClick={addImage}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 transition-colors">
                <Camera size={18} />
                <span className="text-[9.5px] font-semibold">Thêm ảnh</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-extrabold text-gray-800">Nội dung bài đăng</p>
            <span className={`text-[11px] font-semibold tabular-nums ${content.length > MAX * 0.85 ? "text-orange-500" : "text-gray-400"}`}>
              {content.length}/{MAX}
            </span>
          </div>
          <textarea value={content} onChange={(e) => e.target.value.length <= MAX && setContent(e.target.value)}
            placeholder="Nhập nội dung tin tức, thông báo cho cộng đồng khu phố..."
            rows={5}
            className="w-full text-[12.5px] text-gray-700 outline-none resize-none leading-relaxed placeholder-gray-300" />
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">Danh mục</p>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className={`w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3.5 pr-9 py-3 text-[13px] outline-none focus:border-[#1565C0] transition-colors ${
                category ? "text-gray-800 font-semibold" : "text-gray-400"
              }`}>
              <option value="">-- Chọn danh mục --</option>
              {["Hoạt động","Thông báo","Sự kiện","Khẩn cấp"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <button onClick={submit}
          className={`w-full py-4 rounded-xl font-extrabold text-[15px] transition-all active:scale-[0.98] ${
            content.trim() ? "bg-[#1565C0] text-white shadow-md shadow-blue-200" : "bg-gray-200 text-gray-400"
          }`}>
          Đăng bài
        </button>

        {/* Posted items */}
        <div>
          <h3 className="text-[14px] font-extrabold text-gray-800 mb-3">Bài đã đăng</h3>
          <div className="space-y-2.5">
            {NEWS.map((n) => (
              <button key={n.id} onClick={() => navigate(`/news/${n.id}`)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden active:bg-gray-50">
                <div className="flex gap-3 p-3">
                  <img src={n.image} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 line-clamp-2">{n.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={9} />{n.time}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        n.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {n.status === "approved" ? "✓ Đã duyệt" : "⏳ Chờ duyệt"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
