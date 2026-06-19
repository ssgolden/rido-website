import { RidoLogo } from "@/components/ui/RidoLogo";
import Link from "next/link";
import { X, Mail } from "lucide-react";
import type { SVGProps } from "react";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const footerLinks = {
  Product: [
    { label: "E-Scooter", href: "#vehicles" },
    { label: "E-Bike", href: "#vehicles" },
    { label: "Pricing", href: "#pricing" },
    { label: "Cities", href: "#cities" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Safety", href: "#safety" },
    { label: "Sustainability", href: "#sustainability" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
  ],
};

const socialLinks = [
  { icon: InstagramIcon, href: "https://www.instagram.com/rido", label: "Instagram" },
  { icon: FacebookIcon, href: "https://www.facebook.com/rido", label: "Facebook" },
  { icon: X, href: "https://x.com/rido", label: "X" },
  { icon: Mail, href: "mailto:info@rido.bike", label: "Email" },
];
// NOTE: Social media links above are placeholders. When real accounts are created,
// update the URLs. The rel="me" links were removed from layout.tsx to avoid
// confusing search engines with dead profile links.

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-rido-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2">
            <RidoLogo variant="full" size="md" />
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-xs">Shared micro-mobility for Spain.<br />Move freely. Ride responsibly.</p>
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined} aria-label={social.label} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-rido-magenta/20 flex items-center justify-center transition-all duration-200 hover:scale-110 group" suppressHydrationWarning>
                  <social.icon className="w-4 h-4 text-muted group-hover:text-rido-magenta transition-colors" />
                </a>
              ))}
            </div>
            <div className="mt-5">
              <a href="#download" suppressHydrationWarning className="inline-flex items-center gap-2 text-sm text-rido-magenta hover:text-rido-magenta-light transition-colors cursor-pointer font-semibold">Join the waitlist →</a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") || link.href.startsWith("#") ? (
                      <a href={link.href} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-sm text-muted hover:text-rido-magenta transition-colors cursor-pointer">{link.label}</a>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted hover:text-rido-magenta transition-colors cursor-pointer">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-weak">© {new Date().getFullYear()} Go2 Place S.L. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-weak">English</span>
            <span className="text-xs text-white/20">·</span>
            <span className="text-xs text-muted-weak">Español (coming soon)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
