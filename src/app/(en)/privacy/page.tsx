import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { Shield } from "lucide-react";
import { OG_LOCALE_EN, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — Rido",
  description:
    "How Rido (Go2 Place S.L.) collects, uses, shares, and protects your personal data, including end-of-ride photos and driver identification for traffic authorities. GDPR and LOPDGDD.",
  alternates: { canonical: `${SITE_ORIGIN}/privacy` },
  openGraph: {
    title: "Privacy Policy — Rido",
    description: "How we protect your personal data. GDPR-compliant privacy policy.",
    url: `${SITE_ORIGIN}/privacy`,
    locale: OG_LOCALE_EN,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="October 2026"
      esIntro="Política de privacidad de Rido (Go2 Place S.L., NIF B01745405): qué datos personales recogemos, para qué los usamos, con quién los compartimos y cuáles son tus derechos según el RGPD y la LOPDGDD."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_ORIGIN },
              { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${SITE_ORIGIN}/privacy` },
            ],
          }),
        }}
      />
      <div className="legal-highlight">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-rido-magenta" aria-hidden="true" />
          <h2 className="!mt-0 !mb-0 !text-lg text-white font-bold">Your Data, Your Rights</h2>
        </div>
        <p className="!mb-0">
          Protecting your privacy is of utmost importance to Rido. This policy explains what data we collect, how we use it, and your rights under GDPR and Spanish law.
        </p>
      </div>

      <h2 id="1-introduction" className="legal-section">1. Introduction and Company Details</h2>
      <p>
        This personal data protection policy covers personal information, regardless of whether it is collected and stored in digital format, on paper, or in any other comparable manner.
      </p>
      <p>
        The service is provided by <strong>Go2 Place S.L.</strong>, a commercial company duly incorporated under Spanish law, with Tax Identification Number (NIF) <strong>B01745405</strong> and its registered office at <strong>Calle Eneldo 3, C4, local 22 — Orihuela Costa — 03189</strong>, registered in the Commercial Registry of Alicante in Volume 4309, Folio 12, Sheet A-170633, Entry 1000173971259.
      </p>
      <p>
        <strong>Go2 Place S.L.</strong> (hereinafter, &quot;Rido&quot;) is the Data Controller of the personal data you provide to us. For any question about this policy, or to report a possible infringement of data protection regulations, contact us at <a href="mailto:info@rido.bike">info@rido.bike</a>.
      </p>

      <h2 id="2-legislation" className="legal-section">2. Applicable Legislation on Personal Data Protection</h2>
      <p>
        The processing of personal information is subject to current data protection regulations, including <strong>Regulation (EU) 2016/679</strong> (GDPR), as well as <strong>Organic Law 3/2018</strong>, of December 5, on Personal Data Protection and guarantee of digital rights (LOPDGDD).
      </p>

      <h2 id="3-collection" className="legal-section">3. Collection and Use of Personal Data</h2>
      <p>
        We collect and store a range of personal information about our customers to provide the requested service and based on the following legal bases:
      </p>
      <h3>3.1 Data Collected and Purposes of Processing</h3>
      <ul>
        <li><strong>Identification and contact data</strong>: Name, national ID, address, telephone, email. <em>Legal basis:</em> performance of contract and legitimate interest.</li>
        <li><strong>Financial data</strong>: Payment processing information. <em>Legal basis:</em> performance of contract.</li>
        <li><strong>Geolocation data</strong>: Data concerning the location of the rented vehicle. <em>Legal basis:</em> performance of contract.</li>
        <li>
          <strong>End-of-ride and helmet verification photos</strong>: Photographs uploaded by the User via the App upon terminating a rental. <em>Purpose:</em> to confirm that the vehicle is legally parked, the attached helmet is locked in its dock, enforce contractual surcharges, and provide evidentiary defence in municipal sanction proceedings. Users should avoid capturing visible faces of bystanders or third-party license plates. <em>Legal basis:</em> performance of a contract (Art. 6.1.b GDPR) and legitimate interest (Art. 6.1.f GDPR).
        </li>
        <li><strong>Usage data</strong>: Trip history, start/end times. <em>Legal basis:</em> performance of contract.</li>
        <li><strong>Device data</strong>: IP address, device type, browser version, operating system. <em>Legal basis:</em> legitimate interest in ensuring the correct functioning of the service and fraud prevention.</li>
      </ul>

      <h3 id="3-2-waitlist">3.2 Website Waitlist</h3>
      <p>
        Before the App launches, you can join the Rido waitlist on this website. We store the email address you enter, the language of the page, and the time you signed up. We then send you one email asking you to confirm the address, and record whether and when you confirmed it; if you do not confirm, we will not send you launch news. We use it only to tell you when Rido launches near you and to share launch details. <em>Legal basis:</em> your consent (Art. 6.1.a GDPR), which you can withdraw at any time by emailing <a href="mailto:info@rido.bike">info@rido.bike</a>. We keep this data until you withdraw consent or ask us to delete it.
      </p>

      <h3>3.3 Special Categories of Data</h3>
      <p>
        Rido does not process special categories of personal data (e.g., racial or ethnic origin, political opinions, religious beliefs, trade union membership, genetic data, biometric data, or data concerning health or sexual orientation).
      </p>

      <h2 id="4-disclosure" className="legal-section">4. Disclosure of Data to Third Parties</h2>
      <p>We may share your personal data with third parties in the following circumstances:</p>
      <ul>
        <li>
          <strong>Municipal Councils, Local Police, and Traffic Authorities</strong>: Go2 Place S.L. transmits the User&apos;s identification data (full name, DNI/NIE/Passport, address, telephone, email), trip timestamps, telemetry location logs, and end-of-ride photographs to the competent <em>Policía Local</em>, <em>Ayuntamiento</em>, or DGT in response to notifications of traffic infractions, improper parking tickets, helmet non-use, or municipal vehicle removals. <em>Legal basis:</em> compliance with a statutory legal obligation to identify the driver pursuant to Article 11 of the Spanish Traffic Law (Real Decreto Legislativo 6/2015 — TRLTSV) (Art. 6.1.c GDPR), and legitimate interest in defending against municipal liability (Art. 6.1.f GDPR).
        </li>
        <li><strong>Cloud and IT providers</strong>: For data storage, App and website hosting and maintenance, email delivery, and service delivery.</li>
        <li><strong>Payment providers</strong>: For processing fees securely.</li>
        <li><strong>Insurance companies</strong>: For the management of claims related to Vehicle use.</li>
      </ul>
      <p>
        Under no circumstances will we sell, trade, or otherwise transfer your personal information to outside parties, except as described in this policy or as required by law.
      </p>

      <h2 id="5-links" className="legal-section">5. Links to Third Parties</h2>
      <p>
        Our App and website may contain links to third-party websites or applications that are not operated or controlled by Rido. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of every site you visit, particularly if you are providing personal information.
      </p>

      <h2 id="6-security" className="legal-section">6. Security Measures and Data Retention</h2>
      <p>
        Rido has implemented appropriate technical and organisational measures (encryption, access controls) to protect your data. No method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
      </p>
      <p>Data is retained only as long as necessary:</p>
      <ul>
        <li><strong>Account data</strong>: Retained for the duration of the account and up to 3 years post-closure.</li>
        <li><strong>Ride and trip data</strong>: Typically retained for up to 5 years for billing, dispute resolution, and legal compliance.</li>
        <li><strong>Waitlist data</strong>: Retained until you withdraw consent or ask us to delete it (see section 3.2).</li>
        <li><strong>Cookie data</strong>: Retained in accordance with the <Link href="/politica-cookies">Cookie Policy</Link>.</li>
      </ul>

      <h2 id="7-rights" className="legal-section">7. Your Rights as a Data Subject</h2>
      <div className="legal-highlight">
        <p className="!mb-0">
          Under GDPR and LOPDGDD, you have the following rights:
        </p>
      </div>
      <ul>
        <li><strong>Right of Access</strong>: You may request confirmation as to whether your personal data is being processed and, if so, access that data along with a copy.</li>
        <li><strong>Right of Rectification</strong>: You may request the correction of inaccurate personal data or the completion of incomplete data.</li>
        <li><strong>Right of Erasure (Right to be Forgotten)</strong>: You may request the deletion of your personal data when it is no longer necessary for the purpose for which it was collected, or when you withdraw consent, or when you object to the processing.</li>
        <li><strong>Right to Restriction of Processing</strong>: You may request the restriction of processing of your data in certain circumstances, such as when you contest the accuracy of the data.</li>
        <li><strong>Right to Data Portability</strong>: You may request to receive your personal data in a structured, commonly used, and machine-readable format, and have it transmitted to another controller.</li>
        <li><strong>Right of Objection</strong>: You may object to the processing of your data based on legitimate interests, including profiling.</li>
        <li><strong>Right not to be subject to automated decisions</strong>: You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or significantly affects you.</li>
      </ul>
      <p>
        Contact us at <a href="mailto:info@rido.bike">info@rido.bike</a> with valid identification to exercise these rights.
      </p>

      <h2 id="8-amendments" className="legal-section">8. Amendments to the Privacy Policy</h2>
      <p>
        Rido reserves the right to modify this Privacy Policy at any time. Such modifications shall become effective upon their publication on our website and/or through the App. We recommend that you review this page periodically for the latest information on our privacy practices.
      </p>
      <p>
        If the changes are substantial, we will make reasonable efforts to notify you through the App or via email prior to the changes taking effect, particularly where the changes affect the processing of your data.
      </p>

      <h2 id="9-complaint" className="legal-section">9. Right to File a Complaint</h2>
      <p>
        If you believe your data has been processed incorrectly, you have the right to file a complaint with the Spanish Data Protection Agency (Agencia Española de Protección de Datos — AEPD) via <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
      </p>

      <h2 id="cookies" className="legal-section">Cookie Policy</h2>
      <p>
        The Rido website does not set traditional tracking cookies. When you answer the consent banner, that choice is stored in this browser&apos;s local storage so we do not ask again. Cookieless analytics (Vercel Analytics, only on pages served from Vercel&apos;s hosting) and our own anonymous counts of waitlist-form views, submissions and share clicks run only if you choose Accept. If you decline, or do not answer, neither runs. We do not use advertising cookies or cross-site tracking.
      </p>
      <p>
        What runs on your device, the legal basis, and how to withdraw consent are set out in the{" "}
        <Link href="/politica-cookies" className="cursor-pointer">Cookie Policy</Link>.
      </p>

      <div className="legal-highlight mt-12">
        <p className="!mb-0 text-sm">
          <strong>References:</strong><br />
          [1] Regulation (EU) 2016/679 (GDPR)<br />
          [2] Organic Law 3/2018, of 5 December (LOPDGDD)<br />
          [3] Law 34/2002, of 11 July (LSSI-CE)<br />
          [4] Royal Legislative Decree 6/2015 (TRLTSV), Article 11
        </p>
      </div>
    </LegalPage>
  );
}
