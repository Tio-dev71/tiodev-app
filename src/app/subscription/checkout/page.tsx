'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { formatVND } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCartStore } from '@/store/cart-store';
import QRCodeLib from 'qrcode';

const API_BASE = process.env.NEXT_PUBLIC_SUBSCRIPTION_API || 'https://api.tiodev.io.vn/v1';

const planInfo: Record<string, { name: string; color: string }> = {
  starter: { name: 'Starter', color: 'from-emerald-500 to-teal-500' },
  pro: { name: 'Pro', color: 'from-violet-500 to-purple-600' },
  enterprise: { name: 'Enterprise', color: 'from-amber-500 to-orange-600' },
};

const planPricing: Record<string, { monthly: number; yearly: number }> = {
  starter: { monthly: 799000, yearly: 7670400 },
  pro: { monthly: 1590000, yearly: 15264000 },
  enterprise: { monthly: 3490000, yearly: 33504000 },
};

type Step = 'review' | 'payment' | 'success';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planCode = searchParams.get('plan') || 'starter';
  const cycle = (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly';

  const { token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { affiliateCode } = useCartStore();

  const plan = planInfo[planCode] || planInfo.starter;
  const pricing = planPricing[planCode] || planPricing.starter;
  const amount = cycle === 'yearly' ? pricing.yearly : pricing.monthly;

  const [step, setStep] = useState<Step>('review');
  const [refCodeInput, setRefCodeInput] = useState(affiliateCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment state
  const [orderData, setOrderData] = useState<{
    code: string;
    vietqr: {
      qrImageUrl: string;
      bankId: string;
      accountNo: string;
      accountName: string;
      amount: number;
      description: string;
    };
  } | null>(null);

  const [qrFallbackUrl, setQrFallbackUrl] = useState<string | null>(null);
  const [qrImageError, setQrImageError] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Generate local QR code fallback when orderData is set
  useEffect(() => {
    if (!orderData) return;

    async function generateLocalQR() {
      try {
        // Build a simple VietQR-compatible content string
        const bankId = orderData!.vietqr.bankId || '970422';
        const accountNo = orderData!.vietqr.accountNo || '';
        const amount = orderData!.vietqr.amount;
        const description = orderData!.vietqr.description || '';

        // Build VietQR deep link URL format for banking apps
        const qrContent = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}`;

        const dataUrl = await QRCodeLib.toDataURL(qrContent, {
          width: 400,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        setQrFallbackUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate local QR:', err);
      }
    }

    generateLocalQR();
  }, [orderData]);

  // Fetch download URL from settings
  useEffect(() => {
    if (step === 'success') {
      fetch('/api/settings/9meta_download_url')
        .then((r) => r.json())
        .then((data) => {
          if (data.value) setDownloadUrl(data.value);
        })
        .catch(() => {});
    }
  }, [step]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/account/login?redirect=${encodeURIComponent(`/subscription/checkout?plan=${planCode}&cycle=${cycle}`)}`);
    }
  }, [authLoading, isAuthenticated, router, planCode, cycle]);

  // Create order
  async function handleCreateOrder() {
    if (!isAuthenticated || !token || orderData) return;
    setStep('payment');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/billing/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planCode, cycle, affiliateCode: refCodeInput || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          router.push(`/account/login?redirect=${encodeURIComponent(`/subscription/checkout?plan=${planCode}&cycle=${cycle}`)}`);
          return;
        }
        setError(data.message || 'Không thể tạo đơn hàng');
        setStep('review'); // Go back on error
        return;
      }

      setOrderData({
        code: data.order.code,
        vietqr: data.vietqr,
      });
    } catch {
      setError('Không thể kết nối server.');
      setStep('review');
    } finally {
      setLoading(false);
    }
  }

  // Poll for payment status
  const pollPayment = useCallback(async () => {
    if (!orderData?.code || !token) return false;

    try {
      const res = await fetch(`${API_BASE}/billing/order-status/${orderData.code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.status === 'paid') {
        // Record subscription order in web database for affiliate tracking
        try {
          await fetch('/api/subscription-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              planName: plan.name,
              cycle,
              amount,
              affiliateCode: refCodeInput || undefined,
              customerName: 'Subscription User',
              customerEmail: '',
            }),
          });
        } catch {
          // Non-critical: don't block success flow
        }

        setStep('success');
        return true;
      }
    } catch {
      // ignore polling errors
    }
    return false;
  }, [orderData, token, plan.name, cycle, amount, refCodeInput]);

  useEffect(() => {
    if (step !== 'payment' || !orderData) return;

    const interval = setInterval(async () => {
      const paid = await pollPayment();
      if (paid) clearInterval(interval);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [step, orderData, pollPayment]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-lg mx-auto relative">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại bảng giá
        </Link>

        {/* Plan Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{plan.name[0]}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{plan.name}</h3>
                <p className="text-white/40 text-xs">{cycle === 'yearly' ? 'Thanh toán hàng năm' : 'Thanh toán hàng tháng'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{formatVND(amount)}</div>
              <div className="text-white/30 text-xs">/{cycle === 'yearly' ? 'năm' : 'tháng'}</div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(['review', 'payment', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-gradient-to-r from-primary-500 to-cyan-500 text-white'
                  : i < ['review', 'payment', 'success'].indexOf(step)
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-white/5 text-white/30'
              }`}>
                {i < ['review', 'payment', 'success'].indexOf(step) ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div className={`w-12 h-0.5 rounded-full ${
                  i < ['review', 'payment', 'success'].indexOf(step)
                    ? 'bg-primary-500/50'
                    : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
                    {/* Step 0: Review */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Xác nhận thanh toán</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Mã giới thiệu / Affiliate Code (Tuỳ chọn)</label>
                  <input
                    type="text"
                    value={refCodeInput}
                    onChange={(e) => setRefCodeInput(e.target.value)}
                    placeholder="Nhập mã giới thiệu..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                  <p className="text-white/30 text-xs mt-2">Nếu bạn được ai đó giới thiệu, hãy nhập mã của họ vào đây.</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25 glow flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tiếp tục thanh toán'}
              </button>
            </motion.div>
          )}

          {/* Step 1: Payment QR */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-3xl p-8"
            >
              {loading && !orderData ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">Đang tạo đơn thanh toán...</p>
                </div>
              ) : orderData ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-primary-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Quét mã để thanh toán</h2>
                    <p className="text-white/40 text-sm">
                      Sử dụng app ngân hàng để quét mã QR bên dưới
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white rounded-2xl p-4 mb-6 mx-auto w-fit">
                    <img
                      src={qrImageError && qrFallbackUrl ? qrFallbackUrl : orderData.vietqr.qrImageUrl}
                      alt="VietQR Payment"
                      className="w-64 h-64 object-contain"
                      onError={() => setQrImageError(true)}
                    />
                  </div>

                  {/* Payment details */}
                  <div className="glass rounded-xl p-4 space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Ngân hàng</span>
                      <span className="text-white font-medium">MB Bank</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Số TK</span>
                      <span className="text-white font-medium">{orderData.vietqr.accountNo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Chủ TK</span>
                      <span className="text-white font-medium">{orderData.vietqr.accountName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Số tiền</span>
                      <span className="text-white font-bold text-primary-400">{formatVND(orderData.vietqr.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Nội dung CK</span>
                      <span className="text-white font-mono font-bold text-amber-400">{orderData.vietqr.description}</span>
                    </div>
                  </div>

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 text-white/30 text-xs mb-4">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Đang chờ xác nhận thanh toán tự động...</span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <p className="text-white/20 text-xs text-center">
                    ⚠️ Ghi đúng nội dung chuyển khoản <span className="text-amber-400 font-bold">{orderData.vietqr.description}</span> để hệ thống tự động xác nhận.
                    Đơn hàng sẽ hết hạn sau 30 phút.
                  </p>
                </>
              ) : (
                <div className="text-center py-12">
                  {error ? (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                      <p className="text-red-400 text-sm mb-4">{error}</p>
                      <button
                        onClick={() => { setError(''); setOrderData(null); }}
                        className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20 transition-colors"
                      >
                        Thử lại
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-primary-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-3">Thanh toán thành công! 🎉</h2>
              <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
                Gói <span className="text-white font-semibold">{plan.name}</span> của bạn đã được kích hoạt.
                Mở app 9Meta và đăng nhập để bắt đầu sử dụng.
              </p>

              <div className="glass rounded-xl p-4 mb-8 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Gói đăng ký</span>
                  <span className="text-white font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Chu kỳ</span>
                  <span className="text-white font-medium">{cycle === 'yearly' ? 'Hàng năm' : 'Hàng tháng'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Số tiền</span>
                  <span className="text-white font-bold">{formatVND(amount)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-2xl hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/25 glow"
                  >
                    <Download className="w-5 h-5" />
                    Tải xuống ứng dụng 9Meta
                  </a>
                )}
                <Link
                  href="/account"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all"
                >
                  Xem tài khoản của tôi
                </Link>
                <Link
                  href="/pricing"
                  className="block w-full py-3 text-center text-white/40 hover:text-white text-sm transition-colors"
                >
                  Quay lại bảng giá
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
