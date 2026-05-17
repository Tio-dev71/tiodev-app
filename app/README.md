# Portfolio Store — Full-Stack E-Commerce Platform

A production-ready Next.js application combining a developer portfolio, digital product store, affiliate tracking system, payment processing (Stripe + VietQR), Google Sheets sync, and admin dashboard.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: TailwindCSS v4
- **Database**: PostgreSQL + Prisma ORM v6
- **Auth**: NextAuth.js v5 (Credentials/JWT)
- **Payments**: Stripe + VietQR
- **State**: Zustand (cart)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Email**: Resend
- **Sync**: Google Sheets API

## 📦 Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)

### 2. Setup Database
```bash
# Option A: Using Docker
docker-compose up -d

# Option B: Use your own PostgreSQL
# Update DATABASE_URL in .env
```

### 3. Install & Configure
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual keys

# Push database schema
npm run db:push

# Seed sample data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Default Admin Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Login URL**: `/admin/login`

## 🎯 Features

### Portfolio
- Hero section with animated gradient text
- Skills/tech stack showcase
- Project gallery with hover effects
- Contact CTA section
- Smooth scroll animations

### E-Commerce Store
- Product listing with search & category filters
- Product detail pages
- Shopping cart with quantity controls
- Checkout with customer form

### Payments
- **Stripe**: Credit card via Checkout Sessions
- **VietQR**: QR code generation for Vietnamese bank transfers

### Affiliate System
- Generate unique affiliate codes
- Configurable discount percentages
- Apply codes at checkout
- Track usage and revenue per affiliate

### Admin Dashboard
- Sales analytics overview
- Product management (CRUD)
- Order management with status updates
- Affiliate code management
- Revenue tracking

### Data Sync
- All orders saved to PostgreSQL
- Automatic sync to Google Sheets on payment
- Order confirmation emails via Resend

## 📁 Project Structure

```
app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/
│   │   ├── page.tsx           # Portfolio landing
│   │   ├── store/             # Product pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/
│   │   └── layout/            # Header, Footer, Sidebar
│   ├── lib/
│   │   ├── prisma.ts          # Database client
│   │   ├── stripe.ts          # Stripe SDK
│   │   ├── google-sheets.ts   # Sheets sync
│   │   ├── vietqr.ts          # QR generation
│   │   ├── email.ts           # Notifications
│   │   ├── auth.ts            # Auth config
│   │   └── utils.ts           # Utilities
│   ├── store/
│   │   └── cart-store.ts      # Zustand cart
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.example               # Environment template
├── docker-compose.yml         # PostgreSQL container
└── next.config.ts             # Next.js config
```

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List active products |
| GET | `/api/products/[id]` | Get product by slug/ID |
| POST | `/api/checkout` | Create order + payment |
| POST | `/api/webhooks/stripe` | Stripe webhook |
| POST | `/api/affiliates/validate` | Validate affiliate code |
| GET | `/api/admin/products` | List all products (admin) |
| POST | `/api/admin/products` | Create product (admin) |
| PUT | `/api/admin/products/[id]` | Update product (admin) |
| DELETE | `/api/admin/products/[id]` | Delete product (admin) |
| GET | `/api/admin/orders` | List orders (admin) |
| PUT | `/api/admin/orders/[id]` | Update order status (admin) |
| GET | `/api/admin/affiliates` | List affiliates (admin) |
| POST | `/api/admin/affiliates` | Create affiliate (admin) |
| GET | `/api/admin/analytics` | Dashboard stats (admin) |

## 🔧 Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Session encryption key |
| `ADMIN_EMAIL` | ✅ | Admin login email |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook secret |
| `GOOGLE_SHEETS_*` | For sync | Google Sheets API credentials |
| `VIETQR_*` | For QR | Bank account details |
| `RESEND_API_KEY` | For email | Resend API key |

## 🚀 Production Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set all environment variables in Vercel dashboard.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:reset` | Reset and re-seed database |

## 🎨 Sample Affiliate Codes (after seeding)

| Code | Discount |
|------|----------|
| `WELCOME10` | 10% off |
| `VIP20` | 20% off |
| `FRIEND15` | 15% off |
