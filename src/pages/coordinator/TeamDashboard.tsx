import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, PhoneCall, TrendingUp, FileText, ListChecks, Clock, Hourglass, BarChart3, CloudUpload, Eye, Activity, Inbox } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { get } from '../../services/api';
import { useFetch, useSocketEvent } from '../../hooks/hooks';
import { AdminStats } from '../../types';
import { ErrorState, Loading, PresenceBadge, StatCard } from '../../components/ui';
import UploadBox from '../../components/UploadBox';
import { fmtDuration, title } from '../../utils/format';

const COLORS = ['#16a34a', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b', '#ec4899', '#0ea5e9'];
const rateColor = (r: number) => (r >= 65 ? 'bg-green-500' : r >= 50 ? 'bg-brand-500' : r > 0 ? 'bg-amber-400' : 'bg-slate-200');
interface Feed { id: string; employeeName?: string; contactName?: string; disposition: string; duration?: number; at: string }

export default function TeamDashboard() {
  const [range, setRange] = useState<'today' | 'all'>('today'); const nav = useNavigate(); const [feed, setFeed] = useState<Feed[]>([]);
  const { data, loading, error, reload } = useFetch(() => get<AdminStats>('/dashboard/team', { range }), [range]);
  useSocketEvent('dashboard.refresh', () => reload(true)); useSocketEvent('presence.updated', () => reload(true));
  useSocketEvent('call.updated', (e: Feed) => { if (e.employeeName) setFeed((f) => [{ ...e, at: e.at || new Date().toISOString() }, ...f].slice(0, 15)); });
  if (loading && !data) return <Loading />; if (error || !data) return <ErrorState msg={error} retry={reload} />;
  const c = data.cards; const waiting = c.unassignedContacts || 0;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard tone="blue" icon={<Users />} label="Team Contacts" value={c.totalContacts.toLocaleString()} />
        <StatCard tone="green" icon={<UserCheck />} label="Active Telecallers" value={c.activeEmployees} />
        <StatCard tone="red" icon={<PhoneCall />} label="Calls Today" value={c.todayCalls} />
        <StatCard tone="yellow" icon={<TrendingUp />} label="Success Rate" value={`${c.successRate}%`} />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard tone="purple" icon={<ListChecks />} label="Assigned Contacts" value={c.assignedContacts.toLocaleString()} />
        <StatCard tone="yellow" icon={<Hourglass />} label="Pending Contacts" value={c.pendingContacts.toLocaleString()} />
        <StatCard tone="blue" icon={<FileText />} label="Total Calls · Connected" value={`${c.totalCalls} · ${c.completedCalls}`} />
        <StatCard tone="green" icon={<Clock />} label="Avg Call Duration" value={fmtDuration(c.avgDuration)} />
      </div>

      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3"><CloudUpload className="text-brand-600" size={30} /><div className="flex-1"><h2 className="font-bold">UPLOAD &amp; DISTRIBUTE CONTACTS</h2><p className="text-sm text-slate-500">Upload Excel or CSV file and distribute equally among your team members.</p></div>
          {waiting > 0 && <button className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100" onClick={() => nav('/contacts')}><Inbox size={16} />{waiting} unassigned — allocate</button>}</div>
        <UploadBox onDone={(_, m) => { reload(true); if (m === 'manual') nav('/contacts'); }} />
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3"><h2 className="flex items-center gap-2 font-bold"><BarChart3 className="text-brand-600" size={20} />My Team Performance</h2>
          <select className="input !w-auto" value={range} onChange={(e) => setRange(e.target.value as 'today' | 'all')} aria-label="Range"><option value="today">Today ({new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})</option><option value="all">All time</option></select></div>
        <div className="overflow-x-auto px-3 pb-3"><table className="w-full min-w-[720px]"><thead className="bg-slate-50"><tr><th>#</th><th>Name</th><th>Assigned</th><th>Called</th><th>Pending</th><th>Success Rate</th><th>Status</th><th className="text-center">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{data.performance.map((p, i) => (
            <tr key={p.employeeId}><td>{i + 1}</td><td className="font-medium">{p.name}</td><td>{p.assigned}</td><td>{p.called}</td><td>{p.pending}</td>
              <td><div className="flex items-center gap-2"><span className="w-10">{p.successRate}%</span><div className="h-2 w-20 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${rateColor(p.successRate)}`} style={{ width: `${p.successRate}%` }} /></div></div></td>
              <td><PresenceBadge p={p.presence} /></td><td className="text-center"><button className="rounded-lg p-1.5 hover:bg-slate-100" aria-label={`View ${p.name}`} onClick={() => nav(`/my-team?id=${p.employeeId}`)}><Eye size={16} /></button></td></tr>
          ))}</tbody></table>
          {!data.performance.length && <p className="py-8 text-center text-sm text-slate-400">No telecallers are assigned to you yet. Ask your admin to add them to your team.</p>}</div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3"><h3 className="mb-3 font-bold">Daily calling activity</h3>
          <ResponsiveContainer width="100%" height={240}><LineChart data={data.daily.map((d) => ({ ...d, date: d.date.slice(5) }))}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Legend /><Line dataKey="calls" name="Calls" stroke="#7a2bb5" strokeWidth={2.5} dot={false} /><Line dataKey="success" name="Successful" stroke="#16a34a" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></section>
        <section className="card p-5 lg:col-span-2"><h3 className="mb-3 font-bold">Call dispositions</h3>
          {data.dispositions.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={data.dispositions.map((d) => ({ name: title(d.key), value: d.count }))} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>{data.dispositions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-slate-400">No calls logged yet</p>}</section>
        <section className="card p-5 lg:col-span-3"><h3 className="mb-3 font-bold">Monthly calling activity</h3>
          <ResponsiveContainer width="100%" height={200}><BarChart data={data.monthly}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis dataKey="month" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="calls" name="Calls" fill="#e8317a" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></section>
        <section className="card p-5 lg:col-span-2"><h3 className="mb-3 flex items-center gap-2 font-bold"><Activity size={18} className="text-green-600" />Live activity</h3>
          {feed.length ? <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto">{feed.map((f, i) => <li key={`${f.id}${i}`} className="py-2 text-sm"><b>{f.employeeName}</b> <span className="text-slate-500">called {f.contactName}</span><div className="flex items-center gap-2 text-xs text-slate-500"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{title(f.disposition)}</span>{!!f.duration && fmtDuration(f.duration)}<span className="ml-auto text-slate-400">{new Date(f.at).toLocaleTimeString()}</span></div></li>)}</ul> : <p className="py-10 text-center text-sm text-slate-400">New calls from your team appear here live.</p>}</section>
      </div>
    </div>
  );
}


//------ second change -----------
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Users, UserCheck, PhoneCall, TrendingUp, ListChecks, Hourglass, Clock, FileText, Eye, Activity } from 'lucide-react';
// import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import { get } from '../../services/api';
// import { useFetch, useSocketEvent } from '../../hooks/hooks';
// import { AdminStats } from '../../types';
// import { ErrorState, Loading, PresenceBadge, StatCard } from '../../components/ui';
// import { fmtDuration, title } from '../../utils/format';

