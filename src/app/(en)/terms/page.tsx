import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { AlertTriangle, Scale, HardHat } from "lucide-react";
import { OG_LOCALE_EN, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and Conditions — Rido",
  description:
    "Rido's terms and conditions for e-scooter rental in Spain: registration, damage and insurance, parking and photo rules, fines and towing, helmet use, fees, dispute resolution, and applicable law.",
  alternates: { canonical: `${SITE_ORIGIN}/terms` },
  openGraph: {
    title: "Terms and Conditions — Rido",
    description: "Terms of service for Rido e-scooter rentals in Spain.",
    url: `${SITE_ORIGIN}/terms`,
    locale: OG_LOCALE_EN,
  },
};

/** Section 8 fee schedule. Amounts are the published operational fees, not ride fares. */
const FEES = [
  { category: "Missing/Damaged End-of-Ride Photo", amount: "€30", trigger: "Photo missing, black, or unidentifiable." },
  { category: "Missing/Unlocked/Damaged Helmet", amount: "€50", trigger: "Helmet not latched into dock, stolen, or damaged." },
  { category: "Administrative Fine Processing Fee", amount: "€40", trigger: "Handling authority notices, telemetry extraction, or impound release." },
  { category: "Municipal Fine & Towing Recovery", amount: "At cost", trigger: "Recharging police ticket and municipal tow depot fees." },
  { category: "Out-of-Area Collection Fee", amount: "€50 / €500", trigger: "Leaving the scooter up to 20 km (€50) or more than 20 km (€500) outside the service area." },
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      lastUpdated="October 2026"
      esIntro="Términos y condiciones del servicio de alquiler de patinetes y bicis eléctricas de Rido (Go2 Place S.L., NIF B01745405): registro, uso del vehículo, aparcamiento y foto de fin de viaje, casco, tarifas y penalizaciones, multas y ley aplicable."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_ORIGIN },
              { "@type": "ListItem", "position": 2, "name": "Terms and Conditions", "item": `${SITE_ORIGIN}/terms` },
            ],
          }),
        }}
      />
      <div className="legal-warning">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-rido-magenta-light" aria-hidden="true" />
          <h2 className="!mt-0 !mb-0 !text-lg text-white font-bold">Please Read Carefully</h2>
        </div>
        <p className="!mb-0">
          By creating an account or using any of Rido&apos;s services, you confirm your acceptance of these Terms. If you do not agree, you are not authorised to use Rido&apos;s Services. These Terms have been drafted and reviewed to comply with Spanish national traffic laws (TRLTSV), DGT directives, and EU consumer protection frameworks.
        </p>
      </div>

      <nav aria-label="Contents" className="legal-toc">
        <p className="!mb-2 text-sm font-semibold text-white">Contents</p>
        <ol>
          <li><a href="#1-introduction">Introduction and Company Details</a></li>
          <li><a href="#2-definitions">Definitions</a></li>
          <li><a href="#3-registration">Registration and User Account</a></li>
          <li><a href="#4-use">Use of the Service and the App</a></li>
          <li><a href="#5-damages">Defects, Damages, and Insurance</a></li>
          <li><a href="#6-parking">Rental Period, Parking, and Authority Fines</a></li>
          <li><a href="#7-responsibilities">User Responsibilities, Traffic Rules, and Equipment</a></li>
          <li><a href="#8-fees">Operational Fee Schedule</a></li>
          <li><a href="#9-financial">Financial Terms and Conditions</a></li>
          <li><a href="#10-privacy">Data Protection and Privacy</a></li>
          <li><a href="#11-ip">Intellectual Property</a></li>
          <li><a href="#12-modifications">Modifications and Termination</a></li>
          <li><a href="#13-withdrawal">Right of Withdrawal</a></li>
          <li><a href="#14-cookies">Cookie Policy</a></li>
          <li><a href="#15-adr">Alternative Dispute Resolution</a></li>
          <li><a href="#16-jurisdiction">Applicable Law and Jurisdiction</a></li>
          <li><a href="#17-feedback">Feedback</a></li>
        </ol>
      </nav>

      <h2 id="1-introduction" className="legal-section">1. Introduction and Company Details</h2>
      <p>
        This document sets out the General Terms and Conditions (hereinafter, the &quot;Terms&quot;) governing the use of personal mobility vehicle (PMV/VMP) rental services and related services offered through the &quot;Rido&quot; mobile application (hereinafter, the &quot;App&quot;).
      </p>
      <p>
        The service is provided by <strong>Go2 Place S.L.</strong>, a commercial company duly incorporated under Spanish law, with Tax Identification Number (NIF) <strong>B01745405</strong> and its registered office at <strong>Calle Eneldo 3, C4, local 22 — Orihuela Costa — 03189</strong>, registered in the Commercial Registry of Alicante in Volume 4309, Folio 12, Sheet A-170633, Entry 1000173971259.
      </p>
      <p>Contact: <a href="mailto:info@rido.bike">info@rido.bike</a></p>
      <p>
        Go2 Place S.L. is the sole owner and operator of the Rido mobile application. By using Rido&apos;s services, the registered user (hereinafter, the &quot;User&quot;) agrees to comply with and be legally bound by these Terms.
      </p>

      <h2 id="2-definitions" className="legal-section">2. Definitions</h2>
      <ul>
        <li><strong>Registered User</strong>: The natural person who, having completed the registration process in the App, contracts the services for personal use.</li>
        <li><strong>Services</strong>: The comprehensive range of services offered by Go2 Place S.L., encompassing the rental of Vehicles, access to the App, maintenance, and complementary technology.</li>
        <li><strong>Vehicles</strong>: Electric personal mobility vehicles (PMVs/VMPs), such as electric scooters, compliant with DGT specifications, along with related equipment including the attached locking smart-helmet.</li>
        <li><strong>App</strong>: The &quot;Rido&quot; mobile application, exclusively owned by Go2 Place S.L., serving as the primary platform for accessing and utilising the Services.</li>
      </ul>

      <h2 id="3-registration" className="legal-section">3. Registration and User Account</h2>
      <p>
        To use the Services through the App, the User must create an account. The information provided must be truthful, accurate, and up-to-date.
      </p>
      <div className="legal-highlight">
        <h3 className="!mt-0">3.1 Age Requirement</h3>
        <p className="!mb-0">
          The User must be at least <strong>18 years of age</strong> to register.
        </p>
      </div>
      <h3>3.2 Payment Methods</h3>
      <p>
        To use a Vehicle, the User must have a valid credit or debit card, a Rido charging card, or another certified payment method. Payment information is transmitted through a third-party payment service provider; therefore, Go2 Place S.L. does not directly receive or store such information.
      </p>
      <h3>3.3 Mobile Device</h3>
      <p>
        The User will require a smartphone equipped with the latest software and hardware when creating an account and using the Services.
      </p>
      <h3>3.4 Fraudulent Conduct</h3>
      <p>
        Go2 Place S.L. reserves the right to suspend accounts suspected of fraudulent conduct.
      </p>

      <h2 id="4-use" className="legal-section">4. Use of the Service and the App</h2>
      <p>
        The User can use the Rido App to locate, reserve, and rent Vehicles. Go2 Place S.L. reserves the right to accept or reject reservation requests. If a reservation via the App is rejected after the User&apos;s request, the User will receive the applicable refund if they were charged in the first place.
      </p>

      <h2 id="5-damages" className="legal-section">5. Defects, Damages, and Insurance</h2>
      <h3>5.1 General Damages</h3>
      <div className="legal-warning">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-5 h-5 text-rido-magenta-light" aria-hidden="true" />
          <p className="!mb-0 text-white font-bold">Liability Notice</p>
        </div>
        <p className="!mb-0">
          Beyond conventional wear and tear, the User must return the Vehicle in the condition it was rented. Should the User damage the Vehicle (deliberately, negligently, or by accident), they shall be liable for repair costs (up to <strong>€2,000</strong>).
        </p>
      </div>
      <p>
        A Vehicle not returned within 48 hours is presumed lost/stolen, incurring replacement costs. Depending on the circumstances, Go2 Place S.L. may be required to file a police report against the User.
      </p>
      <p>
        The use of Rido&apos;s Vehicles carries inherent risks, including the potential for malfunction. These risks may result in property damage, injury, or even death to the User or third parties. By utilising our services, the User acknowledges and accepts these risks.
      </p>

      <h3>5.2 Mandatory Civil Liability Insurance and Exclusions</h3>
      <ol>
        <li>
          <strong>Third-Party Coverage:</strong> In compliance with Spanish regulations governing personal mobility vehicles, Go2 Place S.L. maintains an active corporate Civil Liability Insurance policy covering third-party bodily injury and property damage resulting from the lawful operation of its certified fleet.
        </li>
        <li>
          <strong>Strict Exclusions and Right of Recourse (Acción de Repetición):</strong> Corporate insurance does not exempt the User from personal liability. The insurer and Go2 Place S.L. reserve the right of recourse to recover indemnities and costs if damages occur because the User: operated under the influence of alcohol or drugs; transported a passenger; circulated on prohibited roadways (sidewalks, interurban highways); permitted an unauthorised third party to use their account; or engaged in gross negligence.
        </li>
        <li>
          <strong>Non-Coverage of Fines:</strong> Municipal fines, towing surcharges, and administrative sanctions are strictly non-insurable and remain the sole liability of the User.
        </li>
      </ol>

      <h2 id="6-parking" className="legal-section">6. Rental Period, Parking, and Authority Fines</h2>
      <h3>6.1 Mandatory Parking Standards and Photo Verification</h3>
      <p>
        The User must park the Vehicle strictly in authorised zones in compliance with municipal mobility ordinances and Spanish traffic laws (TRLTSV).
      </p>
      <ul>
        <li>
          <strong>Prohibited Areas:</strong> Do not park on sidewalks (aceras), promenades blocking pedestrians, emergency exits, loading bays, PRM ramps, or tied to urban fixtures.
        </li>
        <li>
          <strong>Mandatory End-of-Ride Photo:</strong> The User must submit a clear photograph via the App demonstrating the Vehicle is upright, correctly parked, and the <strong>attached helmet is securely locked back into its dock</strong>. Failure to upload a verifiable photo incurs a non-compliance fee of <strong>€30</strong>.
        </li>
      </ul>
      <h3>6.2 User Liability for Fines, Towing Fees, and Police Sanctions</h3>
      <ol>
        <li>
          <strong>Direct Liability:</strong> The User assumes direct, exclusive liability for administrative infractions, traffic tickets, municipal citations (boletines de denuncia), and DGT/Local Police sanctions arising from improper parking or traffic violations.
        </li>
        <li>
          <strong>Driver Identification (Art. 11 TRLTSV):</strong> Go2 Place S.L. is statutorily obligated to identify the driver. We will transmit the User&apos;s legal name, DNI/NIE/Passport, address, email, GPS telemetry, and end-of-ride photo to the sanctioning authority. See the <Link href="/privacy#4-disclosure">Privacy Policy</Link> for details.
        </li>
        <li>
          <strong>Indemnification and Automatic Recharge:</strong> If Go2 Place S.L. is held liable or the Vehicle is impounded by municipal towing (grúa), Go2 Place S.L. will automatically charge the User&apos;s registered payment method for the <strong>full fine amount</strong>, the <strong>municipal impound fee</strong>, and an <strong>Administrative Processing Fee of €40</strong>.
        </li>
      </ol>

      <h2 id="7-responsibilities" className="legal-section">7. User Responsibilities, Traffic Rules, and Equipment</h2>
      <h3>7.1 Integrated Helmet System and Mandatory Use</h3>
      <div className="legal-highlight">
        <div className="flex items-center gap-3 mb-2">
          <HardHat className="w-5 h-5 text-rido-magenta" aria-hidden="true" />
          <p className="!mb-0 text-white font-bold">A helmet is required on every ride</p>
        </div>
        <ul className="!mb-0">
          <li><strong>National Legal Mandate:</strong> Spanish traffic regulations require an approved protective helmet. Circulating without one carries a Local Police/DGT fine of €200.</li>
          <li><strong>Provided Equipment:</strong> Every Rido scooter is equipped with a certified helmet attached via a smart-lock.</li>
          <li><strong>Helmet Replacement Fee:</strong> Concluding a rental with the helmet missing, unlocked, or damaged incurs a <strong>€50 fee</strong>. Police citations for failure to wear a helmet are the User&apos;s sole liability.</li>
        </ul>
      </div>
      <h3>7.2 DGT Certification and Vehicle Integrity</h3>
      <p>
        All Rido Vehicles comply with the DGT <em>Manual de características de los vehículos de movilidad personal</em>, featuring certification plates, 25 km/h speed limiters, dual brakes, and lighting. Tampering with any hardware, firmware, or the helmet lock is strictly prohibited.
      </p>
      <h3>7.3 General Circulation Rules</h3>
      <p>
        The User must strictly avoid circulating on sidewalks (aceras), motorways, or pedestrian zones. Operating under the influence of alcohol/drugs, using a mobile phone while riding, or carrying passengers is strictly prohibited.
      </p>
      <h3>7.4 Further Responsibilities</h3>
      <p>The User is also responsible for:</p>
      <ul>
        <li>Determining the battery charge level and estimating whether it will reach the intended destination</li>
        <li>Keeping both hands on the handlebars at all times — no items held in hand whilst operating the Vehicle</li>
        <li>Not transporting animals on the Vehicle</li>
        <li>Not securing the Vehicle with locks not provided by Rido</li>
        <li>Not leaving Vehicles in locations to which Rido does not have access</li>
        <li>Exercising extreme caution when operating in pedestrian or motor vehicle traffic</li>
        <li>Exercising caution when placing the User&apos;s phone in the phone holder</li>
        <li>Complying with all applicable laws and regulations governing the use of Vehicles</li>
      </ul>

      <h2 id="8-fees" className="legal-section">8. Operational Fee Schedule Summary</h2>
      <p>
        These fees apply in the circumstances set out in sections 5 to 7. They are separate from the per-minute rental price shown in the App.
      </p>
      <div className="legal-table-wrap" role="region" aria-label="Operational fee schedule" tabIndex={0}>
        <table className="legal-table">
          <thead>
            <tr>
              <th scope="col">Fee category</th>
              <th scope="col">Amount</th>
              <th scope="col">Trigger / condition</th>
            </tr>
          </thead>
          <tbody>
            {FEES.map((fee) => (
              <tr key={fee.category}>
                <th scope="row">{fee.category}</th>
                <td className="whitespace-nowrap font-semibold text-white">{fee.amount}</td>
                <td>{fee.trigger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        An out-of-area return includes leaving a Vehicle on privately owned land or in a location where it is difficult to find or access.
      </p>

      <h2 id="9-financial" className="legal-section">9. Financial Terms and Conditions</h2>
      <p>
        The User may rent access to Vehicles for a per-minute fee in accordance with Rido&apos;s price list, which is available in the App. Please note that Go2 Place S.L. reserves the right to amend its prices. Rido&apos;s prices include applicable taxes (VAT) and other fees.
      </p>
      <p>
        Payment of fees will be processed using the payment method selected by the User when setting up their account. All payments are processed through a third-party payment service provider.
      </p>
      <p>
        Go2 Place S.L. may, at its sole discretion, offer bonuses, discounts, or promotions. These offers shall be subject to their own specific terms and conditions, which will be communicated to the User. The sale or transfer of bonus points is prohibited.
      </p>

      <h2 id="10-privacy" className="legal-section">10. Data Protection and Privacy</h2>
      <p>
        Go2 Place S.L. complies with the provisions of <strong>Regulation (EU) 2016/679</strong> (GDPR) and <strong>Organic Law 3/2018</strong> (LOPDGDD). The Data Controller for your personal data is Go2 Place S.L., with NIF B01745405 and its registered office at Calle Eneldo 3, C4, local 22 — Orihuela Costa — 03189.
      </p>
      <p>
        For full details, including the end-of-ride photos and the data shared with traffic authorities, please refer to our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2 id="11-ip" className="legal-section">11. Intellectual Property</h2>
      <p>
        The Vehicles and Services remain the exclusive property of Go2 Place S.L., and the User&apos;s engagement with them does not confer any transfer of ownership rights. The use of the Vehicles and Services does not grant the User ownership of any intellectual property rights pertaining to Rido&apos;s Vehicles and Services or the content accessed by the User, save for the limited licence granted to the User herein.
      </p>
      <p>
        All rights therein (including all intellectual property) are vested in Go2 Place S.L. or its licensors. The User is prohibited from using content from Rido&apos;s Vehicles and Services without Rido&apos;s express prior written permission or as otherwise permitted by law. These Terms do not grant the User the right to use any trademarks, branding, or logos associated with Rido&apos;s Vehicles and Services.
      </p>

      <h2 id="12-modifications" className="legal-section">12. Modifications and Termination</h2>
      <h3>12.1 Modifications to the Terms</h3>
      <p>
        Go2 Place S.L. reserves the right to modify these Terms, prices, and services at any time. Such modifications shall become effective upon their publication on the website or within the App, and shall be binding upon the User. The User will be notified via the App of the updated Terms and, in order to continue utilising our services, must accept the updated Terms.
      </p>
      <h3>12.2 Termination for Breach</h3>
      <p>
        Should the User culpably breach these Terms, Go2 Place S.L. reserves the right to terminate the User&apos;s access to the Vehicles and Services, the App, and to deactivate and cancel the User&apos;s account. In the event of a minor infringement, Go2 Place S.L. will notify the User and request that they cease the infringement. Should the User fail to comply, Go2 Place S.L. may cancel their account and restrict access to the Vehicles and Services. In the event of such termination, the User shall not be entitled to reimbursement for any paid rental.
      </p>

      <h2 id="13-withdrawal" className="legal-section">13. Right of Withdrawal</h2>
      <div className="legal-highlight">
        <p className="!mb-0">
          In accordance with Royal Legislative Decree 1/2007 (LGDCU), the User, in their capacity as a consumer, possesses the right to withdraw from the contract within <strong>14 calendar days</strong> without needing to provide any justification.
        </p>
      </div>
      <p>
        <strong>Exceptions to the Right of Withdrawal:</strong> The right of withdrawal shall not apply to contracts pertaining to the provision of services, once the service has been fully performed, where the performance has commenced with the consumer&apos;s and user&apos;s prior express consent and with their acknowledgement that they will have forfeited their right of withdrawal.
      </p>
      <p>
        Given that Rido&apos;s Vehicle rental services are provided on a per-minute basis and commence immediately upon the User&apos;s acceptance, the right of withdrawal shall not be applicable once the service has begun to be performed with the User&apos;s express consent.
      </p>

      <h2 id="14-cookies" className="legal-section">14. Cookie Policy</h2>
      <p>
        Go2 Place S.L. informs the User that the App and the Rido website use on-device storage and similar technologies to ensure correct functionality, remember preferences, and — with the User&apos;s consent — measure traffic. The website does not use advertising or cross-site tracking cookies.
      </p>
      <p>
        For detailed information on the cookies utilised, their purpose, and management, please consult our <Link href="/politica-cookies">Cookie Policy</Link>.
      </p>

      <h2 id="15-adr" className="legal-section">15. Alternative Dispute Resolution (ADR)</h2>
      <p>
        In compliance with Directive 2013/11/EU and Spanish Law 7/2017 on alternative dispute resolution, Go2 Place S.L. informs Users that the European Online Dispute Resolution (ODR) platform under Regulation (EU) No 524/2013 has been discontinued and repealed by Regulation (EU) 2024/3238.
      </p>
      <p>
        Consumers may submit complaints to the competent consumer arbitration entities (Juntas Arbitrales de Consumo) or the European Consumer Centre Network (ECC-Net) via <a href="https://portal-cec.consumo.gob.es" target="_blank" rel="noopener noreferrer">portal-cec.consumo.gob.es</a>.
      </p>

      <h2 id="16-jurisdiction" className="legal-section">16. Applicable Law and Jurisdiction</h2>
      <p>
        These Terms are governed by <strong>Spanish law</strong>. Conflicts shall be submitted to the jurisdiction of the Spanish Courts and Tribunals. If the User is a consumer, they may elect to file the claim before the Courts and Tribunals corresponding to their domicile.
      </p>

      <h2 id="17-feedback" className="legal-section">17. Feedback</h2>
      <p>
        For any comments, requests, or if the User is dissatisfied with the services, please contact our customer support via our <strong>in-app chat</strong> or at <a href="mailto:info@rido.bike">info@rido.bike</a>.
      </p>

      <div className="legal-highlight mt-12">
        <p className="text-sm !mb-0">
          <strong>References:</strong><br />
          [1] Regulation (EU) 2016/679 (GDPR) — <a href="https://www.boe.es/doue/2016/119/L00001-00088.pdf" target="_blank" rel="noopener noreferrer">Link</a><br />
          [2] Organic Law 3/2018, of 5 December (LOPDGDD) — <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673" target="_blank" rel="noopener noreferrer">Link</a><br />
          [3] Law 34/2002, of 11 July (LSSI-CE) — <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758" target="_blank" rel="noopener noreferrer">Link</a><br />
          [4] Royal Legislative Decree 1/2007 (LGDCU) — <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555" target="_blank" rel="noopener noreferrer">Link</a><br />
          [5] Royal Legislative Decree 6/2015 (TRLTSV), Spanish Traffic Law<br />
          [6] Directive 2013/11/EU and Law 7/2017 on alternative dispute resolution for consumers<br />
          [7] Regulation (EU) 2024/3238, repealing Regulation (EU) No 524/2013 (ODR)
        </p>
      </div>
    </LegalPage>
  );
}
