import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { get, patch, post, put } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useFetch } from '../hooks/hooks';
import { Disposition, Settings as S, User } from '../types';
import { Field, Loading, PageHeader } from '../components/ui';
import { errMsg } from '../utils/format';

export default function Settings() {
  const { user, setUser } = useAuth(); const toast = useToast();
  const [name, setName] = useState(user!.name); const [phone, setPhone] = useState(user!.phone || ''); const [cur, setCur] = useState(''); const [nw, setNw] = useState('');
  const st = useFetch(() => get<S>('/settings'), []); const [disp, setDisp] = useState<Disposition[] | null>(null); const [company, setCompany] = useState<string | null>(null);
  const admin = user!.role === 'ADMIN';
  const profile = async (e: React.FormEvent) => { e.preventDefault(); try { setUser(await patch<User>('/auth/me', { name, phone: phone || undefined })); toast.ok('Profile saved'); } catch (x) { toast.err(errMsg(x)); } };
  const password = async (e: React.FormEvent) => { e.preventDefault(); try { await post('/auth/change-password', { currentPassword: cur, newPassword: nw }); toast.ok('Password changed'); setCur(''); setNw(''); } catch (x) { toast.err(errMsg(x)); } };
  const list = disp ?? st.data?.dispositions ?? [];
  const saveSys = async () => { try { await put('/settings', { dispositions: list, companyName: company ?? st.data?.companyName }); toast.ok('Settings saved'); st.reload(true); setDisp(null); } catch (x) { toast.err(errMsg(x)); } };
  const upd = (i: number, p: Partial<Disposition>) => setDisp(list.map((d, j) => (j === i ? { ...d, ...p } : d)));
  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={profile} className="card space-y-3 p-5"><h2 className="font-bold">Profile</h2><Field label="Name"><input className="input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label="Phone"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field><Field label="Email"><input className="input" disabled value={user!.email} /></Field><button className="btn-primary">Save profile</button></form>
        <form onSubmit={password} className="card space-y-3 p-5"><h2 className="font-bold">Change password</h2><Field label="Current password"><input className="input" type="password" required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field><Field label="New password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={nw} onChange={(e) => setNw(e.target.value)} /></Field><button className="btn-primary">Change password</button></form>
        {admin && (
          <section className="card space-y-3 p-5 lg:col-span-2"><h2 className="font-bold">System settings</h2>
            {st.loading && !st.data ? <Loading /> : <>
              <Field label="Company name"><input className="input max-w-sm" value={company ?? st.data?.companyName ?? ''} onChange={(e) => setCompany(e.target.value)} /></Field>
              <div><p className="label">Call dispositions</p>
                <div className="space-y-2">{list.map((d, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2"><input className="input max-w-[200px]" value={d.label} aria-label="Label" onChange={(e) => upd(i, { label: e.target.value })} /><input className="input max-w-[200px] font-mono text-xs" value={d.key} aria-label="Key" onChange={(e) => upd(i, { key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })} />
                    <select className="input !w-auto" value={d.outcome} aria-label="Outcome" onChange={(e) => upd(i, { outcome: e.target.value as Disposition['outcome'] })}><option value="COMPLETED">Closes contact</option><option value="RETRY">Retry later</option><option value="FOLLOW_UP">Needs follow-up</option></select>
                    <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={d.success} onChange={(e) => upd(i, { success: e.target.checked })} />Counts as success</label>
                    <button type="button" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Remove" onClick={() => setDisp(list.filter((_, j) => j !== i))}><Trash2 size={16} /></button></div>))}</div>
                <button type="button" className="btn-ghost mt-3" onClick={() => setDisp([...list, { key: 'NEW_STATUS', label: 'New status', outcome: 'RETRY', success: false }])}><Plus size={16} />Add disposition</button></div>
              <button className="btn-primary" onClick={saveSys}>Save system settings</button></>}
          </section>)}
      </div>
    </>
  );
}

//---- 12.11.2026 ---------
// import { useState } from 'react';
// import { Plus, Trash2 } from 'lucide-react';
// import { get, patch, post, put } from '../services/api';
// import { useAuth } from '../contexts/AuthContext';
// import { useToast } from '../contexts/ToastContext';
// import { useFetch } from '../hooks/hooks';
// import { Disposition, Settings as S, User } from '../types';
// import { Field, Loading, PageHeader } from '../components/ui';
// import { errMsg } from '../utils/format';

// export default function Settings() {
//   const { user, setUser } = useAuth(); const toast = useToast();
//   const [name, setName] = useState(user!.name); const [phone, setPhone] = useState(user!.phone || ''); const [cur, setCur] = useState(''); const [nw, setNw] = useState('');
//   const st = useFetch(() => get<S>('/settings'), []); const [disp, setDisp] = useState<Disposition[] | null>(null); const [company, setCompany] = useState<string | null>(null);
//   const admin = user!.role === 'ADMIN';
//   const profile = async (e: React.FormEvent) => { e.preventDefault(); try { setUser(await patch<User>('/auth/me', { name, phone: phone || undefined })); toast.ok('Profile saved'); } catch (x) { toast.err(errMsg(x)); } };
//   const password = async (e: React.FormEvent) => { e.preventDefault(); try { await post('/auth/change-password', { currentPassword: cur, newPassword: nw }); toast.ok('Password changed'); setCur(''); setNw(''); } catch (x) { toast.err(errMsg(x)); } };
//   const list = disp ?? st.data?.dispositions ?? [];
//   const saveSys = async () => { try { await put('/settings', { dispositions: list, companyName: company ?? st.data?.companyName }); toast.ok('Settings saved'); st.reload(true); setDisp(null); } catch (x) { toast.err(errMsg(x)); } };
//   const upd = (i: number, p: Partial<Disposition>) => setDisp(list.map((d, j) => (j === i ? { ...d, ...p } : d)));
//   return (
//     <>
//       <PageHeader title="Settings" />
//       <div className="grid gap-5 lg:grid-cols-2">
//         <form onSubmit={profile} className="card space-y-3 p-5"><h2 className="font-bold">Profile</h2><Field label="Name"><input className="input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label="Phone"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field><Field label="Email"><input className="input" disabled value={user!.email} /></Field><button className="btn-primary">Save profile</button></form>
//         <form onSubmit={password} className="card space-y-3 p-5"><h2 className="font-bold">Change password</h2><Field label="Current password"><input className="input" type="password" required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field><Field label="New password (min 8 characters)"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={nw} onChange={(e) => setNw(e.target.value)} /></Field><button className="btn-primary">Change password</button></form>
//         {admin && (
//           <section className="card space-y-3 p-5 lg:col-span-2"><h2 className="font-bold">System settings</h2>
//             {st.loading && !st.data ? <Loading /> : <>
//               <Field label="Company name"><input className="input max-w-sm" value={company ?? st.data?.companyName ?? ''} onChange={(e) => setCompany(e.target.value)} /></Field>
//               <div><p className="label">Call dispositions</p>
//                 <div className="space-y-2">{list.map((d, i) => (
//                   <div key={i} className="flex flex-wrap items-center gap-2"><input className="input max-w-[200px]" value={d.label} aria-label="Label" onChange={(e) => upd(i, { label: e.target.value })} /><input className="input max-w-[200px] font-mono text-xs" value={d.key} aria-label="Key" onChange={(e) => upd(i, { key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })} />
//                     <select className="input !w-auto" value={d.outcome} aria-label="Outcome" onChange={(e) => upd(i, { outcome: e.target.value as Disposition['outcome'] })}><option value="COMPLETED">Closes contact</option><option value="RETRY">Retry later</option><option value="FOLLOW_UP">Needs follow-up</option></select>
//                     <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={d.success} onChange={(e) => upd(i, { success: e.target.checked })} />Counts as success</label>
//                     <button type="button" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Remove" onClick={() => setDisp(list.filter((_, j) => j !== i))}><Trash2 size={16} /></button></div>))}</div>
//                 <button type="button" className="btn-ghost mt-3" onClick={() => setDisp([...list, { key: 'NEW_STATUS', label: 'New status', outcome: 'RETRY', success: false }])}><Plus size={16} />Add disposition</button></div>
//               <button className="btn-primary" onClick={saveSys}>Save system settings</button></>}
//           </section>)}
//       </div>
//     </>
//   );
// }
