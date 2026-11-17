
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { KeyRound, Pencil, Plus, Power, Search } from 'lucide-react';
import { get, patch, post } from '../../services/api';
import { useDebounce, useFetch, useSocketEvent } from '../../hooks/hooks';
import { Page, User } from '../../types';
import { Confirm, Field, Loading, Modal, PageHeader, PresenceBadge, StatusBadge, StatCard } from '../../components/ui';
import { Col, DataTable } from '../../components/DataTable';
import { useToast } from '../../contexts/ToastContext';
import { errMsg, fmtTalk, fmtDuration } from '../../utils/format';
import { PhoneCall, Clock, TrendingUp, Hourglass } from 'lucide-react';

const leadId = (u?: Partial<User> | null) => (u?.teamLead && typeof u.teamLead === 'object' ? u.teamLead._id : (u?.teamLead as string) || '');
const leadName = (u: User) => (u.teamLead && typeof u.teamLead === 'object' ? u.teamLead.name : '—');

export default function Telecallers() {
  const [sp, setSp] = useSearchParams(); const toast = useToast();
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
  useEffect(() => setPg(1), [q, status]);
  const { data, loading, error, reload } = useFetch(() => get<Page<User>>('/employees', { search: q, status, page: pg, limit: 15 }), [q, status, pg]);
  useSocketEvent('presence.updated', () => reload(true));
  const [form, setForm] = useState<Partial<User> & { password?: string } | null>(null); const [reset, setReset] = useState<User | null>(null); const [pw, setPw] = useState(''); const [toggle, setToggle] = useState<User | null>(null); const [busy, setBusy] = useState(false);
  const coords = useFetch(() => get<Page<User>>('/coordinators', { limit: 100, status: 'ACTIVE', sort: 'name', order: 'asc' }), []);
  const detailId = sp.get('id'); const detail = useFetch(() => (detailId ? get<User>(`/employees/${detailId}`) : Promise.resolve(null)), [detailId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form) return; setBusy(true);
    try {
      if (form._id) await patch(`/employees/${form._id}`, { name: form.name, email: form.email, phone: form.phone || undefined, teamLead: leadId(form) || null }); else await post('/employees', { name: form.name, email: form.email, phone: form.phone || undefined, password: form.password, teamLead: leadId(form) || null });
      toast.ok(form._id ? 'Telecaller updated' : 'Telecaller created'); setForm(null); reload(true);
    } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); }
  };
  const doReset = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { await post(`/employees/${reset!._id}/reset-password`, { password: pw }); toast.ok('Password reset. Ask the telecaller to log in again.'); setReset(null); setPw(''); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
  const doToggle = async () => { try { await patch(`/employees/${toggle!._id}/status`, { status: toggle!.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); toast.ok('Status updated'); reload(true); } catch (x) { toast.err(errMsg(x)); } };

  const cols: Col<User>[] = [
    { head: 'Name', cell: (u) => <button className="text-left font-semibold text-blue-700 hover:underline" onClick={() => setSp({ id: u._id })}>{u.name}</button> },
    { head: 'Email', cell: (u) => u.email }, { head: 'Phone', cell: (u) => u.phone || '—' }, { head: 'Assigned', cell: (u) => u.assignedCount }, { head: 'Coordinator', cell: (u) => leadName(u) },
    { head: 'Presence', cell: (u) => <PresenceBadge p={u.status === 'ACTIVE' ? u.presence : 'OFFLINE'} /> }, { head: 'Status', cell: (u) => <StatusBadge s={u.status} /> },
    { head: 'Actions', className: 'text-right', cell: (u) => (
      <div className="flex justify-end gap-1">
        <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Edit" aria-label="Edit" onClick={() => setForm(u)}><Pencil size={16} /></button>
        <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Reset password" aria-label="Reset password" onClick={() => setReset(u)}><KeyRound size={16} /></button>
        <button className="rounded-lg p-1.5 hover:bg-slate-100" title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} aria-label="Toggle status" onClick={() => setToggle(u)}><Power size={16} className={u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'} /></button>
      </div>) },
  ];
  const p = detail.data?.performance;
  return (
    <>
      <PageHeader title="Telecallers" sub="Manage your calling team" actions={<button className="btn-primary" onClick={() => setForm({ name: '', email: '', phone: '', password: '' })}><Plus size={16} />Add telecaller</button>} />
      <div className="card">
        <div className="flex flex-wrap gap-3 p-4"><div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
        <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} empty="No telecallers found" />
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit telecaller' : 'Add telecaller'}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Full name"><input className="input" required minLength={2} value={form?.name || ''} onChange={(e) => setForm({ ...form!, name: e.target.value })} /></Field>
          <Field label="Email"><input className="input" type="email" required value={form?.email || ''} onChange={(e) => setForm({ ...form!, email: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={form?.phone || ''} onChange={(e) => setForm({ ...form!, phone: e.target.value })} /></Field>
          <Field label="Operations Coordinator"><select className="input" value={leadId(form)} onChange={(e) => setForm({ ...form!, teamLead: e.target.value || null })}><option value="">— None —</option>{coords.data?.items.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
          {!form?._id && <Field label="Temporary password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={form?.password || ''} onChange={(e) => setForm({ ...form!, password: e.target.value })} /></Field>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div>
        </form>
      </Modal>
      <Modal open={!!reset} onClose={() => setReset(null)} title={`Reset password — ${reset?.name}`}>
        <form onSubmit={doReset} className="space-y-3"><Field label="New password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setReset(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Reset password</button></div></form>
      </Modal>
      <Confirm open={!!toggle} onClose={() => setToggle(null)} onYes={doToggle} text={toggle?.status === 'ACTIVE' ? `Deactivate ${toggle?.name}? They will be signed out immediately.` : `Activate ${toggle?.name}?`} />
      <Modal open={!!detailId} onClose={() => setSp({})} title={detail.data?.name || 'Telecaller'} wide>
        {detail.loading || !detail.data ? <Loading /> : (
          <div className="space-y-4"><p className="text-sm text-slate-500">{detail.data.email} · {detail.data.phone || 'no phone'} · Coordinator: {leadName(detail.data)}</p>
            {p && <><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard tone="blue" icon={<PhoneCall />} label="Calls today" value={p.callsToday} /><StatCard tone="green" icon={<Clock />} label="Talk time today" value={fmtTalk(p.talkTimeToday)} /><StatCard tone="purple" icon={<TrendingUp />} label="Success rate" value={`${p.successRate}%`} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={p.pending} /></div>
              <p className="text-sm text-slate-600">Assigned {p.assigned} · Completed {p.completed} · Follow-ups {p.followUps} · Total calls {p.totalCalls} · Avg duration {fmtDuration(p.avgDuration)}</p></>}
          </div>)}
      </Modal>
    </>
  );
}

//----- second change ----------
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { KeyRound, Pencil, Plus, Power, Search } from 'lucide-react';
// import { get, patch, post } from '../../services/api';
// import { useDebounce, useFetch, useSocketEvent } from '../../hooks/hooks';
// import { Page, User } from '../../types';
// import { Confirm, Field, Loading, Modal, PageHeader, PresenceBadge, StatusBadge, StatCard } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtTalk, fmtDuration } from '../../utils/format';
// import { PhoneCall, Clock, TrendingUp, Hourglass } from 'lucide-react';

// const leadId = (u?: Partial<User> | null) => (u?.teamLead && typeof u.teamLead === 'object' ? u.teamLead._id : (u?.teamLead as string) || '');
// const leadName = (u: User) => (u.teamLead && typeof u.teamLead === 'object' ? u.teamLead.name : '—');

// export default function Telecallers() {
//   const [sp, setSp] = useSearchParams(); const toast = useToast();
//   const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
//   useEffect(() => setPg(1), [q, status]);
//   const { data, loading, error, reload } = useFetch(() => get<Page<User>>('/employees', { search: q, status, page: pg, limit: 15 }), [q, status, pg]);
//   useSocketEvent('presence.updated', () => reload(true));
//   const [form, setForm] = useState<Partial<User> & { password?: string } | null>(null); const [reset, setReset] = useState<User | null>(null); const [pw, setPw] = useState(''); const [toggle, setToggle] = useState<User | null>(null); const [busy, setBusy] = useState(false);
//   const coords = useFetch(() => get<Page<User>>('/coordinators', { limit: 100, status: 'ACTIVE', sort: 'name', order: 'asc' }), []);
//   const detailId = sp.get('id'); const detail = useFetch(() => (detailId ? get<User>(`/employees/${detailId}`) : Promise.resolve(null)), [detailId]);

//   const save = async (e: React.FormEvent) => {
//     e.preventDefault(); if (!form) return; setBusy(true);
//     try {
//       if (form._id) await patch(`/employees/${form._id}`, { name: form.name, email: form.email, phone: form.phone || undefined, teamLead: leadId(form) || null }); else await post('/employees', { name: form.name, email: form.email, phone: form.phone || undefined, password: form.password, teamLead: leadId(form) || null });
//       toast.ok(form._id ? 'Telecaller updated' : 'Telecaller created'); setForm(null); reload(true);
//     } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); }
//   };
//   const doReset = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { await post(`/employees/${reset!._id}/reset-password`, { password: pw }); toast.ok('Password reset. Ask the telecaller to log in again.'); setReset(null); setPw(''); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
//   const doToggle = async () => { try { await patch(`/employees/${toggle!._id}/status`, { status: toggle!.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); toast.ok('Status updated'); reload(true); } catch (x) { toast.err(errMsg(x)); } };

//   const cols: Col<User>[] = [
//     { head: 'Name', cell: (u) => <button className="text-left font-semibold text-blue-700 hover:underline" onClick={() => setSp({ id: u._id })}>{u.name}</button> },
//     { head: 'Email', cell: (u) => u.email }, { head: 'Phone', cell: (u) => u.phone || '—' }, { head: 'Assigned', cell: (u) => u.assignedCount }, { head: 'Coordinator', cell: (u) => leadName(u) },
//     { head: 'Presence', cell: (u) => <PresenceBadge p={u.status === 'ACTIVE' ? u.presence : 'OFFLINE'} /> }, { head: 'Status', cell: (u) => <StatusBadge s={u.status} /> },
//     { head: 'Actions', className: 'text-right', cell: (u) => (
//       <div className="flex justify-end gap-1">
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Edit" aria-label="Edit" onClick={() => setForm(u)}><Pencil size={16} /></button>
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Reset password" aria-label="Reset password" onClick={() => setReset(u)}><KeyRound size={16} /></button>
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} aria-label="Toggle status" onClick={() => setToggle(u)}><Power size={16} className={u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'} /></button>
//       </div>) },
//   ];
//   const p = detail.data?.performance;
//   return (
//     <>
//       <PageHeader title="Telecallers" sub="Manage your calling team" actions={<button className="btn-primary" onClick={() => setForm({ name: '', email: '', phone: '', password: '' })}><Plus size={16} />Add telecaller</button>} />
//       <div className="card">
//         <div className="flex flex-wrap gap-3 p-4"><div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
//           <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
//         <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} empty="No telecallers found" />
//       </div>

//       <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit telecaller' : 'Add telecaller'}>
//         <form onSubmit={save} className="space-y-3">
//           <Field label="Full name"><input className="input" required minLength={2} value={form?.name || ''} onChange={(e) => setForm({ ...form!, name: e.target.value })} /></Field>
//           <Field label="Email"><input className="input" type="email" required value={form?.email || ''} onChange={(e) => setForm({ ...form!, email: e.target.value })} /></Field>
//           <Field label="Phone"><input className="input" value={form?.phone || ''} onChange={(e) => setForm({ ...form!, phone: e.target.value })} /></Field>
//           <Field label="Operations Coordinator"><select className="input" value={leadId(form)} onChange={(e) => setForm({ ...form!, teamLead: e.target.value || null })}><option value="">— None —</option>{coords.data?.items.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
//           {!form?._id && <Field label="Temporary password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={form?.password || ''} onChange={(e) => setForm({ ...form!, password: e.target.value })} /></Field>}
//           <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div>
//         </form>
//       </Modal>
//       <Modal open={!!reset} onClose={() => setReset(null)} title={`Reset password — ${reset?.name}`}>
//         <form onSubmit={doReset} className="space-y-3"><Field label="New password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setReset(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Reset password</button></div></form>
//       </Modal>
//       <Confirm open={!!toggle} onClose={() => setToggle(null)} onYes={doToggle} text={toggle?.status === 'ACTIVE' ? `Deactivate ${toggle?.name}? They will be signed out immediately.` : `Activate ${toggle?.name}?`} />
//       <Modal open={!!detailId} onClose={() => setSp({})} title={detail.data?.name || 'Telecaller'} wide>
//         {detail.loading || !detail.data ? <Loading /> : (
//           <div className="space-y-4"><p className="text-sm text-slate-500">{detail.data.email} · {detail.data.phone || 'no phone'} · Coordinator: {leadName(detail.data)}</p>
//             {p && <><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard tone="blue" icon={<PhoneCall />} label="Calls today" value={p.callsToday} /><StatCard tone="green" icon={<Clock />} label="Talk time today" value={fmtTalk(p.talkTimeToday)} /><StatCard tone="purple" icon={<TrendingUp />} label="Success rate" value={`${p.successRate}%`} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={p.pending} /></div>
//               <p className="text-sm text-slate-600">Assigned {p.assigned} · Completed {p.completed} · Follow-ups {p.followUps} · Total calls {p.totalCalls} · Avg duration {fmtDuration(p.avgDuration)}</p></>}
//           </div>)}
//       </Modal>
//     </>
//   );
// }

//------- 12.11.2026 ---------------
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { KeyRound, Pencil, Plus, Power, Search } from 'lucide-react';
// import { get, patch, post } from '../../services/api';
// import { useDebounce, useFetch, useSocketEvent } from '../../hooks/hooks';
// import { Page, User } from '../../types';
// import { Confirm, Field, Loading, Modal, PageHeader, PresenceBadge, StatusBadge, StatCard } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtTalk, fmtDuration } from '../../utils/format';
// import { PhoneCall, Clock, TrendingUp, Hourglass } from 'lucide-react';

// export default function Telecallers() {
//   const [sp, setSp] = useSearchParams(); const toast = useToast();
//   const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
//   useEffect(() => setPg(1), [q, status]);
//   const { data, loading, error, reload } = useFetch(() => get<Page<User>>('/employees', { search: q, status, page: pg, limit: 15 }), [q, status, pg]);
//   useSocketEvent('presence.updated', () => reload(true));
//   const [form, setForm] = useState<Partial<User> & { password?: string } | null>(null); const [reset, setReset] = useState<User | null>(null); const [pw, setPw] = useState(''); const [toggle, setToggle] = useState<User | null>(null); const [busy, setBusy] = useState(false);
//   const detailId = sp.get('id'); const detail = useFetch(() => (detailId ? get<User>(`/employees/${detailId}`) : Promise.resolve(null)), [detailId]);

//   const save = async (e: React.FormEvent) => {
//     e.preventDefault(); if (!form) return; setBusy(true);
//     try {
//       if (form._id) await patch(`/employees/${form._id}`, { name: form.name, email: form.email, phone: form.phone || undefined }); else await post('/employees', { name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
//       toast.ok(form._id ? 'Telecaller updated' : 'Telecaller created'); setForm(null); reload(true);
//     } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); }
//   };
//   const doReset = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { await post(`/employees/${reset!._id}/reset-password`, { password: pw }); toast.ok('Password reset. Ask the telecaller to log in again.'); setReset(null); setPw(''); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
//   const doToggle = async () => { try { await patch(`/employees/${toggle!._id}/status`, { status: toggle!.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); toast.ok('Status updated'); reload(true); } catch (x) { toast.err(errMsg(x)); } };

//   const cols: Col<User>[] = [
//     { head: 'Name', cell: (u) => <button className="text-left font-semibold text-blue-700 hover:underline" onClick={() => setSp({ id: u._id })}>{u.name}</button> },
//     { head: 'Email', cell: (u) => u.email }, { head: 'Phone', cell: (u) => u.phone || '—' }, { head: 'Assigned', cell: (u) => u.assignedCount },
//     { head: 'Presence', cell: (u) => <PresenceBadge p={u.status === 'ACTIVE' ? u.presence : 'OFFLINE'} /> }, { head: 'Status', cell: (u) => <StatusBadge s={u.status} /> },
//     { head: 'Actions', className: 'text-right', cell: (u) => (
//       <div className="flex justify-end gap-1">
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Edit" aria-label="Edit" onClick={() => setForm(u)}><Pencil size={16} /></button>
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Reset password" aria-label="Reset password" onClick={() => setReset(u)}><KeyRound size={16} /></button>
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} aria-label="Toggle status" onClick={() => setToggle(u)}><Power size={16} className={u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'} /></button>
//       </div>) },
//   ];
//   const p = detail.data?.performance;
//   return (
//     <>
//       <PageHeader title="Telecallers" sub="Manage your calling team" actions={<button className="btn-primary" onClick={() => setForm({ name: '', email: '', phone: '', password: '' })}><Plus size={16} />Add telecaller</button>} />
//       <div className="card">
//         <div className="flex flex-wrap gap-3 p-4"><div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
//           <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
//         <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} empty="No telecallers found" />
//       </div>

//       <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit telecaller' : 'Add telecaller'}>
//         <form onSubmit={save} className="space-y-3">
//           <Field label="Full name"><input className="input" required minLength={2} value={form?.name || ''} onChange={(e) => setForm({ ...form!, name: e.target.value })} /></Field>
//           <Field label="Email"><input className="input" type="email" required value={form?.email || ''} onChange={(e) => setForm({ ...form!, email: e.target.value })} /></Field>
//           <Field label="Phone"><input className="input" value={form?.phone || ''} onChange={(e) => setForm({ ...form!, phone: e.target.value })} /></Field>
//           {!form?._id && <Field label="Temporary password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={form?.password || ''} onChange={(e) => setForm({ ...form!, password: e.target.value })} /></Field>}
//           <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div>
//         </form>
//       </Modal>
//       <Modal open={!!reset} onClose={() => setReset(null)} title={`Reset password — ${reset?.name}`}>
//         <form onSubmit={doReset} className="space-y-3"><Field label="New password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setReset(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Reset password</button></div></form>
//       </Modal>
//       <Confirm open={!!toggle} onClose={() => setToggle(null)} onYes={doToggle} text={toggle?.status === 'ACTIVE' ? `Deactivate ${toggle?.name}? They will be signed out immediately.` : `Activate ${toggle?.name}?`} />
//       <Modal open={!!detailId} onClose={() => setSp({})} title={detail.data?.name || 'Telecaller'} wide>
//         {detail.loading || !detail.data ? <Loading /> : (
//           <div className="space-y-4"><p className="text-sm text-slate-500">{detail.data.email} · {detail.data.phone || 'no phone'}</p>
//             {p && <><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard tone="blue" icon={<PhoneCall />} label="Calls today" value={p.callsToday} /><StatCard tone="green" icon={<Clock />} label="Talk time today" value={fmtTalk(p.talkTimeToday)} /><StatCard tone="purple" icon={<TrendingUp />} label="Success rate" value={`${p.successRate}%`} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={p.pending} /></div>
//               <p className="text-sm text-slate-600">Assigned {p.assigned} · Completed {p.completed} · Follow-ups {p.followUps} · Total calls {p.totalCalls} · Avg duration {fmtDuration(p.avgDuration)}</p></>}
//           </div>)}
//       </Modal>
//     </>
//   );
// }
