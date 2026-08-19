export function StatusBar() {
  const now = new Date();
  const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-bold text-white bg-[#1565C0] select-none shrink-0">
      <span>{t}</span>
      <div className="flex items-center gap-1.5">
        <svg width="15" height="11" viewBox="0 0 15 11" fill="white">
          <rect x="0" y="5" width="3" height="6" rx="0.5" opacity="0.4" />
          <rect x="4" y="3" width="3" height="8" rx="0.5" opacity="0.65" />
          <rect x="8" y="1" width="3" height="10" rx="0.5" opacity="0.85" />
          <rect x="12" y="0" width="3" height="11" rx="0.5" />
        </svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
          <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="white" strokeWidth="1.2" />
          <rect x="19" y="3" width="3" height="5" rx="1" fill="white" />
          <rect x="1.5" y="1.5" width="14" height="8" rx="1.5" fill="white" />
        </svg>
      </div>
    </div>
  );
}
