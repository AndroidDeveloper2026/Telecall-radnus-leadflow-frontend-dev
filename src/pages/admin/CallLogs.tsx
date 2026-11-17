import { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { download, get } from '../../services/api';
import { useDebounce, useFetch, useSocketEvent } from '../../hooks/hooks';
import { CallLog, Page, Settings } from '../../types';
import { DispBadge, Loading, Modal, PageHeader, Badge } from '../../components/ui';
import { Col, DataTable } from '../../components/DataTable';
import { useEmployees } from './Contacts';
import { useToast } from '../../contexts/ToastContext';
import { errMsg, fmtDate, fmtDuration, title } from '../../utils/format';

export const CALL_STATUSES = ['CONNECTED', 'NO_ANSWER', 'BUSY', 'NOT_REACHABLE', 'WRONG_NUMBER'];
export function useFilters() {
  const [sp] = useSearchParams(); const [f, setF] = useState({ employeeId: sp.get('employeeId') || '', from: '', to: '', disposition: '', callStatus: '', search: '' });
  return { f, set: (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v })) };
}
export function Filters({ f, set }: ReturnType<typeof useFilters>) {
  const emps = useEmployees(); const st = useFetch(() => get<Settings>('/settings'), []);
  return (
    <div className="flex flex-wrap gap-3 p-4">
      <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search contact, phone or notes" value={f.search} onChange={(e) => set('search', e.target.value)} /></div>
      <select className="input !w-auto" value={f.employeeId} onChange={(e) => set('employeeId', e.target.value)} aria-label="Telecaller"><option value="">All telecallers</option>{emps.data?.items.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}</select>
      <select className="input !w-auto" value={f.disposition} onChange={(e) => set('disposition', e.target.value)} aria-label="Disposition"><option value="">All dispositions</option>{st.data?.dispositions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select>
      <select className="input !w-auto" value={f.callStatus} onChange={(e) => set('callStatus', e.target.value)} aria-label="Call status"><option value="">All call statuses</option>{CALL_STATUSES.map((s) => <option key={s} value={s}>{title(s)}</option>)}</select>
      <input className="input !w-auto" type="date" value={f.from} onChange={(e) => set('from', e.target.value)} aria-label="From date" /><input className="input !w-auto" type="date" value={f.to} onChange={(e) => set('to', e.target.value)} aria-label="To date" />
    </div>
  );
}
export const clean = (f: Record<string, string>) => Object.fromEntries(Object.entries(f).filter(([, v]) => v));

export function ExportButtons({ f }: { f: Record<string, string> }) {
  const toast = useToast(); const [busy, setBusy] = useState('');
  const go = async (fmt: 'csv' | 'xlsx') => { setBusy(fmt); try { await download('/reports/calls/export', { ...clean(f), format: fmt }, `call-report.${fmt}`); } catch (e) { toast.err(errMsg(e)); } finally { setBusy(''); } };
  return <><button className="btn-ghost" disabled={!!busy} onClick={() => go('csv')}><Download size={16} />CSV</button><button className="btn-ghost" disabled={!!busy} onClick={() => go('xlsx')}><Download size={16} />Excel</button></>;
}

export default function CallLogs() {
  const fl = useFilters(); const s = useDebounce(fl.f.search); const [pg, setPg] = useState(1); const [open, setOpen] = useState<string | null>(null);
  const params = { ...clean({ ...fl.f, search: s }) };
  useEffect(() => setPg(1), [JSON.stringify(params)]); // eslint-disable-line
  const { data, loading, error, reload } = useFetch(() => get<Page<CallLog>>('/call-logs', { ...params, page: pg, limit: 15 }), [JSON.stringify(params), pg]);
  useSocketEvent('call.updated', () => reload(true));
  const detail = useFetch(() => (open ? get<CallLog>(`/call-logs/${open}`) : Promise.resolve(null)), [open]);
  const cols: Col<CallLog>[] = [
    { head: 'Date & time', cell: (l) => fmtDate(l.startTime) }, { head: 'Telecaller', cell: (l) => l.employee?.name }, { head: 'Contact', cell: (l) => <><div className="font-semibold">{l.contact?.name}</div><div className="text-xs text-slate-500">{l.contact?.phone}</div></> },
    { head: 'Duration', cell: (l) => fmtDuration(l.duration) }, { head: 'Call status', cell: (l) => <Badge tone={l.callStatus === 'CONNECTED' ? 'green' : 'slate'}>{title(l.callStatus)}</Badge> }, { head: 'Disposition', cell: (l) => <DispBadge d={l.disposition} /> },
    { head: 'Notes', className: 'max-w-[220px] truncate', cell: (l) => l.notes || '—' },
  ];
  const d = detail.data;
  return (
    <>
      <PageHeader title="Call Logs" sub="Every call made by your team" actions={<ExportButtons f={{ ...fl.f, search: s }} />} />
      <div className="card"><Filters {...fl} /><DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} onRow={(l) => setOpen(l._id)} empty="No calls match these filters" /></div>
      <Modal open={!!open} onClose={() => setOpen(null)} title="Call details">
        {detail.loading || !d ? <Loading /> : (
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-slate-500">Contact</dt><dd className="font-semibold">{d.contact.name} · {d.contact.phone}</dd><dt className="text-slate-500">Company</dt><dd>{d.contact.company || '—'}</dd>
            <dt className="text-slate-500">Telecaller</dt><dd>{d.employee.name}</dd><dt className="text-slate-500">Started</dt><dd>{fmtDate(d.startTime)}</dd><dt className="text-slate-500">Ended</dt><dd>{fmtDate(d.endTime)}</dd>
            <dt className="text-slate-500">Duration</dt><dd>{fmtDuration(d.duration)}</dd><dt className="text-slate-500">Call status</dt><dd>{title(d.callStatus)}</dd><dt className="text-slate-500">Disposition</dt><dd><DispBadge d={d.disposition} /></dd>
            <dt className="text-slate-500">Follow-up</dt><dd>{fmtDate(d.followUpAt)}</dd><dt className="text-slate-500">Notes</dt><dd className="whitespace-pre-wrap">{d.notes || '—'}</dd>
          </dl>)}
      </Modal>
    </>
  );
}


