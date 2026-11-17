import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { get } from '../../services/api';
import { useFetch } from '../../hooks/hooks';
import { AdminStats } from '../../types';
import { ErrorState, Loading, PageHeader } from '../../components/ui';
import { ExportButtons, Filters, useFilters } from './CallLogs';
import { title } from '../../utils/format';

export default function Reports() {
  const fl = useFilters(); const [range, setRange] = useState<'today' | 'all'>('all');
  const { data, loading, error, reload } = useFetch(() => get<AdminStats>('/dashboard/admin', { range }), [range]);
  return (
    <>
      <PageHeader title="Reports" sub="Export call data and review team performance" actions={<ExportButtons f={fl.f} />} />
      <div className="card mb-5"><p className="px-4 pt-4 text-sm font-semibold">Export filters</p><Filters {...fl} /></div>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState msg={error} retry={reload} /> : (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="card p-5"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Calls per telecaller</h3><select className="input !w-auto" value={range} onChange={(e) => setRange(e.target.value as 'today' | 'all')} aria-label="Range"><option value="all">All time</option><option value="today">Today</option></select></div>
            <ResponsiveContainer width="100%" height={260}><BarChart data={data.performance}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="calls" name="Calls" fill="#7a2bb5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></section>
          <section className="card p-5"><h3 className="mb-3 font-bold">Disposition breakdown</h3>
            <ResponsiveContainer width="100%" height={260}><BarChart layout="vertical" data={data.dispositions.map((d) => ({ name: title(d.key), count: d.count }))}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="name" width={120} fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#16a34a" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></section>
          <section className="card overflow-x-auto lg:col-span-2"><table className="w-full min-w-[600px]"><thead className="bg-slate-50"><tr><th>Telecaller</th><th>Assigned</th><th>Contacts called</th><th>Pending</th><th>Calls</th><th>Success rate</th></tr></thead><tbody className="divide-y divide-slate-100">{data.performance.map((p) => <tr key={p.employeeId}><td className="font-semibold">{p.name}</td><td>{p.assigned}</td><td>{p.called}</td><td>{p.pending}</td><td>{p.calls}</td><td>{p.successRate}%</td></tr>)}</tbody></table></section>
        </div>)}
    </>
  );
}

//------------ 12.11.2026 --------------
// import { useState } from 'react';
// import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import { get } from '../../services/api';
// import { useFetch } from '../../hooks/hooks';
// import { AdminStats } from '../../types';
// import { ErrorState, Loading, PageHeader } from '../../components/ui';
// import { ExportButtons, Filters, useFilters } from './CallLogs';
// import { title } from '../../utils/format';

// export default function Reports() {
//   const fl = useFilters(); const [range, setRange] = useState<'today' | 'all'>('all');
//   const { data, loading, error, reload } = useFetch(() => get<AdminStats>('/dashboard/admin', { range }), [range]);
//   return (
//     <>
//       <PageHeader title="Reports" sub="Export call data and review team performance" actions={<ExportButtons f={fl.f} />} />
//       <div className="card mb-5"><p className="px-4 pt-4 text-sm font-semibold">Export filters</p><Filters {...fl} /></div>
//       {loading && !data ? <Loading /> : error || !data ? <ErrorState msg={error} retry={reload} /> : (
//         <div className="grid gap-5 lg:grid-cols-2">
//           <section className="card p-5"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Calls per telecaller</h3><select className="input !w-auto" value={range} onChange={(e) => setRange(e.target.value as 'today' | 'all')} aria-label="Range"><option value="all">All time</option><option value="today">Today</option></select></div>
//             <ResponsiveContainer width="100%" height={260}><BarChart data={data.performance}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="calls" name="Calls" fill="#7a2bb5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></section>
//           <section className="card p-5"><h3 className="mb-3 font-bold">Disposition breakdown</h3>
//             <ResponsiveContainer width="100%" height={260}><BarChart layout="vertical" data={data.dispositions.map((d) => ({ name: title(d.key), count: d.count }))}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="name" width={120} fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#16a34a" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></section>
//           <section className="card overflow-x-auto lg:col-span-2"><table className="w-full min-w-[600px]"><thead className="bg-slate-50"><tr><th>Telecaller</th><th>Assigned</th><th>Contacts called</th><th>Pending</th><th>Calls</th><th>Success rate</th></tr></thead><tbody className="divide-y divide-slate-100">{data.performance.map((p) => <tr key={p.employeeId}><td className="font-semibold">{p.name}</td><td>{p.assigned}</td><td>{p.called}</td><td>{p.pending}</td><td>{p.calls}</td><td>{p.successRate}%</td></tr>)}</tbody></table></section>
//         </div>)}
//     </>
//   );
// }
