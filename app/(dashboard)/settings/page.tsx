'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Download, Key, Phone, Mail, TestTube } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 text-slate hover:text-charcoal transition-colors" title="Copy">
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
}

const webhookEndpoints = [
  { name: 'Contact Form', path: '/api/webhooks/contact-form', description: 'Captures contact form submissions from /contact' },
  { name: 'Consulting Inquiry', path: '/api/webhooks/consulting-inquiry', description: 'Captures consulting inquiry submissions from /consulting' },
  { name: 'Accelerator Waitlist', path: '/api/webhooks/accelerator-waitlist', description: 'Captures Accelerator waitlist signups from /accelerator' },
  { name: 'Subscribe', path: '/api/webhooks/subscribe', description: 'Captures newsletter & community signups (footer, community page, community section)' },
];

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('Concierge Nurse Business Society');
  const [email, setEmail] = useState('hello@conciergenursebusiness.com');
  const [timezone, setTimezone] = useState('America/New_York');

  const [resendKey, setResendKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://crm.conciergenursebusiness.com';

  return (
    <>
      <Header title="Settings" subtitle="Manage your CRM configuration and integrations" />
      <div className="p-8 max-w-4xl space-y-8">
        {/* Profile */}
        <Card>
          <h3 className="text-lg font-semibold text-charcoal mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <Input label="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: 'America/New_York', label: 'Eastern (ET)' },
                { value: 'America/Chicago', label: 'Central (CT)' },
                { value: 'America/Denver', label: 'Mountain (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
              ]}
            />
            <Button>Save Profile</Button>
          </div>
        </Card>

        {/* Integrations */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Resend */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal">Resend</h3>
                <p className="text-xs text-slate">Email delivery</p>
              </div>
            </div>
            <Input
              label="API Key"
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder="re_..."
            />
            <Button size="sm" variant="outline" className="mt-3">Connect</Button>
          </Card>

          {/* Twilio */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <Phone size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal">Twilio</h3>
                <p className="text-xs text-slate">SMS delivery</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input label="Account SID" value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} placeholder="AC..." />
              <Input label="Auth Token" type="password" value={twilioToken} onChange={(e) => setTwilioToken(e.target.value)} />
              <Input label="Phone Number" value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} placeholder="+1..." />
            </div>
            <Button size="sm" variant="outline" className="mt-3">Connect</Button>
          </Card>
        </div>

        {/* Webhook URLs */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Key size={20} className="text-gold" />
            <h3 className="text-lg font-semibold text-charcoal">Webhook URLs</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate">Add these endpoints to your public website to capture form submissions.</p>
            <Link href="/settings/webhooks/test">
              <Button variant="outline" size="sm" className="gap-1.5">
                <TestTube size={14} /> Test Webhooks
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {webhookEndpoints.map(({ name, path, description }) => (
              <div key={path} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">{name}</p>
                  <p className="text-xs text-slate">{description}</p>
                  <code className="text-xs text-blue-600 break-all">{baseUrl}{path}</code>
                </div>
                <CopyButton text={`${baseUrl}${path}`} />
              </div>
            ))}
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <h3 className="text-lg font-semibold text-charcoal mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">Export All Contacts</p>
                <p className="text-xs text-slate">Download all contacts as a CSV file</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Download size={14} /> Export CSV
              </Button>
            </div>
            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Delete All Data</p>
                <p className="text-xs text-slate">Permanently delete all contacts and campaigns</p>
              </div>
              <Button variant="danger" size="sm">Delete All</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
