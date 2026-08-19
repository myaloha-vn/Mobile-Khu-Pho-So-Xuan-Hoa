import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Check, CheckCircle2, ChevronDown, X } from "lucide-react";
import {
  NEIGHBORHOODS, detectHoodId, groupStyle, HOUSEHOLD_GROUPS, HOUSEHOLD_ROLES,
  type Household, type HouseholdRole,
} from "../../data";
import { LocateButton } from "./LocateButton";

export function HouseholdForm({
  initial, onSubmit, onCancel,
}: { initial?: Household | null; onSubmit: (h: Household) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [hoodId, setHoodId] = useState<number | "">(initial?.hoodId ?? "");
  const [role, setRole] = useState<HouseholdRole>(initial?.role ?? "owner");
  const [groups, setGroups] = useState<string[]>(initial?.groups ?? []);
  const [groupOpen, setGroupOpen] = useState(false);
  const [touchedHood, setTouchedHood] = useState(!!initial);
  const [err, setErr] = useState("");

  // Tự nhận diện khu phố khi người dân nhập địa chỉ
  useEffect(() => {
    if (touchedHood) return;
    const id = detectHoodId(address);
    if (id) setHoodId(id);
  }, [address, touchedHood]);

  const detected = !touchedHood && detectHoodId(address) !== null;

  const submit = () => {
    if (!name.trim()) return setErr("Vui lòng nhập tên chủ hộ");
    if (!/^0\d{8,10}$/.test(phone.replace(/[\s.]/g, ""))) return setErr("Số điện thoại không hợp lệ (VD: 0901234567)");
    if (!address.trim()) return setErr("Vui lòng nhập địa chỉ");
    if (!hoodId) return setErr("Vui lòng chọn khu phố bạn đang sinh sống");
    setErr("");
    onSubmit({
      name: name.trim(), phone: phone.trim(), address: address.trim(),
      hoodId: Number(hoodId), role, groups,
    });
  };

  const label = "text-[12px] font-bold text-gray-700 mb-1.5 block";
  const input = "w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-[13px] outline-none focus:border-[#1565C0] transition-colors";

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Cam kết bảo mật - đặt đầu form để người dân yên tâm khai báo */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#1E88E5] p-4 shadow-md shadow-blue-200">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-white" />
          </span>
          <p className="text-[13px] font-extrabold text-white tracking-wide">THÔNG TIN CỦA BẠN ĐƯỢC BẢO MẬT</p>
        </div>
        <p className="text-[12px] text-blue-50 leading-relaxed">
          Thông tin bạn cung cấp giúp địa phương nắm bắt tình hình, cập nhật dữ liệu và hỗ trợ người dân tốt hơn.
          Vui lòng điền đầy đủ, chính xác thông tin. Dữ liệu sẽ được bảo mật và sử dụng đúng mục đích.
        </p>
      </div>

      <div>
        <label className={label}>Tên chủ hộ <span className="text-red-500">*</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn An" className={input} />
      </div>

      <div>
        <label className={label}>Số điện thoại <span className="text-red-500">*</span></label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
          placeholder="VD: 0901234567" className={input} />
      </div>

      <div>
        <label className={label}>Địa chỉ <span className="text-red-500">*</span></label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
          placeholder="VD: 45/3 Đường số 7, KP 7, Phường Xuân Hoà"
          className={input + " resize-none"} />
        <p className="text-[10.5px] text-gray-400 mt-1">Ghi rõ số khu phố (VD: KP 7) để hệ thống tự nhận diện.</p>
        <LocateButton className="mt-2" onLocated={setAddress} />
      </div>

      <div>
        <label className={label}>Khu phố <span className="text-red-500">*</span></label>
        <div className="relative">
          <select value={hoodId} onChange={(e) => { setTouchedHood(true); setHoodId(Number(e.target.value)); }}
            className={input + " appearance-none pr-9"}>
            <option value="">-- Chọn khu phố --</option>
            {NEIGHBORHOODS.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {detected && hoodId && (
          <p className="text-[11px] text-green-600 font-semibold mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={12} /> Hệ thống tự nhận diện: {NEIGHBORHOODS[Number(hoodId) - 1].name}
          </p>
        )}
      </div>

      <div>
        <label className={label}>Vai trò trong hộ <span className="text-red-500">*</span></label>
        <div className="relative">
          <select value={role} onChange={(e) => setRole(e.target.value as HouseholdRole)}
            className={input + " appearance-none pr-9"}>
            {HOUSEHOLD_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className={label}>Nhóm đối tượng <span className="text-gray-400 font-normal">(có thể chọn nhiều)</span></label>
        <div className="relative">
          <button type="button" onClick={() => setGroupOpen((v) => !v)}
            className={`w-full bg-white border rounded-xl px-3.5 py-2.5 pr-9 text-left transition-colors ${
              groupOpen ? "border-[#1565C0]" : "border-gray-200"
            }`}>
            {groups.length === 0 ? (
              <span className="text-[13px] text-gray-400">-- Chọn nhóm đối tượng --</span>
            ) : (
              <span className="flex flex-wrap gap-1.5">
                {groups.map((g) => {
                  const st = groupStyle(g);
                  return (
                    <span key={g}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${st.chip}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {g}
                      <span onClick={(e) => { e.stopPropagation(); setGroups((cur) => cur.filter((x) => x !== g)); }}
                        className="ml-0.5 opacity-60 active:opacity-100">
                        <X size={11} />
                      </span>
                    </span>
                  );
                })}
              </span>
            )}
            <ChevronDown size={16}
              className={`absolute right-3 top-3.5 text-gray-400 transition-transform ${groupOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {groupOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {HOUSEHOLD_GROUPS.map((g) => {
                  const on = groups.includes(g.label);
                  return (
                    <button key={g.label} type="button"
                      onClick={() => setGroups((cur) => (on ? cur.filter((x) => x !== g.label) : [...cur, g.label]))}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-gray-100 last:border-0 active:bg-gray-50">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        on ? "bg-[#1565C0] border-[#1565C0]" : "border-gray-300"
                      }`}>
                        {on && <Check size={11} className="text-white" />}
                      </span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${g.dot}`} />
                      <span className={`text-[13px] font-semibold ${on ? "text-[#1565C0]" : "text-gray-700"}`}>{g.label}</span>
                    </button>
                  );
                })}
                <button type="button" onClick={() => setGroupOpen(false)}
                  className="w-full py-2.5 text-[12px] font-bold text-[#1565C0] bg-blue-50 active:opacity-70">
                  Xong
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {err && (
        <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0" /> {err}
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        {onCancel && (
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-[13px] font-bold text-gray-600 active:bg-gray-50">
            Huỷ
          </button>
        )}
        <button onClick={submit}
          className="flex-1 py-3.5 rounded-xl bg-[#1565C0] text-white text-[13px] font-bold shadow active:scale-[0.98] transition-transform">
          Xác nhận khai báo
        </button>
      </div>
    </div>
  );
}
