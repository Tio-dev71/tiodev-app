import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - Tiodev',
  description: 'Refund and cancellation policy for Tiodev products.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative">
      <div className="max-w-4xl mx-auto glass rounded-3xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        
        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Digital Products and Subscriptions</h2>
          <p>
            Due to the nature of digital goods and services (including downloadable software, TradingView indicators, and digital subscriptions), we generally do not offer refunds once the purchase is completed and access has been granted.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Exceptions</h2>
          <p>We may, at our sole discretion, grant a refund in the following exceptional circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The product is completely non-functional, and our support team cannot resolve the issue within 7 days.</li>
            <li>The product description was materially misleading.</li>
            <li>A duplicate charge occurred due to a technical error on our payment gateway.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Subscription Cancellations</h2>
          <p>
            You may cancel your subscription at any time. Cancellation will prevent any further billing cycles, but it will not automatically trigger a refund for the current billing cycle. You will retain access to the subscription benefits until the end of your currently paid cycle.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Requesting a Refund</h2>
          <p>
            To request a refund under the exceptional circumstances outlined above, please contact our support team at <a href="mailto:thonguyen7106@gmail.com" className="text-primary-400 hover:underline">thonguyen7106@gmail.com</a> within 14 days of your purchase. Please include your order number, proof of purchase, and a detailed explanation of the issue.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Payment Gateway Processing</h2>
          <p>
            Refunds processed via cryptocurrency may be subject to network fees and exchange rate fluctuations. We are not responsible for value changes in cryptocurrency between the time of purchase and the time of the refund.
          </p>
        </div>
      </div>
    </div>
  );
}
