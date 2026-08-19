import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function AppHeader({
  title, onBack, right, blue = true,
}: {
  title?: string; onBack?: () => void; right?: ReactNode; blue?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 shrink-0 ${blue ? "bg-[#1565C0]" : "bg-white border-b border-gray-100"}`}>
      <div className="w-8">
        {onBack && (
          <button onClick={onBack} className={`p-1 -ml-1 rounded-full active:opacity-60 ${blue ? "text-white" : "text-gray-700"}`}>
            <ChevronLeft size={22} />
          </button>
        )}
      </div>
      <h2 className={`text-[15px] font-bold flex-1 text-center ${blue ? "text-white" : "text-gray-800"}`}>{title}</h2>
      <div className="w-8 flex justify-end">{right}</div>
    </div>
  );
}
