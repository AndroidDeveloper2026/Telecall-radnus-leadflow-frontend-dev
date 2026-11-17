import { useEffect, useState } from 'react';
import { KeyRound, Pencil, Plus, Power, Search, Users } from 'lucide-react';
import { get, patch, post, put } from '../../services/api';
import { useDebounce, useFetch } from '../../hooks/hooks';
import { Page, User } from '../../types';
import { Confirm, Field, Modal, PageHeader, PresenceBadge, StatusBadge } from '../../components/ui';
import { Col, DataTable } from '../../components/DataTable';
import { useToast } from '../../contexts/ToastContext';
import { errMsg } from '../../utils/format';

export default function Coordinators() {
  const toast = useToast(); const [search, setSearch] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
  useEffect(() => setPg(1), [q]);
  const { data, loading, error, reload } = useFetch(() => get<Page<User>>('/coordinators', { search: q, page: pg, limit: 15 }), [q, pg]);
  const emps = useFetch(() => get<Page<User>>('/employees', { limit: 100, status: 'ACTIVE', sort: 'name', order: 'asc' }), []);
  const [form, setForm] = useState<(Partial<User> & { password?: string }) | null>(null); const [reset, setReset] = useState<User | null>(null); const [pw, setPw] = useState(''); const [toggle, setToggle] = useState<User | null>(null);
  const [team, setTeam] = useState<User | null>(null); const [picked, setPicked] = useState<string[]>([]); const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form) return; setBusy(true);
    try {
      if (form._id) await patch(`/coordinators/${form._id}`, { name: form.name, email: form.email, phone: form.phone || undefined });
      else await post('/coordinators', { name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
      toast.ok(form._id ? 'Coordinator updated' : 'Coordinator created'); setForm(null); reload(true);
    } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); }
  };
  const doReset = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { await post(`/coordinators/${reset!._id}/reset-password`, { password: pw }); toast.ok('Password reset'); setReset(null); setPw(''); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
  const doToggle = async () => { try { await patch(`/coordinators/${toggle!._id}/status`, { status: toggle!.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); toast.ok('Status updated'); reload(true); } catch (x) { toast.err(errMsg(x)); } };
  const openTeam = async (c: User) => { setTeam(c); const d = await get<User>(`/coordinators/${c._id}`); setPicked((d.team || []).map((t) => t._id)); };
  const saveTeam = async () => { setBusy(true); try { await put(`/coordinators/${team!._id}/team`, { employeeIds: picked }); toast.ok('Team updated'); setTeam(null); reload(true); emps.reload(true); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
  const flip = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const cols: Col<User>[] = [
    { head: 'Name', cell: (u) => <span className="font-semibold">{u.name}</span> }, { head: 'Email', cell: (u) => u.email }, { head: 'Phone', cell: (u) => u.phone || '—' },
    { head: 'Team size', cell: (u) => u.teamSize }, { head: 'Status', cell: (u) => <StatusBadge s={u.status} /> },
    { head: 'Actions', className: 'text-right', cell: (u) => (
      <div className="flex justify-end gap-1">
        <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Manage team" aria-label="Manage team" onClick={() => openTeam(u)}><Users size={16} /></button>
        <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Edit" aria-label="Edit" onClick={() => setForm(u)}><Pencil size={16} /></button>
        <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Reset password" aria-label="Reset password" onClick={() => setReset(u)}><KeyRound size={16} /></button>
        <button className="rounded-lg p-1.5 hover:bg-slate-100" title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} aria-label="Toggle status" onClick={() => setToggle(u)}><Power size={16} className={u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'} /></button>
      </div>) },
  ];
  return (
    <>
      <PageHeader title="Operations Coordinators" sub="Team leads who monitor their own telecallers" actions={<button className="btn-primary" onClick={() => setForm({ name: '', email: '', phone: '', password: '' })}><Plus size={16} />Add coordinator</button>} />
      <div className="card">
        <div className="p-4"><div className="relative max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
        <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} empty="No coordinators yet" />
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit coordinator' : 'Add Operations Coordinator'}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Full name"><input className="input" required minLength={2} value={form?.name || ''} onChange={(e) => setForm({ ...form!, name: e.target.value })} /></Field>
          <Field label="Email"><input className="input" type="email" required value={form?.email || ''} onChange={(e) => setForm({ ...form!, email: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={form?.phone || ''} onChange={(e) => setForm({ ...form!, phone: e.target.value })} /></Field>
          {!form?._id && <Field label="Temporary password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={form?.password || ''} onChange={(e) => setForm({ ...form!, password: e.target.value })} /></Field>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div>
        </form>
      </Modal>
      <Modal open={!!reset} onClose={() => setReset(null)} title={`Reset password — ${reset?.name}`}>
        <form onSubmit={doReset} className="space-y-3"><Field label="New password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setReset(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Reset password</button></div></form>
      </Modal>
      <Confirm open={!!toggle} onClose={() => setToggle(null)} onYes={doToggle} text={toggle?.status === 'ACTIVE' ? `Deactivate ${toggle?.name}? They will be signed out immediately.` : `Activate ${toggle?.name}?`} />
      <Modal open={!!team} onClose={() => setTeam(null)} title={`Team — ${team?.name}`}>
        <p className="mb-3 text-sm text-slate-500">Tick the telecallers who report to this coordinator. A telecaller belongs to one coordinator at a time.</p>
        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
          {emps.data?.items.map((e) => { const other = e.teamLead && typeof e.teamLead === 'object' && e.teamLead._id !== team?._id ? e.teamLead.name : '';
            return <label key={e._id} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50"><input type="checkbox" checked={picked.includes(e._id)} onChange={() => flip(e._id)} /><span className="flex-1 text-sm font-medium">{e.name}</span>{other && <span className="text-xs text-amber-600">currently under {other}</span>}<PresenceBadge p={e.presence} /></label>; })}
          {!emps.data?.items.length && <p className="p-6 text-center text-sm text-slate-400">No active telecallers</p>}
        </div>
        <div className="flex justify-end gap-2 pt-3"><button className="btn-ghost" onClick={() => setTeam(null)}>Cancel</button><button className="btn-primary" disabled={busy} onClick={saveTeam}>Save team ({picked.length})</button></div>
      </Modal>
    </>
  );
}

//------ second change --------
// import { useEffect, useState } from 'react';
// import { KeyRound, Pencil, Plus, Power, Search, Users } from 'lucide-react';
// import { get, patch, post, put } from '../../services/api';
// import { useDebounce, useFetch } from '../../hooks/hooks';
// import { Page, User } from '../../types';
// import { Confirm, Field, Modal, PageHeader, PresenceBadge, StatusBadge } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg } from '../../utils/format';

// export default function Coordinators() {
//   const toast = useToast(); const [search, setSearch] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
//   useEffect(() => setPg(1), [q]);
//   const { data, loading, error, reload } = useFetch(() => get<Page<User>>('/coordinators', { search: q, page: pg, limit: 15 }), [q, pg]);
//   const emps = useFetch(() => get<Page<User>>('/employees', { limit: 100, status: 'ACTIVE', sort: 'name', order: 'asc' }), []);
//   const [form, setForm] = useState<(Partial<User> & { password?: string }) | null>(null); const [reset, setReset] = useState<User | null>(null); const [pw, setPw] = useState(''); const [toggle, setToggle] = useState<User | null>(null);
//   const [team, setTeam] = useState<User | null>(null); const [picked, setPicked] = useState<string[]>([]); const [busy, setBusy] = useState(false);

//   const save = async (e: React.FormEvent) => {
//     e.preventDefault(); if (!form) return; setBusy(true);
//     try {
//       if (form._id) await patch(`/coordinators/${form._id}`, { name: form.name, email: form.email, phone: form.phone || undefined });
//       else await post('/coordinators', { name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
//       toast.ok(form._id ? 'Coordinator updated' : 'Coordinator created'); setForm(null); reload(true);
//     } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); }
//   };
//   const doReset = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { await post(`/coordinators/${reset!._id}/reset-password`, { password: pw }); toast.ok('Password reset'); setReset(null); setPw(''); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
//   const doToggle = async () => { try { await patch(`/coordinators/${toggle!._id}/status`, { status: toggle!.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); toast.ok('Status updated'); reload(true); } catch (x) { toast.err(errMsg(x)); } };
//   const openTeam = async (c: User) => { setTeam(c); const d = await get<User>(`/coordinators/${c._id}`); setPicked((d.team || []).map((t) => t._id)); };
//   const saveTeam = async () => { setBusy(true); try { await put(`/coordinators/${team!._id}/team`, { employeeIds: picked }); toast.ok('Team updated'); setTeam(null); reload(true); emps.reload(true); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
//   const flip = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

//   const cols: Col<User>[] = [
//     { head: 'Name', cell: (u) => <span className="font-semibold">{u.name}</span> }, { head: 'Email', cell: (u) => u.email }, { head: 'Phone', cell: (u) => u.phone || '—' },
//     { head: 'Team size', cell: (u) => u.teamSize }, { head: 'Status', cell: (u) => <StatusBadge s={u.status} /> },
//     { head: 'Actions', className: 'text-right', cell: (u) => (
//       <div className="flex justify-end gap-1">
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Manage team" aria-label="Manage team" onClick={() => openTeam(u)}><Users size={16} /></button>
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Edit" aria-label="Edit" onClick={() => setForm(u)}><Pencil size={16} /></button>
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title="Reset password" aria-label="Reset password" onClick={() => setReset(u)}><KeyRound size={16} /></button>
//         <button className="rounded-lg p-1.5 hover:bg-slate-100" title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} aria-label="Toggle status" onClick={() => setToggle(u)}><Power size={16} className={u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'} /></button>
//       </div>) },
//   ];
//   return (
//     <>
//       <PageHeader title="Operations Coordinators" sub="Team leads who monitor their own telecallers" actions={<button className="btn-primary" onClick={() => setForm({ name: '', email: '', phone: '', password: '' })}><Plus size={16} />Add coordinator</button>} />
//       <div className="card">
//         <div className="p-4"><div className="relative max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9" placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
//         <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} empty="No coordinators yet" />
//       </div>
//       <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit coordinator' : 'Add Operations Coordinator'}>
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
//       <Modal open={!!team} onClose={() => setTeam(null)} title={`Team — ${team?.name}`}>
//         <p className="mb-3 text-sm text-slate-500">Tick the telecallers who report to this coordinator. A telecaller belongs to one coordinator at a time.</p>
//         <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
//           {emps.data?.items.map((e) => { const other = e.teamLead && typeof e.teamLead === 'object' && e.teamLead._id !== team?._id ? e.teamLead.name : '';
//             return <label key={e._id} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50"><input type="checkbox" checked={picked.includes(e._id)} onChange={() => flip(e._id)} /><span className="flex-1 text-sm font-medium">{e.name}</span>{other && <span className="text-xs text-amber-600">currently under {other}</span>}<PresenceBadge p={e.presence} /></label>; })}
//           {!emps.data?.items.length && <p className="p-6 text-center text-sm text-slate-400">No active telecallers</p>}
//         </div>
//         <div className="flex justify-end gap-2 pt-3"><button className="btn-ghost" onClick={() => setTeam(null)}>Cancel</button><button className="btn-primary" disabled={busy} onClick={saveTeam}>Save team ({picked.length})</button></div>
//       </Modal>
//     </>
//   );
// }
