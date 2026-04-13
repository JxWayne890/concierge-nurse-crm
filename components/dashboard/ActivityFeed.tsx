'use client';

import {
  UserPlus,
  Mail,
  MousePointerClick,
  FileText,
  Upload,
  Send,
  StickyNote,
  ArrowRightLeft,
} from 'lucide-react';
import type { ActivityLogEntry } from '@/lib/types';

const iconMap: Record<ActivityLogEntry['type'], typeof UserPlus> = {
  signup: UserPlus,
  email_open: Mail,
  email_click: MousePointerClick,
  form_submission: FileText,
  import: Upload,
  campaign_sent: Send,
  note_added: StickyNote,
  status_change: ArrowRightLeft,
};

const colorMap: Record<ActivityLogEntry['type'], string> = {
  signup: 'text-green-600 bg-green-50',
  email_open: 'text-blue-600 bg-blue-50',
  email_click: 'text-purple-600 bg-purple-50',
  form_submission: 'text-gold bg-gold/10',
  import: 'text-teal-600 bg-teal-50',
  campaign_sent: 'text-indigo-600 bg-indigo-50',
  note_added: 'text-amber-600 bg-amber-50',
  status_change: 'text-slate bg-gray-100',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ActivityFeed({ activities }: { activities: ActivityLogEntry[] }) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = iconMap[activity.type];
        const colors = colorMap[activity.type];
        return (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-charcoal">{activity.description}</p>
              <p className="text-xs text-slate mt-0.5">{timeAgo(activity.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
