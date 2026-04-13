'use client';

import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import Header from '@/components/layout/Header';
import ContactsTable from '@/components/contacts/ContactsTable';
import Button from '@/components/ui/Button';
import { mockContacts } from '@/lib/mock-data';

export default function ContactsPage() {
  return (
    <>
      <Header
        title="Contacts"
        subtitle={`${mockContacts.length} total contacts`}
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
        <ContactsTable contacts={mockContacts} />
      </div>
    </>
  );
}
