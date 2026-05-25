'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight, Shield, Clock, Infinity } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatVND } from '@/lib/utils';

const plans = [
  {
    code: 'starter',
    name: 'Starter',
    icon: Zap,
    monthlyPrice: 799000,
    yearlyPrice: 7670400,
    description: 'Dành cho cá nhân mới dùng',
    color: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    features: [
      '3 tài khoản / mỗi app',
      'Đầy đủ tính năng cốt lõi',
      'Hỗ trợ nhanh SLA 12–24h',
      'Auto-update miễn phí',
      'Dùng thử miễn phí 3 ngày',
    ],
    popular: false,
  },
  {
    code: 'pro',
    name: 'Pro',
    icon: Sparkles,
    monthlyPrice: 1590000,
    yearlyPrice: 15264000,
    description: 'Dành cho team nhỏ',
    color: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    features: [
      '5 tài khoản / mỗi app',
      'Đầy đủ tính năng nâng cao',
      'Hỗ trợ ưu tiên nhanh hơn',
      'Không giới hạn proxy',
      'Auto-update miễn phí',
      'Dùng thử miễn phí 3 ngày',
    ],
    popular: true,
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    monthlyPrice: 3490000,
    yearlyPrice: 33504000,
    description: 'Gói Full cho vận hành chuyên nghiệp',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    features: [
      'Không giới hạn tài khoản',
      'Toàn bộ tính năng premium',
      'Không giới hạn proxy',
      'Support riêng tốc độ cao',
      'Ưu tiên cao nhất',
      'Dùng thử miễn phí 3 ngày',
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-600/8 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-semibold tracking-widest uppercase text-primary-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Bảng giá 9Meta
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Chọn gói <span className="gradient-text">phù hợp</span> với bạn
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Quản lý đa tài khoản Zalo, Messenger, Fanpage, Telegram, WhatsApp — tất cả trong một app.
          </p>
        </motion.div>

        {/* Cycle Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-14"
        >
          <span className={`text-sm font-medium transition-colors ${cycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>
            Hàng tháng
          </span>
          <button
            onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative flex items-center w-16 h-8 rounded-full bg-white/10 border border-white/10 transition-colors hover:border-white/20 px-[3px]"
            id="pricing-cycle-toggle"
          >
            <motion.div
              animate={{ x: cycle === 'yearly' ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-cyan-500"
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${cycle === 'yearly' ? 'text-white' : 'text-white/40'}`}>
            Hàng năm
          </span>
          {cycle === 'yearly' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold"
            >
              Tiết kiệm 20%
            </motion.span>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => {
            const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const monthlyEquiv = cycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:translate-y-[-8px] group ${plan.popular
                  ? 'glass-strong border-2 border-violet-500/30'
                  : 'glass'
                  }`}
                style={plan.popular ? { boxShadow: `0 0 60px ${plan.glowColor}` } : {}}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-500 to-purple-600 text-center py-2 text-xs font-bold text-white tracking-widest uppercase">
                    ⭐ Phổ biến nhất
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-14' : ''}`}>
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-white/40">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-white">
                        {formatVND(monthlyEquiv)}
                      </span>
                      <span className="text-white/40 text-sm mb-1">/tháng</span>
                    </div>
                    {cycle === 'yearly' && (
                      <p className="text-xs text-white/30 mt-1">
                        Thanh toán {formatVND(price)} / năm
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-violet-400' : 'text-primary-400'
                          }`} />
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={`/subscription/checkout?plan=${plan.code}&cycle=${cycle}`}
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-300 group-hover:scale-[1.02] ${plan.popular
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                      : 'bg-white/8 text-white border border-white/10 hover:bg-white/12 hover:border-white/20'
                      }`}
                    id={`pricing-cta-${plan.code}`}
                  >
                    Bắt đầu miễn phí
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16 text-white/30 text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Bảo mật tuyệt đối</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Dùng thử 3 ngày miễn phí</span>
          </div>
          <div className="flex items-center gap-2">
            <Infinity className="w-4 h-4" />
            <span>Hủy bất cứ lúc nào</span>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-10">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Dùng thử miễn phí hoạt động như thế nào?',
                a: 'Khi đăng ký, bạn sẽ được dùng thử 3 ngày miễn phí với gói Starter. Sau thời gian dùng thử, bạn có thể chọn gói phù hợp để tiếp tục sử dụng.',
              },
              {
                q: 'Thanh toán bằng cách nào?',
                a: 'Bạn chuyển khoản ngân hàng qua mã QR VietQR hoặc Crypto Bank. Hệ thống sẽ tự động xác nhận thanh toán trong vòng 1-2 phút.',
              },
              {
                q: 'Tôi có thể nâng cấp gói không?',
                a: 'Có, bạn có thể nâng cấp gói bất cứ lúc nào. Thời gian còn lại của gói cũ sẽ được tính vào gói mới.',
              },
              {
                q: 'Hỗ trợ kỹ thuật như thế nào?',
                a: 'Tùy theo gói, bạn sẽ được hỗ trợ qua chat với SLA từ 12-24h (Starter) đến hỗ trợ riêng tốc độ cao (Enterprise).',
              },
            ].map((faq, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
