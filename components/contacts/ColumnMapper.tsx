'use client';

import Select from '@/components/ui/Select';
import { CRM_FIELDS } from '@/lib/csv-parser';
import type { ColumnMapping } from '@/lib/types';

interface ColumnMapperProps {
  mappings: ColumnMapping[];
  onChange: (mappings: ColumnMapping[]) => void;
}

export default function ColumnMapper({ mappings, onChange }: ColumnMapperProps) {
  const handleChange = (index: number, crmField: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], crmField: crmField || null };
    onChange(updated);
  };

  const options = CRM_FIELDS.map((f) => ({
    value: f.value ?? '',
    label: f.label,
  }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-medium text-slate mb-2">
        <span>CSV Column</span>
        <span />
        <span>CRM Field</span>
      </div>
      {mappings.map((mapping, i) => (
        <div key={mapping.csvColumn} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-charcoal">
            {mapping.csvColumn}
          </div>
          <span className="text-slate">→</span>
          <Select
            options={options}
            value={mapping.crmField ?? ''}
            onChange={(e) => handleChange(i, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
