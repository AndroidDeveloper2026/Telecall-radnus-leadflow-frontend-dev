import { useState } from 'react';
import { Zap } from 'lucide-react';
import { get, post } from '../../services/api';
import { useFetch, useSocketEvent } from '../../hooks/hooks';
import { Page } from '../../types';
import { Confirm, ErrorState, Loading, PageHeader, StatusBadge } from '../../components/ui';
import { Col, DataTable } from '../../components/DataTable';
import { useToast } from '../../contexts/ToastContext';
import { errMsg, fmtDate } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

interface Summary { items: { employeeId: string; name: string; status: string; total: number; pending: number; inProgress: number; followUp: number; completed: number }[]; unassigned: number }
interface Row { _id: string; contact: { name: string; phone: string }; employee: { name: string }; assignedBy: { name: string }; status: string; assignedAt: string }

export default function Assignments() {
  const toast = useToast(); const team = useAuth().user!.role === 'COORDINATOR'; const [emp, setEmp] = useState(''); const [pg, setPg] = useState(1); const [ask, setAsk] = useState(false);
  const sum = useFetch(() => get<Summary>('/assignments/summary'), []);
  const hist = useFetch(() => get<Page<Row>>('/assignments', { employeeId: emp || undefined, page: pg, limit: 15 }), [emp, pg]);
  useSocketEvent('dashboard.refresh', () => { sum.reload(true); hist.reload(true); });
  const distribute = async () => { try { const r = await post<{ total: number }>('/assignments/distribute', {}); toast.ok(`${r.total} contacts distributed equally`); sum.reload(true); hist.reload(true); } catch (x) { toast.err(errMsg(x)); } };
  const cols: Col<Row>[] = [
    { head: 'Contact', cell: (r) => <span className="font-semibold">{r.contact?.name || 'Deleted contact'}</span> }, { head: 'Phone', cell: (r) => r.contact?.phone || '—' }, { head: 'Telecaller', cell: (r) => r.employee?.name },
    { head: 'Assigned by', cell: (r) => r.assignedBy?.name }, { head: 'Date', cell: (r) => fmtDate(r.assignedAt) }, { head: 'Status', cell: (r) => <StatusBadge s={r.status === 'ACTIVE' ? 'ASSIGNED' : r.status} /> },
  ];
  return (
    <>
      <PageHeader title="Assignments" sub="Employee-wise workload and assignment history" actions={<button className="btn-green" disabled={!sum.data?.unassigned} onClick={() => setAsk(true)}><Zap size={16} />Distribute {sum.data?.unassigned || 0} unassigned equally</button>} />
      <div className="card mb-5">
        {sum.loading && !sum.data ? <Loading /> : sum.error ? <ErrorState msg={sum.error} retry={sum.reload} /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px]"><thead className="bg-slate-50"><tr><th>Telecaller</th><th>Total</th><th>Not called</th><th>In progress</th><th>Follow-up</th><th>Completed</th><th>Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{sum.data!.items.map((r) => <tr key={r.employeeId}><td className="font-semibold">{r.name}</td><td>{r.total}</td><td>{r.pending}</td><td>{r.inProgress}</td><td>{r.followUp}</td><td>{r.completed}</td><td><StatusBadge s={r.status} /></td></tr>)}</tbody></table></div>)}
      </div>
      <div className="card">
        <div className="flex items-center justify-between p-4"><h2 className="font-bold">Assignment history</h2>
          <select className="input !w-auto" value={emp} onChange={(e) => { setEmp(e.target.value); setPg(1); }} aria-label="Telecaller"><option value="">All telecallers</option>{sum.data?.items.map((e) => <option key={e.employeeId} value={e.employeeId}>{e.name}</option>)}</select></div>
        <DataTable cols={cols} page={hist.data} loading={hist.loading} error={hist.error} reload={hist.reload} onPage={setPg} empty="No assignments yet" />
      </div>
      <Confirm open={ask} onClose={() => setAsk(false)} onYes={distribute} text={`Split ${sum.data?.unassigned} unassigned contacts equally across ${team ? 'your team' : 'all active telecallers'}?`} />
    </>
  );
}


