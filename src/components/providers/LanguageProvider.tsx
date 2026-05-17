'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type Locale = 'vi' | 'en';

type Dictionary = {
  brandTagline: string;
  nav: {
    home: string;
    store: string;
    blog: string;
    pricing: string;
    cart: string;
    admin: string;
    navigation: string;
    support: string;
  };
  hero: {
    greeting: string;
    intro: string;
    titleDeveloper: string;
    titleCrypto: string;
    titleBuilder: string;
    description: string;
    browseStore: string;
    resume: string;
    stats: Array<{ value: string; label: string }>;
  };
  skills: {
    headingPrefix: string;
    headingHighlight: string;
    headingSuffix: string;
    location: string;
    categories: string[];
    highlightsTitle: string;
    highlightPoints: string[];
  };
  cta: {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
    button: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  vi: {
    brandTagline: 'Coding & Crypto. Khám phá các sản phẩm, công cụ và tài liệu trading chất lượng cao.',
    nav: {
      home: 'Trang chủ',
      store: 'Cửa hàng',
      blog: 'Blog',
      pricing: '9Meta',
      cart: 'Giỏ hàng',
      admin: 'Quản trị',
      navigation: 'Điều hướng',
      support: 'Hỗ trợ',
    },
    hero: {
      greeting: 'Xin chào',
      intro: 'Tôi là Tio',
      titleDeveloper: 'Developer',
      titleCrypto: 'Crypto',
      titleBuilder: 'Builder',
      description: 'Developer tập trung vào open-source, crypto tooling, web/app development và trading automation. Xây dựng indicator, bot và hệ thống giúp trader làm việc nhanh hơn và thông minh hơn.',
      browseStore: 'Xem cửa hàng',
      resume: 'Hồ sơ của tôi',
      stats: [
        { value: '500+', label: 'Lệnh đã chạy' },
        { value: '85%', label: 'Tỷ lệ thắng' },
        { value: '2+', label: 'Năm kinh nghiệm' },
        { value: '50+', label: 'Khách hàng hài lòng' },
      ],
    },
    skills: {
      headingPrefix: 'Kỹ năng',
      headingHighlight: 'của tôi',
      headingSuffix: '& Chuyên môn',
      location: 'Làm việc tại Hà Nội, Việt Nam',
      categories: ['Frontend & UI', 'Backend & Database', 'System & Tools', 'Specialty & Workflow'],
      highlightsTitle: 'Điểm nổi bật chuyên môn',
      highlightPoints: [
        'Thành thạo JavaScript, thao tác DOM và mô hình đối tượng JavaScript.',
        'Hiểu sâu về React.js, các nguyên lý cốt lõi và các workflow phổ biến như Flux/Redux.',
        'Khả năng học nhanh, áp dụng công nghệ mới và tận dụng AI hiệu quả trong sản phẩm.',
        'Tham gia học hỏi và giao lưu chuyên môn cùng cộng đồng Người Viết Mã.',
      ],
    },
    cta: {
      badge: 'Bắt đầu hành trình của bạn ngay hôm nay',
      titlePrefix: 'Sẵn sàng',
      titleHighlight: 'Nâng cấp',
      titleSuffix: 'giao dịch của bạn?',
      description: 'Khám phá bộ sưu tập tools, indicators và tài liệu trading được thiết kế bởi Tiodev.',
      button: 'Khám phá cửa hàng',
    },
  },
  en: {
    brandTagline: 'Coding & Crypto. Explore premium products, tools, and trading resources.',
    nav: {
      home: 'Home',
      store: 'Store',
      blog: 'Blog',
      pricing: '9Meta',
      cart: 'Shopping Cart',
      admin: 'Admin',
      navigation: 'Navigation',
      support: 'Support',
    },
    hero: {
      greeting: 'Hello',
      intro: "I'm Tio",
      titleDeveloper: 'Developer',
      titleCrypto: 'Crypto',
      titleBuilder: 'Builder',
      description: 'A developer focused on open-source, crypto tooling, web/app development, and trading automation. I build indicators, bots, and systems that help traders work faster and smarter.',
      browseStore: 'Browse Store',
      resume: 'My Resume',
      stats: [
        { value: '500+', label: 'Trades Executed' },
        { value: '85%', label: 'Win Rate' },
        { value: '2+', label: 'Years Experience' },
        { value: '50+', label: 'Happy Clients' },
      ],
    },
    skills: {
      headingPrefix: 'My',
      headingHighlight: 'Skills',
      headingSuffix: '& Expertise',
      location: 'Based in Ha Noi, Viet Nam',
      categories: ['Frontend & UI', 'Backend & Database', 'System & Tools', 'Specialty & Workflow'],
      highlightsTitle: 'Professional Highlights',
      highlightPoints: [
        'Strong proficiency in JavaScript, DOM manipulation, and the JavaScript object model.',
        'Thorough understanding of React.js, its core principles, and popular workflows (Flux/Redux).',
        'Ability to learn, apply new technology quickly and use/update AI effectively in products.',
        'Participate in learning and exchange activities with the Người Viết Mã community.',
      ],
    },
    cta: {
      badge: 'Start your journey today',
      titlePrefix: 'Ready to',
      titleHighlight: 'Level Up',
      titleSuffix: 'Your Trading?',
      description: 'Explore a curated collection of tools, indicators, and trading resources designed by Tiodev.',
      button: 'Explore Store',
    },
  },
};

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const saved = window.localStorage.getItem('site-locale');
  if (saved === 'vi' || saved === 'en') return saved;

  const language = navigator.language?.toLowerCase() || '';
  const languages = navigator.languages?.map((lang) => lang.toLowerCase()) || [];
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  const isVietnam =
    language.includes('vi') ||
    languages.some((lang) => lang.includes('vi') || lang.includes('-vn')) ||
    timezone.includes('Ho_Chi_Minh') ||
    timezone.includes('Asia/Saigon');

  return isVietnam ? 'vi' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('site-locale', nextLocale);
    }
  };

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
