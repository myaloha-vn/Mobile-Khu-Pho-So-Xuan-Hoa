import { useNavigate } from "react-router";

/**
 * "Quay lại" an toàn cho các trang chi tiết (khu phố, tin tức...).
 *
 * Nếu người dùng vào trang này từ 1 trang khác trong ứng dụng (còn lịch sử
 * điều hướng trong phiên hiện tại) thì lùi đúng 1 bước, y hệt nút back của
 * trình duyệt - luôn trả về đúng nơi vừa đến từ đó.
 *
 * Nếu trang được mở trực tiếp (gõ thẳng URL, mở link chia sẻ, mở tab mới...)
 * thì không có gì để lùi về - lúc đó `navigate(-1)` sẽ đứng yên hoặc thoát
 * hẳn ra khỏi ứng dụng, nên chuyển tới `fallbackPath` cho chắc.
 */
export function useSafeBack(fallbackPath: string) {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallbackPath);
  };
}