//------ second change -----------
// import { useState } from 'react';
// import { Zap } from 'lucide-react';
// import { get, post } from '../../services/api';
// import { useFetch, useSocketEvent } from '../../hooks/hooks';
// import { Page } from '../../types';
// import { Confirm, ErrorState, Loading, PageHeader, StatusBadge } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtDate } from '../../utils/format';

// interface Summary { items: { employeeId: string; name: string; status: string; total: number; pending: number; inProgress: number; followUp: number; completed: number }[]; unassigned: number }
// interface Row { _id: string; contact: { name: string; phone: string }; employee: { name: string }; assignedBy: { name: string }; status: string; assignedAt: string }

// export default function Assignments() {
//   const toast = useToast(); const [emp, setEmp] = useState(''); const [pg, setPg] = useState(1); const [ask, setAsk] = useState(false);
//   const sum = useFetch(() => get<Summary>('/assignments/summary'), []);
//   const hist = useFetch(() => get<Page<Row>>('/assignments', { employeeId: emp || undefined, page: pg, limit: 15 }), [emp, pg]);
//   useSocketEvent('dashboard.refresh', () => { sum.reload(true); hist.reload(true); });
//   const distribute = async () => { try { const r = await post<{ total: number }>('/assignments/distribute', {}); toast.ok(`${r.total} contacts distributed equally`); sum.reload(true); hist.reload(true); } catch (x) { toast.err(errMsg(x)); } };
//   const cols: Col<Row>[] = [
//     { head: 'Contact', cell: (r) => <span className="font-semibold">{r.contact?.name || 'Deleted contact'}</span> }, { head: 'Phone', cell: (r) => r.contact?.phone || '—' }, { head: 'Telecaller', cell: (r) => r.employee?.name },
//     { head: 'Assigned by', cell: (r) => r.assignedBy?.name }, { head: 'Date', cell: (r) => fmtDate(r.assignedAt) }, { head: 'Status', cell: (r) => <StatusBadge s={r.status === 'ACTIVE' ? 'ASSIGNED' : r.status} /> },
//   ];
//   return (
//     <>
//       <PageHeader title="Assignments" sub="Employee-wise workload and assignment history" actions={<button className="btn-green" disabled={!sum.data?.unassigned} onClick={() => setAsk(true)}><Zap size={16} />Distribute {sum.data?.unassigned || 0} unassigned equally</button>} />
//       <div className="card mb-5">
//         {sum.loading && !sum.data ? <Loading /> : sum.error ? <ErrorState msg={sum.error} retry={sum.reload} /> : (
//           <div className="overflow-x-auto"><table className="w-full min-w-[640px]"><thead className="bg-slate-50"><tr><th>Telecaller</th><th>Total</th><th>Not called</th><th>In progress</th><th>Follow-up</th><th>Completed</th><th>Status</th></tr></thead>
//             <tbody className="divide-y divide-slate-100">{sum.data!.items.map((r) => <tr key={r.employeeId}><td className="font-semibold">{r.name}</td><td>{r.total}</td><td>{r.pending}</td><td>{r.inProgress}</td><td>{r.followUp}</td><td>{r.completed}</td><td><StatusBadge s={r.status} /></td></tr>)}</tbody></table></div>)}
//       </div>
//       <div className="card">
//         <div className="flex items-center justify-between p-4"><h2 className="font-bold">Assignment history</h2>
//           <select className="input !w-auto" value={emp} onChange={(e) => { setEmp(e.target.value); setPg(1); }} aria-label="Telecaller"><option value="">All telecallers</option>{sum.data?.items.map((e) => <option key={e.employeeId} value={e.employeeId}>{e.name}</option>)}</select></div>
//         <DataTable cols={cols} page={hist.data} loading={hist.loading} error={hist.error} reload={hist.reload} onPage={setPg} empty="No assignments yet" />
//       </div>
//       <Confirm open={ask} onClose={() => setAsk(false)} onYes={distribute} text={`Split ${sum.data?.unassigned} unassigned contacts equally across all active telecallers?`} />
//     </>
//   );
// }


