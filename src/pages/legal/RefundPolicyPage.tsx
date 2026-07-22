import { LegalPageLayout } from './LegalPageLayout';

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      description="EnglEuphoria refund and cancellation policy, including the 5-day cancellation rule."
      lastUpdated="April 18, 2026"
    >
      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">1. Overview</h2>
        <p>
          EnglEuphoria operates on a credit-based booking model. Students purchase lesson credits, then redeem
          them when booking sessions with teachers. This Policy governs how cancellations and refunds are handled.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">2. The 5-Day Cancellation Rule</h2>
        <p className="text-lg">
          <strong>To receive a credit refund for a scheduled lesson, you must cancel at least 120 hours
          (5 full days) before the lesson start time.</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 my-4">
          <li>
            Cancellations made <strong>more than 120 hours in advance</strong>: the lesson credit is fully
            returned to your account and may be reused for another booking.
          </li>
          <li>
            Cancellations made <strong>within the 120-hour window</strong>: the lesson is considered final.
            <strong> No refund or credit return will be issued.</strong>
          </li>
          <li>
            <strong>No-shows:</strong> students who fail to attend a scheduled lesson without cancelling forfeit
            the credit in full.
          </li>
        </ul>
        <p>This window protects our teachers, who block out time exclusively for your booking.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">3. Trial Lessons</h2>
        <p>
          <strong>Trial lessons are final sale and non-refundable</strong> under any circumstance. Trials are
          offered at a discounted introductory rate specifically because they are not eligible for refunds.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">4. Credit Pack Purchases</h2>
        <p>
          Lesson credit packs are non-refundable once purchased. Unused credits remain valid for the period
          specified at checkout (typically 12 months from the purchase date). Expired credits cannot be reinstated.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">5. Teacher-Initiated Cancellations</h2>
        <p>
          If a teacher cancels a lesson for any reason, your credit will be <strong>fully refunded</strong>
          regardless of the time of cancellation, and you will be offered priority rebooking.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">6. Technical Failures</h2>
        <p>
          If a lesson cannot be delivered due to a verified Platform-side technical failure (e.g., server outage),
          the credit will be returned in full. Failures originating from the user's device, network, or browser
          do not qualify for a refund.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">7. How to Cancel</h2>
        <p>
          You can cancel any upcoming booking from your dashboard under "My Schedule." The system will display
          whether you are within or outside the 120-hour window before confirming the cancellation.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">8. Disputes & Chargebacks</h2>
        <p>
          All payments are processed by Paddle, our Merchant of Record. Refund disputes should first be raised
          with EnglEuphoria support at{' '}
          <a href="mailto:billing@engleuphoria.com" className="text-indigo-400 hover:underline">billing@engleuphoria.com</a>.
          Initiating a chargeback without first contacting support may result in account suspension.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">9. Contact</h2>
        <p>For refund inquiries, contact <a href="mailto:billing@engleuphoria.com" className="text-indigo-400 hover:underline">billing@engleuphoria.com</a>.</p>
      </section>
    </LegalPageLayout>
  );
}
