'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

type EndpointKey = 'contact-form' | 'consulting-inquiry' | 'accelerator-waitlist' | 'subscribe';

const endpoints: { value: EndpointKey; label: string }[] = [
  { value: 'contact-form', label: 'Contact Form' },
  { value: 'consulting-inquiry', label: 'Consulting Inquiry' },
  { value: 'accelerator-waitlist', label: 'Accelerator Waitlist' },
  { value: 'subscribe', label: 'Newsletter / Subscribe' },
];

const examplePayloads: Record<EndpointKey, object> = {
  'contact-form': {
    source: 'contact_form',
    submitted_at: new Date().toISOString(),
    page_url: '/contact',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    referrer: null,
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane.doe@example.com',
    interest: 'clarity_consult',
    message: 'I would love to learn more about starting a concierge nursing business.',
  },
  'consulting-inquiry': {
    source: 'consulting_inquiry',
    submitted_at: new Date().toISOString(),
    page_url: '/consulting',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    referrer: null,
    full_name: 'Michelle Carter',
    email: 'michelle.carter@example.com',
    business_name: 'Carter Concierge Nursing LLC',
    annual_revenue: '$85,000',
    biggest_challenge: 'Scaling beyond solo practice while maintaining quality of care.',
  },
  'accelerator-waitlist': {
    source: 'accelerator_waitlist',
    submitted_at: new Date().toISOString(),
    page_url: '/accelerator',
    utm_source: 'instagram',
    utm_medium: 'social',
    utm_campaign: 'cohort2_launch',
    referrer: 'https://instagram.com',
    full_name: 'Aisha Johnson',
    email: 'aisha.j@example.com',
  },
  subscribe: {
    source: 'community_page',
    submitted_at: new Date().toISOString(),
    page_url: '/community',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    referrer: null,
    first_name: 'Lauren',
    email: 'lauren.w@example.com',
  },
};

interface TestResult {
  status: number;
  body: unknown;
  duration: number;
}

export default function WebhookTestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointKey>('contact-form');
  const [payload, setPayload] = useState(JSON.stringify(examplePayloads['contact-form'], null, 2));
  const [webhookSecret, setWebhookSecret] = useState('dev-webhook-secret');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEndpointChange = (value: string) => {
    const key = value as EndpointKey;
    setSelectedEndpoint(key);
    setPayload(JSON.stringify(examplePayloads[key], null, 2));
    setResult(null);
  };

  const handleSend = async () => {
    setLoading(true);
    setResult(null);

    const start = performance.now();
    try {
      const res = await fetch(`/api/webhooks/${selectedEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret,
        },
        body: payload,
      });

      const body = await res.json();
      const duration = Math.round(performance.now() - start);
      setResult({ status: res.status, body, duration });
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setResult({ status: 0, body: { error: String(err) }, duration });
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = result
    ? result.status >= 200 && result.status < 300
      ? <CheckCircle size={18} className="text-green-600" />
      : result.status >= 400
        ? <XCircle size={18} className="text-red-600" />
        : <AlertCircle size={18} className="text-yellow-600" />
    : null;

  const statusColor = result
    ? result.status >= 200 && result.status < 300
      ? 'bg-green-50 border-green-200'
      : result.status >= 400
        ? 'bg-red-50 border-red-200'
        : 'bg-yellow-50 border-yellow-200'
    : '';

  return (
    <>
      <Header title="Webhook Tester" subtitle="Test your webhook endpoints with example payloads" />
      <div className="p-8 max-w-4xl space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Endpoint"
                value={selectedEndpoint}
                onChange={(e) => handleEndpointChange(e.target.value)}
                options={endpoints}
              />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Webhook Secret
                </label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-charcoal">
                  Request Body
                </label>
                <span className="text-xs text-slate">
                  POST /api/webhooks/{selectedEndpoint}
                </span>
              </div>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono bg-gray-50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                spellCheck={false}
              />
            </div>

            <Button onClick={handleSend} disabled={loading} className="gap-2">
              <Play size={16} />
              {loading ? 'Sending...' : 'Send Test Request'}
            </Button>
          </div>
        </Card>

        {result && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              {statusIcon}
              <h3 className="font-semibold text-charcoal">Response</h3>
              <span className={`ml-auto text-sm font-mono px-2 py-0.5 rounded border ${statusColor}`}>
                {result.status}
              </span>
              <span className="text-xs text-slate">{result.duration}ms</span>
            </div>
            <pre className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </>
  );
}
