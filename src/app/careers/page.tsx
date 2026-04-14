import { LegalPage } from "@/components/layout/LegalPage";
import { Briefcase } from "lucide-react";

export default function CareersPage() {
  return (
    <LegalPage title="Careers" lastUpdated="January 2026">
      <div className="legal-highlight">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-5 h-5 text-rido-magenta" />
          <h3 className="!mt-0 !mb-0 text-white font-bold">Join the Rido Team</h3>
        </div>
        <p className="!mb-0">
          We&apos;re building the future of micro-mobility in Spain. Check back soon for open positions, or reach out to us directly.
        </p>
      </div>

      <h2 id="1-about" className="legal-section">1. About Rido</h2>
      <p>
        Rido is a shared micro-mobility company operating e-scooters and e-bikes across Spain&apos;s most vibrant cities. Our mission is to provide sustainable, affordable transportation that helps reduce congestion and emissions.
      </p>
      <p>
        We&apos;re a passionate team focused on:
      </p>
      <ul>
        <li>Making urban mobility accessible to everyone</li>
        <li>Building reliable, safe vehicles</li>
        <li>Creating a sustainable future for Spanish cities</li>
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
        <li>Free rides on Rido vehicles!</li>
      </ul>

      <div className="legal-highlight mt-12">
        <p className="!mb-0 text-sm">
          <strong>Rido</strong> is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
        </p>
      </div>
    </LegalPage>
  );
}