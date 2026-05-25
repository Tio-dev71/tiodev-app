import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Tiodev',
  description: 'Terms of Service for Tiodev products and services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative">
      <div className="max-w-4xl mx-auto glass rounded-3xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing our website and purchasing our products (including TradingView indicators, subscriptions, and other digital goods), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Tiodev and its licensors. The Service is protected by copyright, trademark, and other laws of both the country of operations and foreign countries. You may not resell, distribute, or modify our digital products without explicit permission.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Subscriptions and Payments</h2>
          <p>
            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
            Payments made via cryptocurrency or fiat gateways are processed securely. You are responsible for ensuring sufficient funds and entering the correct payment details.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Digital Goods Delivery</h2>
          <p>
            Upon successful payment, digital goods (e.g., indicator access, software downloads) are typically delivered automatically. In cases where manual processing is required (e.g., TradingView invites), access will be granted within 24 hours of payment confirmation.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Disclaimer of Warranties</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied. Trading indicators and software are tools and do not guarantee financial profits. You are solely responsible for your trading decisions.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </div>
      </div>
    </div>
  );
}