// const COLORS = ['#16a34a', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b', '#ec4899', '#0ea5e9'];
// const rateColor = (r: number) => (r >= 65 ? 'bg-green-500' : r >= 50 ? 'bg-brand-500' : r > 0 ? 'bg-amber-400' : 'bg-slate-200');
// interface Feed { id: string; employeeName?: string; contactName?: string; disposition: string; duration?: number; at: string }

// export default function TeamDashboard() {
//   const [range, setRange] = useState<'today' | 'all'>('today'); const nav = useNavigate(); const [feed, setFeed] = useState<Feed[]>([]);
//   const { data, loading, error, reload } = useFetch(() => get<AdminStats>('/dashboard/team', { range }), [range]);
//   useSocketEvent('dashboard.refresh', () => reload(true)); useSocketEvent('presence.updated', () => reload(true));
//   useSocketEvent('call.updated', (e: Feed) => { if (e.employeeName) setFeed((f) => [{ ...e, at: e.at || new Date().toISOString() }, ...f].slice(0, 15)); });
//   if (loading && !data) return <Loading />; if (error || !data) return <ErrorState msg={error} retry={reload} />;
//   const c = data.cards; const live = data.performance.filter((p) => p.presence === 'ON_CALL').length;
//   return (
//     <div className="space-y-5">
//       <div><h1 className="text-xl font-bold">Team Dashboard</h1><p className="text-sm text-slate-500">Live view of the telecallers in your team</p></div>
//       <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
//         <StatCard tone="blue" icon={<Users />} label="Team Members" value={c.totalEmployees} />
//         <StatCard tone="green" icon={<UserCheck />} label="Online Now" value={data.performance.filter((p) => p.presence !== 'OFFLINE').length} />
//         <StatCard tone="red" icon={<PhoneCall />} label="On a Call" value={live} />
//         <StatCard tone="yellow" icon={<TrendingUp />} label="Success Rate" value={`${c.successRate}%`} />
//       </div>
//       <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
//         <StatCard tone="red" icon={<PhoneCall />} label="Calls Today" value={c.todayCalls} />
//         <StatCard tone="purple" icon={<ListChecks />} label="Assigned Contacts" value={c.assignedContacts.toLocaleString()} />
//         <StatCard tone="yellow" icon={<Hourglass />} label="Pending Contacts" value={c.pendingContacts.toLocaleString()} />
//         <StatCard tone="green" icon={<Clock />} label="Avg Call Duration" value={fmtDuration(c.avgDuration)} />
//       </div>

