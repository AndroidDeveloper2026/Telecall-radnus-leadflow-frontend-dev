import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, Pencil, Phone, Plus, Search, Trash2, Upload, User as UserIcon, UserPlus, Users } from 'lucide-react';
import { del, get, patch, post } from '../../services/api';
import { useDebounce, useFetch } from '../../hooks/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { AdminStats, Contact, Page, User } from '../../types';
import { Confirm, Field, Modal, PageHeader, StatCard, StatusBadge, DispBadge, Badge } from '../../components/ui';
import { Col, DataTable } from '../../components/DataTable';
import UploadBox from '../../components/UploadBox';
import { useToast } from '../../contexts/ToastContext';
import { errMsg, PRIORITY } from '../../utils/format';

export const useEmployees = () => { const { user } = useAuth(); return useFetch(() => (user?.role === 'COORDINATOR' ? get<{ items: User[] }>('/team/members') : get<Page<User>>('/employees', { limit: 100, status: 'ACTIVE', sort: 'name', order: 'asc' })), []); };

export default function Contacts() {
  const [sp] = useSearchParams(); const toast = useToast(); const { user } = useAuth(); const isAdmin = user!.role === 'ADMIN';
  const [search, setSearch] = useState(sp.get('search') || ''); const [status, setStatus] = useState(''); const [assigned, setAssigned] = useState(''); const [pg, setPg] = useState(1); const q = useDebounce(search);
  useEffect(() => setPg(1), [q, status, assigned]);
  const emps = useEmployees(); const coord = user!.role === 'COORDINATOR';
  const stats = useFetch(() => get<AdminStats>(coord ? '/dashboard/team' : '/dashboard/admin'), [coord]);
  const sc = stats.data?.cards; const assignedN = sc?.assignedContacts ?? 0; const unassignedN = sc ? (coord ? sc.unassignedContacts || 0 : Math.max(sc.totalContacts - sc.assignedContacts, 0)) : 0; const totalN = sc ? (coord ? assignedN + unassignedN : sc.totalContacts) : 0;
  const num = (n: number) => (sc ? n.toLocaleString() : '—');
  const { data, loading, error, reload: reloadList } = useFetch(() => get<Page<Contact>>('/contacts', { search: q, status: status || undefined, ...(assigned === 'none' ? { unassigned: 'true' } : assigned ? { assignedTo: assigned } : {}), page: pg, limit: 15 }), [q, status, assigned, pg]);
  const [sel, setSel] = useState<Set<string>>(new Set()); const [form, setForm] = useState<Partial<Contact> | null>(null); const [rm, setRm] = useState<Contact | null>(null); const [up, setUp] = useState(false); const [asg, setAsg] = useState(false); const [target, setTarget] = useState(''); const [busy, setBusy] = useState(false);
  const reload = (silent?: boolean) => { reloadList(silent); stats.reload(true); };
  useEffect(() => setSel(new Set()), [pg, q, status, assigned]);
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOn = !!data?.items.length && data.items.every((c) => sel.has(c._id));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form) return; setBusy(true);
    const body = { name: form.name, phone: form.phone, email: form.email || undefined, company: form.company || undefined, city: form.city || undefined, priority: Number(form.priority || 2) };
    try { form._id ? await patch(`/contacts/${form._id}`, body) : await post('/contacts', body); toast.ok(form._id ? 'Contact updated' : 'Contact added'); setForm(null); reload(true); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); }
  };
  const assign = async () => { setBusy(true); try { const r = await post<{ assigned: number; skipped: number }>('/assignments/assign', { employeeId: target, contactIds: [...sel] }); toast.ok(`${r.assigned} assigned${r.skipped ? `, ${r.skipped} skipped (completed)` : ''}`); setAsg(false); setSel(new Set()); reload(true); } catch (x) { toast.err(errMsg(x)); } finally { setBusy(false); } };
  const cols: Col<Contact>[] = [
    { head: <input type="checkbox" aria-label="Select all" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(data!.items.map((c) => c._id)))} />, className: 'w-10', cell: (c) => <input type="checkbox" aria-label={`Select ${c.name}`} checked={sel.has(c._id)} onChange={() => toggle(c._id)} /> },
    { head: 'Name', cell: (c) => <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{c.name.trim().charAt(0).toUpperCase()}</span><span className="font-bold text-ink">{c.name}</span></div> },
    { head: 'Phone', cell: (c) => <span className="flex items-center gap-2 whitespace-nowrap"><Phone size={16} className="text-brand-500" />{c.phone}</span> },
    { head: 'Company', cell: (c) => c.company ? <span className="flex items-center gap-2 whitespace-nowrap"><Building2 size={16} className="text-brand-500" />{c.company}</span> : <span className="text-slate-400">—</span> },
    { head: 'Priority', cell: (c) => <span className={`inline-block rounded-full px-3.5 py-1 text-[13px] font-semibold ${PRIORITY[c.priority].cls}`}>{PRIORITY[c.priority].label.split(' ')[0]}</span> },
    { head: 'Assigned To', cell: (c) => c.assignedTo?.name ? <span className="flex items-center gap-2 whitespace-nowrap"><UserIcon size={16} className="text-brand-500" />{c.assignedTo.name}</span> : <Badge tone="slate">Unassigned</Badge> },
    { head: 'Status', cell: (c) => <StatusBadge s={c.status} /> }, { head: 'Last Result', cell: (c) => <DispBadge d={c.lastDisposition} /> },
    ...(isAdmin ? [{ head: 'Actions', className: 'text-right', cell: (c: Contact) => <div className="flex justify-end gap-1"><button className="rounded-xl p-2 text-brand-600 hover:bg-brand-50" aria-label="Edit" onClick={() => setForm(c)}><Pencil size={18} /></button><button className="rounded-xl p-2 text-accent-500 hover:bg-accent-50" aria-label="Delete" onClick={() => setRm(c)}><Trash2 size={18} /></button></div> }] : []),
  ];
  return (
    <>
      <PageHeader title="Contacts" sub={isAdmin ? 'Upload, search and assign customer contacts' : 'Upload contacts and allocate them to your team members'} actions={<><button className="btn-ghost" onClick={() => setUp(true)}><Upload size={18} />Upload File</button><button className="btn-primary" onClick={() => setForm({ priority: 2 })}><Plus size={18} />Add Contact</button></>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="purple" icon={<Users />} label="Total Contacts" value={num(totalN)} />
        <StatCard tone="blue" icon={<Phone />} label="Assigned" value={num(assignedN)} />
        <StatCard tone="yellow" icon={<Clock />} label="Unassigned" value={num(unassignedN)} />
        <StatCard tone="green" icon={<CheckCircle2 />} label="Completed" value={num(sc?.completedContacts ?? 0)} />
      </div>
      <div className="card">
        <div className="flex flex-wrap gap-3 p-5">
          <div className="relative min-w-[220px] flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-11" placeholder="Search name, phone, company, city…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <select className="input !w-auto min-w-[10.5rem]" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All Statuses</option>{['NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'COMPLETED'].map((x) => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</select>
          <select className="input !w-auto min-w-[10.5rem]" value={assigned} onChange={(e) => setAssigned(e.target.value)} aria-label="Assignment"><option value="">All Telecallers</option><option value="none">Unassigned (to allocate)</option>{emps.data?.items.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}</select>
          {sel.size > 0 && <button className="btn-green" onClick={() => setAsg(true)}><UserPlus size={16} />Assign {sel.size} selected</button>}
        </div>
        <DataTable cols={cols} page={data} loading={loading} error={error} reload={reload} onPage={setPg} empty="No contacts found" />
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit contact' : 'Add contact'}>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <Field label="Name"><input className="input" required value={form?.name || ''} onChange={(e) => setForm({ ...form!, name: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" required value={form?.phone || ''} onChange={(e) => setForm({ ...form!, phone: e.target.value })} /></Field>
          <Field label="Email"><input className="input" type="email" value={form?.email || ''} onChange={(e) => setForm({ ...form!, email: e.target.value })} /></Field>
          <Field label="Company"><input className="input" value={form?.company || ''} onChange={(e) => setForm({ ...form!, company: e.target.value })} /></Field>
          <Field label="City"><input className="input" value={form?.city || ''} onChange={(e) => setForm({ ...form!, city: e.target.value })} /></Field>
          <Field label="Priority"><select className="input" value={form?.priority || 2} onChange={(e) => setForm({ ...form!, priority: Number(e.target.value) })}><option value={1}>High</option><option value={2}>Medium</option><option value={3}>Low</option></select></Field>
          <div className="flex justify-end gap-2 pt-2 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div>
        </form>
      </Modal>
      <Confirm open={!!rm} onClose={() => setRm(null)} text={`Delete ${rm?.name}? Their call history stays in reports.`} onYes={async () => { try { await del(`/contacts/${rm!._id}`); toast.ok('Contact deleted'); reload(true); } catch (x) { toast.err(errMsg(x)); } }} />
      <Modal open={up} onClose={() => setUp(false)} title="Upload contacts" wide><UploadBox compact onDone={() => { reload(true); }} /></Modal>
      <Modal open={asg} onClose={() => setAsg(false)} title={`Assign ${sel.size} contact${sel.size === 1 ? '' : 's'}`}>
        <Field label="Telecaller"><select className="input" value={target} onChange={(e) => setTarget(e.target.value)}><option value="">Select telecaller</option>{emps.data?.items.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}</select></Field>
        <p className="mt-2 text-xs text-slate-500">Contacts that are already assigned will be reassigned. Completed contacts are skipped.</p>
        <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setAsg(false)}>Cancel</button><button className="btn-primary" disabled={!target || busy} onClick={assign}>Assign</button></div>
      </Modal>
    </>
  );
}