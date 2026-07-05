import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy — Rido",
  description: "Learn which cookies and similar technologies Rido (Go2 Place S.L.) uses on its website, why we use them, and how you can manage or withdraw your consent.",
  alternates: { canonical: "https://rido.bike/politica-cookies" },
  openGraph: {
    title: "Cookie Policy — Rido",
    description: "Which cookies and similar technologies Rido uses, and how to manage your consent.",
    url: "https://rido.bike/politica-cookies",
  },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="June 2026">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rido.bike" },
              { "@type": "ListItem", "position": 2, "name": "Cookie Policy", "item": "https://rido.bike/politica-cookies" },
            ],
          }),
        }}
      />
      <div className="legal-highlight">
        <div className="flex items-center gap-3 mb-2">
          <Cookie className="w-5 h-5 text-rido-magenta" />
          <h3 className="!mt-0 !mb-0 text-white font-bold">Transparency First</h3>
        </div>
        <p className="!mb-0">
          This policy explains which cookies and similar technologies are used on the Rido website, why we use them, and how you can manage or withdraw your consent at any time.
        </p>
      </div>

      <h2 id="1-what-are-cookies" className="legal-section">1. What Are Cookies and Similar Technologies?</h2>
      <p>
        Cookies are small data files that a website stores on your device (computer, smartphone, or tablet) when you visit it. They are widely used to make websites work, remember your preferences, and provide information to the site&apos;s owners.
      </p>
      <p>
        In addition to cookies, websites may use similar technologies such as <strong>local storage</strong> (a browser feature that stores information on your device without an expiry date) and <strong>cookieless analytics</strong> (measurement techniques that do not store identifiers on your device). This policy covers all such technologies.
      </p>

      <h2 id="2-what-we-use" className="legal-section">2. What Rido Actually Uses</h2>
      <p>
        We believe in being precise about what runs on your device. The Rido website does <strong>not</strong> set any traditional tracking cookies. Specifically, we use:
      </p>
      <ul>
        <li>
          <strong>Consent preference (local storage)</strong>: When you respond to our cookie banner, your choice is saved in your browser&apos;s local storage under the key <code>rido-cookie-consent</code>, together with the date of your decision. This is strictly necessary so that we can respect your choice and avoid showing you the banner on every visit. It remains on your device until you clear your browser data.
        </li>
        <li>
          <strong>Cookieless analytics (Vercel Analytics)</strong>: We measure aggregate website traffic (page views, visit counts) using Vercel Analytics, which operates <strong>without cookies</strong> and without storing identifiers on your device. It does not track you across websites and the data we receive is anonymous and aggregated.
        </li>
        <li>
          <strong>Self-hosted fonts</strong>: The typefaces used on our website are hosted on our own servers and delivered together with the rest of the website. No font files are requested from Google Fonts or any other third party, no cookies are set, and your IP address is not transmitted to any external font provider.
        </li>
      </ul>
      <div className="legal-highlight">
        <p className="!mb-0">
          We do <strong>not</strong> use advertising cookies, social media tracking pixels, or any third-party cookies that profile your behaviour across websites.
        </p>
      </div>

      <h2 id="3-legal-basis" className="legal-section">3. Legal Basis and Consent</h2>
      <p>
        The use of cookies and similar technologies is regulated in Spain by <strong>Law 34/2002, of 11 July</strong> (LSSI-CE), in conjunction with <strong>Regulation (EU) 2016/679</strong> (GDPR) and <strong>Organic Law 3/2018</strong> (LOPDGDD).
      </p>
      <ul>
        <li><strong>Strictly necessary storage</strong> (such as the local storage entry that records your consent choice) is exempt from the consent requirement, as it is required to provide a service you have expressly requested.</li>
        <li><strong>Analytics</strong>: Our analytics solution is cookieless and processes only aggregated, anonymous data. To the extent any processing of personal data occurs (such as the momentary processing of your IP address to serve the website), the legal basis is our legitimate interest in operating, securing, and improving our website.</li>
      </ul>
      <p>
        Where consent is required, it is obtained through the consent banner displayed on your first visit, and you may withdraw it at any time as described below.
      </p>

      <h2 id="4-managing-consent" className="legal-section">4. How to Manage or Withdraw Your Consent</h2>
      <p>You are in control of the technologies described in this policy at all times:</p>
      <ul>
        <li>
          <strong>Consent banner</strong>: On your first visit, you can accept or decline non-essential technologies via our banner. To change a previous choice, clear your browser&apos;s site data for rido.bike (which removes the <code>rido-cookie-consent</code> entry) and the banner will appear again on your next visit.
        </li>
        <li>
          <strong>Browser settings</strong>: All major browsers (Chrome, Firefox, Safari, Edge) allow you to view, block, and delete cookies and site data, either globally or for specific websites. Consult your browser&apos;s help section for instructions. Please note that blocking all storage may affect the functioning of some websites.
        </li>
      </ul>
      <p>
        Because our analytics is cookieless and our fonts are self-hosted (no third-party requests), declining non-essential technologies does not degrade your experience on our website.
      </p>

      <h2 id="5-changes" className="legal-section">5. Changes to This Cookie Policy</h2>
      <p>
        Rido reserves the right to modify this Cookie Policy at any time, for example to reflect changes in the technologies we use or in applicable legislation. Such modifications shall become effective upon their publication on our website. We recommend that you review this page periodically for the latest information.
      </p>

      <h2 id="6-contact" className="legal-section">6. Contact and Company Identification</h2>
      <p>
        This website is operated by <strong>Go2 Place S.L.</strong>, a commercial company duly incorporated under Spanish law, with Tax Identification Number (NIF) <strong>B01745405</strong> and its registered office at <strong>Calle Eneldo 3, C4, local 22 — Orihuela Costa — 03189</strong>, registered in the Commercial Registry of Alicante in Volume 4309, Folio 12, Sheet A-170633, Entry 1000173971259.
      </p>
      <p>
        For any questions regarding this Cookie Policy or the technologies we use, you can contact us at <a href="mailto:info@rido.bike">info@rido.bike</a>.
      </p>

      <div className="legal-highlight mt-12">
        <p className="!mb-0 text-sm">
          <strong>References:</strong><br />
          [1] Regulation (EU) 2016/679 (GDPR)<br />
          [2] Organic Law 3/2018, of 5 December (LOPDGDD)<br />
          [3] Law 34/2002, of 11 July (LSSI-CE)
        </p>
      </div>
    </LegalPage>
  );
}
