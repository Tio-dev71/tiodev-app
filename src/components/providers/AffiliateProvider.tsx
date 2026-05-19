'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';

export function AffiliateProvider() {
  const searchParams = useSearchParams();
  const { setAffiliateCode } = useCartStore();

  useEffect(() => {
    const code = searchParams.get('ref') || searchParams.get('affiliate');
    
    if (code) {
      // Automatically validate and apply the affiliate code
      const applyAffiliateCode = async () => {
        try {
          const res = await fetch('/api/affiliates/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code.toUpperCase() }),
          });
          const data = await res.json();
          if (data.valid) {
            setAffiliateCode(data.code, data.discountPercent);
          }
        } catch (error) {
          console.error('Failed to validate affiliate code from URL:', error);
        }
      };

      applyAffiliateCode();
    }
  }, [searchParams, setAffiliateCode]);

  return null;
}
