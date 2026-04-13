'use client';

import Header from '@/components/layout/Header';
import CSVImporter from '@/components/contacts/CSVImporter';

export default function ImportPage() {
  return (
    <>
      <Header title="Import Contacts" subtitle="Upload CSV files, select a folder, or paste data directly." />
      <div className="p-8 max-w-4xl">
        <CSVImporter />
      </div>
    </>
  );
}
