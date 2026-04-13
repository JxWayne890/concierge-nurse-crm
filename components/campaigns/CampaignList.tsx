'use client';

import { useRouter } from 'next/navigation';
import { Mail, MessageSquare } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import type { Campaign, CampaignStatus } from '@/lib/types';

const statusVariant: Record<CampaignStatus, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  scheduled: 'warning',
  sending: 'info',
  sent: 'success',
};

export default function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();

  const columns = [
    {
      key: 'type',
      header: '',
      className: 'w-10',
      render: (c: Campaign) => (
        c.type === 'email'
          ? <Mail size={16} className="text-blue-500" />
          : <MessageSquare size={16} className="text-green-500" />
      ),
    },
    {
      key: 'name',
      header: 'Campaign',
      sortable: true,
      render: (c: Campaign) => (
        <div>
          <p className="font-medium text-charcoal">{c.name}</p>
          {c.subject && <p className="text-xs text-slate mt-0.5">{c.subject}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (c: Campaign) => <Badge variant={statusVariant[c.status]}>{c.status}</Badge>,
    },
    {
      key: 'recipientCount',
      header: 'Recipients',
      sortable: true,
      render: (c: Campaign) => <span className="text-sm">{c.recipientCount}</span>,
    },
    {
      key: 'stats',
      header: 'Performance',
      render: (c: Campaign) => {
        if (c.status === 'draft') return <span className="text-sm text-slate">—</span>;
        if (c.type === 'sms') {
          return <span className="text-sm">{c.stats.deliveryRate}% delivered</span>;
        }
        return (
          <div className="text-sm">
            <span className="text-green-600">{c.stats.openRate}% open</span>
            <span className="text-slate mx-1">·</span>
            <span className="text-blue-600">{c.stats.clickRate}% click</span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (c: Campaign) => (
        <span className="text-sm text-slate">{new Date(c.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={campaigns}
      onRowClick={(item) => {
        router.push(`/campaigns/${item.type}/${item.id}`);
      }}
      emptyMessage="No campaigns yet"
    />
  );
}
