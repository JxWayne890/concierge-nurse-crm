'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Download, Trash2, Tag } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import type { Contact, ContactStatus } from '@/lib/types';

const statusVariant: Record<ContactStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  unconfirmed: 'warning',
  unsubscribed: 'default',
  bounced: 'danger',
};

interface ContactsTableProps {
  contacts: Contact[];
}

export default function ContactsTable({ contacts }: ContactsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = contacts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter);
    if (sourceFilter !== 'all') result = result.filter((c) => c.source === sourceFilter);

    result = [...result].sort((a, b) => {
      const aVal = a[sortKey as keyof Contact] ?? '';
      const bVal = b[sortKey as keyof Contact] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [contacts, search, statusFilter, sourceFilter, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const columns = [
    {
      key: 'select',
      header: '',
      className: 'w-10',
      render: (c: Contact) => (
        <input
          type="checkbox"
          checked={selectedIds.has(c.id)}
          onChange={(e) => { e.stopPropagation(); toggleSelect(c.id); }}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (c: Contact) => (
        <div>
          <p className="font-medium text-charcoal">{c.firstName} {c.lastName}</p>
          <p className="text-xs text-slate">{c.email}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (c: Contact) => <Badge variant={statusVariant[c.status]}>{c.status}</Badge>,
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (c: Contact) => <span className="text-sm text-slate">{c.source}</span>,
    },
    {
      key: 'segments',
      header: 'Segments',
      render: (c: Contact) => (
        <div className="flex flex-wrap gap-1">
          {c.segments.slice(0, 2).map((s) => (
            <Badge key={s} variant="gold">{s}</Badge>
          ))}
          {c.segments.length > 2 && (
            <Badge variant="default">+{c.segments.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'lifecycleStage',
      header: 'Stage',
      sortable: true,
      render: (c: Contact) => <span className="text-sm text-slate">{c.lifecycleStage || '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Added',
      sortable: true,
      render: (c: Contact) => (
        <span className="text-sm text-slate">{new Date(c.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-light px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-slate-light px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Sources</option>
            <option value="manualUpload">Manual Upload</option>
            <option value="webhook">Webhook</option>
            <option value="csvImport">CSV Import</option>
            <option value="formSubmission">Form Submission</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-navy/5 px-4 py-2">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" className="gap-1"><Tag size={14} /> Tag</Button>
          <Button size="sm" variant="outline" className="gap-1"><Download size={14} /> Export</Button>
          <Button size="sm" variant="danger" className="gap-1"><Trash2 size={14} /> Delete</Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-sm text-slate hover:text-charcoal">
            Clear
          </button>
        </div>
      )}

      {/* Table header checkbox */}
      <div className="text-sm text-slate flex items-center gap-2 px-1">
        <input
          type="checkbox"
          checked={selectedIds.size === filtered.length && filtered.length > 0}
          onChange={toggleAll}
          className="rounded border-gray-300"
        />
        <span>{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <Table
        columns={columns}
        data={filtered}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(item) => router.push(`/contacts/${item.id}`)}
      />
    </div>
  );
}
