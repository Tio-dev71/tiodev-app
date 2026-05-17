'use client';

import { motion } from 'framer-motion';
import {
  User,
  CreditCard,
  Key,
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Crown,
  Zap,
  ArrowUpRight,
  CalendarDays,
  Shield,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth, Subscription } from '@/components/providers/AuthProvider';
import { formatVND } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_SUBSCRIPTION_API || 'https://api.tiodev.io.vn/v1';

const planIcons: Record<string, React.ElementType> = {
  starter: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

const planColors: Record<string, string> = {
  starter: 'from-emerald-500 to-teal-500',
  pro: 'from-violet-500 to-purple-600',
  enterprise: 'from-amber-500 to-orange-600',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Đang hoạt động', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  trial: { label: 'Dùng thử', color: 'text-cyan-400 bg-cyan-500/10', icon: Clock },
  expired: { label: 'Hết hạn', color: 'text-red-400 bg-red-500/10', icon: XCircle },
  cancelled: { label: 'Đã hủy', color: 'text-amber-400 bg-amber-500/10', icon: AlertTriangle },
  pending: { label: 'Chờ thanh toán', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
};

export default function AccountDashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login?redirect=/account');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!token) return;
    setLoadingSubs(true);

    try {
      const res = await fetch(`${API_BASE}/user/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingSubs(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
    }
  }, [isAuthenticated, fetchSubscriptions]);

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Tài khoản của tôi</h1>
            <p className="text-white/40 text-sm">Quản lý subscription và license key</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm"
            id="account-logout"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{user?.name}</h2>
              <p className="text-white/40 text-sm truncate">{user?.email}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium">
              <User className="w-3.5 h-3.5" />
              Thành viên
            </div>
          </div>
        </motion.div>

        {/* Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-400" />
              Subscription của tôi
            </h2>
            <button
              onClick={fetchSubscriptions}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
              id="refresh-subs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSubs ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {loadingSubs ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary-400 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Đang tải...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Chưa có subscription</h3>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                Bạn chưa đăng ký gói nào. Khám phá các gói subscription để bắt đầu sử dụng.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all glow"
              >
                Xem bảng giá
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub, index) => {
                const PlanIcon = planIcons[sub.planCode] || Zap;
                const color = planColors[sub.planCode] || 'from-primary-500 to-cyan-500';
                const status = statusConfig[sub.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-all"
                  >
                    {/* Plan header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <PlanIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{sub.planName || sub.planCode}</h3>
                          <p className="text-white/30 text-xs">
                            {sub.cycle === 'yearly' ? 'Hàng năm' : 'Hàng tháng'}
                          </p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium w-fit ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3">
                        <CalendarDays className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <div>
                          <p className="text-white/30 text-xs">Bắt đầu</p>
                          <p className="text-white text-sm font-medium">
                            {new Date(sub.currentPeriodStart).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3">
                        <Clock className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <div>
                          <p className="text-white/30 text-xs">Hết hạn</p>
                          <p className="text-white text-sm font-medium">
                            {new Date(sub.currentPeriodEnd).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* License key */}
                    {sub.licenseKey && (
                      <div className="bg-white/[0.03] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-white/40 text-xs">
                            <Key className="w-3.5 h-3.5" />
                            License Key
                          </div>
                          <button
                            onClick={() => handleCopyKey(sub.licenseKey!)}
                            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                            id={`copy-license-${sub.id}`}
                          >
                            {copiedKey === sub.licenseKey ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Đã sao chép
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Sao chép
                              </>
                            )}
                          </button>
                        </div>
                        <code className="text-sm text-primary-400 font-mono break-all block bg-black/20 rounded-lg p-3">
                          {sub.licenseKey}
                        </code>
                      </div>
                    )}

                    {/* Renew button for expired */}
                    {(sub.status === 'expired' || sub.status === 'cancelled') && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <Link
                          href={`/subscription/checkout?plan=${sub.planCode}&cycle=${sub.cycle || 'monthly'}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Gia hạn ngay
                        </Link>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link
            href="/pricing"
            className="glass rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm">Nâng cấp gói</h3>
              <p className="text-white/30 text-xs">Xem các gói subscription</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
          </Link>

          <Link
            href="/store"
            className="glass rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm">Cửa hàng</h3>
              <p className="text-white/30 text-xs">Khám phá sản phẩm</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
