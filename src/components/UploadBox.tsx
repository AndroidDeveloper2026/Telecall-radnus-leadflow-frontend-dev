import { useRef, useState } from 'react';
import { CloudUpload, FolderOpen, Zap, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { errMsg } from '../utils/format';
import { Spinner } from './ui';

export interface UploadResult { totalRows: number; inserted: number; duplicates: number; invalid: number; errors: { row: number; reason: string }[]; distribution: { total: number; distribution: { assigned: number }[] } | null }

/** Drag & drop + distribution options, matching the dashboard reference. */
export default function UploadBox({ onDone, compact }: { onDone: (r: UploadResult, mode: 'equal' | 'manual') => void; compact?: boolean }) {
  const [file, setFile] = useState<File | null>(null); const [mode, setMode] = useState<'equal' | 'manual'>('equal'); const [busy, setBusy] = useState(false); const [over, setOver] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null); const input = useRef<HTMLInputElement>(null); const toast = useToast();
  const pick = (f?: File) => { if (!f) return; if (!/\.(csv|xlsx|xls)$/i.test(f.name)) return toast.err('Only .csv, .xls and .xlsx files are supported'); if (f.size > 10 * 1024 * 1024) return toast.err('File must be under 10 MB'); setFile(f); setResult(null); };
  const submit = async () => {
    if (!file) return toast.err('Choose a file first');
    setBusy(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('distribute', String(mode === 'equal'));
      const r = (await api.post<UploadResult>('/uploads/contacts', fd)).data; setResult(r); setFile(null);
      toast.ok(`${r.inserted} contacts imported${r.distribution ? ' and distributed' : ''}`); onDone(r, mode);
    } catch (e) { toast.err(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[1fr_280px]'}`}>
      <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${over ? 'border-brand-500 bg-brand-50' : 'border-brand-300 bg-brand-50/30'}`}>
        {file ? <FileSpreadsheet size={44} className="text-green-600" /> : <CloudUpload size={44} className="text-slate-400" />}
        <p className="text-sm font-semibold">{file ? file.name : 'Drag & Drop CSV/Excel File Here'}</p>
        {!file && <p className="text-xs text-slate-400">or</p>}
        <input ref={input} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        <button className="btn-primary" onClick={() => input.current?.click()}><FolderOpen size={16} />Browse Files</button>
        <p className="text-[11px] text-slate-400">Columns: name, phone (required), email, company, city</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="mb-3 text-sm font-bold">Distribution Options</p>
        {([['equal', 'Distribute Equally'], ['manual', 'Manual Assignment']] as const).map(([v, l]) => (
          <label key={v} className="mb-2 flex cursor-pointer items-center gap-2 text-sm"><input type="radio" className="h-4 w-4 accent-blue-600" checked={mode === v} onChange={() => setMode(v)} />{l}</label>
        ))}
        <button className="btn-green mt-3 w-full" disabled={busy || !file} onClick={submit}>{busy ? <Spinner className="!text-white" /> : <Zap size={16} />}{mode === 'equal' ? 'Distribute Contacts' : 'Import Contacts'}</button>
        {result && (
          <div className="mt-3 rounded-lg bg-white p-3 text-xs text-slate-600" role="status">
            <p><b className="text-green-600">{result.inserted}</b> imported · <b className="text-amber-600">{result.duplicates}</b> duplicates · <b className="text-red-600">{result.invalid}</b> invalid</p>
            {result.errors.slice(0, 4).map((e) => <p key={e.row} className="text-red-500">Row {e.row}: {e.reason}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}


//-------- 12.11.2026 ----------------
// import { useRef, useState } from 'react';
// import { CloudUpload, FolderOpen, Zap, FileSpreadsheet } from 'lucide-react';
// import { api } from '../services/api';
// import { useToast } from '../contexts/ToastContext';
// import { errMsg } from '../utils/format';
// import { Spinner } from './ui';

// export interface UploadResult { totalRows: number; inserted: number; duplicates: number; invalid: number; errors: { row: number; reason: string }[]; distribution: { total: number; distribution: { assigned: number }[] } | null }

// /** Drag & drop + distribution options, matching the dashboard reference. */
// export default function UploadBox({ onDone, compact }: { onDone: (r: UploadResult, mode: 'equal' | 'manual') => void; compact?: boolean }) {
//   const [file, setFile] = useState<File | null>(null); const [mode, setMode] = useState<'equal' | 'manual'>('equal'); const [busy, setBusy] = useState(false); const [over, setOver] = useState(false);
//   const [result, setResult] = useState<UploadResult | null>(null); const input = useRef<HTMLInputElement>(null); const toast = useToast();
//   const pick = (f?: File) => { if (!f) return; if (!/\.(csv|xlsx|xls)$/i.test(f.name)) return toast.err('Only .csv, .xls and .xlsx files are supported'); if (f.size > 10 * 1024 * 1024) return toast.err('File must be under 10 MB'); setFile(f); setResult(null); };
//   const submit = async () => {
//     if (!file) return toast.err('Choose a file first');
//     setBusy(true);
//     try {
//       const fd = new FormData(); fd.append('file', file); fd.append('distribute', String(mode === 'equal'));
//       const r = (await api.post<UploadResult>('/uploads/contacts', fd)).data; setResult(r); setFile(null);
//       toast.ok(`${r.inserted} contacts imported${r.distribution ? ' and distributed' : ''}`); onDone(r, mode);
//     } catch (e) { toast.err(errMsg(e)); } finally { setBusy(false); }
//   };
//   return (
//     <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[1fr_280px]'}`}>
//       <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
//         className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${over ? 'border-brand-500 bg-brand-50' : 'border-brand-300 bg-brand-50/30'}`}>
//         {file ? <FileSpreadsheet size={44} className="text-green-600" /> : <CloudUpload size={44} className="text-slate-400" />}
//         <p className="text-sm font-semibold">{file ? file.name : 'Drag & Drop CSV/Excel File Here'}</p>
//         {!file && <p className="text-xs text-slate-400">or</p>}
//         <input ref={input} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
//         <button className="btn-primary" onClick={() => input.current?.click()}><FolderOpen size={16} />Browse Files</button>
//         <p className="text-[11px] text-slate-400">Columns: name, phone (required), email, company, city</p>
//       </div>
//       <div className="rounded-xl bg-slate-50 p-4">
//         <p className="mb-3 text-sm font-bold">Distribution Options</p>
//         {([['equal', 'Distribute Equally'], ['manual', 'Manual Assignment']] as const).map(([v, l]) => (
//           <label key={v} className="mb-2 flex cursor-pointer items-center gap-2 text-sm"><input type="radio" className="h-4 w-4 accent-blue-600" checked={mode === v} onChange={() => setMode(v)} />{l}</label>
//         ))}
//         <button className="btn-green mt-3 w-full" disabled={busy || !file} onClick={submit}>{busy ? <Spinner className="!text-white" /> : <Zap size={16} />}{mode === 'equal' ? 'Distribute Contacts' : 'Import Contacts'}</button>
//         {result && (
//           <div className="mt-3 rounded-lg bg-white p-3 text-xs text-slate-600" role="status">
//             <p><b className="text-green-600">{result.inserted}</b> imported · <b className="text-amber-600">{result.duplicates}</b> duplicates · <b className="text-red-600">{result.invalid}</b> invalid</p>
//             {result.errors.slice(0, 4).map((e) => <p key={e.row} className="text-red-500">Row {e.row}: {e.reason}</p>)}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
