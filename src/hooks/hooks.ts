import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../services/api';
import { errMsg } from '../utils/format';

export function useDebounce<T>(v: T, ms = 350) { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; }

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const seq = useRef(0);
  const run = useCallback(async (silent = false) => {
    const id = ++seq.current; if (!silent) setLoading(true); setError('');
    try { const r = await fn(); if (id === seq.current) setData(r); } catch (e) { if (id === seq.current) setError(errMsg(e)); } finally { if (id === seq.current) setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { data, loading, error, reload: run };
}

/** Subscribe to a Socket.IO event for the lifetime of the component. */
export function useSocketEvent(event: string, handler: (d: any) => void) {
  const h = useRef(handler); h.current = handler;
  useEffect(() => {
    let s = getSocket(); let tries = 0;
    const fn = (d: any) => h.current(d);
    const t = setInterval(() => { if (!s) s = getSocket(); if (s) { s.on(event, fn); clearInterval(t); } else if (++tries > 20) clearInterval(t); }, 250);
    if (s) { s.on(event, fn); clearInterval(t); }
    return () => { clearInterval(t); s?.off(event, fn); };
  }, [event]);
}


//------- 12.11.2026 -------------
// import { useCallback, useEffect, useRef, useState } from 'react';
// import { getSocket } from '../services/api';
// import { errMsg } from '../utils/format';

// export function useDebounce<T>(v: T, ms = 350) { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; }

// export function useFetch<T>(fn: () => Promise<T>, deps: unknown[]) {
//   const [data, setData] = useState<T | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
//   const seq = useRef(0);
//   const run = useCallback(async (silent = false) => {
//     const id = ++seq.current; if (!silent) setLoading(true); setError('');
//     try { const r = await fn(); if (id === seq.current) setData(r); } catch (e) { if (id === seq.current) setError(errMsg(e)); } finally { if (id === seq.current) setLoading(false); }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, deps);
//   useEffect(() => { run(); }, [run]);
//   return { data, loading, error, reload: run };
// }

// /** Subscribe to a Socket.IO event for the lifetime of the component. */
// export function useSocketEvent(event: string, handler: (d: any) => void) {
//   const h = useRef(handler); h.current = handler;
//   useEffect(() => {
//     let s = getSocket(); let tries = 0;
//     const fn = (d: any) => h.current(d);
//     const t = setInterval(() => { if (!s) s = getSocket(); if (s) { s.on(event, fn); clearInterval(t); } else if (++tries > 20) clearInterval(t); }, 250);
//     if (s) { s.on(event, fn); clearInterval(t); }
//     return () => { clearInterval(t); s?.off(event, fn); };
//   }, [event]);
// }
