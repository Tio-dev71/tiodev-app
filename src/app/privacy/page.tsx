import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Tiodev',
  description: 'Privacy Policy for Tiodev services.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative">
      <div className="max-w-4xl mx-auto glass rounded-3xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect about you to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our Services.</li>
            <li>Process transactions and send you related information, including confirmations and receipts.</li>
            <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
            <li>Respond to your comments, questions, and requests, and provide customer service.</li>
            <li>Communicate with you about products, services, offers, promotions, rewards, and events offered by Tiodev and others.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Sharing of Information</h2>
          <p>
            We do not share your personal information with third parties except as described in this privacy policy. We may share your information with our service providers who need access to such information to carry out work on our behalf.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:thonguyen7106@gmail.com" className="text-primary-400 hover:underline">thonguyen7106@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
