import { RefreshCw } from "lucide-react";

export function LoadingSpinner({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <RefreshCw size={26} className="text-[#1565C0] animate-spin" />
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
}
