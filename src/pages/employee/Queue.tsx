import { useEffect, useRef, useState } from 'react';
import { Building2, CalendarClock, Clock, FileText, Hourglass, ListOrdered, Phone, PhoneCall, PhoneOff, Save, TrendingUp, User as UserIcon } from 'lucide-react';
import { get, patch, post } from '../../services/api';
import { useFetch, useSocketEvent } from '../../hooks/hooks';
import { Contact, EmployeeStats, Settings } from '../../types';
import { Empty, ErrorState, Loading, Spinner, StatCard } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { errMsg, fmtDuration, fmtTalk, PRIORITY, toLocalInput } from '../../utils/format';

const CALL_STATUS: Record<string, string> = { NO_ANSWER: 'NO_ANSWER', BUSY: 'BUSY', NOT_REACHABLE: 'NOT_REACHABLE', WRONG_NUMBER: 'WRONG_NUMBER' };
type Phase = 'idle' | 'calling' | 'ended';

export default function Queue() {
  const toast = useToast();
  const stats = useFetch(() => get<EmployeeStats>('/dashboard/employee'), []);
  const queue = useFetch(() => get<{ items: Contact[] }>('/contacts/queue'), []);
  const cfg = useFetch(() => get<Settings>('/settings'), []);
  useSocketEvent('assignment.updated', () => { queue.reload(true); stats.reload(true); }); useSocketEvent('contact.updated', () => queue.reload(true));

  const [pickId, setPickId] = useState<string | null>(null); const [phase, setPhase] = useState<Phase>('idle'); const [secs, setSecs] = useState(0);
  const start = useRef<Date | null>(null); const end = useRef<Date | null>(null); const timer = useRef<number>();
  const [disp, setDisp] = useState(''); const [notes, setNotes] = useState(''); const [follow, setFollow] = useState(''); const [busy, setBusy] = useState(false);
  const items = queue.data?.items ?? []; const cur = items.find((c) => c._id === pickId) ?? items[0]; const next = items.filter((c) => c._id !== cur?._id).slice(0, 4);
  const d = cfg.data?.dispositions.find((x) => x.key === disp);
  useEffect(() => () => clearInterval(timer.current), []);
  useEffect(() => { if (d?.outcome === 'FOLLOW_UP' && !follow) { const t = new Date(Date.now() + 86400000); t.setHours(10, 0, 0, 0); setFollow(toLocalInput(t)); } }, [d, follow]);

  const reset = () => { clearInterval(timer.current); setPhase('idle'); setSecs(0); setDisp(''); setNotes(''); setFollow(''); start.current = null; end.current = null; };
  const pick = (id: string) => { if (phase === 'calling') return toast.err('End the current call first'); reset(); setPickId(id); };
  const call = () => {
    if (!cur) return; start.current = new Date(); end.current = null; setSecs(0); setPhase('calling');
    timer.current = window.setInterval(() => setSecs(Math.round((Date.now() - start.current!.getTime()) / 1000)), 1000);
    patch('/auth/presence', { presence: 'ON_CALL' }).catch(() => {});
    window.location.href = `tel:${cur.phone}`; // hands off to the device dialer (softphone/desktop app, or phone link)
  };
  const hangup = () => { clearInterval(timer.current); end.current = new Date(); setSecs(Math.round((end.current.getTime() - start.current!.getTime()) / 1000)); setPhase('ended'); };
  const save = async () => {
    if (!cur) return; if (!disp) return toast.err('Select a call status'); if (!notes.trim()) return toast.err('Add call notes');
    setBusy(true);
    const st = start.current ?? new Date(); const en = end.current ?? new Date();
    try {
      await post('/call-logs', { contactId: cur._id, startTime: st.toISOString(), endTime: en.toISOString(), duration: phase === 'idle' ? 0 : secs, callStatus: CALL_STATUS[disp] || 'CONNECTED', disposition: disp, notes: notes.trim(), followUpAt: d?.outcome === 'FOLLOW_UP' && follow ? new Date(follow).toISOString() : undefined, clientId: crypto.randomUUID() });
      toast.ok('Saved'); reset(); setPickId(null); await Promise.all([queue.reload(true), stats.reload(true)]);
    } catch (e) { toast.err(errMsg(e)); } finally { setBusy(false); }
  };
  const s = stats.data;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard tone="blue" icon={<Phone />} label="Calls Today" value={s?.callsToday ?? '–'} /><StatCard tone="green" icon={<Clock />} label="Talk Time" value={s ? fmtTalk(s.talkTimeToday) : '–'} />
        <StatCard tone="purple" icon={<TrendingUp />} label="Success Rate" value={s ? `${s.successRate}%` : '–'} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={s?.pending ?? '–'} />
      </div>
      {queue.loading && !queue.data ? <Loading /> : queue.error ? <ErrorState msg={queue.error} retry={queue.reload} /> : !cur ? (
        <div className="card"><Empty text="Your queue is empty" hint="New contacts appear here as soon as your admin assigns them." /></div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {phase === 'calling' && <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600" role="status"><i className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />CALL IN PROGRESS ({fmtDuration(secs)})</div>}
            <section className="card space-y-3 p-5">
              <dl className="grid grid-cols-[110px_1fr] gap-y-2.5 rounded-xl border border-slate-100 p-4 text-sm">
                <dt className="flex items-center gap-2 text-slate-500"><UserIcon size={15} />Customer :</dt><dd className="font-semibold">{cur.name}</dd>
                <dt className="flex items-center gap-2 text-slate-500"><Building2 size={15} />Company :</dt><dd>{cur.company || '—'}</dd>
                <dt className="flex items-center gap-2 text-slate-500"><Phone size={15} />Phone :</dt><dd className="font-semibold">{cur.phone}</dd>
                <dt className="flex items-center gap-2 text-slate-500"><FileText size={15} />Last Note :</dt><dd className="italic">{cur.lastNote ? `“${cur.lastNote}”` : 'No previous notes'}</dd>
                {cur.followUpAt && <><dt className="flex items-center gap-2 text-slate-500"><CalendarClock size={15} />Follow-up :</dt><dd>{new Date(cur.followUpAt).toLocaleString()}</dd></>}
              </dl>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-green !py-3" disabled={phase === 'calling'} onClick={call}><PhoneCall size={18} />{phase === 'ended' ? 'Call again' : 'Call'}</button>
                <button className="btn-red !py-3" disabled={phase !== 'calling'} onClick={hangup}><PhoneOff size={18} />End</button>
              </div>
              <p className="text-[11px] text-slate-400">Call opens your device dialer. The timer measures talk time from Call to End.</p>
            </section>
            <section className="card space-y-3 p-5">
              <h2 className="flex items-center gap-2 font-bold"><Save size={16} className="text-brand-600" />Call Disposition <span className="text-xs font-normal text-slate-500">(Required after call ends)</span></h2>
              <label className="block"><span className="label">Status <b className="text-red-500">*</b></span>
                <select className={`input ${disp ? '!bg-green-50' : ''}`} value={disp} onChange={(e) => setDisp(e.target.value)}><option value="">Select status…</option>{cfg.data?.dispositions.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></label>
              {d?.outcome === 'FOLLOW_UP' && <label className="block"><span className="label">Follow-up on</span><input type="datetime-local" className="input" value={follow} onChange={(e) => setFollow(e.target.value)} /></label>}
              <label className="block"><span className="label">Notes <b className="text-red-500">*</b></span><textarea className="input min-h-[90px]" maxLength={2000} placeholder="Add call summary here..." value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
              <button className="btn-primary w-full !py-3" disabled={busy || phase === 'calling'} onClick={save}>{busy ? <Spinner className="!text-white" /> : <Save size={16} />}Save Status &amp; Get Next Contact</button>
            </section>
          </div>
          <section className="card h-fit p-5"><h2 className="mb-3 flex items-center gap-2 font-bold"><ListOrdered size={16} className="text-brand-600" />Next in Queue</h2>
            {next.length ? <ul className="divide-y divide-slate-100">{next.map((c, i) => (
              <li key={c._id}><button onClick={() => pick(c._id)} className="flex w-full items-center gap-3 py-3 text-left text-sm hover:bg-slate-50"><span className="w-4 text-slate-400">{i + 1}</span><span className="flex-1"><b className="block">{c.name}</b><span className="text-xs text-slate-500">{c.phone}</span></span><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${PRIORITY[c.priority].cls}`}>{PRIORITY[c.priority].label}</span></button></li>))}</ul> : <p className="py-4 text-sm text-slate-400">This is your last contact in the queue.</p>}
          </section>
        </div>)}
    </div>
  );
}


//----- 12.11.2026 ----------
// import { useEffect, useRef, useState } from 'react';
// import { Building2, CalendarClock, Clock, FileText, Hourglass, ListOrdered, Phone, PhoneCall, PhoneOff, Save, TrendingUp, User as UserIcon } from 'lucide-react';
// import { get, patch, post } from '../../services/api';
// import { useFetch, useSocketEvent } from '../../hooks/hooks';
// import { Contact, EmployeeStats, Settings } from '../../types';
// import { Empty, ErrorState, Loading, Spinner, StatCard } from '../../components/ui';
// import { useToast } from '../../contexts/ToastContext';
// import { errMsg, fmtDuration, fmtTalk, PRIORITY, toLocalInput } from '../../utils/format';

// const CALL_STATUS: Record<string, string> = { NO_ANSWER: 'NO_ANSWER', BUSY: 'BUSY', NOT_REACHABLE: 'NOT_REACHABLE', WRONG_NUMBER: 'WRONG_NUMBER' };
// type Phase = 'idle' | 'calling' | 'ended';

// export default function Queue() {
//   const toast = useToast();
//   const stats = useFetch(() => get<EmployeeStats>('/dashboard/employee'), []);
//   const queue = useFetch(() => get<{ items: Contact[] }>('/contacts/queue'), []);
//   const cfg = useFetch(() => get<Settings>('/settings'), []);
//   useSocketEvent('assignment.updated', () => { queue.reload(true); stats.reload(true); }); useSocketEvent('contact.updated', () => queue.reload(true));

//   const [pickId, setPickId] = useState<string | null>(null); const [phase, setPhase] = useState<Phase>('idle'); const [secs, setSecs] = useState(0);
//   const start = useRef<Date | null>(null); const end = useRef<Date | null>(null); const timer = useRef<number>();
//   const [disp, setDisp] = useState(''); const [notes, setNotes] = useState(''); const [follow, setFollow] = useState(''); const [busy, setBusy] = useState(false);
//   const items = queue.data?.items ?? []; const cur = items.find((c) => c._id === pickId) ?? items[0]; const next = items.filter((c) => c._id !== cur?._id).slice(0, 4);
//   const d = cfg.data?.dispositions.find((x) => x.key === disp);
//   useEffect(() => () => clearInterval(timer.current), []);
//   useEffect(() => { if (d?.outcome === 'FOLLOW_UP' && !follow) { const t = new Date(Date.now() + 86400000); t.setHours(10, 0, 0, 0); setFollow(toLocalInput(t)); } }, [d, follow]);

//   const reset = () => { clearInterval(timer.current); setPhase('idle'); setSecs(0); setDisp(''); setNotes(''); setFollow(''); start.current = null; end.current = null; };
//   const pick = (id: string) => { if (phase === 'calling') return toast.err('End the current call first'); reset(); setPickId(id); };
//   const call = () => {
//     if (!cur) return; start.current = new Date(); end.current = null; setSecs(0); setPhase('calling');
//     timer.current = window.setInterval(() => setSecs(Math.round((Date.now() - start.current!.getTime()) / 1000)), 1000);
//     patch('/auth/presence', { presence: 'ON_CALL' }).catch(() => {});
//     window.location.href = `tel:${cur.phone}`; // hands off to the device dialer (softphone/desktop app, or phone link)
//   };
//   const hangup = () => { clearInterval(timer.current); end.current = new Date(); setSecs(Math.round((end.current.getTime() - start.current!.getTime()) / 1000)); setPhase('ended'); };
//   const save = async () => {
//     if (!cur) return; if (!disp) return toast.err('Select a call status'); if (!notes.trim()) return toast.err('Add call notes');
//     setBusy(true);
//     const st = start.current ?? new Date(); const en = end.current ?? new Date();
//     try {
//       await post('/call-logs', { contactId: cur._id, startTime: st.toISOString(), endTime: en.toISOString(), duration: phase === 'idle' ? 0 : secs, callStatus: CALL_STATUS[disp] || 'CONNECTED', disposition: disp, notes: notes.trim(), followUpAt: d?.outcome === 'FOLLOW_UP' && follow ? new Date(follow).toISOString() : undefined, clientId: crypto.randomUUID() });
//       toast.ok('Saved'); reset(); setPickId(null); await Promise.all([queue.reload(true), stats.reload(true)]);
//     } catch (e) { toast.err(errMsg(e)); } finally { setBusy(false); }
//   };
//   const s = stats.data;
//   return (
//     <div className="space-y-5">
//       <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
//         <StatCard tone="blue" icon={<Phone />} label="Calls Today" value={s?.callsToday ?? '–'} /><StatCard tone="green" icon={<Clock />} label="Talk Time" value={s ? fmtTalk(s.talkTimeToday) : '–'} />
//         <StatCard tone="purple" icon={<TrendingUp />} label="Success Rate" value={s ? `${s.successRate}%` : '–'} /><StatCard tone="yellow" icon={<Hourglass />} label="Pending" value={s?.pending ?? '–'} />
//       </div>
//       {queue.loading && !queue.data ? <Loading /> : queue.error ? <ErrorState msg={queue.error} retry={queue.reload} /> : !cur ? (
//         <div className="card"><Empty text="Your queue is empty" hint="New contacts appear here as soon as your admin assigns them." /></div>
//       ) : (
//         <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
//           <div className="space-y-4">
//             {phase === 'calling' && <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600" role="status"><i className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />CALL IN PROGRESS ({fmtDuration(secs)})</div>}
//             <section className="card space-y-3 p-5">
//               <dl className="grid grid-cols-[110px_1fr] gap-y-2.5 rounded-xl border border-slate-100 p-4 text-sm">
//                 <dt className="flex items-center gap-2 text-slate-500"><UserIcon size={15} />Customer :</dt><dd className="font-semibold">{cur.name}</dd>
//                 <dt className="flex items-center gap-2 text-slate-500"><Building2 size={15} />Company :</dt><dd>{cur.company || '—'}</dd>
//                 <dt className="flex items-center gap-2 text-slate-500"><Phone size={15} />Phone :</dt><dd className="font-semibold">{cur.phone}</dd>
//                 <dt className="flex items-center gap-2 text-slate-500"><FileText size={15} />Last Note :</dt><dd className="italic">{cur.lastNote ? `“${cur.lastNote}”` : 'No previous notes'}</dd>
//                 {cur.followUpAt && <><dt className="flex items-center gap-2 text-slate-500"><CalendarClock size={15} />Follow-up :</dt><dd>{new Date(cur.followUpAt).toLocaleString()}</dd></>}
//               </dl>
//               <div className="grid grid-cols-2 gap-3">
//                 <button className="btn-green !py-3" disabled={phase === 'calling'} onClick={call}><PhoneCall size={18} />{phase === 'ended' ? 'Call again' : 'Call'}</button>
//                 <button className="btn-red !py-3" disabled={phase !== 'calling'} onClick={hangup}><PhoneOff size={18} />End</button>
//               </div>
//               <p className="text-[11px] text-slate-400">Call opens your device dialer. The timer measures talk time from Call to End.</p>
//             </section>
//             <section className="card space-y-3 p-5">
//               <h2 className="flex items-center gap-2 font-bold"><Save size={16} className="text-brand-600" />Call Disposition <span className="text-xs font-normal text-slate-500">(Required after call ends)</span></h2>
//               <label className="block"><span className="label">Status <b className="text-red-500">*</b></span>
//                 <select className={`input ${disp ? '!bg-green-50' : ''}`} value={disp} onChange={(e) => setDisp(e.target.value)}><option value="">Select status…</option>{cfg.data?.dispositions.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></label>
//               {d?.outcome === 'FOLLOW_UP' && <label className="block"><span className="label">Follow-up on</span><input type="datetime-local" className="input" value={follow} onChange={(e) => setFollow(e.target.value)} /></label>}
//               <label className="block"><span className="label">Notes <b className="text-red-500">*</b></span><textarea className="input min-h-[90px]" maxLength={2000} placeholder="Add call summary here..." value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
//               <button className="btn-primary w-full !py-3" disabled={busy || phase === 'calling'} onClick={save}>{busy ? <Spinner className="!text-white" /> : <Save size={16} />}Save Status &amp; Get Next Contact</button>
//             </section>
//           </div>
//           <section className="card h-fit p-5"><h2 className="mb-3 flex items-center gap-2 font-bold"><ListOrdered size={16} className="text-brand-600" />Next in Queue</h2>
//             {next.length ? <ul className="divide-y divide-slate-100">{next.map((c, i) => (
//               <li key={c._id}><button onClick={() => pick(c._id)} className="flex w-full items-center gap-3 py-3 text-left text-sm hover:bg-slate-50"><span className="w-4 text-slate-400">{i + 1}</span><span className="flex-1"><b className="block">{c.name}</b><span className="text-xs text-slate-500">{c.phone}</span></span><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${PRIORITY[c.priority].cls}`}>{PRIORITY[c.priority].label}</span></button></li>))}</ul> : <p className="py-4 text-sm text-slate-400">This is your last contact in the queue.</p>}
//           </section>
//         </div>)}
//     </div>
//   );
// }
