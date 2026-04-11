import { LegalPage } from "@/components/layout/LegalPage";
import { AlertTriangle, Scale } from "lucide-react";
import { withBase } from "@/lib/basePath";

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" lastUpdated="January 2026">
      <div className="legal-warning">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-rido-yellow" />
          <h3 className="!mt-0 !mb-0 text-white font-bold">Please Read Carefully</h3>
        </div>
        <p className="!mb-0">
          By creating an account or using any of Rido&apos;s services, you confirm your acceptance of these Terms. If you do not agree, you are not authorised to use Rido&apos;s Services.
        </p>
      </div>

      <h2 id="1-introduction" className="legal-section">1. Introduction and Company Details</h2>
      <p>
        This document sets out the General Terms and Conditions (hereinafter, the &quot;Terms&quot;) governing the use of personal mobility vehicle (PMV) rental services and related services offered through the &quot;Rido&quot; mobile application (hereinafter, the &quot;App&quot;).
      </p>
      <p>
        The service is provided by <strong>Go2 Place S.L.</strong>, a commercial company duly incorporated under Spanish law, with Tax Identification Number (NIF) <strong>B01745405</strong> and its registered office at <strong>Calle Eneldo 3, C4, local 22 — Orihuela Costa — 03189</strong>, registered in the Commercial Registry of Alicante in Volume 4309, Folio 12, Sheet A-170633, Entry 1000173971259.
      </p>
      <p>Contact: <a href="mailto:info@rido.bike">info@rido.bike</a></p>
      <p>
        Go2Place S.L. is the sole owner and operator of the Rido mobile application. By using Rido&apos;s services, the registered user (hereinafter, the &quot;User&quot;) agrees to comply with and be legally bound by these Terms.
      </p>

      <h2 id="2-definitions" className="legal-section">2. Definitions</h2>
      <ul>
        <li><strong>Registered User</strong>: The natural person who, having completed the registration process in the App, contracts the services for their personal use or for a group. In the case of group rentals, the Registered User assumes full responsibility for all vehicles rented under their account.</li>
        <li><strong>Services</strong>: The comprehensive range of services offered by Go2Place S.L., encompassing the rental of Vehicles, access to and use of the App and its associated software, the website, maintenance, and any other complementary technology or service.</li>
        <li><strong>Vehicles</strong>: Electric personal mobility vehicles (PMVs), such as electric scooters, and any related equipment (e.g., charging stations, chargers) made available by Go2Place S.L. for rental.</li>
        <li><strong>App</strong>: The &quot;Rido&quot; mobile application, exclusively owned by Go2Place S.L., serving as the primary platform for accessing and utilising the Services.</li>
      </ul>

      <h2 id="3-registration" className="legal-section">3. Registration and User Account</h2>
      <p>
        To use the Services through the App, the User must create a user account and register. The information provided by the User to Go2Place S.L. must be truthful, accurate, and up-to-date at all times.
      </p>

      <div className="legal-highlight">
        <h3 className="!mt-0">3.1 Age Requirements</h3>
        <p className="!mb-0">
          The User must be at least <strong>18 years of age</strong> to register for and use the Services.
        </p>
      </div>

      <h3>3.2 Payment Methods</h3>
      <p>
        To use a Vehicle, the User must have a valid credit or debit card, a Rido charging card, or another certified payment method. Payment information is transmitted through a third-party payment service provider; therefore, Go2Place S.L. does not directly receive or store such information.
      </p>

      <h3>3.3 Mobile Device</h3>
      <p>
        The User will require a smartphone equipped with the latest software and hardware when creating an account and using the Services.
      </p>

      <h3>3.4 Fraudulent Conduct</h3>
      <p>
        Go2Place S.L. treats fraudulent conduct with the utmost seriousness. Should suspicion arise that the User has provided incorrect information, Go2Place S.L. reserves the right to suspend the User&apos;s account until the accuracy of the information has been verified.
      </p>

      <h2 id="4-use" className="legal-section">4. Use of the Service and the App</h2>
      <p>
        The User can use the Rido App to locate, reserve, and rent Vehicles. Go2Place S.L. reserves the right to accept or reject reservation requests. If a reservation via the App is rejected after the User&apos;s request, the User will receive the applicable refund if they were charged in the first place.
      </p>

      <h2 id="5-defects" className="legal-section">5. Defects and Damages</h2>
      <div className="legal-warning">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-5 h-5 text-rido-yellow" />
          <h3 className="!mt-0 !mb-0 text-white font-bold">Liability Notice</h3>
        </div>
        <p className="!mb-0">
          Damage can be costly, with the repair of a single Vehicle potentially reaching up to <strong>€2,000</strong>. Should a User damage a Vehicle, Go2Place S.L. reserves the right to levy a fee equivalent to the cost of repairing the Vehicle.
        </p>
      </div>
      <p>
        Beyond conventional wear and tear, Go2Place S.L. expects the User to return the Vehicle in the same condition as it was at the commencement of the rental. Should the User damage the Vehicle (whether deliberately, through negligence, or by accident), or fail to return the Vehicle in the expected manner resulting in damage, they shall be liable for the costs arising from such damage.
      </p>
      <p>
        If a Vehicle is not returned or located within 48 hours of being rented by a User, Go2Place S.L. will presume the Vehicle has been lost or stolen and reserves the right to levy a fee equivalent to the cost of replacing the Vehicle. Depending on the circumstances, Go2Place S.L. may be required to file a police report against the User.
      </p>
      <p>
        The use of Rido&apos;s Vehicles carries inherent risks, including the potential for malfunction. These risks may result in property damage, injury, or even death to the User or third parties. By utilising our services, the User acknowledges and accepts these risks.
      </p>

      <h2 id="6-rental" className="legal-section">6. Rental Period</h2>

      <div className="legal-highlight">
        <h3 className="!mt-0">Fees</h3>
        <p>The User may rent access to Vehicles for a per-minute fee in accordance with Rido&apos;s price list, which is available in the App. Prices include applicable taxes (VAT) and other fees.</p>
      </div>

      <h3>Out-of-Area Returns</h3>
      <p>
        Should the User fail to return a Vehicle to an appropriate location (i.e., more than 20 km outside the defined service area, on privately owned land, or in a location where the Vehicle is difficult to find or access):
      </p>
      <ul>
        <li>Return fee: up to <strong>€500</strong></li>
        <li>Within 20 km of service area: <strong>€50</strong> collection fee</li>
      </ul>

      <h3>Parking Photo Requirement</h3>
      <p>
        The User must take a parking photograph at the end of the ride; should this duty not be fulfilled, Go2Place S.L. reserves the right to charge a fee of <strong>€30</strong>.
      </p>

      <h3>Fines</h3>
      <p>
        Any fines or costs incurred from third parties, particularly governmental institutions, due to reckless parking or a breach of these Terms and applicable law, are the User&apos;s responsibility. Should Go2Place S.L. be charged by third parties, those fines or costs will be debited from the User&apos;s account.
      </p>

      <h2 id="7-financial" className="legal-section">7. Financial Terms and Conditions</h2>
      <p>
        The User may rent access to Vehicles for a per-minute fee in accordance with Rido&apos;s price list, which is available in the App. Please note that Go2Place S.L. reserves the right to amend its prices. Rido&apos;s prices include applicable taxes (VAT) and other fees.
      </p>
      <p>
        Payment of fees will be processed using the payment method selected by the User when setting up their account. All payments are processed through a third-party payment service provider.
      </p>
      <p>
        Go2Place S.L. may, at its sole discretion, offer bonuses, discounts, or promotions. These offers shall be subject to their own specific terms and conditions, which will be communicated to the User. The sale or transfer of bonus points is prohibited.
      </p>

      <h2 id="8-responsibilities" className="legal-section">8. User Responsibilities</h2>
      <p>
        Safety is the paramount priority for Go2Place S.L. The User is responsible for:
      </p>
      <ul>
        <li>Determining the battery charge level and estimating whether it will reach the intended destination</li>
        <li>Not using Vehicles whilst under the influence of alcohol or any other intoxicating substances</li>
        <li>Wearing an approved helmet (strongly recommended; compulsory where municipal ordinances mandate it)</li>
        <li>Keeping both hands on the handlebars at all times — no items held in hand whilst operating the Vehicle</li>
        <li>Not transporting passengers or animals on the Vehicle</li>
        <li>Not securing the Vehicle with locks not provided by Rido</li>
        <li>Not leaving Vehicles in locations to which Rido does not have access</li>
        <li>Exercising extreme caution when operating in pedestrian or motor vehicle traffic</li>
        <li>Exercising caution when placing the User&apos;s phone in the phone holder</li>
        <li>Complying with all applicable laws and regulations governing the use of Vehicles</li>
      </ul>

      <h2 id="9-privacy" className="legal-section">9. Data Protection and Privacy</h2>
      <p>
        At Go2Place S.L., we are fully committed to protecting your privacy. The processing of your personal data is conducted with the utmost diligence and in strict adherence to current data protection regulations.
      </p>
      <p>
        Go2Place S.L. complies with the provisions of <strong>Regulation (EU) 2016/679</strong> (GDPR) and <strong>Organic Law 3/2018</strong> (LOPDGDD).
      </p>
      <p>
        The Data Controller for your personal data is Go2Place S.L., with NIF B01745405 and its registered office at Calle Eneldo 3, C4, local 22 — Orihuela Costa — 03189.
      </p>
      <p>
        For full details, please refer to our <a href={withBase("/privacy")}>Privacy Policy</a>.
      </p>

      <h2 id="10-ip" className="legal-section">10. Intellectual Property</h2>
      <p>
        The Vehicles and Services remain the exclusive property of Go2Place S.L., and the User&apos;s engagement with them does not confer any transfer of ownership rights. The use of the Vehicles and Services does not grant the User ownership of any intellectual property rights pertaining to Rido&apos;s Vehicles and Services or the content accessed by the User, save for the limited licence granted to the User herein.
      </p>
      <p>
        All rights therein (including all intellectual property) are vested in Go2Place S.L. or its licensors. The User is prohibited from using content from Rido&apos;s Vehicles and Services without Rido&apos;s express prior written permission or as otherwise permitted by law. These Terms do not grant the User the right to use any trademarks, branding, or logos associated with Rido&apos;s Vehicles and Services.
      </p>

      <h2 id="11-modifications" className="legal-section">11. Modifications and Termination</h2>
      <h3>11.1 Modifications to the Terms</h3>
      <p>
        Go2Place S.L. reserves the right to modify these Terms, prices, and services at any time. Such modifications shall become effective upon their publication on the website or within the App, and shall be binding upon the User. The User will be notified via the App of the updated Terms and, in order to continue utilising our services, must accept the updated Terms.
      </p>
      <h3>11.2 Termination for Breach</h3>
      <p>
        Should the User culpably breach these Terms, Go2Place S.L. reserves the right to terminate the User&apos;s access to the Vehicles and Services, the App, and to deactivate and cancel the User&apos;s account. In the event of a minor infringement, Go2Place S.L. will notify the User and request that they cease the infringement. Should the User fail to comply, Go2Place S.L. may cancel their account and restrict access to the Vehicles and Services. In the event of such termination, the User shall not be entitled to reimbursement for any paid rental.
      </p>

      <h2 id="12-withdrawal" className="legal-section">12. Right of Withdrawal</h2>
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

      <h2 id="13-cookies" className="legal-section">13. Cookie Policy</h2>
      <p>
        Our App and website utilise cookies to ensure correct functionality and enhance your user experience. Go2Place S.L. informs the User that the App and the Rido website employ proprietary and third-party cookies to enhance the browsing experience, analyse traffic, and deliver personalised content.
      </p>
      <p>
        For detailed information on the cookies utilised, their purpose, and management, please consult our <a href="https://Rido.bike/politica-cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.
      </p>

      <h2 id="14-jurisdiction" className="legal-section">14. Applicable Law and Jurisdiction</h2>
      <p>
        These Terms are governed by <strong>Spanish law</strong>. In the event of any conflict or dispute arising in connection with the interpretation or application of these Terms, the parties shall submit to the jurisdiction of the Spanish Courts and Tribunals. If the User is a consumer, they may elect to file the claim before the Courts and Tribunals corresponding to their domicile.
      </p>

      <h2 id="15-odr" className="legal-section">15. Online Dispute Resolution (ODR Platform)</h2>
      <p>
        In accordance with <strong>Regulation (EU) No 524/2013</strong>, Go2Place S.L. informs consumers of the existence of the European Commission&apos;s online dispute resolution platform, available at <a href="http://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr/</a>, through which consumers may submit their complaints.
      </p>

      <h2 id="16-feedback" className="legal-section">16. Feedback</h2>
      <p>
        For any comments, requests, or if the User is dissatisfied with the services, please contact our customer support via our <strong>in-app chat</strong>.
      </p>

      <div className="legal-highlight mt-12">
        <p className="text-sm !mb-0">
          <strong>References:</strong><br />
          [1] Regulation (EU) 2016/679 (GDPR) — <a href="https://www.boe.es/doue/2016/119/L00001-00088.pdf" target="_blank" rel="noopener noreferrer">Link</a><br />
          [2] Organic Law 3/2018, of 5 December (LOPDGDD) — <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673" target="_blank" rel="noopener noreferrer">Link</a><br />
          [3] Law 34/2002, of 11 July (LSSI-CE) — <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758" target="_blank" rel="noopener noreferrer">Link</a><br />
          [4] Royal Legislative Decree 1/2007 (LGDCU) — <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555" target="_blank" rel="noopener noreferrer">Link</a><br />
          [5] Regulation (EU) No 524/2013 (ODR) — <a href="https://www.boe.es/doue/2013/165/L00001-00012.pdf" target="_blank" rel="noopener noreferrer">Link</a>
        </p>
      </div>
    </LegalPage>
  );
}