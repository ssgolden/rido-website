import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { Briefcase } from "lucide-react";
import { SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers — Rido",
  description:
    "Help launch Rido's shared e-scooters and e-bikes on the Costa del Sol. We're looking for people in operations, engineering, marketing, and more — from day one.",
  alternates: { canonical: `${SITE_ORIGIN}/careers` },
  openGraph: {
    title: "Careers — Rido",
    description: "Help launch shared e-scooters and e-bikes on the Costa del Sol. Build Rido from day one.",
    url: `${SITE_ORIGIN}/careers`,
  },
};

export default function CareersPage() {
  return (
    <LegalPage title="Careers" lastUpdated="January 2026">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_ORIGIN },
              { "@type": "ListItem", "position": 2, "name": "Careers", "item": `${SITE_ORIGIN}/careers` },
            ],
          }),
        }}
      />
      <div className="legal-highlight">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-5 h-5 text-rido-magenta" />
          <h3 className="!mt-0 !mb-0 text-white font-bold">Join the Rido Team</h3>
        </div>
        <p className="!mb-0">
          We&apos;re launching shared e-scooters and e-bikes on the Costa del Sol. Help build the service from day one. Check back soon for open positions, or reach out to us directly.
        </p>
      </div>

      <h2 id="1-about" className="legal-section">1. About Rido</h2>
      <p>
        Rido is launching shared e-scooters and e-bikes on the Costa del Sol. Join early and help build the service from day one. Our mission is sustainable transport that cuts congestion and emissions.
      </p>
      <p>
        We&apos;re a passionate team focused on:
      </p>
      <ul>
        <li>Making urban mobility accessible to everyone</li>
        <li>Building reliable, safe vehicles</li>
        <li>Creating a sustainable way to get around the Costa del Sol</li>
        <li>Delivering exceptional customer experiences</li>
      </ul>

      <h2 id="2-open-positions" className="legal-section">2. Open Positions</h2>
      <p>
        Currently, we don&apos;t have any open positions listed. However, we&apos;re always on the lookout for talented individuals who share our vision. If you believe you could contribute to Rido&apos;s mission, we&apos;d love to hear from you.
      </p>
      
      <div className="legal-highlight">
        <p className="!mb-0">
          <strong>Send your CV:</strong> We&apos;re interested in hearing from people with experience in operations, engineering, marketing, customer service, and more. Email us at <a href="mailto:info@rido.bike">info@rido.bike</a> with &quot;Careers&quot; in the subject line.
        </p>
      </div>

      <h2 id="3-values" className="legal-section">3. Our Values</h2>
      <ul>
        <li><strong>Sustainability First:</strong> Every decision we make considers its environmental impact</li>
        <li><strong>Safety Always:</strong> The wellbeing of our riders is our top priority</li>
        <li><strong>Innovation Driven:</strong> We continuously improve our technology and service</li>
        <li><strong>Team Spirit:</strong> We succeed together, celebrating each other&apos;s contributions</li>
        <li><strong>Customer Obsessed:</strong> We listen, learn, and adapt to our riders&apos; needs</li>
      </ul>

      <h2 id="4-benefits" className="legal-section">4. Benefits</h2>
      <p>Working at Rido means:</p>
      <ul>
        <li>Flexible working arrangements</li>
        <li>Opportunity to shape the future of urban mobility</li>
        <li>Dynamic, supportive team environment</li>
        <li>Competitive compensation</li>
      </ul>

      <div className="legal-highlight mt-12">
        <p className="!mb-0 text-sm">
          <strong>Rido</strong> is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
        </p>
      </div>
    </LegalPage>
  );
}