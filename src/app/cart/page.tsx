'use client';

import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, affiliateCode, setAffiliateCode, clearAffiliateCode, getOrderSummary } = useCartStore();
  const [codeInput, setCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const summary = getOrderSummary();

  async function handleApplyCode() {
    if (!codeInput.trim()) return;
    setCodeLoading(true);
    setCodeError('');
    setCodeSuccess('');
    try {
      const res = await fetch('/api/affiliates/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.valid) {
        setAffiliateCode(data.code, data.discountPercent);
        setCodeSuccess(`${data.discountPercent}% discount applied!`);
      } else {
        setCodeError(data.message || 'Invalid code');
      }
    } catch { setCodeError('Failed to validate code'); }
    finally { setCodeLoading(false); }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full glass flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-white/40 mb-8">Browse our store and add some items!</p>
          <Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 transition-colors">
            <ShoppingBag className="w-5 h-5" /> Browse Store
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[128px]" />
      </div>
      <div className="max-w-6xl mx-auto relative">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-bold text-white mb-10">
          Shopping <span className="gradient-text">Cart</span>
        </motion.h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div key={item.productId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5 flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary-900/30 to-accent-900/30 flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-white/10" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/store/${item.slug}`} className="text-white font-semibold hover:text-primary-400 transition-colors truncate block">{item.name}</Link>
                  <div className="text-sm text-white/40 mt-1">{formatPrice(item.price)} each</div>
                </div>
                <div className="flex items-center gap-1 glass rounded-xl">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 text-white/40 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="px-3 text-white font-medium text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 text-white/40 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="text-white font-semibold w-24 text-right">{formatPrice(item.price * item.quantity)}</div>
                <button onClick={() => removeItem(item.productId)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 h-fit sticky top-28">
            <h2 className="text-lg font-semibold text-white mb-6">Order Summary</h2>
            {/* Affiliate Code */}
            <div className="mb-6">
              <label className="text-sm text-white/40 mb-2 flex items-center gap-1"><Tag className="w-4 h-4" /> Affiliate Code</label>
              {affiliateCode ? (
                <div className="flex items-center gap-2 mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium flex-1">{affiliateCode} ({summary.discountPercent}% off)</span>
                  <button onClick={clearAffiliateCode} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Enter code" className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/50" id="affiliate-code-input" />
                  <button onClick={handleApplyCode} disabled={codeLoading} className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-500 transition-colors disabled:opacity-50">
                    {codeLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {codeError && <p className="text-red-400 text-xs mt-2">{codeError}</p>}
              {codeSuccess && <p className="text-emerald-400 text-xs mt-2">{codeSuccess}</p>}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-white/40">Subtotal</span><span className="text-white">{formatPrice(summary.subtotal)}</span></div>
              {summary.discount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-400">Discount ({summary.discountPercent}%)</span><span className="text-emerald-400">-{formatPrice(summary.discount)}</span></div>}
              <div className="border-t border-white/10 pt-3 flex justify-between"><span className="text-white font-semibold">Total</span><span className="text-xl font-bold gradient-text">{formatPrice(summary.total)}</span></div>
            </div>

            <Link href="/checkout" className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 glow">
              Checkout <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/store" className="flex items-center justify-center gap-2 w-full py-3 mt-3 text-white/40 hover:text-white text-sm transition-colors">
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
