import SMSCampaignDetailClient from './SMSCampaignDetailClient';

export default async function SMSCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SMSCampaignDetailClient campaignId={id} />;
}
