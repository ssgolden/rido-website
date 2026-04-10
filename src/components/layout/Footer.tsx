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
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-rido-navy">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-2xl font-black text-white">
              Rido<span className="text-rido-coral">.</span>
            </p>
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
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-rido-coral transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Rido. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/50 font-semibold">ES</span>
            <span className="text-xs text-white/30">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}