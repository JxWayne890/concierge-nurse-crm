'use client';

import { useState } from 'react';
import { Send, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { mockSegments } from '@/lib/mock-data';

export default function EmailComposer() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('Concierge Nurse Business Society');
  const [fromEmail, setFromEmail] = useState('hello@conciergenursebusiness.com');
  const [body, setBody] = useState('');
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  const toggleSegment = (segId: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segId) ? prev.filter((s) => s !== segId) : [...prev, segId]
    );
  };

  const totalRecipients = mockSegments
    .filter((s) => selectedSegments.includes(s.id))
    .reduce((sum, s) => sum + s.contactCount, 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Campaign details */}
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">Campaign Details</h3>
          <div className="space-y-4">
            <Input label="Campaign Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., April Newsletter" />
            <Input label="Subject Line" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Big news from CNBS!" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="From Name" value={fromName} onChange={(e) => setFromName(e.target.value)} />
              <Input label="From Email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Email body */}
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">Email Body</h3>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            placeholder="Write your email content here... (HTML supported)"
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate mt-2">
            Supports HTML. A rich text editor will be connected in a future update.
          </p>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Recipients */}
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">Recipients</h3>
          <p className="text-sm text-slate mb-3">Select segments to send to:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockSegments.map((seg) => (
              <label key={seg.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-cream rounded-lg p-2 -mx-2">
                <input
                  type="checkbox"
                  checked={selectedSegments.includes(seg.id)}
                  onChange={() => toggleSegment(seg.id)}
                  className="rounded border-gray-300"
                />
                <span className="flex-1">{seg.name}</span>
                <span className="text-xs text-slate">{seg.contactCount}</span>
              </label>
            ))}
          </div>
          {totalRecipients > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Badge variant="gold">{totalRecipients} recipients</Badge>
            </div>
          )}
        </Card>

        {/* Schedule */}
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">Schedule</h3>
          <Select
            options={[
              { value: 'now', label: 'Send immediately' },
              { value: 'later', label: 'Schedule for later' },
            ]}
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as 'now' | 'later')}
          />
          {scheduleType === 'later' && (
            <Input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="mt-3" />
          )}
        </Card>

        {/* Actions */}
        <Card>
          <div className="space-y-2">
            <Button className="w-full gap-2" disabled={!name || !subject || !body || selectedSegments.length === 0}>
              {scheduleType === 'now' ? <><Send size={14} /> Send Campaign</> : <><Clock size={14} /> Schedule Campaign</>}
            </Button>
            <Button variant="outline" className="w-full">Save as Draft</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
