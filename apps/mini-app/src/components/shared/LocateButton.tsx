import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Navigation, RefreshCw } from "lucide-react";

async function fetchJson(url: string, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    return await res.json();
  } finally { clearTimeout(timer); }
}

export function LocateButton({ onLocated, className = "" }: { onLocated: (addr: string) => void; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const doneRef = useRef(false);
  const watchRef = useRef<number | null>(null);

  const stopWatch = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  const reverse = async (lat: number, lon: number) => {
    try {
      const d = await fetchJson(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=vi`
      );
      return (d?.display_name as string) || "";
    } catch { return ""; }
  };

  const finish = async (pos: GeolocationPosition) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopWatch();
    const { latitude: lat, longitude: lon, accuracy } = pos.coords;
    const acc = accuracy ? ` (±${Math.round(accuracy)}m)` : "";
    onLocated(`Toạ độ: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    setOk(`Đã lấy vị trí hiện tại thành công${acc}`);
    setBusy(false);
    const addr = await reverse(lat, lon);
    if (addr) { onLocated(addr); setOk(`Đã lấy vị trí hiện tại thành công${acc}`); }
    else setOk(`Đã lấy vị trí hiện tại thành công${acc} - vui lòng bổ sung số nhà, tên đường`);
  };

  /** Dự phòng: định vị theo mạng, thử lần lượt nhiều nhà cung cấp */
  const fallbackByIp = async (reason: string) => {
    const providers: { url: string; pick: (d: any) => { lat?: number; lon?: number; label?: string } }[] = [
      { url: "https://ipwho.is/", pick: (d) => ({ lat: d?.latitude, lon: d?.longitude, label: [d?.city, d?.region, d?.country].filter(Boolean).join(", ") }) },
      { url: "https://get.geojs.io/v1/ip/geo.json", pick: (d) => ({ lat: Number(d?.latitude), lon: Number(d?.longitude), label: [d?.city, d?.region, d?.country].filter(Boolean).join(", ") }) },
      { url: "https://ipapi.co/json/", pick: (d) => ({ lat: d?.latitude, lon: d?.longitude, label: [d?.city, d?.region, d?.country_name].filter(Boolean).join(", ") }) },
    ];
    for (const p of providers) {
      try {
        const { lat, lon, label } = p.pick(await fetchJson(p.url, 7000));
        if (lat && lon) {
          const addr = (await reverse(lat, lon)) || label || `Toạ độ: ${lat}, ${lon}`;
          onLocated(addr);
          setOk("Đã lấy vị trí theo mạng (tương đối) - vui lòng bổ sung số nhà, tên đường");
          setBusy(false);
          return true;
        }
      } catch { /* thử nhà cung cấp kế tiếp */ }
    }
    setBusy(false);
    setErr(reason);
    return false;
  };

  const fail = (e: GeolocationPositionError) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopWatch();
    void fallbackByIp(
      e.code === e.PERMISSION_DENIED
        ? "Trình duyệt đang chặn quyền vị trí. Bấm biểu tượng ổ khoá trên thanh địa chỉ → cho phép Vị trí."
        : "Không lấy được GPS. Kiểm tra Dịch vụ vị trí của máy đã bật cho trình duyệt, rồi thử lại."
    );
  };

  const locate = () => {
    setErr(""); setOk(""); doneRef.current = false; setBusy(true);

    const secure = typeof window === "undefined" || window.isSecureContext !== false;
    if (!("geolocation" in navigator) || !secure) {
      void fallbackByIp(
        !secure
          ? "Trình duyệt chỉ cho phép định vị GPS trên HTTPS hoặc localhost."
          : "Thiết bị không hỗ trợ định vị GPS."
      );
      return;
    }

    // watchPosition bám vị trí liên tục - đáng tin hơn getCurrentPosition trên máy tính
    watchRef.current = navigator.geolocation.watchPosition(
      finish,
      (e) => { if (e.code === e.PERMISSION_DENIED) fail(e); },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 30000 }
    );

    // Song song: thử một phát getCurrentPosition ở chế độ nhẹ
    navigator.geolocation.getCurrentPosition(finish, () => {}, {
      enableHighAccuracy: false, timeout: 25000, maximumAge: 300000,
    });

    // Hết 26s mà chưa có GPS -> chuyển sang định vị theo mạng
    setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      stopWatch();
      void fallbackByIp("Không lấy được GPS. Kiểm tra Dịch vụ vị trí của máy đã bật cho trình duyệt, rồi thử lại.");
    }, 26000);
  };

  useEffect(() => () => stopWatch(), []);

  return (
    <div className={className}>
      <button type="button" onClick={locate} disabled={busy}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#1565C0]/30 bg-blue-50 text-[#1565C0] text-[12px] font-bold active:bg-blue-100 disabled:opacity-60">
        {busy ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}
        {busy ? "Đang lấy vị trí..." : ok ? "Lấy lại vị trí" : "Lấy vị trí hiện tại"}
      </button>
      {ok && !busy && (
        <p className="mt-1.5 text-[11px] text-green-600 font-semibold flex items-start gap-1">
          <CheckCircle2 size={11} className="shrink-0 mt-0.5" /> {ok}
        </p>
      )}
      {err && !busy && (
        <p className="mt-1.5 text-[11px] text-red-600 flex items-start gap-1">
          <AlertCircle size={11} className="shrink-0 mt-0.5" /> {err}
        </p>
      )}
    </div>
  );
}