//----- second change ------
// import { useEffect, useState } from 'react';
// import { Download, Search } from 'lucide-react';
// import { useSearchParams } from 'react-router-dom';
// import { download, get } from '../../services/api';
// import { useDebounce, useFetch, useSocketEvent } from '../../hooks/hooks';
// import { CallLog, Page, Settings } from '../../types';
// import { DispBadge, Loading, Modal, PageHeader, Badge } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useEmployees } from './Contacts';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtDate, fmtDuration, title } from '../../utils/format';

// export const CALL_STATUSES = ['CONNECTED', 'NO_ANSWER', 'BUSY', 'NOT_REACHABLE', 'WRONG_NUMBER'];
// export function useFilters() {
//   const [sp] = useSearchParams(); const [f, setF] = useState({ employeeId: sp.get('employeeId') || '', from: '', to: '', disposition: '', callStatus: '', search: '' });
//   return { f, set: (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v })) };
// }
// export function Filters({ f, set }: ReturnType<typeof useFilters>) {
//   const emps = useEmployees(); const st = useFetch(() => get<Settings>('/settings'), []);
//   return (
//     <div className="flex flex-wrap gap-3 p-4">
//       <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search contact, phone or notes" value={f.search} onChange={(e) => set('search', e.target.value)} /></div>
//       <select className="input !w-auto" value={f.employeeId} onChange={(e) => set('employeeId', e.target.value)} aria-label="Telecaller"><option value="">All telecallers</option>{emps.data?.items.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}</select>
//       <select className="input !w-auto" value={f.disposition} onChange={(e) => set('disposition', e.target.value)} aria-label="Disposition"><option value="">All dispositions</option>{st.data?.dispositions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select>
//       <select className="input !w-auto" value={f.callStatus} onChange={(e) => set('callStatus', e.target.value)} aria-label="Call status"><option value="">All call statuses</option>{CALL_STATUSES.map((s) => <option key={s} value={s}>{title(s)}</option>)}</select>
//       <input className="input !w-auto" type="date" value={f.from} onChange={(e) => set('from', e.target.value)} aria-label="From date" /><input className="input !w-auto" type="date" value={f.to} onChange={(e) => set('to', e.target.value)} aria-label="To date" />
//     </div>
//   );
// }
// export const clean = (f: Record<string, string>) => Object.fromEntries(Object.entries(f).filter(([, v]) => v));

// export function ExportButtons({ f }: { f: Record<string, string> }) {
//   const toast = useToast(); const [busy, setBusy] = useState('');
//   const go = async (fmt: 'csv' | 'xlsx') => { setBusy(fmt); try { await download('/reports/calls/export', { ...clean(f), format: fmt }, `call-report.${fmt}`); } catch (e) { toast.err(errMsg(e)); } finally { setBusy(''); } };
//   return <><button className="btn-ghost" disabled={!!busy} onClick={() => go('csv')}><Download size={16} />CSV</button><button className="btn-ghost" disabled={!!busy} onClick={() => go('xlsx')}><Download size={16} />Excel</button></>;
// }

