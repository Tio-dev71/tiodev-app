'use client';

import { motion } from 'framer-motion';
import { CreditCard, QrCode, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, affiliateCode, getOrderSummary, clearCart } = useCartStore();
  const summary = getOrderSummary();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'vietqr'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vietqrData, setVietqrData] = useState<{ qrImageUrl: string; bankName: string; accountNo: string; accountName: string; amount: number; description: string } | null>(null);
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '', shippingAddress: '' });

  if (items.length === 0 && !vietqrData) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No items in cart</h2>
          <Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail) { setError('Please fill in all required fields'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          ...form,
          paymentMethod,
          affiliateCode: affiliateCode || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || 'Checkout failed'); return; }

      if (paymentMethod === 'stripe' && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else if (paymentMethod === 'vietqr') {
        setVietqrData(data.vietqr);
      } else if (data.orderId) {
        clearCart();
        router.push(`/checkout/success?orderId=${data.orderId}`);
      }
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  if (vietqrData) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Scan to Pay</h2>
            <p className="text-white/40 text-sm mb-6">Scan the QR code with your banking app to complete payment</p>
            <div className="bg-white rounded-2xl p-4 mb-6 inline-block">
              <img src={vietqrData.qrImageUrl} alt="VietQR Payment Code" className="w-64 h-64 object-contain" />
            </div>
            <div className="glass rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm"><span className="text-white/40">Bank</span><span className="text-white font-medium">{vietqrData.bankName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">Account</span><span className="text-white font-medium">{vietqrData.accountNo}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">Name</span><span className="text-white font-medium">{vietqrData.accountName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">Amount</span><span className="text-white font-bold">{formatPrice(vietqrData.amount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">Message</span><span className="text-white font-medium text-xs">{vietqrData.description}</span></div>
            </div>
            <p className="text-white/30 text-xs">After payment, your order will be confirmed automatically or by admin review.</p>
            <button onClick={() => { clearCart(); router.push('/checkout/success?method=vietqr'); }} className="mt-4 w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition-colors">
              I&apos;ve completed the transfer
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[128px]" /></div>
      <div className="max-w-4xl mx-auto relative">
        <Link href="/cart" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Cart</Link>
        <h1 className="text-3xl font-bold text-white mb-10">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Customer Info */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div><label className="text-sm text-white/40 mb-1 block">Full Name *</label><input type="text" required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" id="checkout-name" /></div>
                <div><label className="text-sm text-white/40 mb-1 block">Email *</label><input type="email" required value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" id="checkout-email" /></div>
                <div><label className="text-sm text-white/40 mb-1 block">Phone</label><input type="tel" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" id="checkout-phone" /></div>
                <div><label className="text-sm text-white/40 mb-1 block">Shipping Address</label><textarea value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})} rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" id="checkout-address" /></div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setPaymentMethod('stripe')} className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'stripe' ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'}`}>
                  <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'stripe' ? 'text-primary-400' : 'text-white/40'}`} />
                  <div className="text-sm font-medium text-white">Credit Card</div>
                  <div className="text-xs text-white/40">Visa, Mastercard, etc.</div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('vietqr')} className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'vietqr' ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'}`}>
                  <QrCode className={`w-6 h-6 mb-2 ${paymentMethod === 'vietqr' ? 'text-primary-400' : 'text-white/40'}`} />
                  <div className="text-sm font-medium text-white">VietQR</div>
                  <div className="text-xs text-white/40">Bank Transfer (VN)</div>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 sticky top-28">
              <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-white/60 truncate mr-2">{item.name} × {item.quantity}</span>
                    <div className="flex flex-col items-end flex-shrink-0">
                      {summary.discountPercent > 0 ? (
                        <>
                          <span className="text-white/30 line-through text-xs">{formatPrice(item.price * item.quantity)}</span>
                          <span className="text-emerald-400 font-medium">{formatPrice(item.price * item.quantity * (1 - summary.discountPercent / 100))}</span>
                        </>
                      ) : (
                        <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-white/40">Subtotal</span><span className="text-white">{formatPrice(summary.subtotal)}</span></div>
                {summary.discount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-{formatPrice(summary.discount)}</span></div>}
                <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-white font-semibold">Total</span><span className="text-xl font-bold gradient-text">{formatPrice(summary.total)}</span></div>
              </div>
              {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
              <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full py-4 mt-6 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl hover:from-primary-500 hover:to-primary-400 transition-all glow disabled:opacity-50" id="checkout-submit">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                {loading ? 'Processing...' : `Pay ${formatPrice(summary.total)}`}
              </button>
              <p className="text-white/20 text-xs text-center mt-3 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Secured by Stripe</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
