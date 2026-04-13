'use client';

import { ArrowLeft, MessageSquare, Users, AlertTriangle, UserMinus } from 'lucide-react';
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

export default function SMSCampaignDetailClient({ campaignId }: { campaignId: string }) {
  const campaign = mockCampaigns.find((c) => c.id === campaignId && c.type === 'sms');

  if (!campaign) {
    return (
      <>
        <Header title="Campaign Not Found" />
        <div className="p-8"><p className="text-slate">SMS campaign not found.</p></div>
      </>
    );
  }

  return (
    <>
      <Header title={campaign.name} />
      <div className="p-8 space-y-6">
        <Link href="/campaigns" className="inline-flex items-center gap-1 text-sm text-slate hover:text-charcoal">
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>

        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
          {campaign.sentAt && <span className="text-sm text-slate">Sent {new Date(campaign.sentAt).toLocaleString()}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <div className="flex flex-col items-center">
              <MessageSquare size={20} className="mb-2 text-green-600" />
              <p className="text-2xl font-bold">{campaign.stats.sent}</p>
              <p className="text-xs text-slate">Sent</p>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col items-center">
              <Users size={20} className="mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{campaign.stats.delivered}</p>
              <p className="text-xs text-slate">Delivered</p>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col items-center">
              <AlertTriangle size={20} className="mb-2 text-red-600" />
              <p className="text-2xl font-bold">{campaign.stats.bounced}</p>
              <p className="text-xs text-slate">Failed</p>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col items-center">
              <UserMinus size={20} className="mb-2 text-gray-600" />
              <p className="text-2xl font-bold">{campaign.stats.unsubscribed}</p>
              <p className="text-xs text-slate">Unsubscribed</p>
            </div>
          </Card>
        </div>

        <Card>
          <p className="text-sm text-slate mb-1">Delivery Rate</p>
          <p className="text-3xl font-bold text-charcoal">{campaign.stats.deliveryRate}%</p>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-3">Message</h3>
          <div className="rounded-lg bg-cream p-4 text-sm whitespace-pre-wrap">{campaign.body}</div>
        </Card>

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