//       <section className="card">
//         <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3"><h2 className="flex items-center gap-2 font-bold"><Users className="text-brand-600" size={20} />My Team</h2>
//           <select className="input !w-auto" value={range} onChange={(e) => setRange(e.target.value as 'today' | 'all')} aria-label="Range"><option value="today">Today</option><option value="all">All time</option></select></div>
//         <div className="overflow-x-auto px-3 pb-3"><table className="w-full min-w-[720px]"><thead className="bg-slate-50"><tr><th>#</th><th>Name</th><th>Status</th><th>Assigned</th><th>Called</th><th>Pending</th><th>Calls</th><th>Success Rate</th><th className="text-center">View</th></tr></thead>
//           <tbody className="divide-y divide-slate-100">{data.performance.map((p, i) => (
//             <tr key={p.employeeId}><td>{i + 1}</td><td className="font-medium">{p.name}</td><td><PresenceBadge p={p.presence} /></td><td>{p.assigned}</td><td>{p.called}</td><td>{p.pending}</td><td>{p.calls}</td>
//               <td><div className="flex items-center gap-2"><span className="w-10">{p.successRate}%</span><div className="h-2 w-20 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${rateColor(p.successRate)}`} style={{ width: `${p.successRate}%` }} /></div></div></td>
//               <td className="text-center"><button className="rounded-lg p-1.5 hover:bg-slate-100" aria-label={`View ${p.name}`} onClick={() => nav(`/my-team?id=${p.employeeId}`)}><Eye size={16} /></button></td></tr>
//           ))}</tbody></table>
//           {!data.performance.length && <p className="py-8 text-center text-sm text-slate-400">No telecallers are assigned to you yet. Ask your admin to add them to your team.</p>}</div>
//       </section>

//       <div className="grid gap-5 lg:grid-cols-5">
//         <section className="card p-5 lg:col-span-3"><h3 className="mb-3 font-bold">Daily team activity</h3>
//           <ResponsiveContainer width="100%" height={240}><LineChart data={data.daily.map((d) => ({ ...d, date: d.date.slice(5) }))}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Legend /><Line dataKey="calls" name="Calls" stroke="#7a2bb5" strokeWidth={2.5} dot={false} /><Line dataKey="success" name="Successful" stroke="#16a34a" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></section>
//         <section className="card p-5 lg:col-span-2"><h3 className="mb-3 font-bold">Call dispositions</h3>
//           {data.dispositions.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={data.dispositions.map((d) => ({ name: title(d.key), value: d.count }))} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>{data.dispositions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-slate-400">No calls logged yet</p>}</section>
//         <section className="card p-5 lg:col-span-5"><h3 className="mb-3 flex items-center gap-2 font-bold"><Activity size={18} className="text-green-600" />Live activity</h3>
//           {feed.length ? <ul className="divide-y divide-slate-100">{feed.map((f, i) => <li key={`${f.id}${i}`} className="flex flex-wrap items-center gap-x-3 py-2 text-sm"><FileText size={14} className="text-slate-400" /><b>{f.employeeName}</b><span className="text-slate-500">called {f.contactName}</span><span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold">{title(f.disposition)}</span>{!!f.duration && <span className="text-xs text-slate-500">{fmtDuration(f.duration)}</span>}<span className="ml-auto text-xs text-slate-400">{new Date(f.at).toLocaleTimeString()}</span></li>)}</ul> : <p className="py-6 text-center text-sm text-slate-400">New calls from your team will appear here in real time.</p>}</section>
//       </div>
//     </div>
//   );
// }
