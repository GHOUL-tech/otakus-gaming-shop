import { Game, GamePackage } from '../types';
import { Play, Shield, Monitor, Gamepad2, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
  games: Game[];
  packages: GamePackage[];
}

export default function Home({ onNavigate, games, packages }: HomeProps) {
  // Filter for featured games (first 4 of each category)
  const pcGames = games.filter(g => g.type === 'PC').slice(0, 4);
  const pspGames = games.filter(g => g.type === 'PSP').slice(0, 4);

  // Filter 30 min and 1 hour prices for display
  const getRate = (system: 'PC' | 'PSP', duration: number) => {
    const pkg = packages.find(p => p.system === system && p.durationMinutes === duration);
    return pkg ? `${pkg.price} TK` : 'N/A';
  };

  // Find our custom generated hero image path or fallback
  const heroImage = '/src/assets/images/gaming_lounge_graffiti_hero_1783614567283.jpg';

  return (
    <div className="space-y-12">
      {/* Hero Section - Bento style */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(0,255,0,0.05)] bg-[#111]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/95 to-transparent z-10" />
        <img
          src={heroImage}
          alt="OtakuS Gaming Haven"
          className="w-full h-[450px] object-cover object-center transform scale-100 hover:scale-105 transition-transform duration-700 opacity-60"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback if path isn't resolvable
            e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop";
          }}
        />
        
        <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-8 md:p-12 z-20 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/20 px-3 py-1 rounded text-xs font-mono tracking-widest uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
            Lounge Active & Live
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight uppercase italic">
            OTAKUS <span className="text-[#00FF00] text-glow-green">GAMING HAVEN</span>
          </h1>
          <p className="text-gray-400 font-sans text-sm md:text-base leading-relaxed">
            Unleash ultimate gaming performance. Rent our top-tier gaming setups and PSP consoles directly in Demra! Experience premium high-end rigs and big screen retro action with zero latency.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              id="hero-book-now"
              onClick={() => onNavigate('prebook')}
              className="px-6 py-3 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,0,0.4)] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Prebook a Seat Now
            </button>
            <button
              id="hero-view-games"
              onClick={() => onNavigate('games')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              Explore All Games
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hourly Rates & Systems Quick-view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* High-End PC Specs & Price */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF00]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-[#00FF00]/10 rounded-xl text-[#00FF00]">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="bg-[#00FF00]/10 text-[#00FF00] text-xs px-2.5 py-1 rounded font-mono border border-[#00FF00]/20 font-bold tracking-widest uppercase">
                HIGH END RIGS
              </span>
            </div>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight italic">High-Performance PC Gaming</h3>
            <p className="text-gray-400 text-sm">
              Powered by Ryzen 5 & RX 580. Stunning 100Hz visuals for smooth competitive gameplay.
            </p>
            
            {/* Rates Table */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3 font-mono text-sm text-slate-300">
              <div className="flex justify-between border-b border-white/10 pb-2 text-gray-500 font-bold uppercase text-[11px]">
                <span>Duration</span>
                <span>Rate (Taka)</span>
              </div>
              <div className="flex justify-between">
                <span>30 Minutes</span>
                <span className="text-[#00FF00] font-bold">{getRate('PC', 30)}</span>
              </div>
              <div className="flex justify-between">
                <span>1 Hour</span>
                <span className="text-[#00FF00] font-bold">{getRate('PC', 60)}</span>
              </div>
              <div className="flex justify-between">
                <span>2 Hours</span>
                <span className="text-[#00FF00] font-bold">{getRate('PC', 120)}</span>
              </div>
              <div className="flex justify-between pt-1 text-xs text-[#00FF00]/80">
                <span>✨ Multi-hour bundles available</span>
                <span className="underline cursor-pointer font-bold" onClick={() => onNavigate('prebook')}>Check Pack</span>
              </div>
            </div>
          </div>
          <button
            id="pc-book-btn"
            onClick={() => onNavigate('prebook')}
            className="mt-6 w-full py-2.5 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/30 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Book PC Seat
          </button>
        </div>

        {/* PSP Console Specs & Price */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 rounded-xl text-white">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="bg-white/5 text-white text-xs px-2.5 py-1 rounded font-mono border border-white/10 font-bold tracking-widest uppercase">
                PSP CONSOLES
              </span>
            </div>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight italic">Retro PSP Big Screen Gaming</h3>
            <p className="text-gray-400 text-sm">
              Large 32" screen layout with responsive controllers and zero-fuss emulator launcher.
            </p>
            
            {/* Rates Table */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3 font-mono text-sm text-slate-300">
              <div className="flex justify-between border-b border-white/10 pb-2 text-gray-500 font-bold uppercase text-[11px]">
                <span>Duration</span>
                <span>Rate (Taka)</span>
              </div>
              <div className="flex justify-between">
                <span>30 Minutes</span>
                <span className="text-white font-bold">{getRate('PSP', 30)}</span>
              </div>
              <div className="flex justify-between">
                <span>1 Hour</span>
                <span className="text-white font-bold">{getRate('PSP', 60)}</span>
              </div>
              <div className="flex justify-between">
                <span>2 Hours</span>
                <span className="text-white font-bold">{getRate('PSP', 120)}</span>
              </div>
              <div className="flex justify-between pt-1 text-xs text-white/80">
                <span>✨ Budget bundles configured</span>
                <span className="underline cursor-pointer font-bold" onClick={() => onNavigate('prebook')}>Check Pack</span>
              </div>
            </div>
          </div>
          <button
            id="psp-book-btn"
            onClick={() => onNavigate('prebook')}
            className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Book PSP Console
          </button>
        </div>
      </div>

      {/* Featured Games Preview */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-display font-black text-white uppercase italic">POPULAR TITLES IN SHOP</h2>
            <p className="text-gray-400 text-sm">Most played games by customers this week</p>
          </div>
          <button
            id="view-all-games-top"
            onClick={() => onNavigate('games')}
            className="text-[#00FF00] hover:underline text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            View Full List ({games.length}) <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* PC Games Row */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00] animate-pulse" /> PC High-End Catalog Highlights
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pcGames.map(game => (
              <div
                key={game.id}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#111] hover:border-[#00FF00]/50 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-black flex items-center justify-center">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
                </div>
                <div className="p-3 border-t border-white/5 bg-[#0a0a0a]">
                  <h4 className="font-bold text-white text-sm truncate">{game.name}</h4>
                  <p className="text-[#00FF00] text-[10px] font-bold font-mono mt-1 uppercase tracking-tight">PC HIGH GRAPHICS</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PSP Games Row */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> PSP Classic Catalog Highlights
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pspGames.map(game => (
              <div
                key={game.id}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#111] hover:border-white/30 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-black flex items-center justify-center">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
                </div>
                <div className="p-3 border-t border-white/5 bg-[#0a0a0a]">
                  <h4 className="font-bold text-white text-sm truncate">{game.name}</h4>
                  <p className="text-slate-400 text-[10px] font-bold font-mono mt-1 uppercase tracking-tight">WALTON 32" SCREEN</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badging / Quality indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#111] rounded-2xl p-6 border border-white/10">
        <div className="flex gap-4">
          <div className="p-3 bg-[#00FF00]/10 rounded-xl text-[#00FF00] h-fit">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-display italic">Saves & Accounts</h4>
            <p className="text-xs text-gray-400">
              Cloud accounts logged in on our devices. Your campaign progress will be saved!
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="p-3 bg-white/5 rounded-xl text-white h-fit">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-display italic">Premium Controllers</h4>
            <p className="text-xs text-gray-400">
              Ergonomic pro gamepads, high feedback, clean and sanitized after every single booking.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="p-3 bg-[#00FF00]/10 rounded-xl text-[#00FF00] h-fit">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-display italic">100Hz Smooth Display</h4>
            <p className="text-xs text-gray-400">
              Fluid refresh rates for premium action, low response latency, completely eye-safe setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
