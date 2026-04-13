'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import Header from '@/components/layout/Header';
import ContactsTable from '@/components/contacts/ContactsTable';
import Button from '@/components/ui/Button';
import type { Contact } from '@/lib/types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/contacts?limit=500');
        const data = await res.json();
        setContacts(data.contacts || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  return (
    <>
      <Header
        title="Contacts"
        subtitle={loading ? 'Loading...' : `${total} total contacts`}
        actions={
          <div className="flex gap-2">
            <Link href="/contacts/import">
              <Button variant="outline" size="sm" className="gap-1">
                <Upload size={14} /> Import
              </Button>
            </Link>
            <Button size="sm" className="gap-1">
              <Plus size={14} /> Add Contact
            </Button>
          </div>
        }
      />
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate">
            Loading contacts...
          </div>
        ) : (
          <ContactsTable contacts={contacts} />
        )}
      </div>
    </>
  );
}
