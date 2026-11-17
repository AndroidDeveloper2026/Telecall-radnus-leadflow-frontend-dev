import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { connectSocket, disconnectSocket, get, post, tokens } from '../services/api';
import { User } from '../types';

interface Ctx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; logout: () => Promise<void>; setUser: (u: User) => void }
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!tokens.access);
  const reset = useCallback(() => { tokens.clear(); disconnectSocket(); setUser(null); }, []);
  useEffect(() => {
    window.addEventListener('auth:logout', reset);
    if (tokens.access) get<User>('/auth/me').then((u) => { setUser(u); connectSocket(); }).catch(reset).finally(() => setLoading(false));
    return () => window.removeEventListener('auth:logout', reset);
  }, [reset]);
  const login = async (email: string, password: string) => {
    const r = await post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', { email, password });
    tokens.set(r.accessToken, r.refreshToken); setUser(r.user); connectSocket(); return r.user;
  };
  const logout = async () => { try { await post('/auth/logout'); } catch { /* ignore */ } reset(); };
  return <AuthCtx.Provider value={{ user, loading, login, logout, setUser }}>{children}</AuthCtx.Provider>;
}


//--------- 12.11.2026 -------------
// import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
// import { connectSocket, disconnectSocket, get, post, tokens } from '../services/api';
// import { User } from '../types';

// interface Ctx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; logout: () => Promise<void>; setUser: (u: User) => void }
// const AuthCtx = createContext<Ctx>(null!);
// export const useAuth = () => useContext(AuthCtx);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(!!tokens.access);
//   const reset = useCallback(() => { tokens.clear(); disconnectSocket(); setUser(null); }, []);
//   useEffect(() => {
//     window.addEventListener('auth:logout', reset);
//     if (tokens.access) get<User>('/auth/me').then((u) => { setUser(u); connectSocket(); }).catch(reset).finally(() => setLoading(false));
//     return () => window.removeEventListener('auth:logout', reset);
//   }, [reset]);
//   const login = async (email: string, password: string) => {
//     const r = await post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', { email, password });
//     tokens.set(r.accessToken, r.refreshToken); setUser(r.user); connectSocket(); return r.user;
//   };
//   const logout = async () => { try { await post('/auth/logout'); } catch { /* ignore */ } reset(); };
//   return <AuthCtx.Provider value={{ user, loading, login, logout, setUser }}>{children}</AuthCtx.Provider>;
// }
