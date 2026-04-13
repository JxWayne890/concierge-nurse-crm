'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FolderOpen, ClipboardPaste, AlertCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import ImportPreview from './ImportPreview';
import ColumnMapper from './ColumnMapper';
import { parseCSV, autoDetectMappings, validateImportData } from '@/lib/csv-parser';
import type { CSVImportRow, ColumnMapping, ImportValidationResult, ImportResult } from '@/lib/types';

type ImportMethod = 'file' | 'folder' | 'paste';
type Step = 'upload' | 'preview' | 'mapping' | 'validation' | 'review' | 'results';

export default function CSVImporter() {
  const [method, setMethod] = useState<ImportMethod>('file');
  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CSVImportRow[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processCSV = useCallback(async (input: string | File) => {
    try {
      setError(null);
      const result = await parseCSV(input);
      setHeaders(result.headers);
      setRows(result.rows);
      setMappings(autoDetectMappings(result.headers));
      setStep('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse CSV');
    }
  }, []);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith('.csv'));
    if (files.length === 0) { setError('Please drop .csv files'); return; }
    setFileNames(files.map((f) => f.name));
    // Process first file for now; batch support is stubbed
    await processCSV(files[0]);
  }, [processCSV]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const csvFiles = Array.from(files).filter((f) => f.name.endsWith('.csv'));
    if (csvFiles.length === 0) { setError('Please select .csv files'); return; }
    setFileNames(csvFiles.map((f) => f.name));
    await processCSV(csvFiles[0]);
  };

  const handlePaste = async () => {
    if (!pasteContent.trim()) { setError('Please paste CSV data'); return; }
    await processCSV(pasteContent);
  };

  const handleValidate = () => {
    const result = validateImportData(rows, mappings);
    setValidation(result);
    setStep('validation');
  };

  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!validation) return;
    setImporting(true);

    // Map validated rows to contact objects using the column mappings
    const contacts = validation.valid.map((row) => {
      const mapped: Record<string, unknown> = {};
      for (const m of mappings) {
        if (m.crmField && row[m.csvColumn] !== undefined) {
          if (m.crmField === 'segments') {
            mapped.segments = (row[m.csvColumn] || '').split(',').map((s: string) => s.trim()).filter(Boolean);
          } else if (m.crmField === 'externalId') {
            // skip — we generate our own IDs
          } else {
            mapped[m.crmField] = row[m.csvColumn];
          }
        }
      }
      if (!mapped.source) mapped.source = 'csvImport';
      if (!mapped.status) mapped.status = 'confirmed';
      return mapped;
    });

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });
      const result: ImportResult = await res.json();
      setImportResult(result);
    } catch {
      setImportResult({
        totalProcessed: contacts.length,
        imported: 0,
        skippedDuplicates: 0,
        errors: contacts.length,
      });
    } finally {
      setImporting(false);
      setStep('results');
    }
  };

  const reset = () => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setMappings([]);
    setValidation(null);
    setImportResult(null);
    setPasteContent('');
    setError(null);
    setFileNames([]);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['upload', 'preview', 'mapping', 'validation', 'review', 'results'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-gray-200" />}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              s === step ? 'bg-gold/20 text-gold-dark' :
              (['upload', 'preview', 'mapping', 'validation', 'review', 'results'].indexOf(s) < ['upload', 'preview', 'mapping', 'validation', 'review', 'results'].indexOf(step))
                ? 'bg-green-50 text-green-600'
                : 'bg-gray-100 text-slate'
            }`}>
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          {/* Method tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {([
              { key: 'file' as const, label: 'File Upload', icon: Upload },
              { key: 'folder' as const, label: 'Folder Upload', icon: FolderOpen },
              { key: 'paste' as const, label: 'Copy & Paste', icon: ClipboardPaste },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setMethod(key); setError(null); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  method === key ? 'border-gold text-gold-dark' : 'border-transparent text-slate hover:text-charcoal'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {method === 'file' && (
            <div
              className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragActive ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gray-300'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
            >
              <Upload size={40} className="mx-auto mb-4 text-slate" />
              <p className="text-lg font-medium text-charcoal mb-1">
                Drag & drop your CSV file here
              </p>
              <p className="text-sm text-slate mb-4">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
            </div>
          )}

          {method === 'folder' && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <FolderOpen size={40} className="mx-auto mb-4 text-slate" />
              <p className="text-lg font-medium text-charcoal mb-1">
                Select a folder to batch-import CSVs
              </p>
              <p className="text-sm text-slate mb-4">All .csv files in the folder will be processed</p>
              <input
                ref={folderInputRef}
                type="file"
                accept=".csv"
                multiple
                /* @ts-expect-error webkitdirectory is a non-standard attribute */
                webkitdirectory=""
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" onClick={() => folderInputRef.current?.click()}>
                Choose Folder
              </Button>
            </div>
          )}

          {method === 'paste' && (
            <div className="space-y-4">
              <Textarea
                label="Paste CSV data"
                placeholder={`"id","email","firstName","lastName","source","status","createdAt","segments"\n"1","john@example.com","John","Doe","manualUpload","confirmed","2025-01-01T00:00:00Z","Tag 1"`}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
              <Button onClick={handlePaste} disabled={!pasteContent.trim()}>
                Parse CSV Data
              </Button>
            </div>
          )}

          {fileNames.length > 0 && (
            <div className="mt-4 text-sm text-slate">
              Selected: {fileNames.join(', ')}
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Preview — First 10 Rows</h3>
          <ImportPreview headers={headers} rows={rows} />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={reset} className="gap-1">
              <ArrowLeft size={14} /> Start Over
            </Button>
            <Button onClick={() => setStep('mapping')} className="gap-1">
              Next: Column Mapping <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Column Mapping */}
      {step === 'mapping' && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Column Mapping</h3>
          <p className="text-sm text-slate mb-6">
            We auto-detected your columns. Adjust the mapping if needed.
          </p>
          <ColumnMapper mappings={mappings} onChange={setMappings} />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('preview')} className="gap-1">
              <ArrowLeft size={14} /> Back
            </Button>
            <Button onClick={handleValidate} className="gap-1">
              Next: Validate <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Validation */}
      {step === 'validation' && validation && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-700">{validation.valid.length}</p>
              <p className="text-sm text-green-600">Valid rows</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <AlertCircle size={24} className="mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold text-amber-700">{validation.duplicates.length}</p>
              <p className="text-sm text-amber-600">Duplicates</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <XCircle size={24} className="mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-700">{validation.errors.length}</p>
              <p className="text-sm text-red-600">Errors</p>
            </div>
          </div>

          {validation.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">Errors</h4>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-red-100 bg-red-50/50 p-3 space-y-1">
                {validation.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600">Row {err.row}: {err.message}</p>
                ))}
              </div>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-amber-700 mb-2">Warnings</h4>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-1">
                {validation.warnings.map((warn, i) => (
                  <p key={i} className="text-xs text-amber-600">Row {warn.row}: {warn.message}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('mapping')} className="gap-1">
              <ArrowLeft size={14} /> Back
            </Button>
            <Button onClick={() => setStep('review')} disabled={validation.valid.length === 0} className="gap-1">
              Next: Review <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Review & Confirm */}
      {step === 'review' && validation && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Review & Confirm Import</h3>
          <div className="rounded-lg bg-cream-dark p-6 space-y-2 mb-6">
            <p className="text-sm"><strong>Total rows:</strong> {rows.length}</p>
            <p className="text-sm text-green-700"><strong>Will import:</strong> {validation.valid.length} new contacts</p>
            <p className="text-sm text-amber-700"><strong>Will skip:</strong> {validation.duplicates.length} duplicates</p>
            <p className="text-sm text-red-700"><strong>Errors:</strong> {validation.errors.length} rows with errors</p>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('validation')} className="gap-1">
              <ArrowLeft size={14} /> Back
            </Button>
            <Button onClick={handleImport} disabled={importing} className="gap-1">
              <CheckCircle2 size={14} /> {importing ? 'Importing...' : `Import ${validation.valid.length} Contacts`}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 6: Results */}
      {step === 'results' && importResult && (
        <Card>
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
            <div className="space-y-1 text-sm text-slate mb-6">
              <p>{importResult.totalProcessed} rows processed</p>
              <p className="text-green-600 font-medium">{importResult.imported} contacts imported</p>
              <p>{importResult.skippedDuplicates} duplicates skipped</p>
              <p>{importResult.errors} errors</p>
            </div>
            <Button onClick={reset}>Import More</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
