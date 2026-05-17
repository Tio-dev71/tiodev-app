// Database seed script
// Run: npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
// Or: npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'nextjs-saas-template' },
      update: {},
      create: {
        name: 'Next.js SaaS Template',
        slug: 'nextjs-saas-template',
        description: 'Production-ready SaaS starter template built with Next.js 14, featuring authentication, billing with Stripe, team management, and a beautiful dashboard. Save weeks of development time.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
        category: 'Templates',
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'react-component-library' },
      update: {},
      create: {
        name: 'React Component Library',
        slug: 'react-component-library',
        description: '50+ beautifully crafted React components with TypeScript support, dark mode, animations, and full accessibility. Works with any React framework.',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
        category: 'Tools',
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'fullstack-masterclass' },
      update: {},
      create: {
        name: 'Full-Stack Masterclass',
        slug: 'fullstack-masterclass',
        description: 'Complete video course covering React, Next.js, Node.js, PostgreSQL, and deployment. 40+ hours of content with real-world projects.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
        category: 'Courses',
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'portfolio-template-pro' },
      update: {},
      create: {
        name: 'Portfolio Template Pro',
        slug: 'portfolio-template-pro',
        description: 'Stunning portfolio template with smooth animations, dark mode, blog section, and SEO optimization. Stand out from the crowd.',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        category: 'Templates',
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'api-toolkit' },
      update: {},
      create: {
        name: 'API Development Toolkit',
        slug: 'api-toolkit',
        description: 'Comprehensive toolkit for building REST and GraphQL APIs with Express/Fastify. Includes auth, validation, rate limiting, and testing utilities.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        category: 'Tools',
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'ui-design-system-figma' },
      update: {},
      create: {
        name: 'UI Design System (Figma)',
        slug: 'ui-design-system-figma',
        description: 'Complete design system for Figma with 200+ components, auto-layout, variants, and dark/light themes. Perfect for rapid prototyping.',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
        category: 'Design',
        featured: false,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create sample affiliates
  const affiliates = await Promise.all([
    prisma.affiliate.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: { code: 'WELCOME10', name: 'Welcome Offer', email: 'marketing@example.com', discountPercent: 10, commissionRate: 5 },
    }),
    prisma.affiliate.upsert({
      where: { code: 'VIP20' },
      update: {},
      create: { code: 'VIP20', name: 'VIP Partner', email: 'partner@example.com', discountPercent: 20, commissionRate: 10 },
    }),
    prisma.affiliate.upsert({
      where: { code: 'FRIEND15' },
      update: {},
      create: { code: 'FRIEND15', name: 'Referral Program', email: 'referral@example.com', discountPercent: 15, commissionRate: 7 },
    }),
  ]);

  console.log(`✅ Created ${affiliates.length} affiliate codes`);
  console.log('\n🎉 Seeding complete!\n');
  console.log('Affiliate codes: WELCOME10 (10% off), VIP20 (20% off), FRIEND15 (15% off)');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
