import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
type T = { id: number; msg: string; ok: boolean };
const Ctx = createContext<{ ok: (m: string) => void; err: (m: string) => void }>(null!);
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<T[]>([]);
  const push = useCallback((msg: string, ok: boolean) => { const id = Date.now() + Math.random(); setList((l) => [...l, { id, msg, ok }]); setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4000); }, []);
  return (
    <Ctx.Provider value={{ ok: (m) => push(m, true), err: (m) => push(m, false) }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`flex max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${t.ok ? 'bg-green-600' : 'bg-red-600'}`}>
            {t.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}{t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}


//------- 12.11.2026 ---------
// import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
// import { CheckCircle2, XCircle } from 'lucide-react';
// type T = { id: number; msg: string; ok: boolean };
// const Ctx = createContext<{ ok: (m: string) => void; err: (m: string) => void }>(null!);
// export const useToast = () => useContext(Ctx);
// export function ToastProvider({ children }: { children: ReactNode }) {
//   const [list, setList] = useState<T[]>([]);
//   const push = useCallback((msg: string, ok: boolean) => { const id = Date.now() + Math.random(); setList((l) => [...l, { id, msg, ok }]); setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4000); }, []);
//   return (
//     <Ctx.Provider value={{ ok: (m) => push(m, true), err: (m) => push(m, false) }}>
//       {children}
//       <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
//         {list.map((t) => (
//           <div key={t.id} className={`flex max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${t.ok ? 'bg-green-600' : 'bg-red-600'}`}>
//             {t.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}{t.msg}
//           </div>
//         ))}
//       </div>
//     </Ctx.Provider>
//   );
// }
