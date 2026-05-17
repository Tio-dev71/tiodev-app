'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="max-w-md w-full text-center">
        <div className="glass rounded-3xl p-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Order Confirmed!</h1>
          <p className="text-white/40 mb-2">Thank you for your purchase.</p>
          {orderId && <p className="text-sm text-white/30 mb-1">Order ID: <span className="font-mono text-primary-400">{orderId}</span></p>}
          {method === 'vietqr' && <p className="text-sm text-amber-400 mt-4 glass rounded-xl p-3">Your order will be confirmed once we verify the bank transfer.</p>}
          <p className="text-white/30 text-sm mt-4 mb-8">A confirmation email has been sent to your inbox.</p>
          <div className="flex flex-col gap-3">
            <Link href="/store" className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 transition-colors">
              <ShoppingBag className="w-5 h-5" /> Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors py-2">Back to Home</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}><SuccessContent /></Suspense>;
}
