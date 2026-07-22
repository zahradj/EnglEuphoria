import { LegalPageLayout } from './LegalPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="EnglEuphoria Privacy Policy — how we collect, use, and protect your data."
      lastUpdated="April 18, 2026"
    >
      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">1. Our Commitment</h2>
        <p>
          EnglEuphoria ("we", "us") values your privacy. This Policy describes what data we collect, how we use
          it, and your rights. We do not sell your personal data to third parties.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">2. Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-2 my-4">
          <li><strong>Account information:</strong> name, email, date of birth, profile photo, language preferences.</li>
          <li><strong>Educational data:</strong> CEFR level, lesson progress, quiz responses, achievements, time on task.</li>
          <li><strong>Live session media:</strong> camera and microphone streams during scheduled lessons.</li>
          <li><strong>Usage data:</strong> device type, browser, IP address, page views, timestamps.</li>
          <li><strong>Payment data:</strong> handled exclusively by our payment processor (see Section 4).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">3. Authentication & Storage (Supabase)</h2>
        <p>
          Account authentication, user profiles, and learning data are stored on infrastructure provided by
          Supabase, an industry-standard backend platform. Data is encrypted in transit (TLS) and at rest. Access
          is restricted by Row Level Security (RLS) policies so users can only access their own records.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">4. Payment Processing (Paddle)</h2>
        <p>
          All payments are processed by <strong>Paddle</strong>, our Merchant of Record. Paddle handles billing,
          tax compliance, and chargebacks on our behalf. EnglEuphoria does not store your full credit card
          details. For Paddle's privacy practices, see{' '}
          <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            paddle.com/legal/privacy
          </a>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">5. Camera & Microphone Use</h2>
        <p>
          We access your camera and microphone <strong>only during active live classroom sessions</strong>, and
          only after your browser grants explicit permission. Streams are peer-to-peer between teacher and
          student. We do not record sessions by default. If a session is recorded for educational quality
          assurance, both parties will be notified before recording begins.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">6. Children's Privacy</h2>
        <p>
          Students under 13 (Playground Hub) require verified parental consent. Parent accounts have visibility
          into the child's progress and can request deletion of the child's data at any time.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">7. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2 my-4">
          <li>To provide lessons, track progress, and personalize the learning experience.</li>
          <li>To communicate updates, transactional emails, and support replies.</li>
          <li>To process payments and prevent fraud.</li>
          <li>To improve curriculum and AI tutoring quality.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">8. Your Rights</h2>
        <p>
          You may request access, correction, export, or deletion of your personal data at any time by emailing{' '}
          <a href="mailto:privacy@engleuphoria.com" className="text-indigo-400 hover:underline">privacy@engleuphoria.com</a>.
          GDPR and CCPA rights are honored where applicable.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">9. Data Retention</h2>
        <p>
          Active account data is retained for the lifetime of your account. After deletion, residual data is
          purged within 30 days, except where required by law (e.g., tax records).
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">10. Contact</h2>
        <p>For privacy questions, contact <a href="mailto:privacy@engleuphoria.com" className="text-indigo-400 hover:underline">privacy@engleuphoria.com</a>.</p>
      </section>
    </LegalPageLayout>
  );
}
