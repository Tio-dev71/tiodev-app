'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Check, Star, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string | null;
  featured: boolean;
  isSubscription?: boolean;
  subscriptionType?: string | null;
  embedCode?: string | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const searchParams = useSearchParams();
  const setAffiliateCode = useCartStore((s) => s.setAffiliateCode);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setAffiliateCode(ref, 0);
      // Optional: you could save this to localStorage directly or use the store
    }
  }, [searchParams, setAffiliateCode]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (res.ok) setProduct(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchProduct();
  }, [params.slug]);

  function handleAddToCart() {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  if (loading) return <div className="min-h-screen pt-28 pb-20 px-4"><div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12"><div className="aspect-square glass rounded-3xl animate-pulse" /><div className="space-y-6"><div className="h-10 bg-white/5 rounded-xl w-3/4 animate-pulse" /><div className="h-32 bg-white/5 rounded-xl animate-pulse" /></div></div></div>;

  if (!product) return <div className="min-h-screen pt-28 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">🔍</div><h2 className="text-2xl font-bold text-white mb-2">Product not found</h2><Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl"><ArrowLeft className="w-4 h-4" /> Back to Store</Link></div></div>;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[128px]" /></div>
      <div className="max-w-6xl mx-auto relative">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}><Link href="/store" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Store</Link></motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {product.subscriptionType === 'tradingview_indicator' && product.embedCode ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative aspect-[4/3] lg:aspect-auto glass rounded-3xl overflow-hidden" dangerouslySetInnerHTML={{ __html: product.embedCode }} />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative aspect-square glass rounded-3xl overflow-hidden">
              {product.image ? <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-900/30 to-accent-900/30"><Package className="w-24 h-24 text-white/10" /></div>}
              {product.featured && <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm rounded-lg text-sm font-semibold text-white"><Star className="w-4 h-4 fill-white" /> Featured</div>}
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
            {product.category && <span className="text-sm font-medium text-primary-400 mb-2">{product.category}</span>}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{product.name}</h1>
            <div className="text-4xl font-bold gradient-text mb-6">{formatPrice(product.price)}</div>
            <div className="glass rounded-2xl p-6 mb-6"><p className="text-white/60 leading-relaxed whitespace-pre-wrap">{product.description}</p></div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-white/40">Quantity:</span>
              <div className="flex items-center glass rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors">−</button>
                <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors">+</button>
              </div>
            </div>
            
            {(product.slug.includes('9meta') || product.slug.includes('tools-auto-post')) ? (
              <Link href="/pricing" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 shadow-lg shadow-violet-500/25 transition-all duration-300 glow">
                <Star className="w-5 h-5" />
                Xem Bảng Giá Subscription 9Meta
              </Link>
            ) : product.isSubscription && product.subscriptionType === 'tradingview_indicator' ? (
              <Link href={`/indicator-checkout/${product.id}`} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 transition-all duration-300 glow">
                <Star className="w-5 h-5" />
                Đăng ký thuê (Subscribe) — {formatPrice(product.price)} / tháng
              </Link>
            ) : (
              <button onClick={handleAddToCart} disabled={addedToCart} className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 ${addedToCart ? 'bg-emerald-600' : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 glow'}`} id="add-to-cart-detail">
                {addedToCart ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart — {formatPrice(product.price * quantity)}</>}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
