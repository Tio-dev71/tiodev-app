'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShoppingBag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

interface ParallaxProductsProps {
  products: any[];
}

export function ParallaxProducts({ products }: ParallaxProductsProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const headingY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const bgY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section ref={ref} className={`relative py-32 px-4 overflow-hidden ${products.length === 0 ? 'hidden' : ''}`}>
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-primary-500/8 rounded-full blur-[100px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          style={{ y: headingY }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-4"
        >
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-2 parallax-heading"
            >
              Featured <span className="gradient-text">Products</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/40"
            >
              Các sản phẩm nổi bật, tools và tài liệu trading chất lượng cao.
            </motion.p>
          </div>
          <Link
            href="/store"
            className="group flex items-center gap-2 px-6 py-3 glass rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Product cards with scale parallax */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.85, y: 60 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="product-card group"
            >
              <Link href={`/store/${product.slug}`}>
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-900/30 to-surface-900">
                  {product.image ? (
                    <img src={getImageUrl(product.image)} alt={product.name} className="product-image w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ShoppingBag className="w-10 h-10 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent opacity-60" />
                </div>
              </Link>
              <div className="p-5">
                <Link href={`/store/${product.slug}`}>
                  <h3 className="text-base font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-white/40 mb-3 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold gradient-text">${product.price}</span>
                  <Link
                    href={`/store/${product.slug}`}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-primary-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section divider */}
      <div className="section-divider mt-32 max-w-4xl mx-auto" />
    </section>
  );
}
