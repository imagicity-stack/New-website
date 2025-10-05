import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from './button';
import { Checkbox } from './form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';

export interface DataTableColumn<T> {
  key: keyof T & string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  enableToggle?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export const DataTable = <T extends { id: string | number }>({
  data,
  columns,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
}: DataTableProps<T>) => {
  const [params, setParams] = useSearchParams();
  const [hidden, setHidden] = useState<string[]>(() => {
    const param = params.get('cols');
    return param ? param.split(',') : [];
  });

  const visibleColumns = useMemo(() => columns.filter((col) => !hidden.includes(col.key)), [columns, hidden]);

  const toggleColumn = (columnKey: string) => {
    setHidden((prev) => {
      const next = prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey];
      params.set('cols', next.join(','));
      setParams(params, { replace: true });
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{data.length} records</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Columns3 className="h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 space-y-1">
            {columns
              .filter((column) => column.enableToggle !== false)
              .map((column) => (
                <DropdownMenuItem key={column.key} onSelect={(event) => event.preventDefault()} className="justify-between">
                  <span>{column.header}</span>
                  <Checkbox checked={!hidden.includes(column.key)} onCheckedChange={() => toggleColumn(column.key)} />
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead>
            <tr className="bg-slate-100/70 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
              {visibleColumns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-200">
            {data.map((row, rowIndex) => (
              <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-white/70 dark:bg-slate-900/40' : 'bg-slate-50/60 dark:bg-slate-900/20'}>
                {visibleColumns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.accessor ? column.accessor(row) : String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-400" colSpan={visibleColumns.length}>
                  Nothing to display yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {typeof total === 'number' && total > pageSize && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800">
          <span>
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil((total ?? 0) / pageSize)}
              onClick={() => onPageChange?.(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
