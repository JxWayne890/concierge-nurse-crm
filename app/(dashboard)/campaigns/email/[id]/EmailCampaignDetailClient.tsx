'use client';

import { ArrowLeft, Mail, Users, Eye, MousePointerClick, AlertTriangle, UserMinus } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { mockCampaigns } from '@/lib/mock-data';
import type { CampaignStatus } from '@/lib/types';

const statusVariant: Record<CampaignStatus, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  scheduled: 'warning',
  sending: 'info',
  sent: 'success',
};

export default function EmailCampaignDetailClient({ campaignId }: { campaignId: string }) {
  const campaign = mockCampaigns.find((c) => c.id === campaignId && c.type === 'email');

  if (!campaign) {
    return (
      <>
        <Header title="Campaign Not Found" />
        <div className="p-8"><p className="text-slate">Campaign not found.</p></div>
      </>
    );
  }

  const stats = [
    { label: 'Sent', value: campaign.stats.sent, icon: Mail, color: 'text-blue-600 bg-blue-50' },
    { label: 'Delivered', value: campaign.stats.delivered, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Opened', value: campaign.stats.opened, icon: Eye, color: 'text-purple-600 bg-purple-50' },
    { label: 'Clicked', value: campaign.stats.clicked, icon: MousePointerClick, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Bounced', value: campaign.stats.bounced, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: 'Unsubscribed', value: campaign.stats.unsubscribed, icon: UserMinus, color: 'text-gray-600 bg-gray-50' },
  ];

  return (
    <>
      <Header title={campaign.name} subtitle={campaign.subject} />
      <div className="p-8 space-y-6">
        <Link href="/campaigns" className="inline-flex items-center gap-1 text-sm text-slate hover:text-charcoal">
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>

        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
          {campaign.sentAt && <span className="text-sm text-slate">Sent {new Date(campaign.sentAt).toLocaleString()}</span>}
          {campaign.scheduledAt && campaign.status === 'scheduled' && (
            <span className="text-sm text-slate">Scheduled for {new Date(campaign.scheduledAt).toLocaleString()}</span>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <div className="flex flex-col items-center text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-2 ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-bold text-charcoal">{value}</p>
                <p className="text-xs text-slate">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Rates */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-slate">Open Rate</p>
            <p className="text-3xl font-bold text-charcoal">{campaign.stats.openRate}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate">Click Rate</p>
            <p className="text-3xl font-bold text-charcoal">{campaign.stats.clickRate}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate">Delivery Rate</p>
            <p className="text-3xl font-bold text-charcoal">{campaign.stats.deliveryRate}%</p>
          </Card>
        </div>

        {/* Segments */}
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-3">Sent To</h3>
          <div className="flex flex-wrap gap-2">
            {campaign.recipientSegments.map((seg) => (
              <Badge key={seg} variant="gold">{seg}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
