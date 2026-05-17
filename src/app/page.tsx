'use client';

import { useState, useEffect } from 'react';
import { ParallaxHero } from '@/components/parallax/ParallaxHero';
import { ParallaxSkills } from '@/components/parallax/ParallaxSkills';
import { ParallaxProducts } from '@/components/parallax/ParallaxProducts';
import { ParallaxCTA } from '@/components/parallax/ParallaxCTA';
export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const featured = data.filter((p: any) => p.featured).slice(0, 4);
          setProducts(featured.length > 0 ? featured : data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    }
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="relative crypto-grid parallax-container">
      {/* Hero — Multi-layer parallax */}
      <ParallaxHero />

      {/* Section Divider */}
      <div className="section-divider max-w-4xl mx-auto" />

      {/* Skills — Horizontal parallax slide-in */}
      <ParallaxSkills />

      {/* Featured Products — Scale parallax */}
      <ParallaxProducts products={products} />

      {/* CTA — Classic parallax background */}
      <ParallaxCTA />
    </div>
  );
}
