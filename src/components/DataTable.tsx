import { ReactNode } from 'react';
import { Empty, ErrorState, Loading, Pagination } from './ui';
import { Page } from '../types';

export interface Col<T> { head: ReactNode; cell: (r: T, i: number) => ReactNode; className?: string }
export function DataTable<T extends { _id?: string }>({ cols, page, loading, error, reload, onPage, empty, rowKey, onRow }: {
  cols: Col<T>[]; page: Page<T> | null; loading: boolean; error: string; reload: () => void; onPage?: (p: number) => void; empty?: string; rowKey?: (r: T) => string; onRow?: (r: T) => void;
}) {
  if (error) return <ErrorState msg={error} retry={reload} />;
  return (
    <div>
      <div className="overflow-x-auto px-3 sm:px-5">
        <table className="w-full min-w-[720px]">
          <thead><tr>{cols.map((c, i) => <th key={i} className={c.className}>{c.head}</th>)}</tr></thead>
          <tbody>
            {page?.items.map((r, i) => (
              <tr key={rowKey ? rowKey(r) : r._id} className={`transition-colors ${onRow ? 'cursor-pointer' : ''} hover:bg-brand-50/50`} onClick={() => onRow?.(r)}>
                {cols.map((c, j) => <td key={j} className={c.className}>{c.cell(r, i)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && !page && <Loading />}
      {!loading && page && !page.items.length && <Empty text={empty || 'No records found'} hint="Try changing the search or filters." />}
      {page && onPage && <Pagination page={page} onChange={onPage} />}
    </div>
  );
}
