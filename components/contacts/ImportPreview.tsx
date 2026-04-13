'use client';

import type { CSVImportRow } from '@/lib/types';

interface ImportPreviewProps {
  headers: string[];
  rows: CSVImportRow[];
  maxRows?: number;
}

export default function ImportPreview({ headers, rows, maxRows = 10 }: ImportPreviewProps) {
  const previewRows = rows.slice(0, maxRows);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-medium text-slate w-10">#</th>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium text-slate whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td className="px-3 py-2 text-slate">{i + 1}</td>
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-charcoal whitespace-nowrap max-w-[200px] truncate">
                  {row[h] || <span className="text-slate-light italic">empty</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div className="px-3 py-2 text-xs text-slate bg-gray-50 border-t border-gray-200">
          Showing {maxRows} of {rows.length} rows
        </div>
      )}
    </div>
  );
}
