'use client';

const tickerItems = [
  { symbol: 'BTC', price: '$67,234', change: '+2.4%', positive: true },
  { symbol: 'ETH', price: '$3,521', change: '+1.8%', positive: true },
  { symbol: 'SOL', price: '$142.50', change: '-0.5%', positive: false },
  { symbol: 'BNB', price: '$612.30', change: '+3.1%', positive: true },
  { symbol: 'XRP', price: '$0.62', change: '+0.9%', positive: true },
  { symbol: 'ADA', price: '$0.45', change: '-1.2%', positive: false },
  { symbol: 'DOGE', price: '$0.082', change: '+5.3%', positive: true },
  { symbol: 'AVAX', price: '$35.80', change: '+2.1%', positive: true },
];

export function PriceTicker() {
  return (
    <div className="fixed top-[72px] left-0 right-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-white/5 overflow-hidden">
      <div className="ticker-scroll flex items-center gap-8 py-2 px-4 whitespace-nowrap" style={{ width: 'max-content' }}>
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-white/60 font-medium">{item.symbol}</span>
            <span className="text-white font-semibold">{item.price}</span>
            <span className={`font-medium ${item.positive ? 'text-primary-400' : 'text-red-400'}`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
