import { useState } from "react";
import { FolderInput, Images, Plus, Trash2, Upload, FolderPlus } from "lucide-react";
import { Card, CardHeader, Badge, Button, EmptyState } from "../../components/common/ui";
import { FilterBar, SearchInput, Select } from "../../components/common/Filters";
import { ConfirmDialog, RightDrawer, useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { useTable } from "../../services/store";
import { img } from "../../data/mock";
import { fmtDate } from "../../utils/format";
import type { MediaItem } from "../../types";

export default function MediaLibrary() {
  const toast = useToast();
  const { user, hoodScope } = useAuth();
  const [media, setMedia] = useTable("media");
  const [contents] = useTable("contents");
  const [hoods] = useTable("neighborhoods");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [album, setAlbum] = useState("");
  const [detail, setDetail] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [albumModal, setAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [createAlbumModal, setCreateAlbumModal] = useState(false);
  const [createAlbumName, setCreateAlbumName] = useState("");

  const albums = Array.from(new Set(media.map((m) => m.album)));
  const rows = media.filter((m) =>
    (!hoodScope || m.hoodId === hoodScope || m.hoodId === null) &&
    (!q || m.name.toLowerCase().includes(q.toLowerCase())) &&
    (!kind || m.kind === kind) && (!album || m.album === album)
  );

  const upload = () => {
    const item: MediaItem = {
      id: `md-${Date.now()}`, url: img(Math.floor(Math.random() * 8), 400, 300), kind: "image",
      name: `anh-tai-len-${Date.now()}.jpg`, album: albums[0] ?? "Hoạt động cộng đồng",
      hoodId: hoodScope ?? null, event: "", size: "820 KB",
      uploadedAt: new Date().toISOString(), uploadedBy: user?.fullName ?? "Cán bộ", usedIn: [],
    };
    setMedia([item, ...media]);
    toast("Đã tải ảnh lên thư viện");
  };

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }

  function mergeIntoAlbum() {
    const name = newAlbumName.trim();
    if (!name) { toast("Vui lòng nhập tên album"); return; }
    setMedia(media.map((m) => selected.has(m.id) ? { ...m, album: name } : m));
    toast(`Đã gộp ${selected.size} tệp vào album "${name}"`);
    setSelected(new Set());
    setNewAlbumName("");
    setAlbumModal(false);
  }

  function createAlbum() {
    const name = createAlbumName.trim();
    if (!name) { toast("Vui lòng nhập tên album"); return; }
    if (albums.includes(name)) { toast("Album đã tồn tại"); return; }
    setCreateAlbumName("");
    setCreateAlbumModal(false);
    setAlbum(name);
    toast(`Đã tạo album "${name}"`);
  }

  return (
    <>
      <Card>
        <CardHeader title="Thư viện ảnh - video" icon={<Images size={16} className="text-violet-600" />}
          action={
            <Allow module="media" action="create">
              <Button size="sm" icon={<Upload size={14} />} onClick={upload}>Tải lên</Button>
            </Allow>
          } />
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Tìm theo tên tệp..." />
          <Select value={kind} onChange={setKind} placeholder="Tất cả loại"
            options={[{ value: "image", label: "Hình ảnh" }, { value: "video", label: "Video" }]} />
          <Select value={album} onChange={setAlbum} placeholder="Tất cả album"
            options={albums.map((a) => ({ value: a, label: a }))} />
        </FilterBar>
        {/* Album list */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <button onClick={() => setAlbum("")}
              className={`shrink-0 px-3 py-1.5 rounded-lg border text-[12.5px] font-medium transition-colors ${album === "" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
              Tất cả tệp <span className="opacity-60">({media.length})</span>
            </button>
            {albums.map((a) => {
              const count = media.filter((m) => m.album === a).length;
              const active = album === a;
              return (
                <button key={a} onClick={() => setAlbum(active ? "" : a)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg border text-[12.5px] font-medium transition-colors ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"}`}>
                  {a} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
            <button onClick={() => setCreateAlbumModal(true)}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-[12.5px] font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <FolderPlus size={14} /> Tạo album
            </button>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 border-b border-blue-100">
            <span className="text-[13px] font-medium text-blue-700">Đã chọn {selected.size} tệp</span>
            <button onClick={() => setAlbumModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[12.5px] font-medium hover:bg-blue-700 transition-colors">
              <FolderInput size={14} /> Gộp vào album
            </button>
            <button onClick={() => setSelected(new Set())}
              className="text-[12.5px] text-slate-500 hover:text-slate-700 hover:underline">
              Bỏ chọn tất cả
            </button>
          </div>
        )}
        {rows.length === 0 ? (
          <EmptyState title="Chưa có tệp nào" description="Tải ảnh hoặc video lên để sử dụng cho nội dung." />
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <label className="flex items-center gap-2 text-[12.5px] text-slate-600 cursor-pointer">
                <input type="checkbox" checked={selected.size === rows.length && rows.length > 0}
                  onChange={toggleSelectAll} className="w-4 h-4" />
                Chọn tất cả
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {rows.map((m) => (
                <div key={m.id}
                  className={`group rounded-xl border overflow-hidden text-left transition-colors ${selected.has(m.id) ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"}`}>
                  <div className="relative cursor-pointer" onClick={() => toggleSelect(m.id)}>
                    <img src={m.url} alt={m.name} className="w-full h-24 object-cover" />
                    {m.kind === "video" && <span className="absolute top-1.5 left-1.5"><Badge tone="violet">Video</Badge></span>}
                    <span className={`absolute top-1.5 right-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected.has(m.id) ? "bg-blue-600 border-blue-600" : "bg-white/80 border-slate-300"}`}>
                      {selected.has(m.id) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </span>
                  </div>
                  <button onClick={() => setDetail(m)} className="block w-full px-2.5 py-2 text-left">
                    <p className="text-[12px] text-slate-700 truncate">{m.name}</p>
                    <p className="text-[11px] text-slate-400">{m.size}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <RightDrawer open={!!detail} title="Thông tin tệp" onClose={() => setDetail(null)}
        footer={
          detail && (
            <Allow module="media" action="delete">
              <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => { setConfirmDelete(detail); }}>Xoá tệp</Button>
            </Allow>
          )
        }>
        {detail && (
          <div className="space-y-3">
            <img src={detail.url} alt={detail.name} className="w-full rounded-xl object-cover" />
            <dl className="space-y-2 text-[13px]">
              {[
                ["Tên tệp", detail.name],
                ["Loại", detail.kind === "image" ? "Hình ảnh" : "Video"],
                ["Album", detail.album],
                ["Khu phố", detail.hoodId ? `Khu phố ${detail.hoodId}` : "Toàn phường"],
                ["Sự kiện", detail.event || "-"],
                ["Dung lượng", detail.size],
                ["Người tải lên", detail.uploadedBy],
                ["Ngày tải lên", fmtDate(detail.uploadedAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt><dd className="text-slate-800 font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="text-[12.5px] font-medium text-slate-700 mb-1.5">Đang được dùng ở nội dung</p>
              {detail.usedIn.length === 0 ? (
                <p className="text-[12.5px] text-slate-400">Chưa được sử dụng ở nội dung nào.</p>
              ) : (
                <ul className="space-y-1">
                  {detail.usedIn.map((cid) => (
                    <li key={cid} className="text-[12.5px] text-blue-600">
                      {contents.find((c) => c.id === cid)?.title ?? cid}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </RightDrawer>

      <ConfirmDialog open={!!confirmDelete}
        title="Xoá tệp khỏi thư viện"
        description={confirmDelete?.usedIn.length
          ? "Tệp đang được sử dụng trong nội dung đã đăng. Xoá tệp có thể làm nội dung mất ảnh minh hoạ."
          : "Tệp sẽ bị xoá khỏi thư viện."}
        confirmLabel="Xoá tệp" tone="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          setMedia(media.filter((m) => m.id !== confirmDelete!.id));
          setConfirmDelete(null); setDetail(null); toast("Đã xoá tệp");
        }} />

      {/* Create album popup */}
      {createAlbumModal && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setCreateAlbumModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5">
            <h3 className="text-[16px] font-semibold text-slate-900">Tạo album mới</h3>
            <p className="mt-2 text-[13px] text-slate-600">Nhập tên album để nhóm các tệp lại với nhau.</p>
            <div className="mt-4">
              <input value={createAlbumName} onChange={(e) => setCreateAlbumName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createAlbum()}
                placeholder="Nhập tên album..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500" autoFocus />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCreateAlbumModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={createAlbum}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700">Tạo album</button>
            </div>
          </div>
        </div>
      )}

      {/* Album merge popup */}
      {albumModal && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setAlbumModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5">
            <h3 className="text-[16px] font-semibold text-slate-900">Gộp {selected.size} tệp vào album</h3>
            <p className="mt-2 text-[13px] text-slate-600">Nhập tên album mới hoặc chọn album đã có.</p>
            <div className="mt-4 space-y-2">
              <input value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="Nhập tên album mới..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500" autoFocus />
              {albums.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {albums.map((a) => (
                    <button key={a} onClick={() => setNewAlbumName(a)}
                      className="px-2.5 py-1 rounded-full border border-slate-200 text-[12px] text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setAlbumModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={mergeIntoAlbum}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700">Gộp vào album</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
