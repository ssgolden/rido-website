import Link from "next/link";
import { RidoLogo } from "@/components/ui/RidoLogo";

export default function NotFound() {
  return (
    <main className="min-h-screen min-h-dvh flex items-center justify-center bg-rido-navy text-white px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="mb-8 flex justify-center">
          <RidoLogo variant="full" size="lg" />
        </div>

        <h1 className="text-8xl sm:text-9xl font-black text-rido-magenta mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-white/50 mb-8 text-base sm:text-lg leading-relaxed">
          Looks like you took a wrong turn. Don&apos;t worry — even the best riders
          lose their way sometimes. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-rido-magenta hover:bg-rido-magenta-dark text-white shadow-lg shadow-rido-magenta/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Back to Home
          </Link>
          <Link
            href="/#vehicles"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/15 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            View Our Fleet
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-white/30 text-sm">
          <Link href="/privacy" className="hover:text-rido-magenta transition-colors cursor-pointer">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-rido-magenta transition-colors cursor-pointer">
            Terms of Service
          </Link>
          <span>·</span>
          <a href="mailto:info@rido.bike" className="hover:text-rido-magenta transition-colors cursor-pointer">
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}