import EmailCampaignDetailClient from './EmailCampaignDetailClient';

export default async function EmailCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmailCampaignDetailClient campaignId={id} />;
}
