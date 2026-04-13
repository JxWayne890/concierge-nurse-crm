'use client';

import { Users, UserPlus, Send, MailOpen } from 'lucide-react';
import Card from '@/components/ui/Card';

interface StatCardsProps {
  totalContacts: number;
  newThisWeek: number;
  activeCampaigns: number;
  openRate: number;
}

const stats = [
  { key: 'totalContacts', label: 'Total Contacts', icon: Users, format: (v: number) => v.toLocaleString() },
  { key: 'newThisWeek', label: 'New This Week', icon: UserPlus, format: (v: number) => `+${v}` },
  { key: 'activeCampaigns', label: 'Active Campaigns', icon: Send, format: (v: number) => v.toString() },
  { key: 'openRate', label: 'Open Rate', icon: MailOpen, format: (v: number) => `${v}%` },
] as const;

export default function StatCards(props: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, format }) => (
        <Card key={key}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate">{label}</p>
              <p className="mt-1 text-3xl font-bold text-charcoal">{format(props[key])}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon size={24} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
