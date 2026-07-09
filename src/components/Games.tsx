import { useState } from 'react';
import { Game } from '../types';
import { Search, Monitor, Gamepad2, Layers } from 'lucide-react';

interface GamesProps {
  games: Game[];
}

export default function Games({ games }: GamesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PC' | 'PSP'>('ALL');

  // Filter games based on search term and system type
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = activeFilter === 'ALL' || game.type === activeFilter;
    return matchesSearch && matchesSystem;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tighter uppercase italic">
            GAMES <span className="text-glow-green text-[#00FF00]">CATALOG</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Browse all high-graphics PC titles and classic PSP games loaded on our systems.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            id="game-search-input"
            type="text"
            placeholder="Search game name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black hover:bg-[#111] focus:bg-black text-slate-100 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-[#00FF00]/40 focus:outline-none transition-all font-sans"
          />
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          id="btn-filter-all"
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#00FF00]/10 border-[#00FF00]/30 text-[#00FF00] font-black'
              : 'bg-[#111] border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          ALL GAMES ({games.length})
        </button>
        <button
          id="btn-filter-pc"
          onClick={() => setActiveFilter('PC')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
            activeFilter === 'PC'
              ? 'bg-[#00FF00]/10 border-[#00FF00]/30 text-[#00FF00] font-black'
              : 'bg-[#111] border-white/10 text-gray-400 hover:text-[#00FF00]'
          }`}
        >
          <Monitor className="w-4 h-4" />
          PC GAMES ({games.filter(g => g.type === 'PC').length})
        </button>
        <button
          id="btn-filter-psp"
          onClick={() => setActiveFilter('PSP')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
            activeFilter === 'PSP'
              ? 'bg-white/10 border-white/30 text-white font-black'
              : 'bg-[#111] border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          PSP GAMES ({games.filter(g => g.type === 'PSP').length})
        </button>
      </div>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className={`group relative rounded-xl overflow-hidden border bg-[#111] transition-all duration-300 flex flex-col h-full ${
                game.type === 'PC'
                  ? 'border-white/10 hover:border-[#00FF00]/40 hover:shadow-[0_0_15px_rgba(0,255,0,0.1)]'
                  : 'border-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'
              }`}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden relative bg-black flex items-center justify-center">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-85" />
                
                {/* Badge Overlay */}
                <div className="absolute top-2 left-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase border ${
                    game.type === 'PC'
                      ? 'bg-black/80 border-[#00FF00]/30 text-[#00FF00]'
                      : 'bg-black/80 border-white/20 text-white'
                  }`}>
                    {game.type}
                  </span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-3 border-t border-white/5 bg-[#0a0a0a] flex-grow flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight line-clamp-2 leading-snug group-hover:text-[#00FF00] transition-colors">
                    {game.name}
                  </h3>
                </div>
                
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono font-bold text-gray-500 uppercase tracking-tighter">
                  <span>System Installed</span>
                  <span className={game.type === 'PC' ? 'text-[#00FF00]' : 'text-white'}>
                    {game.type === 'PC' ? 'PC Rigs 1-4' : 'PSP Station'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#111] border border-white/10 rounded-2xl space-y-3">
          <Layers className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-white font-black text-lg uppercase italic">No Games Found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto font-sans">
            We couldn't find any games matching "{searchTerm}". Try checking your spelling or selecting another category.
          </p>
        </div>
      )}
    </div>
  );
}
