'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function ParallaxCTA() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const textY = useTransform(scrollYProgress, [0, 1], [60, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);

  return (
    <section ref={ref} className="relative py-40 px-4 overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary-500/8 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-accent-500/8 rounded-full blur-[80px]" />
      </motion.div>

      <motion.div
        style={{ y: textY, scale }}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Zap className="w-4 h-4 text-accent-400" />
            <span className="text-sm text-white/70">{t.cta.badge}</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 parallax-heading leading-tight">
            {t.cta.titlePrefix} <span className="gradient-text">{t.cta.titleHighlight}</span> {t.cta.titleSuffix}
          </h2>

          <p className="text-lg text-white/40 mb-10 max-w-xl mx-auto leading-relaxed">
            {t.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/store"
              className="group flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-primary-600 to-cyan-500 text-white font-semibold rounded-2xl hover:from-primary-500 hover:to-cyan-400 transition-all duration-300 glow text-lg"
            >
              {t.cta.button}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
