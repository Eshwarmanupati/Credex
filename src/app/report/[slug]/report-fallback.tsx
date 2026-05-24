'use client';

import { useState } from 'react';
import type { AuditRecord } from '@/types';
import ReportClient from './report-client';
import Link from 'next/link';

interface ReportFallbackProps {
  slug: string;
}

function readLocalAudit(slug: string): AuditRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`trim_audit_${slug}`);
    if (!stored) return null;
    return JSON.parse(stored) as AuditRecord;
  } catch {
    return null;
  }
}

export default function ReportFallback({ slug }: ReportFallbackProps) {
  const [audit] = useState<AuditRecord | null>(() => readLocalAudit(slug));

  if (!audit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This audit report doesn&apos;t exist or was created in a different browser session.
            Try running a new audit to generate a fresh report.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Run a New Audit
          </Link>
        </div>
      </div>
    );
  }

  return <ReportClient audit={audit} />;
}
