export const fmtDuration = (s = 0) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; };
export const fmtTalk = (s = 0) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return `${h}h ${String(m).padStart(2, '0')}m`; };
export const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
export const title = (k?: string) => (k ? k.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');
export const PRIORITY = { 1: { label: 'High Priority', cls: 'bg-[#ffe3ea] text-accent-600' }, 2: { label: 'Medium Priority', cls: 'bg-[#fff0cf] text-amber-700' }, 3: { label: 'Low Priority', cls: 'bg-[#e1e9ff] text-[#2f4fd0]' } } as Record<number, { label: string; cls: string }>;
export const errMsg = (e: any) => { if (e?.code === 'ERR_NETWORK' || (e?.request && !e?.response)) return 'Cannot reach the server. Make sure the backend is running on the configured API URL.'; const m = e?.response?.data?.message; return Array.isArray(m) ? m.join(', ') : m || e?.message || 'Something went wrong'; };
export const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

