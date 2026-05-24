import Link from 'next/link';

export default function ReportNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This audit report doesn&apos;t exist or the link is invalid. Reports are stored
          permanently — if you just created one, try refreshing the page.
        </p>
        <Link
          href="/audit"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          Run a New Audit
        </Link>
      </div>
    </main>
  );
}
