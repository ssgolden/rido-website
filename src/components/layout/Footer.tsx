import { RidoLogo } from "@/components/ui/RidoLogo";
import Link from "next/link";

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

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-rido-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <RidoLogo variant="full" size="md" />
            <p className="mt-3 text-sm text-white/50 leading-relaxed">
              Shared micro-mobility for Spain.
              <br />
              Move freely. Ride responsibly.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") || link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-sm text-white/50 hover:text-rido-magenta transition-colors cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-rido-magenta transition-colors cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Go2 Place S.L. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/50 font-semibold cursor-pointer">ES</span>
            <span className="text-xs text-white/30">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}