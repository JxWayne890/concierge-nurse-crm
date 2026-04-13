'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gold text-navy text-xl font-bold mb-4">
            CN
          </div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
            Reset Password
          </h1>
          <p className="text-slate-light mt-1 text-sm">We&apos;ll send you a link to reset your password</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm text-charcoal">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
              </p>
              <Link href="/login">
                <Button variant="outline" className="gap-1">
                  <ArrowLeft size={14} /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@conciergenursebusiness.com"
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Send Reset Link
              </Button>
              <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-slate hover:text-charcoal">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
