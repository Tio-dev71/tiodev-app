'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  FileText,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';


const particles = [
  { size: 4, x: '10%', y: '20%', cls: 'particle-1', color: 'bg-primary-400/30', delay: '0s' },
  { size: 6, x: '80%', y: '15%', cls: 'particle-2', color: 'bg-cyan-400/20', delay: '2s' },
  { size: 3, x: '60%', y: '70%', cls: 'particle-3', color: 'bg-primary-500/25', delay: '4s' },
  { size: 5, x: '25%', y: '80%', cls: 'particle-1', color: 'bg-accent-400/20', delay: '1s' },
  { size: 4, x: '90%', y: '50%', cls: 'particle-2', color: 'bg-primary-300/20', delay: '3s' },
  { size: 7, x: '45%', y: '30%', cls: 'particle-3', color: 'bg-cyan-500/15', delay: '5s' },
  { size: 3, x: '70%', y: '85%', cls: 'particle-1', color: 'bg-primary-400/20', delay: '2.5s' },
  { size: 5, x: '15%', y: '55%', cls: 'particle-2', color: 'bg-accent-500/15', delay: '1.5s' },
];

export function ParallaxHero() {
  const { t } = useLanguage();
  const stats = t.hero.stats;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax speeds for different layers
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const statsY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const smoothBgY = useSpring(bgY, { stiffness: 100, damping: 30 });
  const smoothTextY = useSpring(textY, { stiffness: 100, damping: 30 });
  const smoothImageY = useSpring(imageY, { stiffness: 100, damping: 30 });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center px-4 pt-28 overflow-hidden">
      {/* Parallax Background Orbs — slowest layer */}
      <motion.div
        style={{ y: smoothBgY, opacity: heroOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary-600/15 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute top-3/4 -right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[128px]" />
      </motion.div>

      {/* Floating Particles — various speeds */}
      <motion.div style={{ y: particlesY }} className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className={`particle ${p.cls} ${p.color}`}
            style={{
              width: p.size,
              height: p.size,
              left: p.x,
              top: p.y,
              animationDelay: p.delay,
            }}
          />
        ))}
      </motion.div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Text with parallax */}
          <motion.div style={{ y: smoothTextY }}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-white/70">Tiodev</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-2"
            >
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {t.hero.greeting}<span className="text-primary-400 text-4xl">.</span>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-10 h-[3px] bg-primary-500 rounded-full" />
              <span className="text-xl sm:text-2xl text-white/60 italic font-light">
                {t.hero.intro}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] parallax-heading"
            >
              <span className="gradient-text">{t.hero.titleDeveloper}</span>
              <span className="text-white"> & </span>
              <span className="gradient-text">{t.hero.titleCrypto}</span>
              <br />
              <span className="text-white">{t.hero.titleBuilder}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base sm:text-lg text-white/40 max-w-lg mb-8 leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                href="/store"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 glow"
              >
                <ShoppingBag className="w-5 h-5" />
                {t.hero.browseStore}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#skills"
                className="flex items-center gap-2 px-8 py-4 glass text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <FileText className="w-5 h-5" />
                {t.hero.resume}
              </a>
            </motion.div>
          </motion.div>

          {/* Right — Profile Image with parallax depth */}
          <motion.div
            style={{ y: smoothImageY }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="hero-ring w-[350px] h-[350px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] absolute" />
              <div className="hero-ring hero-ring-2 w-[400px] h-[400px] sm:w-[470px] sm:h-[470px] lg:w-[540px] lg:h-[540px] absolute" />
              <div className="hero-ring hero-ring-3 w-[450px] h-[450px] sm:w-[520px] sm:h-[520px] lg:w-[600px] lg:h-[600px] absolute" />

              <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] rounded-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-primary-500/20" />
                <Image
                  src="/hero-profile-v2.png"
                  alt="Tio — Coding & Crypto"
                  fill
                  className="object-contain scale-[1.55] drop-shadow-2xl"
                  priority
                />
              </div>

              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 text-primary-500/40"
              >
                <ChevronRight className="w-8 h-8" />
                <ChevronRight className="w-8 h-8 -mt-3" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats with parallax offset */}
        <motion.div
          style={{ y: statsY }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
              className="stat-card text-center"
            >
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-white/40 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity: heroOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary-400"
          />
        </div>
      </motion.div>
    </section>
  );
}
