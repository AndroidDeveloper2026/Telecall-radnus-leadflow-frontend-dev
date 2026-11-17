import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox, Loader2, X, AlertCircle, ArrowDownRight, ArrowUpRight, BarChart3, CalendarClock, FileText, History, LayoutDashboard, ListChecks, LucideIcon, Phone, PhoneCall, Settings, Users, UserCog, Contact as ContactIcon } from 'lucide-react';
import { Page, Presence } from '../types';
import { title } from '../utils/format';
import { BRAND } from '../utils/brand';

export const Spinner = ({ className = '' }: { className?: string }) => <Loader2 className={`animate-spin text-brand-600 ${className}`} size={22} />;
export const Loading = () => <div className="flex justify-center py-16" role="status"><Spinner /></div>;
export const ErrorState = ({ msg, retry }: { msg: string; retry?: () => void }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center"><AlertCircle className="text-accent-500" /><p className="text-sm text-slate-600">{msg}</p>{retry && <button className="btn-ghost" onClick={() => retry()}>Try again</button>}</div>
);
export const Empty = ({ text = 'Nothing here yet', hint }: { text?: string; hint?: string }) => (
  <div className="flex flex-col items-center gap-1 py-12 text-center text-brand-300"><Inbox size={30} /><p className="mt-2 text-sm font-semibold text-ink">{text}</p>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
);

/** Icon shown beside each page title, matched to the sidebar item for that route. */
const PATH_ICON: Record<string, LucideIcon> = {
  '/': LayoutDashboard, '/telecallers': Users, '/coordinators': UserCog, '/contacts': FileText, '/assignments': ListChecks, '/call-logs': Phone, '/reports': BarChart3, '/settings': Settings,
  '/my-team': Users, '/my-contacts': ContactIcon, '/follow-ups': CalendarClock, '/history': History, '/stats': BarChart3,
};
export const PageHeader = ({ title: t, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) => {
  const Icon = PATH_ICON[useLocation().pathname] || PhoneCall;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-600"><Icon size={26} strokeWidth={1.8} /></div>
        <div><h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink">{t}</h1>{sub && <p className="text-[15px] text-slate-600">{sub}</p>}</div>
      </div>
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  );
};

const TONES: Record<string, string> = {
  blue: 'bg-[#e8ebff] text-[#4455e0]', green: 'bg-[#e1f7ea] text-emerald-600', red: 'bg-[#ffe6ee] text-accent-600', yellow: 'bg-[#fff1da] text-amber-500', purple: 'bg-brand-100 text-brand-600',
};
export const StatCard = ({ icon, label, value, tone = 'purple', trend }: { icon: ReactNode; label: string; value: ReactNode; tone?: string; trend?: number }) => {
  const [bg, fg] = (TONES[tone] || TONES.purple).split(' ');
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-card">
      <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${bg} ${fg} [&>svg]:h-7 [&>svg]:w-7`}>{icon}</div>
      <div className="min-w-0 flex-1"><p className="truncate text-[15px] text-slate-700">{label}</p><p className="text-[28px] font-extrabold leading-tight text-ink">{value}</p></div>
      {trend !== undefined && <span className={`inline-flex items-center gap-0.5 self-end rounded-lg px-2 py-1 text-xs font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{trend >= 0 ? '+' : ''}{trend}%</span>}
    </div>
  );
};

