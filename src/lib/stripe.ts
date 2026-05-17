// ============================================
// Stripe SDK Initialization
// Lazy-loaded to prevent build errors when key is missing
// ============================================

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set. Please configure it in your .env file.');
    }
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

// For backward compatibility, export a proxy that lazy-loads
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});
