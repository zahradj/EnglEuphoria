import { LegalPageLayout } from './LegalPageLayout';

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description="EnglEuphoria Terms of Service — rules, accounts, content ownership, and the Hub system."
      lastUpdated="April 18, 2026"
    >
      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
        <p>
          By accessing or using EnglEuphoria ("the Platform"), you agree to be bound by these Terms of Service.
          If you do not agree, you may not use the Platform. These Terms apply to all visitors, students,
          parents, teachers, and content creators.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">2. User Accounts</h2>
        <p>
          You must provide accurate, complete information when creating an account. You are responsible for
          maintaining the confidentiality of your credentials and for all activity under your account. Accounts
          are personal and non-transferable. Users under 18 require parental consent.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">3. The Hub System</h2>
        <p>EnglEuphoria provides educational services through three specialized Hubs:</p>
        <ul className="list-disc pl-6 space-y-2 my-4">
          <li><strong>The Playground</strong> (kids, ages 5–11): lessons are <strong>30 minutes</strong> in duration.</li>
          <li><strong>The Academy</strong> (teens, ages 12–17): lessons are <strong>60 minutes</strong> in duration.</li>
          <li><strong>The Success Hub</strong> (adults / professionals, 18+): lessons are <strong>60 minutes</strong> in duration.</li>
        </ul>
        <p>
          Each Hub has its own curriculum, pricing, and pedagogical approach. Students are placed in the Hub that
          corresponds to their age group and proficiency level.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">4. Content Ownership</h2>
        <p>
          All curriculum, lesson materials, slides, audio, video, branding, mascots, and software on the Platform
          are the exclusive property of EnglEuphoria or its licensors and are protected by international copyright
          law. You may not copy, redistribute, resell, or create derivative works from Platform content without
          prior written permission.
        </p>
        <p>
          Content you submit (e.g., recordings, written answers, profile information) remains yours, but you grant
          EnglEuphoria a non-exclusive license to use it for the purpose of providing and improving the service.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">5. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 my-4">
          <li>Harass, abuse, or harm other users, teachers, or staff.</li>
          <li>Share account credentials or attempt to access another user's account.</li>
          <li>Record, screenshot, or redistribute live lesson content without consent.</li>
          <li>Use the Platform for any unlawful or fraudulent purpose.</li>
          <li>Reverse-engineer, scrape, or interfere with the Platform's infrastructure.</li>
        </ul>
        <p>
          Violation of these rules may result in suspension or permanent termination of your account without
          refund.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">6. Live Lessons & Technical Requirements</h2>
        <p>
          Users are responsible for maintaining a stable internet connection, working camera, and microphone for
          live sessions. EnglEuphoria is not liable for lesson interruptions caused by user-side connectivity
          issues. Lessons missed due to user error are non-refundable.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">7. Disclaimer & Limitation of Liability</h2>
        <p>
          The Platform is provided "as is" without warranties of any kind. EnglEuphoria's total liability shall
          not exceed the amount paid by you in the 12 months preceding any claim.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">8. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Platform after changes are posted
          constitutes your acceptance.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">9. Contact</h2>
        <p>Questions about these Terms? Contact us at <a href="mailto:hello@engleuphoria.com" className="text-indigo-400 hover:underline">hello@engleuphoria.com</a>.</p>
      </section>
    </LegalPageLayout>
  );
}
