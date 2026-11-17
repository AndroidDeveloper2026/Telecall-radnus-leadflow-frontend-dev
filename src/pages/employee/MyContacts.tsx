import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Phone, Search } from 'lucide-react';
import { get, patch } from '../../services/api';
import { useDebounce, useFetch } from '../../hooks/hooks';
import { CallLog, Contact, Page } from '../../types';
import { DispBadge, Empty, Loading, Modal, PageHeader, StatusBadge } from '../../components/ui';
import { Col, DataTable } from '../../components/DataTable';
import { useToast } from '../../contexts/ToastContext';
import { errMsg, fmtDate, fmtDuration, PRIORITY, toLocalInput } from '../../utils/format';

export default function MyContacts({ followUps }: { followUps?: boolean }) {
  const [sp] = useSearchParams(); const toast = useToast();
  const [search, setSearch] = useState(sp.get('search') || ''); const [status, setStatus] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
  useEffect(() => setPg(1), [q, status, followUps]);
  const { data, loading, error, reload } = useFetch(() => get<Page<Contact>>('/contacts', { search: q, status: status || undefined, followUps: followUps ? 'true' : undefined, sort: followUps ? 'followUpAt' : 'name', order: 'asc', page: pg, limit: 15 }), [q, status, pg, followUps]);
  const [open, setOpen] = useState<Contact | null>(null); const [when, setWhen] = useState('');
  const hist = useFetch(() => (open ? get<Page<CallLog>>('/call-logs', { contactId: open._id, limit: 20 }) : Promise.resolve(null)), [open?._id]);
  const act = async (fn: () => Promise<unknown>, msg: string) => { try { await fn(); toast.ok(msg); setOpen(null); reload(true); } catch (e) { toast.err(errMsg(e)); } };
  const cols: Col<Contact>[] = [
    { head: 'Name', cell: (c) => <span className="font-semibold">{c.name}</span> }, { head: 'Phone', cell: (c) => c.phone }, { head: 'Company', cell: (c) => c.company || '—' },
    { head: 'Priority', cell: (c) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY[c.priority].cls}`}>{PRIORITY[c.priority].label.split(' ')[0]}</span> },
    { head: 'Status', cell: (c) => <StatusBadge s={c.status} /> }, { head: followUps ? 'Follow-up' : 'Last result', cell: (c) => (followUps ? fmtDate(c.followUpAt) : <DispBadge d={c.lastDisposition} />) },
  ];
  return (
    <>
      <PageHeader title={followUps ? 'Follow-ups' : 'My Contacts'} sub={followUps ? 'Customers you promised to call back' : 'Contacts assigned to you'} />
      <div className="card">
        <div className="flex flex-wrap gap-3 p-4"><div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search name, phone, company" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {!followUps && <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option>{['ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'COMPLETED'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>}</div>
        <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} onRow={(c) => { setOpen(c); setWhen(''); }} empty={followUps ? 'No follow-ups scheduled' : 'No contacts assigned yet'} />
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name || ''} wide>
        {open && <div className="space-y-4">
          <dl className="grid grid-cols-[100px_1fr] gap-y-1.5 text-sm"><dt className="text-slate-500">Phone</dt><dd className="font-semibold">{open.phone}</dd><dt className="text-slate-500">Company</dt><dd>{open.company || '—'}</dd><dt className="text-slate-500">Email</dt><dd>{open.email || '—'}</dd><dt className="text-slate-500">City</dt><dd>{open.city || '—'}</dd><dt className="text-slate-500">Status</dt><dd><StatusBadge s={open.status} /></dd></dl>
          <div className="flex flex-wrap items-end gap-2"><a className="btn-green" href={`tel:${open.phone}`}><Phone size={16} />Call</a>
            <button className="btn-ghost" disabled={open.status === 'COMPLETED'} onClick={() => act(() => patch(`/contacts/${open._id}/complete`), 'Marked as completed')}><CheckCircle2 size={16} />Mark completed</button>
            <input type="datetime-local" className="input !w-auto" aria-label="Follow-up time" min={toLocalInput(new Date())} value={when} onChange={(e) => setWhen(e.target.value)} />
            <button className="btn-ghost" disabled={!when} onClick={() => act(() => patch(`/contacts/${open._id}/follow-up`, { followUpAt: new Date(when).toISOString() }), 'Follow-up scheduled')}><CalendarClock size={16} />Schedule follow-up</button></div>
          <div><h3 className="mb-2 text-sm font-bold">Call history</h3>{hist.loading ? <Loading /> : hist.data?.items.length ? <ul className="divide-y divide-slate-100 text-sm">{hist.data.items.map((l) => <li key={l._id} className="py-2"><div className="flex items-center justify-between"><DispBadge d={l.disposition} /><span className="text-xs text-slate-500">{fmtDate(l.startTime)} · {fmtDuration(l.duration)}</span></div>{l.notes && <p className="mt-1 text-slate-600">{l.notes}</p>}</li>)}</ul> : <Empty text="No calls yet" />}</div>
        </div>}
      </Modal>
    </>
  );
}

//----- 12.11.2026 -----------
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { CalendarClock, CheckCircle2, Phone, Search } from 'lucide-react';
// import { get, patch } from '../../services/api';
// import { useDebounce, useFetch } from '../../hooks/hooks';
// import { CallLog, Contact, Page } from '../../types';
// import { DispBadge, Empty, Loading, Modal, PageHeader, StatusBadge } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtDate, fmtDuration, PRIORITY, toLocalInput } from '../../utils/format';

// export default function MyContacts({ followUps }: { followUps?: boolean }) {
//   const [sp] = useSearchParams(); const toast = useToast();
//   const [search, setSearch] = useState(sp.get('search') || ''); const [status, setStatus] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
//   useEffect(() => setPg(1), [q, status, followUps]);
//   const { data, loading, error, reload } = useFetch(() => get<Page<Contact>>('/contacts', { search: q, status: status || undefined, followUps: followUps ? 'true' : undefined, sort: followUps ? 'followUpAt' : 'name', order: 'asc', page: pg, limit: 15 }), [q, status, pg, followUps]);
//   const [open, setOpen] = useState<Contact | null>(null); const [when, setWhen] = useState('');
//   const hist = useFetch(() => (open ? get<Page<CallLog>>('/call-logs', { contactId: open._id, limit: 20 }) : Promise.resolve(null)), [open?._id]);
//   const act = async (fn: () => Promise<unknown>, msg: string) => { try { await fn(); toast.ok(msg); setOpen(null); reload(true); } catch (e) { toast.err(errMsg(e)); } };
//   const cols: Col<Contact>[] = [
//     { head: 'Name', cell: (c) => <span className="font-semibold">{c.name}</span> }, { head: 'Phone', cell: (c) => c.phone }, { head: 'Company', cell: (c) => c.company || '—' },
//     { head: 'Priority', cell: (c) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY[c.priority].cls}`}>{PRIORITY[c.priority].label.split(' ')[0]}</span> },
//     { head: 'Status', cell: (c) => <StatusBadge s={c.status} /> }, { head: followUps ? 'Follow-up' : 'Last result', cell: (c) => (followUps ? fmtDate(c.followUpAt) : <DispBadge d={c.lastDisposition} />) },
//   ];
//   return (
//     <>
//       <PageHeader title={followUps ? 'Follow-ups' : 'My Contacts'} sub={followUps ? 'Customers you promised to call back' : 'Contacts assigned to you'} />
//       <div className="card">
//         <div className="flex flex-wrap gap-3 p-4"><div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search name, phone, company" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
//           {!followUps && <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option>{['ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'COMPLETED'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>}</div>
//         <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} onRow={(c) => { setOpen(c); setWhen(''); }} empty={followUps ? 'No follow-ups scheduled' : 'No contacts assigned yet'} />
//       </div>
//       <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name || ''} wide>
//         {open && <div className="space-y-4">
//           <dl className="grid grid-cols-[100px_1fr] gap-y-1.5 text-sm"><dt className="text-slate-500">Phone</dt><dd className="font-semibold">{open.phone}</dd><dt className="text-slate-500">Company</dt><dd>{open.company || '—'}</dd><dt className="text-slate-500">Email</dt><dd>{open.email || '—'}</dd><dt className="text-slate-500">City</dt><dd>{open.city || '—'}</dd><dt className="text-slate-500">Status</dt><dd><StatusBadge s={open.status} /></dd></dl>
//           <div className="flex flex-wrap items-end gap-2"><a className="btn-green" href={`tel:${open.phone}`}><Phone size={16} />Call</a>
//             <button className="btn-ghost" disabled={open.status === 'COMPLETED'} onClick={() => act(() => patch(`/contacts/${open._id}/complete`), 'Marked as completed')}><CheckCircle2 size={16} />Mark completed</button>
//             <input type="datetime-local" className="input !w-auto" aria-label="Follow-up time" min={toLocalInput(new Date())} value={when} onChange={(e) => setWhen(e.target.value)} />
//             <button className="btn-ghost" disabled={!when} onClick={() => act(() => patch(`/contacts/${open._id}/follow-up`, { followUpAt: new Date(when).toISOString() }), 'Follow-up scheduled')}><CalendarClock size={16} />Schedule follow-up</button></div>
//           <div><h3 className="mb-2 text-sm font-bold">Call history</h3>{hist.loading ? <Loading /> : hist.data?.items.length ? <ul className="divide-y divide-slate-100 text-sm">{hist.data.items.map((l) => <li key={l._id} className="py-2"><div className="flex items-center justify-between"><DispBadge d={l.disposition} /><span className="text-xs text-slate-500">{fmtDate(l.startTime)} · {fmtDuration(l.duration)}</span></div>{l.notes && <p className="mt-1 text-slate-600">{l.notes}</p>}</li>)}</ul> : <Empty text="No calls yet" />}</div>
//         </div>}
//       </Modal>
//     </>
//   );
// }
