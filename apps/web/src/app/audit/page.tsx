/**
 * Audit Trail Page
 * Full-page explorer for chained audit logs with tampering detection
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatDateTime } from '@/lib/utils';

type AuditEntityType = 'JournalEntry' | 'SalesInvoice' | 'Vendor';

interface AuditUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface AuditEntry {
  id: string;
  tenantId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  description?: string;
  createdAt: string;
  previousHash?: string | null;
  dataHash?: string;
  hashVerified?: boolean;
  user: AuditUser;
  changesBefore?: Record<string, unknown>;
  changesAfter?: Record<string, unknown>;
}

interface AuditApiResponse {
  logs: AuditEntry[];
  chainValid: boolean;
  chainBrokenAt: string | null;
}

interface TamperingResponse {
  tampered: AuditEntry[];
  securityStatus: 'SECURE' | 'COMPROMISED';
  affectedRecords: number;
}

const presets: Array<{ label: string; entityType: AuditEntityType; entityId: string }> = [
  { label: 'Journal JE-2025-0001', entityType: 'JournalEntry', entityId: 'JE-2025-0001' },
  { label: 'Journal JE-2025-0005', entityType: 'JournalEntry', entityId: 'JE-2025-0005' },
  { label: 'Sales Invoice SI-2025-0001', entityType: 'SalesInvoice', entityId: 'SI-2025-0001' },
  { label: 'Vendor VEND-003', entityType: 'Vendor', entityId: 'VEND-003' },
];

const entityOptions: Array<{ value: AuditEntityType; label: string }> = [
  { value: 'JournalEntry', label: 'Journal Entry' },
  { value: 'SalesInvoice', label: 'Sales Invoice' },
  { value: 'Vendor', label: 'Vendor' },
];

export default function AuditTrailPage() {
  const [entityType, setEntityType] = useState<AuditEntityType>('JournalEntry');
  const [entityId, setEntityId] = useState('JE-2025-0001');
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [chainValid, setChainValid] = useState(true);
  const [chainBrokenAt, setChainBrokenAt] = useState<string | null>(null);
  const [tamperReport, setTamperReport] = useState<TamperingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusTone = useMemo(() => {
    if (!auditLogs.length) return 'muted';
    if (!chainValid) return 'danger';
    return 'success';
  }, [auditLogs.length, chainValid]);

  useEffect(() => {
    fetchAuditLogs();
  }, [entityType, entityId]);

  useEffect(() => {
    runTamperScan();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `http://localhost:3001/api/audit-logs?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load audit trail (${response.status})`);
      }

      const data: AuditApiResponse = await response.json();
      setAuditLogs(data.logs);
      setChainValid(Boolean(data.chainValid));
      setChainBrokenAt(data.chainBrokenAt);
    } catch (err) {
      console.error('Audit trail fetch failed', err);
      setError('Unable to load audit trail. Verify the API (localhost:3001) is running and the record exists.');
      setAuditLogs([]);
      setChainValid(true);
      setChainBrokenAt(null);
    } finally {
      setLoading(false);
    }
  };

  const runTamperScan = async () => {
    setScanLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/audit-logs/detect-tampering');
      if (!response.ok) {
        throw new Error(`Failed tampering scan (${response.status})`);
      }
      const data: TamperingResponse = await response.json();
      setTamperReport(data);
    } catch (err) {
      console.error('Tampering scan failed', err);
      setTamperReport({ tampered: [], securityStatus: 'COMPROMISED', affectedRecords: 0 });
    } finally {
      setScanLoading(false);
    }
  };

  const selectedPresetLabel = presets.find(
    preset => preset.entityType === entityType && preset.entityId === entityId
  )?.label;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-slate-600 mt-1">End-to-end hash chain with tampering detection.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchAuditLogs} isLoading={loading}>
            Refresh trail
          </Button>
          <Button variant="primary" onClick={runTamperScan} isLoading={scanLoading}>
            Run tampering scan
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Scope</CardTitle>
                <CardDescription>Choose an entity to view its chained audit history.</CardDescription>
              </div>
              {selectedPresetLabel && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {selectedPresetLabel}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select
                label="Entity type"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as AuditEntityType)}
                options={entityOptions}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Entity ID</label>
                <div className="flex gap-2">
                  <input
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    placeholder="e.g. JE-2025-0001"
                    className="flex-1 h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                  <Button onClick={fetchAuditLogs} isLoading={loading}>
                    Load
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={`${preset.entityType}-${preset.entityId}`}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEntityType(preset.entityType);
                    setEntityId(preset.entityId);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Chained events</h2>
                {statusTone === 'success' && (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    Chain verified
                  </span>
                )}
                {statusTone === 'danger' && (
                  <span className="text-xs font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    Chain compromised
                  </span>
                )}
                {statusTone === 'muted' && (
                  <span className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    Awaiting selection
                  </span>
                )}
              </div>

              <div className="mt-3 border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {loading && (
                  <div className="flex items-center justify-center py-12 text-sm text-slate-600">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                    Loading audit trail…
                  </div>
                )}

                {!loading && auditLogs.length === 0 && (
                  <div className="px-4 py-6 text-sm text-slate-600">
                    No audit entries found for this scope.
                  </div>
                )}

                {!loading && auditLogs.map((entry, idx) => (
                  <div key={entry.id} className="px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.action}</p>
                        <p className="text-sm text-slate-600">{entry.description || 'No description provided.'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-700">{entry.user.firstName} {entry.user.lastName}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 text-xs">
                      <div className="rounded-md bg-slate-50 px-3 py-2 border border-slate-200">
                        <p className="font-medium text-slate-700">Hash</p>
                        <p className="mt-1 break-all text-[11px] text-slate-600">{entry.dataHash || '—'}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 px-3 py-2 border border-slate-200">
                        <p className="font-medium text-slate-700">Previous</p>
                        <p className="mt-1 break-all text-[11px] text-slate-600">{entry.previousHash || 'ROOT'}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 px-3 py-2 border border-slate-200">
                        <p className="font-medium text-slate-700">Integrity</p>
                        <p className={entry.hashVerified ? 'mt-1 text-green-700 font-semibold' : 'mt-1 text-red-700 font-semibold'}>
                          {entry.hashVerified ? 'Verified' : 'Mismatch'}
                        </p>
                      </div>
                    </div>

                    {(entry.changesBefore || entry.changesAfter) && (
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
                        {entry.changesBefore && (
                          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
                            <p className="font-medium text-amber-800">Before</p>
                            <pre className="mt-1 overflow-x-auto text-[11px] text-amber-900">{JSON.stringify(entry.changesBefore, null, 2)}</pre>
                          </div>
                        )}
                        {entry.changesAfter && (
                          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2">
                            <p className="font-medium text-emerald-800">After</p>
                            <pre className="mt-1 overflow-x-auto text-[11px] text-emerald-900">{JSON.stringify(entry.changesAfter, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    {!entry.hashVerified && (
                      <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        Hash mismatch detected at {formatDateTime(entry.createdAt)}. Investigate user {entry.user.firstName} {entry.user.lastName} (ID {entry.user.id}).
                      </div>
                    )}

                    {chainBrokenAt && !chainValid && idx === 0 && (
                      <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        Chain first breaks at {formatDateTime(chainBrokenAt)}.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Integrity status</CardTitle>
              <CardDescription>Real-time verdict for the selected chain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={
                    chainValid
                      ? 'inline-flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]'
                      : 'inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(248,113,113,0.2)]'
                  }
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{chainValid ? 'Chain verified' : 'Chain compromised'}</p>
                  <p className="text-xs text-slate-600">
                    {chainValid
                      ? 'Every hop validated against the previous hash.'
                      : chainBrokenAt
                        ? `First break detected ${formatDateTime(chainBrokenAt)}.`
                        : 'Hash mismatch detected.'}
                  </p>
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                Current scope: {entityType} • {entityId}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Tampering radar</CardTitle>
              <CardDescription>Cross-record scan across all audited entities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={
                    tamperReport?.securityStatus === 'SECURE'
                      ? 'inline-flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]'
                      : 'inline-flex h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.2)]'
                  }
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {tamperReport?.securityStatus === 'SECURE' ? 'No tampering detected' : 'Potential tampering detected'}
                  </p>
                  <p className="text-xs text-slate-600">
                    {tamperReport
                      ? `${tamperReport.affectedRecords} affected record${tamperReport.affectedRecords === 1 ? '' : 's'}.`
                      : 'Scan pending…'}
                  </p>
                </div>
              </div>

              {tamperReport && tamperReport.tampered.length > 0 && (
                <div className="space-y-2">
                  {tamperReport.tampered.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{entry.entityType} {entry.entityId}</span>
                        <span>{formatDateTime(entry.createdAt)}</span>
                      </div>
                      <p className="mt-1">Action: {entry.action}</p>
                      <p>User: {entry.user.firstName} {entry.user.lastName}</p>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="secondary" onClick={runTamperScan} isLoading={scanLoading} className="w-full">
                Re-run scan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>How to read this</CardTitle>
              <CardDescription>Quick primer for reviewers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>1) Select an entity and load its chain.</p>
              <p>2) Check chain verdict and tampering radar.</p>
              <p>3) Inspect hash transitions, then review field deltas.</p>
              <p>4) Use presets to jump between mock records.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
