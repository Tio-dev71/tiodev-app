'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Package, Bitcoin } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { formatVND, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import QRCodeLib from 'qrcode';

type Step = 'review' | 'payment' | 'success';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  subscriptionType: string | null;
}

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  const { affiliateCode } = useCartStore();

  const [step, setStep] = useState<Step>('review');
  const [refCodeInput, setRefCodeInput] = useState(affiliateCode || '');
  const [tradingViewUser, setTradingViewUser] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'crypto'>('vietqr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');

  const amount = product?.price || 0;
  const discountAmount = Math.round((amount * discountPercent) / 100);
  const finalAmount = amount - discountAmount;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) setProduct(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setProductLoading(false);
      }
    }
    if (productId) fetchProduct();
  }, [productId]);

  // Sync refCodeInput if affiliateCode becomes available from store (e.g. from URL)
  useEffect(() => {
    if (affiliateCode && !refCodeInput) {
      setRefCodeInput(affiliateCode);
      validateCode(affiliateCode);
    }
  }, [affiliateCode]);

  async function validateCode(codeToValidate: string) {
    if (!codeToValidate.trim()) return;
    setCodeLoading(true);
    setCodeError('');
    setCodeSuccess('');
    try {
      const res = await fetch('/api/affiliates/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToValidate.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountPercent(data.discountPercent);
        setCodeSuccess(`Áp dụng mã giảm ${data.discountPercent}% thành công!`);
      } else {
        setDiscountPercent(0);
        setCodeError(data.message || 'Mã không hợp lệ');
      }
    } catch {
      setDiscountPercent(0);
      setCodeError('Lỗi kiểm tra mã');
    } finally {
      setCodeLoading(false);
    }
  }

  function handleApplyCode() {
    validateCode(refCodeInput);
  }

  // Payment state
  const [orderData, setOrderData] = useState<{
    orderId: string;
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

  // Generate local QR code fallback when orderData is set
  useEffect(() => {
    if (!orderData?.vietqr) return;

    async function generateLocalQR() {
      try {
        const bankId = orderData!.vietqr.bankId || '970422';
        const accountNo = orderData!.vietqr.accountNo || '';
        const amount = orderData!.vietqr.amount;
        const description = orderData!.vietqr.description || '';
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

  // Create order
  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!product || orderData || !tradingViewUser || !customerEmail || !customerName) return;
    
    setStep('payment');
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: [{ productId: product.id, quantity: 1 }],
          customerName,
          customerEmail,
          paymentMethod,
          affiliateCode: refCodeInput || undefined,
          tradingViewUser
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể tạo đơn hàng');
        setStep('review'); // Go back on error
        return;
      }

      if (paymentMethod === 'crypto' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (paymentMethod === 'vietqr') {
        setOrderData({
          orderId: data.orderId,
          vietqr: data.vietqr,
        });
      }
    } catch {
      setError('Không thể kết nối server.');
      setStep('review');
    } finally {
      setLoading(false);
    }
  }

  // Poll for payment status
  const pollPayment = useCallback(async () => {
    if (!orderData?.orderId) return false;

    try {
      // In a real app, you'd have an endpoint to check order status
      const res = await fetch(`/api/orders/${orderData.orderId}/status`);
      if (!res.ok) return false;

      const data = await res.json();
      if (data.status === 'PAID') {
        setStep('success');
        return true;
      }
    } catch {
      // ignore polling errors
    }
    return false;
  }, [orderData]);

  useEffect(() => {
    if (step !== 'payment' || !orderData) return;

    const interval = setInterval(async () => {
      const paid = await pollPayment();
      if (paid) clearInterval(interval);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [step, orderData, pollPayment]);

  if (productLoading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Product not found</h2>
          <Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl"><ArrowLeft className="w-4 h-4" /> Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-lg mx-auto relative">
        <Link
          href={`/store`}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
        </Link>

        {/* Plan Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{product.name}</h3>
                <p className="text-white/40 text-xs">Thanh toán thuê theo tháng</p>
              </div>
            </div>
            <div className="text-right">
              {discountPercent > 0 ? (
                <>
                  <div className="text-white/50 font-bold line-through text-sm">{formatPrice(amount)}</div>
                  <div className="text-emerald-400 font-bold text-lg">{formatPrice(finalAmount)}</div>
                </>
              ) : (
                <div className="text-white font-bold">{formatPrice(amount)}</div>
              )}
              <div className="text-white/30 text-xs">/tháng</div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(['review', 'payment', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : i < ['review', 'payment', 'success'].indexOf(step)
                  ? 'bg-emerald-500/20 text-emerald-400'
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
                    ? 'bg-emerald-500/50'
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
              
              <form onSubmit={handleCreateOrder}>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Họ và tên *</label>
                    <input
                      required
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Email *</label>
                    <input
                      required
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">TradingView Username (hoặc Email) *</label>
                    <input
                      required
                      type="text"
                      value={tradingViewUser}
                      onChange={(e) => setTradingViewUser(e.target.value)}
                      placeholder="TradingView Username của bạn"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <p className="text-white/30 text-xs mt-2">Hệ thống sẽ cấp quyền truy cập chỉ báo cho tài khoản này.</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-white/60 text-sm mb-2">Mã giới thiệu / Affiliate Code (Tuỳ chọn)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refCodeInput}
                        onChange={(e) => setRefCodeInput(e.target.value)}
                        placeholder="Nhập mã giới thiệu..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCode}
                        disabled={codeLoading || !refCodeInput.trim()}
                        className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                      >
                        {codeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Áp dụng'}
                      </button>
                    </div>
                    {codeError && <p className="text-red-400 text-xs mt-2">{codeError}</p>}
                    {codeSuccess && <p className="text-emerald-400 text-xs mt-2">{codeSuccess}</p>}
                  </div>

                  <div className="pt-4 border-t border-white/10 mb-6">
                    <label className="block text-white/60 text-sm mb-4">Phương thức thanh toán *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setPaymentMethod('vietqr')} className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'vietqr' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}`}>
                        <QrCode className={`w-6 h-6 mb-2 ${paymentMethod === 'vietqr' ? 'text-emerald-400' : 'text-white/40'}`} />
                        <div className="text-sm font-medium text-white">VietQR</div>
                        <div className="text-xs text-white/40">Chuyển khoản VNĐ</div>
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('crypto')} className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}`}>
                        <Bitcoin className={`w-6 h-6 mb-2 ${paymentMethod === 'crypto' ? 'text-emerald-400' : 'text-white/40'}`} />
                        <div className="text-sm font-medium text-white">Crypto</div>
                        <div className="text-xs text-white/40">USDT, BTC, ETH...</div>
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl mb-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !tradingViewUser || !customerEmail || !customerName}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-500 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 glow flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tiếp tục thanh toán'}
                </button>
              </form>
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
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">Đang tạo đơn thanh toán...</p>
                </div>
              ) : orderData ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Quét mã để thanh toán</h2>
                    <p className="text-white/40 text-sm">
                      Sử dụng app ngân hàng để quét mã QR bên dưới
                    </p>
                  </div>

                  {/* QR Code */}
                  {orderData.vietqr && (
                    <div className="bg-white rounded-2xl p-4 mb-6 mx-auto w-fit">
                      <img
                        src={qrImageError && qrFallbackUrl ? qrFallbackUrl : orderData.vietqr.qrImageUrl}
                        alt="VietQR Payment"
                        className="w-64 h-64 object-contain"
                        onError={() => setQrImageError(true)}
                      />
                    </div>
                  )}

                  {/* Payment details */}
                  {orderData.vietqr && (
                    <div className="glass rounded-xl p-4 space-y-3 mb-6">
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
                        <span className="text-white font-bold text-emerald-400">{formatVND(orderData.vietqr.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Nội dung CK</span>
                        <span className="text-white font-mono font-bold text-amber-400">{orderData.vietqr.description}</span>
                      </div>
                    </div>
                  )}

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 text-white/30 text-xs mb-4">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Đang chờ Admin xác nhận thanh toán...</span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <p className="text-white/20 text-xs text-center">
                    ⚠️ Nếu Admin không online, bạn có thể phải chờ một lúc để hệ thống kích hoạt quyền TradingView.
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
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-3">Thanh toán thành công! 🎉</h2>
              <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
                Quyền truy cập chỉ báo <span className="text-white font-semibold">{product.name}</span> đã được chuyển cho Admin xử lý. 
                Bạn sẽ sớm thấy chỉ báo trong mục Invite-only scripts trên TradingView.
              </p>

              <div className="glass rounded-xl p-4 mb-8 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">TradingView Username</span>
                  <span className="text-white font-medium">{tradingViewUser}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Số tiền</span>
                  <span className="text-white font-bold">{formatPrice(finalAmount)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/store"
                  className="block w-full py-3 text-center text-white/40 hover:text-white text-sm transition-colors"
                >
                  Quay lại cửa hàng
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function IndicatorCheckoutPage() {
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
