'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layout, Database, Server, Rocket, CheckCircle, MapPin } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

const techCategories = [
  {
    icon: Layout,
    skills: ["React.js", "React-Native", "JavaScript (ES6+)", "HTML/CSS/SCSS", "TailwindCSS", "Lit"]
  },
  {
    icon: Database,
    skills: ["PHP (Laravel)", "C/C++/C#", "RESTful API", "MySQL", "PostgreSQL", "MongoDB", "Firebase"]
  },
  {
    icon: Server,
    skills: ["Linux/OSX/Windows", "Docker", "Rancher", "Nginx/PM2", "Git/SVN"]
  },
  {
    icon: Rocket,
    skills: ["Crypto Trading Bots", "Workflow n8n", "AI Integration", "Fast Learner"]
  }
];

export function ParallaxSkills() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const headingY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const bgGradientX = useTransform(scrollYProgress, [0, 1], [-200, 200]);

  return (
    <section id="skills" ref={ref} className="relative py-32 px-4 overflow-hidden">
      {/* Parallax background gradient */}
      <motion.div
        style={{ x: bgGradientX }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          style={{ y: headingY }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4 parallax-heading"
          >
            {t.skills.headingPrefix} <span className="gradient-text">{t.skills.headingHighlight}</span> {t.skills.headingSuffix}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center gap-2 text-white/60 mb-2"
          >
            <MapPin className="w-4 h-4" />
            <span>{t.skills.location}</span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tech Stack Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techCategories.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:glass-strong transition-all duration-300 group border border-white/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                    <category.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold">{t.skills.categories[i]}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, j) => (
                    <span
                      key={j}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-primary-500/20 hover:text-primary-300 hover:border-primary-500/30 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Highlights & Experience */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-5 glass rounded-2xl p-8 border border-white/5 flex flex-col justify-center"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               {t.skills.highlightsTitle}
            </h3>
            <div className="space-y-4">
              {t.skills.highlightPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70 leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="section-divider mt-32 max-w-4xl mx-auto" />
    </section>
  );
}
