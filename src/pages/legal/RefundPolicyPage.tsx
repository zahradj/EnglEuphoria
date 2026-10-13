import { Trans, useTranslation } from 'react-i18next';
import { LegalPageLayout } from './LegalPageLayout';

const H2 = 'font-display text-2xl font-semibold mt-8 mb-3';
const MAIL = <a href="mailto:billing@engleuphoria.com" className="text-indigo-400 hover:underline" />;

/** Students cancel up to 8 hours before a lesson; teachers need 48 hours' notice. Text lives in translations/<lang>/cancelPolicy.ts. */
export default function RefundPolicyPage() {
  const { t } = useTranslation();
  const bold = { b: <strong /> };

  return (
    <LegalPageLayout
      title={t('rp.title', 'Refund & Cancellation Policy')}
      description={t('rp.desc', 'EnglEuphoria refund and cancellation policy: students can cancel up to 8 hours before a lesson; teachers must give 48 hours’ notice.')}
      lastUpdated={t('rp.updated', 'October 13, 2026')}
    >
      <section>
        <h2 className={H2}>{t('rp.s1.title', '1. Overview')}</h2>
        <p>{t('rp.s1.body', 'EnglEuphoria operates on a credit-based booking model. Students purchase lesson credits, then redeem them when booking sessions with teachers. This Policy governs how cancellations and refunds are handled.')}</p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s2.title', '2. Student Cancellation Rule (8 Hours)')}</h2>
        <p className="text-lg">
          <strong>{t('rp.s2.lead', 'To receive a credit refund for a scheduled lesson, a student must cancel at least 8 hours before the lesson start time.')}</strong>
        </p>
        <ul className="list-disc ps-6 space-y-2 my-4">
          <li><Trans i18nKey="rp.s2.b1" defaults="Cancellations made <b>more than 8 hours in advance</b>: the lesson credit is fully returned to your account and may be reused for another booking." components={bold} /></li>
          <li><Trans i18nKey="rp.s2.b2" defaults="Cancellations made <b>within 8 hours</b> of the lesson: the lesson is considered final. <b>No refund or credit return will be issued.</b>" components={bold} /></li>
          <li><Trans i18nKey="rp.s2.b3" defaults="<b>No-shows:</b> students who fail to attend a scheduled lesson without cancelling forfeit the credit in full." components={bold} /></li>
        </ul>
        <p>{t('rp.s2.foot', 'This window protects our teachers, who block out time exclusively for your booking.')}</p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s3.title', '3. Teacher Cancellation Rule (48 Hours)')}</h2>
        <p><Trans i18nKey="rp.s3.body" defaults="Teachers must cancel or reschedule a booked lesson at least <b>48 hours (2 full days)</b> before its start time, so students can plan around it. Teachers who cancel later may be subject to a late-cancellation penalty." components={bold} /></p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s4.title', '4. Trial Lessons')}</h2>
        <p><Trans i18nKey="rp.s4.body" defaults="<b>Trial lessons are final sale and non-refundable</b> under any circumstance. Trials are offered at a discounted introductory rate specifically because they are not eligible for refunds." components={bold} /></p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s5.title', '5. Credit Pack Purchases')}</h2>
        <p>{t('rp.s5.body', 'Lesson credit packs are non-refundable once purchased. Unused credits remain valid for the period specified at checkout (typically 12 months from the purchase date). Expired credits cannot be reinstated.')}</p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s6.title', '6. Teacher-Initiated Cancellations')}</h2>
        <p><Trans i18nKey="rp.s6.body" defaults="If a teacher cancels a lesson for any reason, your credit will be <b>fully refunded</b> regardless of the time of cancellation, and you will be offered priority rebooking." components={bold} /></p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s7.title', '7. Technical Failures')}</h2>
        <p>{t('rp.s7.body', 'If a lesson cannot be delivered due to a verified Platform-side technical failure (e.g., server outage), the credit will be returned in full. Failures originating from the user’s device, network, or browser do not qualify for a refund.')}</p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s8.title', '8. How to Cancel')}</h2>
        <p>{t('rp.s8.body', 'You can cancel any upcoming booking from your dashboard under “My Schedule.” The system will display whether you are within or outside the 8-hour window before confirming the cancellation.')}</p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s9.title', '9. Disputes & Chargebacks')}</h2>
        <p><Trans i18nKey="rp.s9.body" defaults="All payments are processed by Stripe, our payment processor. Refund disputes should first be raised with EnglEuphoria support at <mail>billing@engleuphoria.com</mail>. Initiating a chargeback without first contacting support may result in account suspension." components={{ mail: MAIL }} /></p>
      </section>

      <section>
        <h2 className={H2}>{t('rp.s10.title', '10. Contact')}</h2>
        <p><Trans i18nKey="rp.s10.body" defaults="For refund inquiries, contact <mail>billing@engleuphoria.com</mail> or by mail at:" components={{ mail: MAIL }} /></p>
        <p className="not-prose">
          EnglEuphoria<br />
          30 N Gould St, Ste R<br />
          Sheridan, WY 82801<br />
          United States
        </p>
      </section>
    </LegalPageLayout>
  );
}