const BADGE: Record<string, string> = {
  green: 'bg-[#dff7e8] text-emerald-700', blue: 'bg-[#e1e9ff] text-[#2f4fd0]', red: 'bg-[#ffe3ea] text-accent-600', amber: 'bg-[#fff0cf] text-amber-700', slate: 'bg-[#ececf2] text-slate-600', purple: 'bg-brand-100 text-brand-700', teal: 'bg-[#d9f5f3] text-teal-700', pink: 'bg-accent-100 text-accent-600',
};
const DOT: Record<string, string> = { green: 'bg-emerald-500', blue: 'bg-blue-500', red: 'bg-accent-500', amber: 'bg-amber-500', slate: 'bg-slate-400', purple: 'bg-brand-500', teal: 'bg-teal-500', pink: 'bg-accent-500' };
export const Badge = ({ tone = 'slate', dot, children }: { tone?: string; dot?: boolean; children: ReactNode }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-[13px] font-semibold ${BADGE[tone] || BADGE.slate}`}>{dot && <i className={`h-1.5 w-1.5 rounded-full ${DOT[tone] || DOT.slate}`} />}{children}</span>
);
const PRES: Record<Presence, [string, string]> = { ON_CALL: ['green', 'On Call'], AVAILABLE: ['blue', 'Available'], BREAK: ['amber', 'Break'], OFFLINE: ['red', 'Offline'] };
export const PresenceBadge = ({ p }: { p: Presence }) => <Badge tone={PRES[p][0]} dot>{PRES[p][1]}</Badge>;
const DISP_TONE: Record<string, string> = { INTERESTED: 'green', COMPLETED: 'green', NOT_INTERESTED: 'red', WRONG_NUMBER: 'red', FOLLOW_UP_REQUIRED: 'amber', CALL_BACK_LATER: 'amber', NO_ANSWER: 'slate', BUSY: 'slate', NOT_REACHABLE: 'slate' };
export const DispBadge = ({ d }: { d?: string }) => (d ? <Badge tone={DISP_TONE[d] || 'blue'}>{title(d)}</Badge> : <span className="text-slate-400">—</span>);
const CS: Record<string, string> = { NEW: 'green', ASSIGNED: 'blue', IN_PROGRESS: 'purple', FOLLOW_UP: 'amber', COMPLETED: 'teal', ACTIVE: 'green', INACTIVE: 'red' };
export const StatusBadge = ({ s }: { s: string }) => <Badge tone={CS[s] || 'slate'}>{title(s)}</Badge>;

export const Modal = ({ open, onClose, title: t, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) => {
  useEffect(() => { if (!open) return; const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1e0b3a]/50 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={t} className={`card max-h-[90vh] w-full overflow-y-auto p-7 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-extrabold text-ink">{t}</h2><button onClick={onClose} aria-label="Close" className="rounded-xl p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-700"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
};

export const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="block"><span className="label">{label}</span>{children}</label>;

/** Compact page list: 1 … current-1, current, current+1 … last */
const pageList = (cur: number, last: number) => {
  const s = new Set([1, last, cur - 1, cur, cur + 1]); const n = [...s].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b); const out: (number | '…')[] = [];
  n.forEach((p, i) => { if (i && p - n[i - 1] > 1) out.push('…'); out.push(p); }); return out;
};
const pgBtn = 'grid h-10 min-w-10 place-items-center rounded-xl border border-brand-100 bg-white px-2 text-sm font-semibold text-slate-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40';
export const Pagination = ({ page, onChange }: { page: Page<unknown>; onChange: (p: number) => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3e9f7] px-5 py-4 text-sm text-slate-500">
    <span>{page.total ? `Showing ${(page.page - 1) * page.limit + 1} – ${Math.min(page.page * page.limit, page.total)} of ${page.total}` : '0 results'}</span>
    <div className="flex items-center gap-2">
      <button className={pgBtn} disabled={page.page <= 1} onClick={() => onChange(page.page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
      {pageList(page.page, Math.max(page.pages, 1)).map((p, i) => p === '…' ? <span key={`e${i}`} className="px-1 text-slate-400">…</span> : <button key={p} onClick={() => onChange(p)} aria-current={p === page.page ? 'page' : undefined} className={`${pgBtn} ${p === page.page ? '!border-transparent !bg-brand-600 !text-white shadow-md shadow-brand-600/30' : ''}`}>{p}</button>)}
      <button className={pgBtn} disabled={page.page >= page.pages} onClick={() => onChange(page.page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
    </div>
  </div>
);

export const Confirm = ({ open, text, onYes, onClose }: { open: boolean; text: string; onYes: () => void; onClose: () => void }) => (
  <Modal open={open} onClose={onClose} title="Please confirm"><p className="text-sm text-slate-600">{text}</p><div className="mt-6 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-red" onClick={() => { onYes(); onClose(); }}>Confirm</button></div></Modal>
);

/** Headset-ring mark + wordmark. Sits on a white surface. Name comes from utils/brand.ts */
export const Logo = () => (
  <div className="flex items-center gap-2.5">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden>
      <defs><linearGradient id="rw-g" x1="4" y1="4" x2="42" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#5b2bb8" /><stop offset="1" stopColor="#e8317a" /></linearGradient></defs>
      <path d="M8.5 25a14.5 14.5 0 1 1 29 0" stroke="url(#rw-g)" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="3.5" y="23" width="8" height="13" rx="4" fill="url(#rw-g)" /><rect x="34.5" y="23" width="8" height="13" rx="4" fill="url(#rw-g)" />
      <path d="M38.5 35.5c0 4.2-4.2 6-9 6h-3" stroke="url(#rw-g)" strokeWidth="3" strokeLinecap="round" />
      <text x="23" y="32" textAnchor="middle" fontSize="21" fontWeight="800" fill="#4a1a78" fontFamily="'Plus Jakarta Sans', sans-serif">R</text>
    </svg>
    <div className="leading-[1.05]"><div className="text-[19px] font-extrabold tracking-wide text-ink">{BRAND.company}</div><div className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-[19px] font-extrabold text-transparent">{BRAND.product}</div></div>
  </div>
);
