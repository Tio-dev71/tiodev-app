'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { formatVND } from '@/lib/utils';

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

type Step = 'auth' | 'payment' | 'success';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planCode = searchParams.get('plan') || 'starter';
  const cycle = (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly';

  const plan = planInfo[planCode] || planInfo.starter;
  const pricing = planPricing[planCode] || planPricing.starter;
  const amount = cycle === 'yearly' ? pricing.yearly : pricing.monthly;

  const [step, setStep] = useState<Step>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

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

  // Auth form
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  // Check existing token on mount
  useEffect(() => {
    const saved = localStorage.getItem('sub_token');
    if (saved) {
      setToken(saved);
      setStep('payment');
    }
  }, []);

  // Handle auth
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (authMode === 'register' && !form.name) {
      setError('Vui lòng nhập tên');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const body = authMode === 'register'
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đã có lỗi xảy ra');
        return;
      }

      const accessToken = data.accessToken;
      localStorage.setItem('sub_token', accessToken);
      localStorage.setItem('sub_user', JSON.stringify(data.user));
      setToken(accessToken);
      setStep('payment');
    } catch {
      setError('Không thể kết nối server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  // Create order & get QR
  useEffect(() => {
    if (step !== 'payment' || !token || orderData) return;

    async function createOrder() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/billing/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planCode, cycle }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            // Token expired, go back to auth
            localStorage.removeItem('sub_token');
            setToken('');
            setStep('auth');
            setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            return;
          }
          setError(data.message || 'Không thể tạo đơn hàng');
          return;
        }

        setOrderData({
          code: data.order.code,
          vietqr: data.vietqr,
        });
      } catch {
        setError('Không thể kết nối server.');
      } finally {
        setLoading(false);
      }
    }

    createOrder();
  }, [step, token, planCode, cycle, orderData]);

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
        setStep('success');
        return true;
      }
    } catch {
      // ignore polling errors
    }
    return false;
  }, [orderData, token]);

  useEffect(() => {
    if (step !== 'payment' || !orderData) return;

    const interval = setInterval(async () => {
      const paid = await pollPayment();
      if (paid) clearInterval(interval);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [step, orderData, pollPayment]);

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
          {(['auth', 'payment', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-gradient-to-r from-primary-500 to-cyan-500 text-white'
                  : i < ['auth', 'payment', 'success'].indexOf(step)
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-white/5 text-white/30'
              }`}>
                {i < ['auth', 'payment', 'success'].indexOf(step) ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div className={`w-12 h-0.5 rounded-full ${
                  i < ['auth', 'payment', 'success'].indexOf(step)
                    ? 'bg-primary-500/50'
                    : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Auth */}
          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                {authMode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}
              </h2>
              <p className="text-white/40 text-sm mb-8">
                {authMode === 'register'
                  ? 'Đăng ký để bắt đầu dùng thử 3 ngày miễn phí'
                  : 'Đăng nhập vào tài khoản của bạn'}
              </p>

              <form onSubmit={handleAuth} className="space-y-5">
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block font-medium">Họ tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
                        placeholder="Nguyễn Văn A"
                        id="sub-name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
                      placeholder="you@email.com"
                      id="sub-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block font-medium">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      id="sub-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl hover:from-primary-500 hover:to-primary-400 transition-all glow disabled:opacity-50"
                  id="sub-auth-submit"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : authMode === 'register' ? (
                    'Đăng ký & Dùng thử miễn phí'
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'register' ? 'login' : 'register');
                    setError('');
                  }}
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  {authMode === 'register' ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment QR */}
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
                      src={orderData.vietqr.qrImageUrl}
                      alt="VietQR Payment"
                      className="w-64 h-64 object-contain"
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

          {/* Step 3: Success */}
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
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl hover:from-primary-500 hover:to-primary-400 transition-all glow"
                >
                  Quay lại trang chủ
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
