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
import { getCharacterCount } from '@/lib/twilio';

export default function SMSComposer() {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  const { characters, segments: smsSegments } = getCharacterCount(body);

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
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">SMS Campaign Details</h3>
          <div className="space-y-4">
            <Input label="Campaign Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Workshop Reminder" />
            <div>
              <Textarea
                label="Message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Hey {firstName}! Your message here..."
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-slate">
                  {characters} characters · {smsSegments} SMS segment{smsSegments !== 1 ? 's' : ''}
                </p>
                {characters > 1600 && (
                  <p className="text-xs text-red-600">Message is very long</p>
                )}
              </div>
            </div>
            <p className="text-xs text-slate">
              Use {'{firstName}'} to personalize. Only contacts with phone numbers will receive SMS.
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">Recipients</h3>
          <p className="text-sm text-slate mb-3">Select segments:</p>
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
              <Badge variant="gold">{totalRecipients} recipients (with phone)</Badge>
            </div>
          )}
        </Card>

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

        <Card>
          <div className="space-y-2">
            <Button className="w-full gap-2" disabled={!name || !body || selectedSegments.length === 0}>
              {scheduleType === 'now' ? <><Send size={14} /> Send SMS</> : <><Clock size={14} /> Schedule SMS</>}
            </Button>
            <Button variant="outline" className="w-full">Save as Draft</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
