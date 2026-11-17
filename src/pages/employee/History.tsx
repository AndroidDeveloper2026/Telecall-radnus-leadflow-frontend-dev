import { useEffect, useState } from 'react';
import { get, patch } from '../../services/api';
import { useFetch } from '../../hooks/hooks';
import { CallLog, Page, Settings } from '../../types';
import { Badge, DispBadge, Modal, PageHeader } from '../../components/ui';
import { Col, DataTable } from '../../components/DataTable';
import { useToast } from '../../contexts/ToastContext';
import { errMsg, fmtDate, fmtDuration, title } from '../../utils/format';

export default function History() {
  const toast = useToast(); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [disp, setDisp] = useState(''); const [pg, setPg] = useState(1);
  useEffect(() => setPg(1), [from, to, disp]);
  const cfg = useFetch(() => get<Settings>('/settings'), []);
  const { data, loading, error, reload } = useFetch(() => get<Page<CallLog>>('/call-logs', { from: from || undefined, to: to || undefined, disposition: disp || undefined, page: pg, limit: 15 }), [from, to, disp, pg]);
  const [edit, setEdit] = useState<CallLog | null>(null); const [nd, setNd] = useState(''); const [nn, setNn] = useState('');
  const save = async () => { try { await patch(`/call-logs/${edit!._id}`, { disposition: nd, notes: nn }); toast.ok('Call updated'); setEdit(null); reload(true); } catch (e) { toast.err(errMsg(e)); } };
  const cols: Col<CallLog>[] = [
    { head: 'Date & time', cell: (l) => fmtDate(l.startTime) }, { head: 'Contact', cell: (l) => <><div className="font-semibold">{l.contact?.name}</div><div className="text-xs text-slate-500">{l.contact?.phone}</div></> },
    { head: 'Duration', cell: (l) => fmtDuration(l.duration) }, { head: 'Call status', cell: (l) => <Badge tone={l.callStatus === 'CONNECTED' ? 'green' : 'slate'}>{title(l.callStatus)}</Badge> },
    { head: 'Disposition', cell: (l) => <DispBadge d={l.disposition} /> }, { head: 'Notes', className: 'max-w-[240px] truncate', cell: (l) => l.notes || '—' },
  ];
  return (
    <>
      <PageHeader title="Call History" sub="Your recent calls — tap a row to edit notes" />
      <div className="card">
        <div className="flex flex-wrap gap-3 p-4"><select className="input !w-auto" value={disp} onChange={(e) => setDisp(e.target.value)} aria-label="Disposition"><option value="">All dispositions</option>{cfg.data?.dispositions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select>
          <input type="date" className="input !w-auto" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" /><input type="date" className="input !w-auto" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" /></div>
        <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} onRow={(l) => { setEdit(l); setNd(l.disposition); setNn(l.notes || ''); }} empty="No calls yet" />
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Call with ${edit?.contact?.name}`}>
        <div className="space-y-3"><label className="block"><span className="label">Disposition</span><select className="input" value={nd} onChange={(e) => setNd(e.target.value)}>{cfg.data?.dispositions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select></label>
          <label className="block"><span className="label">Notes</span><textarea className="input min-h-[100px]" maxLength={2000} value={nn} onChange={(e) => setNn(e.target.value)} /></label>
          <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save changes</button></div></div>
      </Modal>
    </>
  );
}

//-------- 12.11.2026 ---------
// import { useEffect, useState } from 'react';
// import { get, patch } from '../../services/api';
// import { useFetch } from '../../hooks/hooks';
// import { CallLog, Page, Settings } from '../../types';
// import { Badge, DispBadge, Modal, PageHeader } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtDate, fmtDuration, title } from '../../utils/format';

// export default function History() {
//   const toast = useToast(); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [disp, setDisp] = useState(''); const [pg, setPg] = useState(1);
//   useEffect(() => setPg(1), [from, to, disp]);
//   const cfg = useFetch(() => get<Settings>('/settings'), []);
//   const { data, loading, error, reload } = useFetch(() => get<Page<CallLog>>('/call-logs', { from: from || undefined, to: to || undefined, disposition: disp || undefined, page: pg, limit: 15 }), [from, to, disp, pg]);
//   const [edit, setEdit] = useState<CallLog | null>(null); const [nd, setNd] = useState(''); const [nn, setNn] = useState('');
//   const save = async () => { try { await patch(`/call-logs/${edit!._id}`, { disposition: nd, notes: nn }); toast.ok('Call updated'); setEdit(null); reload(true); } catch (e) { toast.err(errMsg(e)); } };
//   const cols: Col<CallLog>[] = [
//     { head: 'Date & time', cell: (l) => fmtDate(l.startTime) }, { head: 'Contact', cell: (l) => <><div className="font-semibold">{l.contact?.name}</div><div className="text-xs text-slate-500">{l.contact?.phone}</div></> },
//     { head: 'Duration', cell: (l) => fmtDuration(l.duration) }, { head: 'Call status', cell: (l) => <Badge tone={l.callStatus === 'CONNECTED' ? 'green' : 'slate'}>{title(l.callStatus)}</Badge> },
//     { head: 'Disposition', cell: (l) => <DispBadge d={l.disposition} /> }, { head: 'Notes', className: 'max-w-[240px] truncate', cell: (l) => l.notes || '—' },
//   ];
//   return (
//     <>
//       <PageHeader title="Call History" sub="Your recent calls — tap a row to edit notes" />
//       <div className="card">
//         <div className="flex flex-wrap gap-3 p-4"><select className="input !w-auto" value={disp} onChange={(e) => setDisp(e.target.value)} aria-label="Disposition"><option value="">All dispositions</option>{cfg.data?.dispositions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select>
//           <input type="date" className="input !w-auto" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" /><input type="date" className="input !w-auto" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" /></div>
//         <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} onRow={(l) => { setEdit(l); setNd(l.disposition); setNn(l.notes || ''); }} empty="No calls yet" />
//       </div>
//       <Modal open={!!edit} onClose={() => setEdit(null)} title={`Call with ${edit?.contact?.name}`}>
//         <div className="space-y-3"><label className="block"><span className="label">Disposition</span><select className="input" value={nd} onChange={(e) => setNd(e.target.value)}>{cfg.data?.dispositions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select></label>
//           <label className="block"><span className="label">Notes</span><textarea className="input min-h-[100px]" maxLength={2000} value={nn} onChange={(e) => setNn(e.target.value)} /></label>
//           <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save changes</button></div></div>
//       </Modal>
//     </>
//   );
// }
