import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-rido-navy">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-rido-magenta transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black mb-2">{title}</h1>
        <p className="text-sm text-white/40 mb-12">Last updated: {lastUpdated}</p>

        <div className="legal-content text-white/70 leading-relaxed space-y-6">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/"
            className="text-rido-magenta hover:text-rido-magenta-light transition-colors"
          >
            ← Back to rido.bike
          </Link>
        </div>
      </div>
    </div>
  );
}