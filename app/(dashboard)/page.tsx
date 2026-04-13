'use client';

import Link from 'next/link';
import { Plus, Send, Upload } from 'lucide-react';
import Header from '@/components/layout/Header';
import StatCards from '@/components/dashboard/StatCards';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { dashboardStats, mockActivityFeed } from '@/lib/mock-data';

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back — here's what's happening." />
      <div className="p-8 space-y-8">
        <StatCards {...dashboardStats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-charcoal mb-4">Recent Activity</h2>
              <ActivityFeed activities={mockActivityFeed} />
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-charcoal mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/contacts?action=add" className="block">
                <Button variant="primary" className="w-full justify-start gap-2">
                  <Plus size={16} /> Add Contact
                </Button>
              </Link>
              <Link href="/campaigns/email/new" className="block">
                <Button variant="secondary" className="w-full justify-start gap-2">
                  <Send size={16} /> New Campaign
                </Button>
              </Link>
              <Link href="/contacts/import" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Upload size={16} /> Import CSV
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
