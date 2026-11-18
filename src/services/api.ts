import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// Accept VITE_API_URL with or without the trailing "/api" or "/".
const RAW = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
const API = /\/api$/.test(RAW) ? RAW : `${RAW}/api`;
const SOCKET = (import.meta.env.VITE_SOCKET_URL || API.replace(/\/api$/, '')).replace(/\/+$/, '');
export const tokens = {
  get access() { return localStorage.getItem('at'); }, get refresh() { return localStorage.getItem('rt'); },
  set(a: string, r: string) { localStorage.setItem('at', a); localStorage.setItem('rt', r); },
  clear() { localStorage.removeItem('at'); localStorage.removeItem('rt'); },
};
export const api = axios.create({ baseURL: API, timeout: 60000 });
api.interceptors.request.use((c) => { if (tokens.access) c.headers.Authorization = `Bearer ${tokens.access}`; return c; });

// Free-tier hosts put the API to sleep; the first requests then time out or return 502/503/504.
// Retry them with back-off and tell the UI so it can show "server is starting" instead of a silent spinner.
const wake = (on: boolean) => window.dispatchEvent(new Event(on ? 'api:waking' : 'api:awake'));
export const warmUp = () => axios.get(`${API}/health`, { timeout: 90000 }).then(() => wake(false)).catch(() => {});

let refreshing: Promise<string> | null = null;
api.interceptors.response.use((r) => { wake(false); return r; }, async (err) => {
  const cfg = err.config; const st = err.response?.status;
  if (cfg && (!err.response || st === 502 || st === 503 || st === 504) && (cfg._net || 0) < 4) {
    cfg._net = (cfg._net || 0) + 1; wake(true);
    await new Promise((r) => setTimeout(r, 2500 * cfg._net));
    return api(cfg);
  }
  if (st === 401 && !cfg._retry && tokens.refresh && !cfg.url?.includes('/auth/')) {
    cfg._retry = true;
    refreshing ||= axios.post(`${API}/auth/refresh`, { refreshToken: tokens.refresh }, { timeout: 60000 }).then((r) => { tokens.set(r.data.accessToken, r.data.refreshToken); return r.data.accessToken as string; }).finally(() => { refreshing = null; });
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
  socket = io(SOCKET, { auth: { token: tokens.access }, transports: ['websocket'] });
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
//   socket = io(SOCKET, { auth: { token: tokens.access }, transports: ['websocket'] });
//   return socket;
// };
// export const getSocket = () => socket;
// export const disconnectSocket = () => { socket?.disconnect(); socket = null; };
