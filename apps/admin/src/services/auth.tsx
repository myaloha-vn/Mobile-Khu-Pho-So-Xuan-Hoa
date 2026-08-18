import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Action, Module, User } from "../types";
import { can as canDo, scopeHoodId } from "./permissions";
import { getTable } from "./store";

const KEY = "xhs_current_user";

interface AuthValue {
  user: User | null;
  login: (username: string) => boolean;
  logout: () => void;
  can: (m: Module, a?: Action) => boolean;
  hoodScope: number | null;
}

const Ctx = createContext<AuthValue>({
  user: null, login: () => false, logout: () => {}, can: () => false, hoodScope: null,
});

/**
 * Đọc lại phiên đăng nhập đã lưu.
 * Phải chạy ngay lúc khởi tạo state, không được để trong useEffect: useEffect
 * chỉ chạy SAU lần render đầu, nên RequireAuth sẽ thấy user = null và đá người
 * dùng về /login mỗi lần tải lại trang (F5).
 */
function readSavedUser(): User | null {
  try {
    const id = localStorage.getItem(KEY);
    if (!id) return null;
    return getTable("users").find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSavedUser);

  const value = useMemo<AuthValue>(() => ({
    user,
    login: (username: string) => {
      const found = getTable("users").find((u) => u.username === username && u.status === "active");
      if (!found) return false;
      setUser(found);
      try { localStorage.setItem(KEY, found.id); } catch { /* bỏ qua */ }
      return true;
    },
    logout: () => {
      setUser(null);
      try { localStorage.removeItem(KEY); } catch { /* bỏ qua */ }
    },
    can: (m: Module, a: Action = "view") => canDo(user, m, a),
    hoodScope: scopeHoodId(user),
  }), [user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
