import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Hourglass, Phone, PhoneCall, TrendingUp } from 'lucide-react';
import { get } from '../../services/api';
import { useFetch, useSocketEvent } from '../../hooks/hooks';
import { User } from '../../types';
import { ErrorState, Loading, Modal, PageHeader, PresenceBadge, StatCard } from '../../components/ui';
import { fmtDuration, fmtTalk, title } from '../../utils/format';

export default function MyTeam() {
  const [sp, setSp] = useSearchParams(); const nav = useNavigate(); const id = sp.get('id');
  const { data, loading, error, reload } = useFetch(() => get<{ items: User[] }>('/team/members'), []);
  useSocketEvent('presence.updated', () => reload(true)); useSocketEvent('call.updated', () => reload(true));
  const detail = useFetch(() => (id ? get<User>(`/team/members/${id}`) : Promise.resolve(null)), [id]);
  if (loading && !data) return <Loading />; if (error || !data) return <ErrorState msg={error} retry={reload} />;
  const p = detail.data?.performance;
  return (
    <>
      <PageHeader title="My Team" sub="Telecallers reporting to you — status and today's work" />
      {!data.items.length && <div className="card p-10 text-center text-sm text-slate-400">No telecallers are assigned to you yet. Ask your admin to add them to your team.</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map((m) => { const s = m.performance!; return (
          <button key={m._id} onClick={() => setSp({ id: m._id })} className="card p-4 text-left transition hover:shadow-md">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-bold">{m.name}</p><p className="truncate text-xs text-slate-500">{m.phone || m.email}</p></div><PresenceBadge p={m.presence} /></div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center"><div><p className="text-lg font-bold">{s.callsToday}</p><p className="text-[11px] text-slate-500">Calls today</p></div><div><p className="text-lg font-bold">{fmtTalk(s.talkTimeToday)}</p><p className="text-[11px] text-slate-500">Talk time</p></div><div><p className="text-lg font-bold">{s.pending}</p><p className="text-[11px] text-slate-500">Pending</p></div><div><p className="text-lg font-bold">{s.successRate}%</p><p className="text-[11px] text-slate-500">Success</p></div></div>
          </button>); })}
      </div>
      <Modal open={!!id} onClose={() => setSp({})} title={detail.data?.name || 'Team member'} wide>
        {detail.loading || !detail.data ? <Loading /> : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-500">{detail.data.email} · {detail.data.phone || 'no phone'}</p><div className="flex items-center gap-2"><PresenceBadge p={detail.data.presence} /><button className="btn-ghost" onClick={() => nav(`/call-logs?employeeId=${detail.data!._id}`)}><Phone size={15} />View calls</button></div></div>
            {p && <><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard tone="blue" icon={<PhoneCall />} label="Calls today" value={p.callsToday} /><StatCard tone="green" icon={<Clock />} label="Talk time today" value={fmtTalk(p.talkTimeToday)} /><StatCard tone="purple" icon={<TrendingUp />} label="Success rate" value={`${p.successRate}%`} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={p.pending} /></div>
              <p className="text-sm text-slate-600">Assigned {p.assigned} · Completed {p.completed} · Follow-ups {p.followUps} · Total calls {p.totalCalls} · Avg duration {fmtDuration(p.avgDuration)}</p>
              {!!p.dispositions.length && <div className="flex flex-wrap gap-2">{p.dispositions.map((d) => <span key={d.key} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{title(d.key)}: {d.count}</span>)}</div>}</>}
          </div>)}
      </Modal>
    </>
  );
}


//------ second change ------------
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Clock, Hourglass, Phone, PhoneCall, TrendingUp } from 'lucide-react';
// import { get } from '../../services/api';
// import { useFetch, useSocketEvent } from '../../hooks/hooks';
// import { User } from '../../types';
// import { ErrorState, Loading, Modal, PageHeader, PresenceBadge, StatCard } from '../../components/ui';
// import { fmtDuration, fmtTalk, title } from '../../utils/format';

// export default function MyTeam() {
//   const [sp, setSp] = useSearchParams(); const nav = useNavigate(); const id = sp.get('id');
//   const { data, loading, error, reload } = useFetch(() => get<{ items: User[] }>('/team/members'), []);
//   useSocketEvent('presence.updated', () => reload(true)); useSocketEvent('call.updated', () => reload(true));
//   const detail = useFetch(() => (id ? get<User>(`/team/members/${id}`) : Promise.resolve(null)), [id]);
//   if (loading && !data) return <Loading />; if (error || !data) return <ErrorState msg={error} retry={reload} />;
//   const p = detail.data?.performance;
//   return (
//     <>
//       <PageHeader title="My Team" sub="Telecallers reporting to you — status and today's work" />
//       {!data.items.length && <div className="card p-10 text-center text-sm text-slate-400">No telecallers are assigned to you yet. Ask your admin to add them to your team.</div>}
//       <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//         {data.items.map((m) => { const s = m.performance!; return (
//           <button key={m._id} onClick={() => setSp({ id: m._id })} className="card p-4 text-left transition hover:shadow-md">
//             <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-bold">{m.name}</p><p className="truncate text-xs text-slate-500">{m.phone || m.email}</p></div><PresenceBadge p={m.presence} /></div>
//             <div className="mt-3 grid grid-cols-4 gap-2 text-center"><div><p className="text-lg font-bold">{s.callsToday}</p><p className="text-[11px] text-slate-500">Calls today</p></div><div><p className="text-lg font-bold">{fmtTalk(s.talkTimeToday)}</p><p className="text-[11px] text-slate-500">Talk time</p></div><div><p className="text-lg font-bold">{s.pending}</p><p className="text-[11px] text-slate-500">Pending</p></div><div><p className="text-lg font-bold">{s.successRate}%</p><p className="text-[11px] text-slate-500">Success</p></div></div>
//           </button>); })}
//       </div>
//       <Modal open={!!id} onClose={() => setSp({})} title={detail.data?.name || 'Team member'} wide>
//         {detail.loading || !detail.data ? <Loading /> : (
//           <div className="space-y-4">
//             <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-500">{detail.data.email} · {detail.data.phone || 'no phone'}</p><div className="flex items-center gap-2"><PresenceBadge p={detail.data.presence} /><button className="btn-ghost" onClick={() => nav(`/call-logs?employeeId=${detail.data!._id}`)}><Phone size={15} />View calls</button></div></div>
//             {p && <><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard tone="blue" icon={<PhoneCall />} label="Calls today" value={p.callsToday} /><StatCard tone="green" icon={<Clock />} label="Talk time today" value={fmtTalk(p.talkTimeToday)} /><StatCard tone="purple" icon={<TrendingUp />} label="Success rate" value={`${p.successRate}%`} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={p.pending} /></div>
//               <p className="text-sm text-slate-600">Assigned {p.assigned} · Completed {p.completed} · Follow-ups {p.followUps} · Total calls {p.totalCalls} · Avg duration {fmtDuration(p.avgDuration)}</p>
//               {!!p.dispositions.length && <div className="flex flex-wrap gap-2">{p.dispositions.map((d) => <span key={d.key} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{title(d.key)}: {d.count}</span>)}</div>}</>}
//           </div>)}
//       </Modal>
//     </>
//   );
// }
