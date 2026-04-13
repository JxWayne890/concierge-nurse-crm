import Papa from 'papaparse';
import type { CSVImportRow, ColumnMapping, ImportValidationResult } from './types';

const DEFAULT_MAPPINGS: Record<string, string> = {
  id: 'externalId',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  source: 'source',
  status: 'status',
  createdAt: 'createdAt',
  segments: 'segments',
  'metafields.lastIp': 'lastIp',
  'metafields.lastOpen': 'lastOpen',
};

export function parseCSV(input: string | File): Promise<{ headers: string[]; rows: CSVImportRow[] }> {
  return new Promise((resolve, reject) => {
    if (typeof input === 'string') {
      Papa.parse(input, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as CSVImportRow[];
          resolve({ headers, rows });
        },
        error: (error: Error) => reject(error),
      });
    } else {
      Papa.parse(input, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as CSVImportRow[];
          resolve({ headers, rows });
        },
        error: (error: Error) => reject(error),
      });
    }
  });
}

export function autoDetectMappings(headers: string[]): ColumnMapping[] {
  return headers.map((header) => ({
    csvColumn: header,
    crmField: DEFAULT_MAPPINGS[header] || null,
  }));
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateImportData(
  rows: CSVImportRow[],
  mappings: ColumnMapping[],
  existingEmails: Set<string> = new Set()
): ImportValidationResult {
  const result: ImportValidationResult = {
    valid: [],
    errors: [],
    warnings: [],
    duplicates: [],
  };

  const seenEmails = new Set<string>();

  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const emailMapping = mappings.find((m) => m.crmField === 'email');
    const emailCol = emailMapping?.csvColumn || 'email';
    const email = row[emailCol]?.trim().toLowerCase();

    if (!email) {
      result.errors.push({ row: rowNum, field: 'email', message: 'Email is required' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      result.errors.push({ row: rowNum, field: 'email', message: `Invalid email format: ${email}` });
      return;
    }

    if (seenEmails.has(email)) {
      result.duplicates.push({ row: rowNum, email });
      return;
    }

    if (existingEmails.has(email)) {
      result.duplicates.push({ row: rowNum, email });
      return;
    }

    seenEmails.add(email);

    // Check for optional field warnings
    const firstNameMapping = mappings.find((m) => m.crmField === 'firstName');
    if (firstNameMapping && !row[firstNameMapping.csvColumn]) {
      result.warnings.push({ row: rowNum, field: 'firstName', message: 'Missing first name' });
    }

    result.valid.push(row);
  });

  return result;
}

export function parseSegments(segmentString: string | undefined): string[] {
  if (!segmentString) return [];
  return segmentString.split(',').map((s) => s.trim()).filter(Boolean);
}

export const CRM_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'source', label: 'Source' },
  { value: 'status', label: 'Status' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'segments', label: 'Segments/Tags' },
  { value: 'lastIp', label: 'Last IP' },
  { value: 'lastOpen', label: 'Last Open' },
  { value: 'phone', label: 'Phone' },
  { value: 'externalId', label: 'External ID' },
  { value: null, label: '— Skip —' },
];
