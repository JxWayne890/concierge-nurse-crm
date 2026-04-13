'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Stub: NextAuth.js will handle this
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gold text-navy text-xl font-bold mb-4">
            CN
          </div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
            Concierge Nurse CRM
          </h1>
          <p className="text-slate-light mt-1 text-sm">Sign in to manage your contacts & campaigns</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@conciergenursebusiness.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm text-gold hover:text-gold-dark">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-light mt-6">
          Concierge Nurse Business Society CRM
        </p>
      </div>
    </div>
  );
}
