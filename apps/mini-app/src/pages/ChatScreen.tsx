import { useEffect, useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { BOT_ANSWERS, SUGGESTED } from "../data";
import { AppHeader } from "../components/shared/AppHeader";
import { RobotIcon } from "../components/shared/RobotIcon";

// ─── SCREEN: CHAT ────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const params = (state as { chatType?: string; initialQ?: string } | null) ?? {};
  const chatType = params.chatType ?? "public";
  const initialQ = params.initialQ ?? "";

  const [messages, setMessages] = useState<{ id: number; role: "user" | "bot"; text: string }[]>([{
    id: 0, role: "bot",
    text: chatType === "public"
      ? "Xin chào! Tôi là trợ lý ảo phường Xuân Hoà. Bạn cần tư vấn về thủ tục hành chính nào?"
      : "Xin chào! Tôi có thể giúp bạn tra cứu thông tin quy hoạch đất đai tại phường Xuân Hoà.",
  }]);
  const [input, setInput] = useState(initialQ);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((p) => [...p, { id: Date.now(), role: "user", text }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [...p, {
        id: Date.now() + 1, role: "bot",
        text: BOT_ANSWERS[text] ??
          "Cảm ơn câu hỏi của bạn! Để được hỗ trợ chính xác nhất, bạn vui lòng đến trực tiếp bộ phận tiếp nhận hồ sơ UBND phường Xuân Hoà (Thứ 2 – Thứ 6, 7:30–11:30 và 13:00–16:30) hoặc gọi: 02513.123.456.",
      }]);
    }, 1400);
  };

  const title = chatType === "public" ? "Dịch vụ công" : "Thông tin quy hoạch";

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title={title} onBack={() => navigate("/assistant")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "none" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && (
              <div className="w-10 h-10 shrink-0 mt-0.5 flex items-center justify-center"><RobotIcon size={40} /></div>
            )}
            <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
              msg.role === "user"
                ? "bg-[#1565C0] text-white rounded-br-sm"
                : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-10 h-10 flex items-center justify-center"><RobotIcon size={40} /></div>
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestion chips */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {SUGGESTED[chatType as keyof typeof SUGGESTED].map((q, i) => (
            <button key={i} onClick={() => setInput(q)}
              className="shrink-0 bg-blue-50 border border-blue-200 text-[#1565C0] text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap active:bg-blue-100">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-center gap-2 shrink-0">
        <button className="p-1.5 text-gray-400 active:opacity-60"><Mic size={17} /></button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Nhập câu hỏi của bạn..."
          className="flex-1 bg-[#F5F7FA] rounded-full px-4 py-2 text-[12.5px] outline-none border border-gray-200 focus:border-[#1565C0] transition-colors" />
        <button onClick={send}
          className="w-9 h-9 rounded-full bg-[#1565C0] flex items-center justify-center active:scale-90 transition-transform shadow-sm">
          <Send size={14} className="text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
}
