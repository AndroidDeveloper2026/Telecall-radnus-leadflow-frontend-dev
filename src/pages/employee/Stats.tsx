import { CheckCircle2, Clock, Phone, TrendingUp, CalendarClock, Hourglass } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { get } from '../../services/api';
import { useFetch } from '../../hooks/hooks';
import { EmployeeStats } from '../../types';
import { ErrorState, Loading, PageHeader, StatCard } from '../../components/ui';
import { fmtDuration, fmtTalk, title } from '../../utils/format';

const COLORS = ['#16a34a', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b', '#ec4899', '#0ea5e9'];
export default function Stats() {
  const { data: s, loading, error, reload } = useFetch(() => get<EmployeeStats>('/dashboard/employee'), []);
  if (loading && !s) return <Loading />; if (error || !s) return <ErrorState msg={error} retry={reload} />;
  return (
    <>
      <PageHeader title="My Stats" sub="Your calling performance" />
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard tone="blue" icon={<Phone />} label="Calls today" value={s.callsToday} /><StatCard tone="green" icon={<Clock />} label="Talk time today" value={fmtTalk(s.talkTimeToday)} /><StatCard tone="purple" icon={<TrendingUp />} label="Success rate" value={`${s.successRate}%`} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={s.pending} />
        <StatCard tone="blue" icon={<Phone />} label="Total calls" value={s.totalCalls} /><StatCard tone="green" icon={<CheckCircle2 />} label="Completed contacts" value={s.completed} /><StatCard tone="yellow" icon={<CalendarClock />} label="Follow-ups" value={s.followUps} /><StatCard tone="red" icon={<Clock />} label="Avg call duration" value={fmtDuration(s.avgDuration)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3"><h3 className="mb-3 font-bold">Calls — last 7 days</h3><ResponsiveContainer width="100%" height={240}><BarChart data={s.daily.map((d) => ({ ...d, date: d.date.slice(5) }))}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="calls" name="Calls" fill="#7a2bb5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></section>
        <section className="card p-5 lg:col-span-2"><h3 className="mb-3 font-bold">Outcomes</h3>{s.dispositions.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={s.dispositions.map((d) => ({ name: title(d.key), value: d.count }))} dataKey="value" innerRadius={50} outerRadius={85}>{s.dispositions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-slate-400">No calls yet</p>}</section>
      </div>
    </>
  );
}

//------ 12.11.2026 -----------
// import { CheckCircle2, Clock, Phone, TrendingUp, CalendarClock, Hourglass } from 'lucide-react';
// import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
// import { get } from '../../services/api';
// import { useFetch } from '../../hooks/hooks';
// import { EmployeeStats } from '../../types';
// import { ErrorState, Loading, PageHeader, StatCard } from '../../components/ui';
// import { fmtDuration, fmtTalk, title } from '../../utils/format';

// const COLORS = ['#16a34a', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b', '#ec4899', '#0ea5e9'];
// export default function Stats() {
//   const { data: s, loading, error, reload } = useFetch(() => get<EmployeeStats>('/dashboard/employee'), []);
//   if (loading && !s) return <Loading />; if (error || !s) return <ErrorState msg={error} retry={reload} />;
//   return (
//     <>
//       <PageHeader title="My Stats" sub="Your calling performance" />
//       <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
//         <StatCard tone="blue" icon={<Phone />} label="Calls today" value={s.callsToday} /><StatCard tone="green" icon={<Clock />} label="Talk time today" value={fmtTalk(s.talkTimeToday)} /><StatCard tone="purple" icon={<TrendingUp />} label="Success rate" value={`${s.successRate}%`} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={s.pending} />
//         <StatCard tone="blue" icon={<Phone />} label="Total calls" value={s.totalCalls} /><StatCard tone="green" icon={<CheckCircle2 />} label="Completed contacts" value={s.completed} /><StatCard tone="yellow" icon={<CalendarClock />} label="Follow-ups" value={s.followUps} /><StatCard tone="red" icon={<Clock />} label="Avg call duration" value={fmtDuration(s.avgDuration)} />
//       </div>
//       <div className="grid gap-5 lg:grid-cols-5">
//         <section className="card p-5 lg:col-span-3"><h3 className="mb-3 font-bold">Calls — last 7 days</h3><ResponsiveContainer width="100%" height={240}><BarChart data={s.daily.map((d) => ({ ...d, date: d.date.slice(5) }))}><CartesianGrid strokeDasharray="3 3" stroke="#f1e7f6" /><XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="calls" name="Calls" fill="#7a2bb5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></section>
//         <section className="card p-5 lg:col-span-2"><h3 className="mb-3 font-bold">Outcomes</h3>{s.dispositions.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={s.dispositions.map((d) => ({ name: title(d.key), value: d.count }))} dataKey="value" innerRadius={50} outerRadius={85}>{s.dispositions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-slate-400">No calls yet</p>}</section>
//       </div>
//     </>
//   );
// }