// export default function CallLogs() {
//   const fl = useFilters(); const s = useDebounce(fl.f.search); const [pg, setPg] = useState(1); const [open, setOpen] = useState<string | null>(null);
//   const params = { ...clean({ ...fl.f, search: s }) };
//   useEffect(() => setPg(1), [JSON.stringify(params)]); // eslint-disable-line
//   const { data, loading, error, reload } = useFetch(() => get<Page<CallLog>>('/call-logs', { ...params, page: pg, limit: 15 }), [JSON.stringify(params), pg]);
//   useSocketEvent('call.updated', () => reload(true));
//   const detail = useFetch(() => (open ? get<CallLog>(`/call-logs/${open}`) : Promise.resolve(null)), [open]);
//   const cols: Col<CallLog>[] = [
//     { head: 'Date & time', cell: (l) => fmtDate(l.startTime) }, { head: 'Telecaller', cell: (l) => l.employee?.name }, { head: 'Contact', cell: (l) => <><div className="font-semibold">{l.contact?.name}</div><div className="text-xs text-slate-500">{l.contact?.phone}</div></> },
//     { head: 'Duration', cell: (l) => fmtDuration(l.duration) }, { head: 'Call status', cell: (l) => <Badge tone={l.callStatus === 'CONNECTED' ? 'green' : 'slate'}>{title(l.callStatus)}</Badge> }, { head: 'Disposition', cell: (l) => <DispBadge d={l.disposition} /> },
//     { head: 'Notes', className: 'max-w-[220px] truncate', cell: (l) => l.notes || '—' },
//   ];
//   const d = detail.data;
//   return (
//     <>
//       <PageHeader title="Call Logs" sub="Every call made by your team" actions={<ExportButtons f={{ ...fl.f, search: s }} />} />
//       <div className="card"><Filters {...fl} /><DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} onRow={(l) => setOpen(l._id)} empty="No calls match these filters" /></div>
//       <Modal open={!!open} onClose={() => setOpen(null)} title="Call details">
//         {detail.loading || !d ? <Loading /> : (
//           <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
//             <dt className="text-slate-500">Contact</dt><dd className="font-semibold">{d.contact.name} · {d.contact.phone}</dd><dt className="text-slate-500">Company</dt><dd>{d.contact.company || '—'}</dd>
//             <dt className="text-slate-500">Telecaller</dt><dd>{d.employee.name}</dd><dt className="text-slate-500">Started</dt><dd>{fmtDate(d.startTime)}</dd><dt className="text-slate-500">Ended</dt><dd>{fmtDate(d.endTime)}</dd>
//             <dt className="text-slate-500">Duration</dt><dd>{fmtDuration(d.duration)}</dd><dt className="text-slate-500">Call status</dt><dd>{title(d.callStatus)}</dd><dt className="text-slate-500">Disposition</dt><dd><DispBadge d={d.disposition} /></dd>
//             <dt className="text-slate-500">Follow-up</dt><dd>{fmtDate(d.followUpAt)}</dd><dt className="text-slate-500">Notes</dt><dd className="whitespace-pre-wrap">{d.notes || '—'}</dd>
//           </dl>)}
//       </Modal>
//     </>
//   );
// }

//------------ 12.11.2026 ---------
// import { useEffect, useState } from 'react';
// import { Download, Search } from 'lucide-react';
// import { download, get } from '../../services/api';
// import { useDebounce, useFetch, useSocketEvent } from '../../hooks/hooks';
// import { CallLog, Page, Settings } from '../../types';
// import { DispBadge, Loading, Modal, PageHeader, Badge } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useEmployees } from './Contacts';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtDate, fmtDuration, title } from '../../utils/format';

// export const CALL_STATUSES = ['CONNECTED', 'NO_ANSWER', 'BUSY', 'NOT_REACHABLE', 'WRONG_NUMBER'];
// export function useFilters() {
//   const [f, setF] = useState({ employeeId: '', from: '', to: '', disposition: '', callStatus: '', search: '' });
//   return { f, set: (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v })) };
// }
// export function Filters({ f, set }: ReturnType<typeof useFilters>) {
//   const emps = useEmployees(); const st = useFetch(() => get<Settings>('/settings'), []);
//   return (
//     <div className="flex flex-wrap gap-3 p-4">
//       <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search contact, phone or notes" value={f.search} onChange={(e) => set('search', e.target.value)} /></div>
//       <select className="input !w-auto" value={f.employeeId} onChange={(e) => set('employeeId', e.target.value)} aria-label="Telecaller"><option value="">All telecallers</option>{emps.data?.items.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}</select>
//       <select className="input !w-auto" value={f.disposition} onChange={(e) => set('disposition', e.target.value)} aria-label="Disposition"><option value="">All dispositions</option>{st.data?.dispositions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select>
//       <select className="input !w-auto" value={f.callStatus} onChange={(e) => set('callStatus', e.target.value)} aria-label="Call status"><option value="">All call statuses</option>{CALL_STATUSES.map((s) => <option key={s} value={s}>{title(s)}</option>)}</select>
//       <input className="input !w-auto" type="date" value={f.from} onChange={(e) => set('from', e.target.value)} aria-label="From date" /><input className="input !w-auto" type="date" value={f.to} onChange={(e) => set('to', e.target.value)} aria-label="To date" />
//     </div>
//   );
// }
// export const clean = (f: Record<string, string>) => Object.fromEntries(Object.entries(f).filter(([, v]) => v));

