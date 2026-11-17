import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { errMsg } from '../utils/format';
import { Logo } from '../components/ui';

export default function Login() {
  const { user, login } = useAuth(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(''); try { await login(email, password); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-[#3d0f72] via-[#6a1b9f] to-[#b02a9d] p-4">
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent-500/25 blur-3xl" /><div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <form onSubmit={submit} className="card relative w-full max-w-sm space-y-5 p-8">
        <div className="flex justify-center"><Logo /></div>
        <div className="text-center"><h1 className="text-xl font-extrabold">Sign in</h1><p className="text-sm text-slate-500">Admins, coordinators and telecallers use the same login.</p></div>
        {err && <p role="alert" className="rounded-xl bg-accent-50 px-3 py-2 text-sm text-accent-600">{err}</p>}
        <label className="block"><span className="label">Email</span><input className="input" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="block"><span className="label">Password</span><input className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" size={16} />}Sign in</button>
      </form>
    </div>
  );
}
