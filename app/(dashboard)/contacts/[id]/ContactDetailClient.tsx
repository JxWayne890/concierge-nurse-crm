'use client';

import Header from '@/components/layout/Header';
import ContactDetail from '@/components/contacts/ContactDetail';
import { mockContacts } from '@/lib/mock-data';

export default function ContactDetailClient({ contactId }: { contactId: string }) {
  const contact = mockContacts.find((c) => c.id === contactId);

  if (!contact) {
    return (
      <>
        <Header title="Contact Not Found" />
        <div className="p-8">
          <p className="text-slate">No contact found with ID: {contactId}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`${contact.firstName} ${contact.lastName}`} subtitle={contact.email} />
      <div className="p-8">
        <ContactDetail contact={contact} />
      </div>
    </>
  );
}
