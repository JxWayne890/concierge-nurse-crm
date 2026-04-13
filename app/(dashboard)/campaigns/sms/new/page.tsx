'use client';

import Header from '@/components/layout/Header';
import SMSComposer from '@/components/campaigns/SMSComposer';

export default function NewSMSCampaignPage() {
  return (
    <>
      <Header title="New SMS Campaign" subtitle="Compose and send an SMS campaign via Twilio" />
      <div className="p-8">
        <SMSComposer />
      </div>
    </>
  );
}
