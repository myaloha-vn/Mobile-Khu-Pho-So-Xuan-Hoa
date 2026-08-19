import type { ReactNode } from "react";

export function EmptyState({ icon, text, sub }: { icon: ReactNode; text: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2.5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-200">{icon}</div>
      <p className="text-[13px] font-semibold text-gray-500">{text}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}
