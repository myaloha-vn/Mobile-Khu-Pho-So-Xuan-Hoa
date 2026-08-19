import { ChevronLeft, ChevronRight, Clock, Edit3, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { NEIGHBORHOODS, NEWS, newsById } from "../data";
import { useSafeBack } from "../hooks/useSafeBack";

// ─── SCREEN: NEWS DETAIL ─────────────────────────────────────────────────────
export default function NewsDetailScreen() {
  const navigate = useNavigate();
  const { newsId } = useParams();
  const news = newsById(Number(newsId));
  const hood = NEIGHBORHOODS[(news.hoodId ?? 1) - 1];
  const related = NEWS.filter((n) => n.id !== news.id).slice(0, 2);

  // "Quay lại" luôn trả về đúng nơi người dùng vừa đến từ đó (trang chủ, danh
  // sách tin, khu phố, đăng tin...). Nếu mở thẳng link tin này (không có lịch
  // sử điều hướng trong app) thì về danh sách tin cho chắc.
  const goBack = useSafeBack("/news");

  return (
    <div className="flex-1 overflow-y-auto bg-white" style={{ scrollbarWidth: "none" }}>
      {/* Cover */}
      <div className="relative h-52">
        <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/10" />
        <button onClick={goBack}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/35 flex items-center justify-center backdrop-blur-sm active:opacity-60">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <span className="absolute bottom-3 left-4 bg-[#1565C0] text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
          {news.category}
        </span>
      </div>

      <div className="px-4 pt-4 pb-6">
        <h1 className="text-[18px] font-extrabold text-gray-900 leading-snug">{news.title}</h1>

        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Clock size={11} />{news.time}</span>
          <span className="flex items-center gap-1"><Users size={11} />{news.views} lượt xem</span>
        </div>

        {/* Khu phố gắn với bài viết */}
        <button onClick={() => navigate(`/neighborhood/${hood.id}`)}
          className="w-full mt-3.5 rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-3 flex items-center gap-2.5 active:bg-blue-100/70">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[18px] shrink-0">🏘️</div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[9.5px] font-extrabold tracking-wider text-[#1565C0]">TIN CỦA</p>
            <p className="text-[13px] font-extrabold text-gray-800 leading-tight">{hood.name}</p>
          </div>
          <span className="text-[11px] text-[#1565C0] font-semibold flex items-center gap-0.5 shrink-0">
            Xem khu phố <ChevronRight size={13} />
          </span>
        </button>

        <div className="mt-4 space-y-3.5">
          {(news.body ?? []).map((para, i) => (
            <p key={i} className="text-[13.5px] text-gray-700 leading-relaxed">{para}</p>
          ))}
        </div>

        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center gap-2 text-[11.5px] text-gray-500">
          <Edit3 size={12} className="text-[#1565C0]" /> Nguồn: <span className="font-semibold text-gray-700">{news.author}</span>
        </div>

        {/* Tin liên quan */}
        <div className="mt-6">
          <h3 className="text-[14px] font-extrabold text-gray-900 mb-2.5">Tin liên quan</h3>
          <div className="divide-y divide-gray-100">
            {related.map((n) => (
              <button key={n.id} onClick={() => navigate(`/news/${n.id}`)}
                className="w-full flex gap-3 py-3 text-left active:opacity-70">
                <img src={n.image} alt="" className="w-[92px] h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  <p className="text-[12.5px] font-semibold text-gray-900 leading-snug line-clamp-2">{n.title}</p>
                  <span className="text-[10.5px] text-gray-400">{n.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
