import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, BarChart3, ChevronDown, FileText, History, LayoutDashboard, ListChecks, LogOut, Menu, Phone, Search, Settings, Users, Contact as ContactIcon, CalendarClock, PhoneCall, UserCircle, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { get, patch, warmUp } from '../services/api';
import { useSocketEvent } from '../hooks/hooks';
import { Logo } from '../components/ui';
import { Notice } from '../types';
import { fmtDate } from '../utils/format';
import { useToast } from '../contexts/ToastContext';

const ADMIN_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }, { to: '/telecallers', label: 'Telecallers', icon: Users }, { to: '/coordinators', label: 'Coordinators', icon: UserCog }, { to: '/contacts', label: 'Contacts', icon: FileText },
  { to: '/assignments', label: 'Assignments', icon: ListChecks }, { to: '/call-logs', label: 'Call Logs', icon: Phone }, { to: '/reports', label: 'Reports', icon: BarChart3 }, { to: '/settings', label: 'Settings', icon: Settings },
];
const COORD_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }, { to: '/my-team', label: 'My Team', icon: Users }, { to: '/contacts', label: 'Contacts', icon: FileText }, { to: '/assignments', label: 'Assignments', icon: ListChecks }, { to: '/call-logs', label: 'Team Call Logs', icon: Phone }, { to: '/settings', label: 'Settings', icon: Settings },
];
const EMP_NAV = [
  { to: '/', label: 'My Queue', icon: PhoneCall, end: true }, { to: '/my-contacts', label: 'My Contacts', icon: ContactIcon }, { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/history', label: 'Call History', icon: History }, { to: '/stats', label: 'My Stats', icon: BarChart3 }, { to: '/settings', label: 'Settings', icon: Settings },
];

function Bell_() {
  const [open, setOpen] = useState(false); const [items, setItems] = useState<Notice[]>([]); const [unread, setUnread] = useState(0); const toast = useToast();
  const load = () => get<{ items: Notice[]; unread: number }>('/notifications').then((r) => { setItems(r.items); setUnread(r.unread); }).catch(() => {});
  useEffect(() => { load(); }, []);
  useSocketEvent('notification.new', (n: Notice) => { toast.ok(n.title); load(); });
  const readAll = async () => { await patch('/notifications/read-all'); load(); };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative rounded-full p-2.5 hover:bg-white/10" aria-label="Notifications"><Bell size={24} strokeWidth={1.8} />{unread > 0 && <span className="absolute right-0.5 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold ring-2 ring-[#8a22ab]">{unread}</span>}</button>
      {open && (
        <div className="card absolute right-0 z-40 mt-3 w-80 text-ink">
          <div className="flex items-center justify-between border-b border-[#f3e9f7] px-5 py-3.5"><b className="text-sm">Notifications</b><button className="text-xs font-semibold text-brand-600" onClick={readAll}>Mark all read</button></div>
          <div className="max-h-80 overflow-y-auto">{items.length ? items.map((n) => <div key={n._id} className={`border-b border-[#f7f0fa] px-5 py-3 ${n.read ? '' : 'bg-brand-50/70'}`}><p className="text-sm font-semibold">{n.title}</p><p className="text-xs text-slate-500">{n.message}</p><p className="mt-1 text-[11px] text-slate-400">{fmtDate(n.createdAt)}</p></div>) : <p className="p-6 text-center text-sm text-slate-400">No notifications</p>}</div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const [side, setSide] = useState(false); const [collapsed, setCollapsed] = useState(false); const [menu, setMenu] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
  const [waking, setWaking] = useState(false);
  useEffect(() => { const on = () => setWaking(true); const off = () => setWaking(false); window.addEventListener('api:waking', on); window.addEventListener('api:awake', off); warmUp(); return () => { window.removeEventListener('api:waking', on); window.removeEventListener('api:awake', off); }; }, []);
  const admin = user!.role === 'ADMIN'; const coord = user!.role === 'COORDINATOR'; const items = admin ? ADMIN_NAV : coord ? COORD_NAV : EMP_NAV;
  useEffect(() => { const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setMenu(false); }; document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f); }, []);
  const search = (e: React.FormEvent) => { e.preventDefault(); nav(`${admin || coord ? '/contacts' : '/my-contacts'}?search=${encodeURIComponent(q)}`); };
  const toggleMenu = () => (window.matchMedia('(min-width:1024px)').matches ? setCollapsed(!collapsed) : setSide(!side));
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-[72px] items-stretch bg-gradient-to-r from-[#4c1590] via-[#7a1fa2] to-[#a82bb8] text-white shadow-[0_10px_30px_-14px_rgba(76,21,144,.7)]">
        <div className="flex shrink-0 items-center rounded-br-[44px] bg-white pl-5 pr-9 shadow-[6px_0_20px_-10px_rgba(76,21,144,.35)] lg:w-[17rem] lg:pr-0"><Logo /></div>
        <div className="flex flex-1 items-center gap-3 px-3 sm:gap-5 sm:px-6">
          <button className="rounded-xl p-2 hover:bg-white/10" onClick={toggleMenu} aria-label="Toggle menu"><Menu size={26} strokeWidth={1.8} /></button>
          {admin || coord ? (
            <form onSubmit={search} className="hidden max-w-2xl flex-1 md:block"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={19} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={coord ? 'Search contacts…' : 'Search contacts, telecallers, assignments…'} className="h-12 w-full rounded-2xl bg-white/95 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-white/25" /></div></form>
          ) : <span className="hidden text-sm font-bold md:block">Agent: {user!.name}</span>}
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Bell_ />
            <div className="relative" ref={ref}>
              <button onClick={() => setMenu(!menu)} className="flex items-center gap-2.5 rounded-2xl py-1 pl-1 pr-2 hover:bg-white/10"><span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-600 shadow-md"><UserCircle size={30} strokeWidth={1.6} /></span><span className="hidden text-[17px] font-semibold sm:block">{admin ? 'Admin' : coord ? 'Coordinator' : 'My Profile'}</span><ChevronDown size={18} /></button>
              {menu && <div className="card absolute right-0 mt-3 w-56 overflow-hidden py-1 text-ink"><div className="border-b border-[#f3e9f7] px-4 py-3"><p className="truncate text-sm font-bold">{user!.name}</p><p className="truncate text-xs text-slate-500">{user!.email}</p></div><button onClick={() => { setMenu(false); nav('/settings'); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50"><Settings size={16} />Settings</button><button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-accent-600 hover:bg-accent-50"><LogOut size={16} />Logout</button></div>}
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className={`fixed bottom-0 left-0 top-[72px] z-20 w-[17rem] shrink-0 overflow-hidden bg-gradient-to-b from-[#3d0f72] via-[#4c1588] to-[#6a1b9f] transition-transform lg:sticky lg:h-[calc(100vh-72px)] lg:translate-x-0 ${side ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:hidden' : ''}`}>
          <svg className="pointer-events-none absolute inset-x-0 bottom-0 w-full" viewBox="0 0 272 220" preserveAspectRatio="none" aria-hidden><defs><linearGradient id="rw-w" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8e2bb5" stopOpacity=".55" /><stop offset="1" stopColor="#e8317a" stopOpacity=".45" /></linearGradient></defs><path d="M0 120C30 70 80 60 120 100s90 60 152 40v80H0Z" fill="url(#rw-w)" /><path d="M0 170c40-30 90-20 130 10s100 30 142 0v40H0Z" fill="#a62bb4" fillOpacity=".5" /></svg>
          <nav className="relative z-10 flex flex-col gap-1.5 overflow-y-auto p-4">{items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setSide(false)} className={({ isActive }) => `flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[16px] font-semibold transition ${isActive ? 'bg-gradient-to-r from-[#e8317a] to-[#f2528f] text-white shadow-lg shadow-black/25' : 'text-white/90 hover:bg-white/10'}`}><n.icon size={22} strokeWidth={1.8} />{n.label}</NavLink>
          ))}</nav>
        </aside>
        {side && <div className="fixed inset-0 top-[72px] z-10 bg-[#1e0b3a]/40 lg:hidden" onClick={() => setSide(false)} />}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{waking && <div role="status" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">Server is starting up — this can take up to a minute. Data will load automatically.</div>}<Outlet /></main>
      </div>
    </div>
  );
}
