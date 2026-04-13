'use client';

import Link from 'next/link';
import { Mail, MessageSquare, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import CampaignList from '@/components/campaigns/CampaignList';
import Button from '@/components/ui/Button';
import { mockCampaigns } from '@/lib/mock-data';

export default function CampaignsPage() {
  return (
    <>
      <Header
        title="Campaigns"
        subtitle={`${mockCampaigns.length} campaigns`}
        actions={
          <div className="flex gap-2">
            <Link href="/campaigns/email/new">
              <Button size="sm" className="gap-1">
                <Mail size={14} /> New Email
              </Button>
            </Link>
            <Link href="/campaigns/sms/new">
              <Button variant="secondary" size="sm" className="gap-1">
                <MessageSquare size={14} /> New SMS
              </Button>
            </Link>
          </div>
        }
      />
      <div className="p-8">
        <CampaignList campaigns={mockCampaigns} />
      </div>
    </>
  );
}
