'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Download } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}/status`)
        .then(res => res.json())
        .then(data => setOrderData(data))
        .catch(console.error);
    }
  }, [orderId]);

  const content = locale === 'vi'
    ? {
        title: 'Đặt hàng thành công!',
        subtitle: 'Cảm ơn bạn đã mua hàng.',
        orderIdLabel: 'Mã đơn hàng:',
        bankPending: 'Đơn hàng sẽ được xác nhận sau khi chúng tôi kiểm tra chuyển khoản.',
        emailSent: 'Email xác nhận đã được gửi tới hộp thư của bạn.',
        continueShopping: 'Tiếp tục mua sắm',
        backHome: 'Về trang chủ',
      }
    : {
        title: 'Order Confirmed!',
        subtitle: 'Thank you for your purchase.',
        orderIdLabel: 'Order ID:',
        bankPending: 'Your order will be confirmed once we verify the bank transfer.',
        emailSent: 'A confirmation email has been sent to your inbox.',
        continueShopping: 'Continue Shopping',
        backHome: 'Back to Home',
      };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="max-w-md w-full text-center">
        <div className="glass rounded-3xl p-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">{content.title}</h1>
          <p className="text-white/40 mb-2">{content.subtitle}</p>
          {orderId && <p className="text-sm text-white/30 mb-1">{content.orderIdLabel} <span className="font-mono text-primary-400">{orderId}</span></p>}
          {method === 'vietqr' && orderData?.status !== 'PAID' && <p className="text-sm text-amber-400 mt-4 glass rounded-xl p-3">{content.bankPending}</p>}
          <p className="text-white/30 text-sm mt-4 mb-8">{content.emailSent}</p>
          
          {orderData?.status === 'PAID' && orderData.items?.length > 0 && (
            <div className="mb-8 text-left glass rounded-2xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                {locale === 'vi' ? 'Sản phẩm của bạn:' : 'Your digital products:'}
              </h3>
              <div className="space-y-3">
                {orderData.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-medium text-white">{item.product.name}</span>
                    {item.product.downloadLink ? (
                      <a 
                        href={item.product.downloadLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        {locale === 'vi' ? 'Tải xuống ngay' : 'Download Now'}
                      </a>
                    ) : (
                      <span className="text-sm text-white/40">
                        {locale === 'vi' ? 'Sẽ được gửi qua email' : 'Will be sent via email'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/store" className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 transition-colors">
              <ShoppingBag className="w-5 h-5" /> {content.continueShopping} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors py-2">{content.backHome}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}><SuccessContent /></Suspense>;
}
