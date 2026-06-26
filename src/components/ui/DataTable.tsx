import type { ReactNode } from "react";

type DataTableProps = {
  columns: string[];
  rows: ReactNode[][];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="block lg:hidden">
        <div className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <div key={index} className="space-y-4 px-5 py-5">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className="grid min-w-0 gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{columns[cellIndex]}</span>
                  <div className="min-w-0 break-words text-sm leading-6 text-slate-700">{cell}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="w-full min-w-0 max-w-full overflow-x-auto">
          <table className="w-full min-w-full table-auto divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-5 py-4 font-bold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/80">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-4 align-top whitespace-normal break-words text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
