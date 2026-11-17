import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const tokens = {
  get access() { return localStorage.getItem('at'); }, get refresh() { return localStorage.getItem('rt'); },
  set(a: string, r: string) { localStorage.setItem('at', a); localStorage.setItem('rt', r); },
  clear() { localStorage.removeItem('at'); localStorage.removeItem('rt'); },
};
export const api = axios.create({ baseURL: API, timeout: 30000 });
api.interceptors.request.use((c) => { if (tokens.access) c.headers.Authorization = `Bearer ${tokens.access}`; return c; });

let refreshing: Promise<string> | null = null;
api.interceptors.response.use((r) => r, async (err) => {
  const cfg = err.config;
  if (err.response?.status === 401 && !cfg._retry && tokens.refresh && !cfg.url?.includes('/auth/')) {
    cfg._retry = true;
    refreshing ||= axios.post(`${API}/auth/refresh`, { refreshToken: tokens.refresh }).then((r) => { tokens.set(r.data.accessToken, r.data.refreshToken); return r.data.accessToken as string; }).finally(() => { refreshing = null; });
    try { const t = await refreshing; cfg.headers.Authorization = `Bearer ${t}`; return api(cfg); } catch { tokens.clear(); window.dispatchEvent(new Event('auth:logout')); }
  }
  return Promise.reject(err);
});
export const get = <T,>(url: string, params?: object) => api.get<T>(url, { params }).then((r) => r.data);
export const post = <T,>(url: string, body?: unknown) => api.post<T>(url, body).then((r) => r.data);
export const patch = <T,>(url: string, body?: unknown) => api.patch<T>(url, body).then((r) => r.data);
export const put = <T,>(url: string, body?: unknown) => api.put<T>(url, body).then((r) => r.data);
export const del = <T,>(url: string) => api.delete<T>(url).then((r) => r.data);
export const download = async (url: string, params: object, name: string) => {
  const r = await api.get(url, { params, responseType: 'blob' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = name; a.click(); URL.revokeObjectURL(a.href);
};

let socket: Socket | null = null;
export const connectSocket = () => {
  disconnectSocket();
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', { auth: { token: tokens.access }, transports: ['websocket'] });
  return socket;
};
export const getSocket = () => socket;
export const disconnectSocket = () => { socket?.disconnect(); socket = null; };


//------ 12.11.2026 ----------
// import axios from 'axios';
// import { io, Socket } from 'socket.io-client';

// const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// export const tokens = {
//   get access() { return localStorage.getItem('at'); }, get refresh() { return localStorage.getItem('rt'); },
//   set(a: string, r: string) { localStorage.setItem('at', a); localStorage.setItem('rt', r); },
//   clear() { localStorage.removeItem('at'); localStorage.removeItem('rt'); },
// };
// export const api = axios.create({ baseURL: API, timeout: 30000 });
// api.interceptors.request.use((c) => { if (tokens.access) c.headers.Authorization = `Bearer ${tokens.access}`; return c; });

// let refreshing: Promise<string> | null = null;
// api.interceptors.response.use((r) => r, async (err) => {
//   const cfg = err.config;
//   if (err.response?.status === 401 && !cfg._retry && tokens.refresh && !cfg.url?.includes('/auth/')) {
//     cfg._retry = true;
//     refreshing ||= axios.post(`${API}/auth/refresh`, { refreshToken: tokens.refresh }).then((r) => { tokens.set(r.data.accessToken, r.data.refreshToken); return r.data.accessToken as string; }).finally(() => { refreshing = null; });
//     try { const t = await refreshing; cfg.headers.Authorization = `Bearer ${t}`; return api(cfg); } catch { tokens.clear(); window.dispatchEvent(new Event('auth:logout')); }
//   }
//   return Promise.reject(err);
// });
// export const get = <T,>(url: string, params?: object) => api.get<T>(url, { params }).then((r) => r.data);
// export const post = <T,>(url: string, body?: unknown) => api.post<T>(url, body).then((r) => r.data);
// export const patch = <T,>(url: string, body?: unknown) => api.patch<T>(url, body).then((r) => r.data);
// export const put = <T,>(url: string, body?: unknown) => api.put<T>(url, body).then((r) => r.data);
// export const del = <T,>(url: string) => api.delete<T>(url).then((r) => r.data);
// export const download = async (url: string, params: object, name: string) => {
//   const r = await api.get(url, { params, responseType: 'blob' });
//   const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = name; a.click(); URL.revokeObjectURL(a.href);
// };

// let socket: Socket | null = null;
// export const connectSocket = () => {
//   disconnectSocket();
//   socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', { auth: { token: tokens.access }, transports: ['websocket'] });
//   return socket;
// };
// export const getSocket = () => socket;
// export const disconnectSocket = () => { socket?.disconnect(); socket = null; };
