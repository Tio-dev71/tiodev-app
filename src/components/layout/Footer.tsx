'use client';

import Link from 'next/link';
import { Globe, MessageCircle, Mail } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/5 bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                <Image className='w-full h-full rounded-2xl' src="/tiodevlogo.png" alt="Tiodev" width={200} height={200} />
              </div>
              <span className="text-lg font-semibold text-white">
                Tio<span className="text-primary-400">dev</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-md">
              {t.brandTagline}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com/Tio-dev71"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/tiodev71"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:thonguyen7106@gmail.com"
                className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{t.nav.navigation}</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: t.nav.home },
                { href: '/store', label: t.nav.store },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{t.nav.support}</h3>
            <ul className="space-y-3">
              {[
                { href: '/cart', label: t.nav.cart },
                { href: '/admin/login', label: t.nav.admin },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { href: '/terms', label: 'Terms of Service' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/refund', label: 'Refund Policy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Tiodev
          </p>
        </div>
      </div>
    </footer>
  );
}
