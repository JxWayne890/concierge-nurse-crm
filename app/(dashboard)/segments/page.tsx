'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { mockSegments } from '@/lib/mock-data';
import type { Segment } from '@/lib/types';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>(mockSegments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'manual' | 'auto'>('manual');

  const openCreate = () => {
    setEditingSegment(null);
    setNewName('');
    setNewDescription('');
    setNewType('manual');
    setModalOpen(true);
  };

  const openEdit = (seg: Segment) => {
    setEditingSegment(seg);
    setNewName(seg.name);
    setNewDescription(seg.description || '');
    setNewType(seg.type);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingSegment) {
      setSegments((prev) =>
        prev.map((s) => s.id === editingSegment.id ? { ...s, name: newName, description: newDescription, type: newType, updatedAt: new Date().toISOString() } : s)
      );
    } else {
      const seg: Segment = {
        id: `s${Date.now()}`,
        name: newName,
        description: newDescription,
        type: newType,
        contactCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSegments((prev) => [...prev, seg]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <>
      <Header
        title="Segments & Tags"
        subtitle={`${segments.length} segments`}
        actions={
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus size={14} /> New Segment
          </Button>
        }
      />
      <div className="p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((seg) => (
            <Card key={seg.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {seg.type === 'auto' ? (
                    <Zap size={16} className="text-amber-500" />
                  ) : (
                    <Users size={16} className="text-slate" />
                  )}
                  <h3 className="font-semibold text-charcoal">{seg.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(seg)} className="p-1 text-slate hover:text-charcoal">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(seg.id)} className="p-1 text-slate hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {seg.description && <p className="text-sm text-slate mb-3">{seg.description}</p>}
              <div className="flex items-center justify-between">
                <Badge variant={seg.type === 'auto' ? 'warning' : 'default'}>
                  {seg.type === 'auto' ? 'Auto' : 'Manual'}
                </Badge>
                <span className="text-sm font-medium text-charcoal">{seg.contactCount} contacts</span>
              </div>
              {seg.rules && seg.rules.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-slate">Rules:</p>
                  {seg.rules.map((rule, i) => (
                    <p key={i} className="text-xs text-charcoal mt-1">
                      {rule.field} {rule.operator} &ldquo;{rule.value}&rdquo;
                    </p>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingSegment ? 'Edit Segment' : 'New Segment'}>
        <div className="space-y-4">
          <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Accelerator Waitlist" />
          <Textarea label="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} placeholder="Optional description" />
          <Select
            label="Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as 'manual' | 'auto')}
            options={[
              { value: 'manual', label: 'Manual' },
              { value: 'auto', label: 'Auto (rule-based)' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!newName.trim()}>
              {editingSegment ? 'Save Changes' : 'Create Segment'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
