/**
 * AuditSidebar Component
 * Displays cryptographic audit trail with change history and diffs
 * 
 * Usage:
 * <AuditSidebar 
 *   isOpen={showAudit}
 *   onClose={setShowAudit}
 *   entityType="JournalEntry"
 *   entityId="je-123"
 * />
 */

import React, { useEffect, useState } from 'react';

interface AuditEntry {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  action: string;
  changesBefore?: Record<string, any>;
  changesAfter?: Record<string, any>;
  createdAt: string;
  description?: string;
  dataHash: string;
  hashVerified: boolean;
  ipAddress?: string;
}

interface AuditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
}

const AuditSidebar: React.FC<AuditSidebarProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
}) => {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [chainValid, setChainValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAuditTrail();
    }
  }, [isOpen, entityType, entityId]);

  const fetchAuditTrail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:3001/api/audit-logs?entityType=${entityType}&entityId=${entityId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch audit trail: ${response.statusText}`);
      }

      const data = await response.json();
      setAuditTrail(data.logs);
      setChainValid(data.chainValid);

      if (!data.chainValid) {
        console.warn(
          '⚠️ AUDIT CHAIN COMPROMISED - Tampering detected at:',
          data.chainBrokenAt
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeClass = (action: string): string => {
    switch (action) {
      case 'Created':
        return 'badge-tala-success';
      case 'Updated':
        return 'badge-tala-warning';
      case 'Deleted':
      case 'Voided':
        return 'badge-tala-danger';
      case 'Posted':
        return 'badge-tala-success';
      case 'Viewed':
        return 'badge-tala-info';
      default:
        return 'badge-tala-info';
    }
  };

  const renderChangeDiff = (changesBefore?: Record<string, any>, changesAfter?: Record<string, any>) => {
    if (!changesBefore && !changesAfter) return null;

    const changes = changesAfter || {};
    return (
      <div className="mt-2 bg-tala-neutral-50 dark:bg-tala-neutral-900 rounded p-2 text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className="text-tala-neutral-600 dark:text-tala-neutral-400">
            <span className="text-tala-primary-600 dark:text-tala-primary-400">
              {key}:
            </span>
            {' '}
            {changesBefore?.[key] && (
              <>
                <span className="line-through text-tala-danger-600">{String(changesBefore[key])}</span>
                {' → '}
              </>
            )}
            <span className="text-tala-success-600 dark:text-tala-success-400">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
          role="button"
          tabIndex={0}
        />
      )}

      {/* Sidebar */}
      <div
        className={`audit-sidebar ${!isOpen ? 'hidden' : ''} z-50`}
        role="complementary"
        aria-label="Audit trail"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-tala-neutral-900 border-b border-tala-neutral-200 dark:border-tala-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-tala-neutral-900 dark:text-white">
              Audit Trail
            </h2>
            <button
              onClick={onClose}
              className="text-tala-neutral-500 hover:text-tala-neutral-700 dark:hover:text-tala-neutral-300"
              aria-label="Close audit sidebar"
            >
              ✕
            </button>
          </div>

          {/* Chain Status Indicator */}
          <div className="mt-3">
            {chainValid ? (
              <div className="flex items-center gap-2 text-sm text-tala-success-600 dark:text-tala-success-400">
                <span className="w-2 h-2 rounded-full bg-tala-success-600 dark:bg-tala-success-400 animate-pulse"></span>
                Chain: VERIFIED
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-tala-danger-600 dark:text-tala-danger-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-tala-danger-600 dark:bg-tala-danger-400 animate-pulse"></span>
                ⚠️ CHAIN COMPROMISED
              </div>
            )}
          </div>

          <p className="text-xs text-tala-neutral-500 dark:text-tala-neutral-400 mt-2">
            {entityType}: {entityId}
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-tala-primary-300 border-t-tala-primary-600 rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-tala-neutral-600 dark:text-tala-neutral-400">
                Loading audit trail...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-tala-danger-50 dark:bg-tala-danger-900 border border-tala-danger-300 dark:border-tala-danger-700 rounded-lg text-sm text-tala-danger-700 dark:text-tala-danger-200">
              <p className="font-semibold">Error Loading Audit Trail</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {!loading && auditTrail.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-tala-neutral-600 dark:text-tala-neutral-400">
                No audit entries found
              </p>
            </div>
          )}

          {/* Audit Entries */}
          {auditTrail.map((entry, index) => (
            <div
              key={entry.id}
              className={`audit-entry action-${entry.action.toLowerCase()}`}
            >
              {/* Entry Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`badge-tala-${entry.action === 'Created' ? 'success' : entry.action === 'Updated' ? 'warning' : 'danger'}`}>
                      {entry.action}
                    </span>
                    <span className="text-xs text-tala-neutral-500 dark:text-tala-neutral-400">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-tala-neutral-900 dark:text-white mt-1">
                    {entry.user.firstName} {entry.user.lastName}
                  </p>
                  <p className="text-xs text-tala-neutral-500 dark:text-tala-neutral-400">
                    {entry.user.email}
                  </p>
                </div>

                {/* Hash Verification Badge */}
                <div className="text-right">
                  {entry.hashVerified ? (
                    <span
                      className="text-xs px-2 py-1 bg-tala-success-100 dark:bg-tala-success-900 text-tala-success-700 dark:text-tala-success-300 rounded font-mono"
                      title={`Hash: ${entry.dataHash.substring(0, 8)}...`}
                    >
                      ✓ Hash OK
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-tala-danger-100 dark:bg-tala-danger-900 text-tala-danger-700 dark:text-tala-danger-300 rounded font-mono">
                      ✗ Hash Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-tala-neutral-500 dark:text-tala-neutral-400 mt-2">
                {formatDate(entry.createdAt)}
              </p>

              {/* Description */}
              {entry.description && (
                <p className="text-sm text-tala-neutral-700 dark:text-tala-neutral-300 mt-2">
                  {entry.description}
                </p>
              )}

              {/* Changes Diff */}
              {renderChangeDiff(entry.changesBefore, entry.changesAfter)}

              {/* IP Address */}
              {entry.ipAddress && (
                <p className="text-xs text-tala-neutral-500 dark:text-tala-neutral-400 mt-2">
                  IP: {entry.ipAddress}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-tala-neutral-200 dark:border-tala-neutral-800 p-4 bg-tala-neutral-50 dark:bg-tala-neutral-900">
          <button
            onClick={fetchAuditTrail}
            className="btn-tala-secondary w-full text-sm"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AuditSidebar;

/**
 * USAGE EXAMPLE IN A PAGE:
 * 
 * import AuditSidebar from '@/components/audit-sidebar';
 * 
 * export default function JournalEntryDetail() {
 *   const [showAudit, setShowAudit] = useState(false);
 *   const [entry, setEntry] = useState(null);
 * 
 *   return (
 *     <div className="flex">
 *       <main className="flex-1 p-6">
 *         {entry && (
 *           <>
 *             <h1>{entry.journalNumber}</h1>
 *             <button
 *               onClick={() => setShowAudit(true)}
 *               className="btn-tala-primary mt-4"
 *             >
 *               📋 View Audit Trail
 *             </button>
 *           </>
 *         )}
 *       </main>
 * 
 *       <AuditSidebar
 *         isOpen={showAudit}
 *         onClose={() => setShowAudit(false)}
 *         entityType="JournalEntry"
 *         entityId={entry?.id}
 *       />
 *     </div>
 *   );
 * }
 */