// export function ExportButtons({ f }: { f: Record<string, string> }) {
//   const toast = useToast(); const [busy, setBusy] = useState('');
//   const go = async (fmt: 'csv' | 'xlsx') => { setBusy(fmt); try { await download('/reports/calls/export', { ...clean(f), format: fmt }, `call-report.${fmt}`); } catch (e) { toast.err(errMsg(e)); } finally { setBusy(''); } };
//   return <><button className="btn-ghost" disabled={!!busy} onClick={() => go('csv')}><Download size={16} />CSV</button><button className="btn-ghost" disabled={!!busy} onClick={() => go('xlsx')}><Download size={16} />Excel</button></>;
// }

// export default function CallLogs() {
//   const fl = useFilters(); const s = useDebounce(fl.f.search); const [pg, setPg] = useState(1); const [open, setOpen] = useState<string | null>(null);
//   const params = { ...clean({ ...fl.f, search: s }) };
//   useEffect(() => setPg(1), [JSON.stringify(params)]); // eslint-disable-line
//   const { data, loading, error, reload } = useFetch(() => get<Page<CallLog>>('/call-logs', { ...params, page: pg, limit: 15 }), [JSON.stringify(params), pg]);
//   useSocketEvent('call.updated', () => reload(true));
//   const detail = useFetch(() => (open ? get<CallLog>(`/call-logs/${open}`) : Promise.resolve(null)), [open]);
//   const cols: Col<CallLog>[] = [
//     { head: 'Date & time', cell: (l) => fmtDate(l.startTime) }, { head: 'Telecaller', cell: (l) => l.employee?.name }, { head: 'Contact', cell: (l) => <><div className="font-semibold">{l.contact?.name}</div><div className="text-xs text-slate-500">{l.contact?.phone}</div></> },
//     { head: 'Duration', cell: (l) => fmtDuration(l.duration) }, { head: 'Call status', cell: (l) => <Badge tone={l.callStatus === 'CONNECTED' ? 'green' : 'slate'}>{title(l.callStatus)}</Badge> }, { head: 'Disposition', cell: (l) => <DispBadge d={l.disposition} /> },
//     { head: 'Notes', className: 'max-w-[220px] truncate', cell: (l) => l.notes || '—' },
//   ];
//   const d = detail.data;
//   return (
//     <>
//       <PageHeader title="Call Logs" sub="Every call made by your team" actions={<ExportButtons f={{ ...fl.f, search: s }} />} />
//       <div className="card"><Filters {...fl} /><DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} onRow={(l) => setOpen(l._id)} empty="No calls match these filters" /></div>
//       <Modal open={!!open} onClose={() => setOpen(null)} title="Call details">
//         {detail.loading || !d ? <Loading /> : (
//           <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
//             <dt className="text-slate-500">Contact</dt><dd className="font-semibold">{d.contact.name} · {d.contact.phone}</dd><dt className="text-slate-500">Company</dt><dd>{d.contact.company || '—'}</dd>
//             <dt className="text-slate-500">Telecaller</dt><dd>{d.employee.name}</dd><dt className="text-slate-500">Started</dt><dd>{fmtDate(d.startTime)}</dd><dt className="text-slate-500">Ended</dt><dd>{fmtDate(d.endTime)}</dd>
//             <dt className="text-slate-500">Duration</dt><dd>{fmtDuration(d.duration)}</dd><dt className="text-slate-500">Call status</dt><dd>{title(d.callStatus)}</dd><dt className="text-slate-500">Disposition</dt><dd><DispBadge d={d.disposition} /></dd>
//             <dt className="text-slate-500">Follow-up</dt><dd>{fmtDate(d.followUpAt)}</dd><dt className="text-slate-500">Notes</dt><dd className="whitespace-pre-wrap">{d.notes || '—'}</dd>
//           </dl>)}
//       </Modal>
//     </>
//   );
// }