//------ 12.11.2026 ---------
// import { useState } from 'react';
// import { Zap } from 'lucide-react';
// import { get, post } from '../../services/api';
// import { useFetch, useSocketEvent } from '../../hooks/hooks';
// import { Page } from '../../types';
// import { Confirm, ErrorState, Loading, PageHeader, StatusBadge } from '../../components/ui';
// import { Col, DataTable } from '../../components/DataTable';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtDate } from '../../utils/format';

// interface Summary { items: { employeeId: string; name: string; status: string; total: number; pending: number; inProgress: number; followUp: number; completed: number }[]; unassigned: number }
// interface Row { _id: string; contact: { name: string; phone: string }; employee: { name: string }; assignedBy: { name: string }; status: string; assignedAt: string }

// export default function Assignments() {
//   const toast = useToast(); const [emp, setEmp] = useState(''); const [pg, setPg] = useState(1); const [ask, setAsk] = useState(false);
//   const sum = useFetch(() => get<Summary>('/assignments/summary'), []);
//   const hist = useFetch(() => get<Page<Row>>('/assignments', { employeeId: emp || undefined, page: pg, limit: 15 }), [emp, pg]);
//   useSocketEvent('dashboard.refresh', () => { sum.reload(true); hist.reload(true); });
//   const distribute = async () => { try { const r = await post<{ total: number }>('/assignments/distribute', {}); toast.ok(`${r.total} contacts distributed equally`); sum.reload(true); hist.reload(true); } catch (x) { toast.err(errMsg(x)); } };
//   const cols: Col<Row>[] = [
//     { head: 'Contact', cell: (r) => <span className="font-semibold">{r.contact?.name || 'Deleted contact'}</span> }, { head: 'Phone', cell: (r) => r.contact?.phone || '—' }, { head: 'Telecaller', cell: (r) => r.employee?.name },
//     { head: 'Assigned by', cell: (r) => r.assignedBy?.name }, { head: 'Date', cell: (r) => fmtDate(r.assignedAt) }, { head: 'Status', cell: (r) => <StatusBadge s={r.status === 'ACTIVE' ? 'ASSIGNED' : r.status} /> },
//   ];
//   return (
//     <>
//       <PageHeader title="Assignments" sub="Employee-wise workload and assignment history" actions={<button className="btn-green" disabled={!sum.data?.unassigned} onClick={() => setAsk(true)}><Zap size={16} />Distribute {sum.data?.unassigned || 0} unassigned equally</button>} />
//       <div className="card mb-5">
//         {sum.loading && !sum.data ? <Loading /> : sum.error ? <ErrorState msg={sum.error} retry={sum.reload} /> : (
//           <div className="overflow-x-auto"><table className="w-full min-w-[640px]"><thead className="bg-slate-50"><tr><th>Telecaller</th><th>Total</th><th>Not called</th><th>In progress</th><th>Follow-up</th><th>Completed</th><th>Status</th></tr></thead>
//             <tbody className="divide-y divide-slate-100">{sum.data!.items.map((r) => <tr key={r.employeeId}><td className="font-semibold">{r.name}</td><td>{r.total}</td><td>{r.pending}</td><td>{r.inProgress}</td><td>{r.followUp}</td><td>{r.completed}</td><td><StatusBadge s={r.status} /></td></tr>)}</tbody></table></div>)}
//       </div>
//       <div className="card">
//         <div className="flex items-center justify-between p-4"><h2 className="font-bold">Assignment history</h2>
//           <select className="input !w-auto" value={emp} onChange={(e) => { setEmp(e.target.value); setPg(1); }} aria-label="Telecaller"><option value="">All telecallers</option>{sum.data?.items.map((e) => <option key={e.employeeId} value={e.employeeId}>{e.name}</option>)}</select></div>
//         <DataTable cols={cols} page={hist.data} loading={hist.loading} error={hist.error} reload={hist.reload} onPage={setPg} empty="No assignments yet" />
//       </div>
//       <Confirm open={ask} onClose={() => setAsk(false)} onYes={distribute} text={`Split ${sum.data?.unassigned} unassigned contacts equally across all active telecallers?`} />
//     </>
//   );
// }
