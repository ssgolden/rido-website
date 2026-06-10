import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Rido",
  description: "Learn how Rido (Go2 Place S.L.) collects, uses, and protects your personal data. GDPR-compliant privacy policy for our shared e-scooter and e-bike services in Spain.",
  alternates: { canonical: "https://rido.bike/privacy" },
  openGraph: {
    title: "Privacy Policy — Rido",
    description: "How we protect your personal data. GDPR-compliant privacy policy.",
    url: "https://rido.bike/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="January 2026">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rido.bike" },
              { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://rido.bike/privacy" },
            ],
          }),
        }}
      />
      <div className="legal-highlight">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-rido-magenta" />
          <h3 className="!mt-0 !mb-0 text-white font-bold">Your Data, Your Rights</h3>
        </div>
        <p className="!mb-0">
          Protecting your privacy is of utmost importance to Rido. This policy explains what data we collect, how we use it, and your rights under GDPR and Spanish law.
        </p>
      </div>

      <h2 id="1-introduction" className="legal-section">1. Introduction and Company Details</h2>
      <p>
        Protecting your privacy is of utmost importance to Rido. This personal data protection policy covers personal information, regardless of whether it is collected and stored in digital format, on paper, or in any other comparable manner. The policy includes data entry, data storage, and the processing of personal information that falls within its scope. This policy is available on Rido&apos;s website.
      </p>
      <p>The service is provided by <strong>Go2 Place S.L.</strong>, a commercial company duly incorporated under Spanish law, with Tax Identification Number (NIF) <strong>B01745405</strong> and its registered office at <strong>Calle Eneldo 3, C4, local 22 — Orihuela Costa — 03189</strong>, registered in the Commercial Registry of Alicante in Volume 4309, Folio 12, Sheet A-170633, Entry 1000173971259.</p>
      <p>You can contact us via email at: <a href="mailto:info@rido.bike">info@rido.bike</a></p>

      <h2 id="2-legislation" className="legal-section">2. Applicable Legislation on Personal Data Protection</h2>
      <p>
        The processing of personal information is subject to current data protection regulations, including <strong>Regulation (EU) 2016/679</strong> of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data (General Data Protection Regulation or GDPR), as well as <strong>Organic Law 3/2018</strong>, of December 5, on Personal Data Protection and guarantee of digital rights (LOPDGDD).
      </p>
      <p>These regulations govern, among other aspects, the collection, storage, processing, and transfer of personal data.</p>

      <h2 id="3-responsibility" className="legal-section">3. Responsibility</h2>
      <p>
        <strong>Go2 Place S.L.</strong> (hereinafter, &quot;Rido&quot;) is the Data Controller of the personal data you provide to us and for the management of such data in its operations. Rido is authorized to use the personal data you provide to us.
      </p>
      <p>
        You can contact us regarding our personal data protection policy or file a complaint about a possible infringement of data protection regulations by sending an email to <a href="mailto:info@rido.bike">info@rido.bike</a>
      </p>
      <p>
        For any queries related to the protection of your personal data, you can contact our Data Protection Officer (DPO) at: <a href="mailto:info@rido.bike">info@rido.bike</a>
      </p>

      <h2 id="4-collection" className="legal-section">4. Collection and Use of Personal Data</h2>
      <p>
        We collect and store a range of personal information about our customers, as detailed below. We collect this information in order to provide the requested service and based on the following legal bases:
      </p>

      <h3>4.1 Data Collected and Purposes of Processing</h3>
      <ul>
        <li><strong>Identification and contact data</strong>: Name, national identification number (or date and year of birth), address, telephone number, and email address. This data is used for managing your user account, providing the contracted services, and communicating with you. The legal basis is the performance of a contract and Rido&apos;s legitimate interest.</li>
        <li><strong>Financial data</strong>: Credit card number, debit card number, bank account information. This data is processed for the collection of fees for the services provided. The legal basis is the performance of a contract.</li>
        <li><strong>Geolocation data</strong>: Data concerning the location of the rented vehicle during and after the rental period. The legal basis is the performance of the contract for the provision of the rented vehicle service.</li>
        <li><strong>Device data</strong>: IP address, device type, browser version, operating system. The legal basis is Rido&apos;s legitimate interest in ensuring the correct functioning of the service, fraud prevention, and continuous improvement.</li>
        <li><strong>Usage data</strong>: Information related to the use of the App and the service. This includes trip history, ride start and end times, and distance travelled. The legal basis is the performance of the contract and Rido&apos;s legitimate interest in improving its services.</li>
      </ul>

      <h3>4.2 Special Categories of Data</h3>
      <p>
        Rido does not process special categories of personal data (e.g., racial or ethnic origin, political opinions, religious beliefs, trade union membership, genetic data, biometric data, or data concerning health or sexual orientation).
      </p>

      <h2 id="5-disclosure" className="legal-section">5. Disclosure of Data to Third Parties</h2>
      <p>
        We may share your personal data with third parties in the following circumstances:
      </p>
      <ul>
        <li><strong>Cloud computing service providers</strong>: For data storage and processing.</li>
        <li><strong>Payment service providers</strong>: For processing payments for the services contracted through the App.</li>
        <li><strong>Public authorities and law enforcement agencies</strong>: When required by law or to comply with legal obligations, court orders, or requests from public authorities.</li>
        <li><strong>Insurance companies</strong>: For the management of claims and coverage related to the use of the Vehicles.</li>
        <li><strong>IT service providers</strong>: For the maintenance, development, and improvement of our IT systems and the App.</li>
      </ul>
      <p>
        Under no circumstances will we sell, trade, or otherwise transfer your personal information to outside parties, except as described in this policy or as required by law.
      </p>

      <h2 id="6-links" className="legal-section">6. Links to Third Parties</h2>
      <p>
        Our App and website may contain links to third-party websites or applications that are not operated or controlled by Rido. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of every site you visit, particularly if you are providing personal information.
      </p>

      <h2 id="7-security" className="legal-section">7. Security Measures</h2>
      <p>
        Rido has implemented appropriate technical and organisational measures to protect the personal data it processes against accidental loss, unauthorised access, manipulation, or disclosure. These measures include, but are not limited to:
      </p>
      <ul>
        <li>Encryption of personal data in transit and at rest</li>
        <li>Access controls and authentication mechanisms</li>
        <li>Regular security audits and vulnerability assessments</li>
        <li>Employee training on data protection policies</li>
        <li>Incident response procedures</li>
      </ul>
      <p>
        Despite our best efforts, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
      </p>

      <h2 id="8-retention" className="legal-section">8. Data Retention</h2>
      <p>
        Personal data will be retained for no longer than is necessary for the purposes for which it was collected. The criteria for data retention periods are as follows:
      </p>
      <ul>
        <li><strong>Account data</strong>: Retained for the duration of the user account and up to 3 years after account closure, unless legal requirements stipulate otherwise.</li>
        <li><strong>Ride/trip data</strong>: Retained for the duration necessary for billing, dispute resolution, and legal compliance, typically up to 5 years.</li>
        <li><strong>Marketing communications data</strong>: Retained until the user withdraws consent or requests deletion.</li>
        <li><strong>Cookie data</strong>: Retained in accordance with the Cookie Policy and applicable legislation.</li>
      </ul>

      <h2 id="9-rights" className="legal-section">9. Your Rights as a Data Subject</h2>
      <div className="legal-highlight">
        <p className="!mb-0">
          Under GDPR (Regulation EU 2016/679) and LOPDGDD (Organic Law 3/2018), you have the following rights:
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
        To exercise any of these rights, please contact us at <a href="mailto:info@rido.bike">info@rido.bike</a> or at the postal address indicated in section&nbsp;1, enclosing a copy of your ID card or equivalent identification document.
      </p>

      <h2 id="10-amendments" className="legal-section">10. Amendments to the Privacy Policy</h2>
      <p>
        Rido reserves the right to modify this Privacy Policy at any time. Such modifications shall become effective upon their publication on our website and/or through the App. We recommend that you review this page periodically for the latest information on our privacy practices.
      </p>
      <p>
        If the changes are substantial, we will make reasonable efforts to notify you through the App or via email prior to the changes taking effect, particularly where the changes affect the processing of your data.
      </p>

      <h2 id="11-complaint" className="legal-section">11. Right to File a Complaint with the Supervisory Authority</h2>
      <p>
        If you believe that the processing of your data infringes applicable regulations, you have the right to file a complaint with the Spanish Data Protection Agency (Agencia Española de Protección de Datos — AEPD), via <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
      </p>

      <h2 id="cookies" className="legal-section">Cookie Policy</h2>
      <p>
        Our website and app use cookies and similar tracking technologies to ensure proper functionality, analyze traffic, and enhance your experience. Cookies are small data files stored on your device when you visit our website.
      </p>
      <h3>Types of Cookies We Use</h3>
      <ul>
        <li><strong>Essential Cookies</strong>: Required for the website to function properly, including session management and security features.</li>
        <li><strong>Analytical Cookies</strong>: Help us understand how visitors interact with our website, allowing us to improve our services.</li>
        <li><strong>Functional Cookies</strong>: Enable enhanced functionality and personalization, such as remembering your preferences.</li>
      </ul>
      <p>
        You can manage your cookie preferences through your browser settings. For more details on the specific cookies we use, please contact us at <a href="mailto:info@rido.bike">info@rido.bike</a>.
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