'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Tag, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import type { Contact, ContactStatus } from '@/lib/types';

const statusVariant: Record<ContactStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  unconfirmed: 'warning',
  unsubscribed: 'default',
  bounced: 'danger',
};

export default function ContactDetail({ contact }: { contact: Contact }) {
  const [newNote, setNewNote] = useState('');

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/contacts" className="inline-flex items-center gap-1 text-sm text-slate hover:text-charcoal transition-colors">
        <ArrowLeft size={16} /> Back to Contacts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold text-2xl font-bold">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">{contact.firstName} {contact.lastName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={statusVariant[contact.status]}>{contact.status}</Badge>
              {contact.lifecycleStage && <Badge variant="gold">{contact.lifecycleStage}</Badge>}
              {contact.leadScore !== undefined && (
                <div className="flex items-center gap-1 text-sm text-slate">
                  <Star size={14} className="text-gold" />
                  <span>Score: {contact.leadScore}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="secondary" size="sm" className="gap-1">
            <Mail size={14} /> Send Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-slate" />
              <span>{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-slate" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.lastIp && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-slate" />
                <span className="text-slate">IP: {contact.lastIp}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-slate" />
              <span className="text-slate">Added {new Date(contact.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          <h3 className="text-sm font-semibold text-charcoal mb-2">Source</h3>
          <p className="text-sm text-slate">{contact.source}</p>

          {contact.interest && (
            <>
              <hr className="my-4 border-gray-100" />
              <h3 className="text-sm font-semibold text-charcoal mb-2">Interest</h3>
              <p className="text-sm text-slate">{contact.interest}</p>
            </>
          )}

          {contact.lastOpen && (
            <>
              <hr className="my-4 border-gray-100" />
              <h3 className="text-sm font-semibold text-charcoal mb-2">Last Opened</h3>
              <p className="text-sm text-slate">{new Date(contact.lastOpen).toLocaleString()}</p>
            </>
          )}
        </Card>

        {/* Segments & Programs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-charcoal">Segments & Tags</h3>
            <Button variant="ghost" size="sm" className="gap-1"><Plus size={14} /> Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {contact.segments.map((seg) => (
              <Badge key={seg} variant="gold">
                <Tag size={10} className="mr-1" /> {seg}
              </Badge>
            ))}
            {contact.segments.length === 0 && (
              <p className="text-sm text-slate">No segments assigned</p>
            )}
          </div>

          {contact.programHistory && contact.programHistory.length > 0 && (
            <>
              <hr className="my-4 border-gray-100" />
              <h3 className="text-sm font-semibold text-charcoal mb-3">Program History</h3>
              <div className="space-y-2">
                {contact.programHistory.map((program) => (
                  <div key={program} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {program}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Notes */}
        <Card>
          <h3 className="text-sm font-semibold text-charcoal mb-4">Notes</h3>
          <div className="space-y-3 mb-4">
            {(!contact.notes || contact.notes.length === 0) && (
              <p className="text-sm text-slate">No notes yet</p>
            )}
            {contact.notes?.map((note) => (
              <div key={note.id} className="rounded-lg bg-cream p-3">
                <p className="text-sm text-charcoal">{note.body}</p>
                <p className="text-xs text-slate mt-1">
                  {note.createdBy} — {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button size="sm" disabled={!newNote.trim()}>Add Note</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
