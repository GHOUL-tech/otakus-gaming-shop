import { useState, useEffect } from 'react';
import { Booking, Game, GamePackage, ActiveSession } from './types';
import { DEFAULT_GAMES, DEFAULT_PACKAGES } from './data/defaultData';

// Component Imports
import Home from './components/Home';
import Games from './components/Games';
import SystemRequirements from './components/SystemRequirements';
import Prebook from './components/Prebook';
import ShopPC from './components/ShopPC';
import AboutUs from './components/AboutUs';
import AdminPanel from './components/AdminPanel';

// Lucide-react icons
import { Gamepad2, Layers, Cpu, Calendar, Info, Clock, Monitor, Lock } from 'lucide-react';

export default function App() {
  // --- Central States ---
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<string>('home');

  // Terminal Profile state
  const [loggedInProfile, setLoggedInProfile] = useState<'PC' | 'PSP' | null>(null);

  // Admin Login state (transient)
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState<boolean>(false);

  // Digital Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  // Initialize and load from LocalStorage
  useEffect(() => {
    // 1. Bookings
    const storedBookings = localStorage.getItem('gaming_shop_bookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      // Seed an initial booking so schedule looks lively
      const initialBookings: Booking[] = [
        {
          id: 'seed-1',
          name: 'Shakil Khan',
          phone: '01712345678',
          system: 'PC',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 2,
          amount: 200,
          status: 'approved',
          code: '#PC-8821'
        },
        {
          id: 'seed-2',
          name: 'Nayeem Hasan',
          phone: '01899112233',
          system: 'PSP',
          date: new Date().toISOString().split('T')[0],
          time: '16:30',
          duration: 1,
          amount: 60,
          status: 'approved',
          code: '#PSP-4412'
        }
      ];
      setBookings(initialBookings);
      localStorage.setItem('gaming_shop_bookings', JSON.stringify(initialBookings));
    }

    // 2. Games Catalog
    const storedGames = localStorage.getItem('gaming_shop_games');
    if (storedGames) {
      try {
        const parsed: Game[] = JSON.parse(storedGames);
        // Overwrite or update images with current DEFAULT_GAMES values to ensure branding changes apply
        const updated = parsed.map((g: Game) => {
          const matched = DEFAULT_GAMES.find((dg: Game) => dg.id === g.id);
          if (matched) {
            return { ...g, name: matched.name, image: matched.image, type: matched.type };
          }
          return g;
        });
        
        // Append any new default games not present in localstorage yet
        const newDefaults = DEFAULT_GAMES.filter((dg: Game) => !parsed.some((g: Game) => g.id === dg.id));
        const finalGames = [...updated, ...newDefaults];

        setGames(finalGames);
        localStorage.setItem('gaming_shop_games', JSON.stringify(finalGames));
      } catch (e) {
        setGames(DEFAULT_GAMES);
        localStorage.setItem('gaming_shop_games', JSON.stringify(DEFAULT_GAMES));
      }
    } else {
      setGames(DEFAULT_GAMES);
      localStorage.setItem('gaming_shop_games', JSON.stringify(DEFAULT_GAMES));
    }

    // 3. Pricing Packages
    const storedPackages = localStorage.getItem('gaming_shop_packages');
    if (storedPackages) {
      setPackages(JSON.parse(storedPackages));
    } else {
      setPackages(DEFAULT_PACKAGES);
      localStorage.setItem('gaming_shop_packages', JSON.stringify(DEFAULT_PACKAGES));
    }

    // 4. Client active sessions
    const storedSessions = localStorage.getItem('gaming_shop_active_sessions');
    if (storedSessions) {
      setActiveSessions(JSON.parse(storedSessions));
    }

    // 5. Client active terminal profiles
    const storedProfile = localStorage.getItem('gaming_shop_terminal_profile');
    if (storedProfile) {
      setLoggedInProfile(storedProfile as 'PC' | 'PSP');
    }
  }, []);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const bdtTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(bdtTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Setup BroadcastChannel for Instant Inter-Tab State Syncing!
  useEffect(() => {
    const channel = new BroadcastChannel('gaming_shop_sync_channel');

    channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'SYNC_ALL_STATES') {
        if (data.bookings) setBookings(data.bookings);
        if (data.games) setGames(data.games);
        if (data.packages) setPackages(data.packages);
        if (data.activeSessions) setActiveSessions(data.activeSessions);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Sync Helper to update localstorage + broadcast to other tabs
  const saveAndBroadcast = (
    updatedBookings: Booking[],
    updatedGames: Game[],
    updatedPackages: GamePackage[],
    updatedSessions: ActiveSession[]
  ) => {
    localStorage.setItem('gaming_shop_bookings', JSON.stringify(updatedBookings));
    localStorage.setItem('gaming_shop_games', JSON.stringify(updatedGames));
    localStorage.setItem('gaming_shop_packages', JSON.stringify(updatedPackages));
    localStorage.setItem('gaming_shop_active_sessions', JSON.stringify(updatedSessions));

    const channel = new BroadcastChannel('gaming_shop_sync_channel');
    channel.postMessage({
      type: 'SYNC_ALL_STATES',
      data: {
        bookings: updatedBookings,
        games: updatedGames,
        packages: updatedPackages,
        activeSessions: updatedSessions
      }
    });
  };

  // --- Mutation Functions ---

  // Add a booking/walk-in bill
  const handleAddBooking = (newBooking: Booking) => {
    const nextBookings = [newBooking, ...bookings];
    setBookings(nextBookings);
    saveAndBroadcast(nextBookings, games, packages, activeSessions);
  };

  // Cancel booking
  const handleCancelBooking = (id: string) => {
    const nextBookings = bookings.map(b => (b.id === id ? { ...b, status: 'cancelled' as const } : b));
    setBookings(nextBookings);
    saveAndBroadcast(nextBookings, games, packages, activeSessions);
  };

  // Delete booking record completely
  const handleDeleteBooking = (id: string) => {
    const nextBookings = bookings.filter(b => b.id !== id);
    setBookings(nextBookings);
    saveAndBroadcast(nextBookings, games, packages, activeSessions);
  };

  // Add dynamic game title
  const handleAddGame = (newGame: Game) => {
    const nextGames = [...games, newGame];
    setGames(nextGames);
    saveAndBroadcast(bookings, nextGames, packages, activeSessions);
  };

  // Add dynamic package configuration
  const handleAddPackage = (newPkg: GamePackage) => {
    const nextPackages = [...packages, newPkg];
    setPackages(nextPackages);
    saveAndBroadcast(bookings, games, nextPackages, activeSessions);
  };

  // Delete package configuration
  const handleDeletePackage = (id: string) => {
    const nextPackages = packages.filter(p => p.id !== id);
    setPackages(nextPackages);
    saveAndBroadcast(bookings, games, nextPackages, activeSessions);
  };

  // Client terminal starts playing (activates the timer)
  const handleStartSession = (newSession: ActiveSession) => {
    // 1. Remove any stale/ended session for same role
    const nextSessions = activeSessions
      .filter(s => s.system !== newSession.system)
      .concat(newSession);
    
    setActiveSessions(nextSessions);
    saveAndBroadcast(bookings, games, packages, nextSessions);
  };

  // Client terminal ends session or clears alarm screen
  const handleEndSession = (code: string) => {
    const session = activeSessions.find(s => s.code === code);
    if (!session) return;

    let nextSessions: ActiveSession[] = [];
    if (session.isEnded) {
      // If it has already ended and they clicked clear/close, remove it completely from active screen
      nextSessions = activeSessions.filter(s => s.code !== code);
    } else {
      // Mark it as ended, which launches the YouTube Alarm / buzzer overlay!
      nextSessions = activeSessions.map(s =>
        s.code === code ? { ...s, isActive: false, isEnded: true } : s
      );
    }

    setActiveSessions(nextSessions);
    saveAndBroadcast(bookings, games, packages, nextSessions);
  };

  // Clear ended notifications from admin alerts
  const handleClearEndedNotifications = () => {
    const nextSessions = activeSessions.filter(s => !s.isEnded);
    setActiveSessions(nextSessions);
    saveAndBroadcast(bookings, games, packages, nextSessions);
  };

  // Terminal Profile Logins
  const handleLoginProfile = (profile: 'PC' | 'PSP') => {
    setLoggedInProfile(profile);
    localStorage.setItem('gaming_shop_terminal_profile', profile);
  };

  const handleLogoutProfile = () => {
    setLoggedInProfile(null);
    localStorage.removeItem('gaming_shop_terminal_profile');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex flex-col justify-between selection:bg-[#00FF00]/30 selection:text-[#00FF00]">
      
      {/* Visual background atmospheric elements - sleek low-opacity green glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00FF00]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[140px]" />
      </div>

      {/* Main Container Wrapper */}
      <div className="z-10 relative flex flex-col min-h-screen">
        
        {/* Navigation Shell Header */}
        <header className="border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Logo/Branding with Bento block styling */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="relative">
                <div className="w-10 h-10 bg-[#00FF00] rounded-sm flex items-center justify-center text-black font-black text-xl italic shadow-[0_0_12px_rgba(0,255,0,0.4)]">
                  OG
                </div>
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tighter text-[#00FF00] italic block uppercase leading-none drop-shadow-[0_0_6px_rgba(0,255,0,0.4)]">OTAKUS</span>
                <span className="font-mono text-[9px] text-white block tracking-widest font-black uppercase">GAMING HAVEN</span>
              </div>
            </div>

            {/* Desktop Navigation Tabs - Bento style */}
            <nav className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
              <button
                id="tab-home"
                onClick={() => setActiveTab('home')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.05)]'
                    : 'border border-transparent text-slate-400 hover:text-[#00FF00]'
                }`}
              >
                Home
              </button>
              
              <button
                id="tab-games"
                onClick={() => setActiveTab('games')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'games'
                    ? 'bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.05)]'
                    : 'border border-transparent text-slate-400 hover:text-[#00FF00]'
                }`}
              >
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Games</span>
              </button>

              <button
                id="tab-requirements"
                onClick={() => setActiveTab('requirements')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'requirements'
                    ? 'bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.05)]'
                    : 'border border-transparent text-slate-400 hover:text-[#00FF00]'
                }`}
              >
                <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Systems</span>
              </button>

              <button
                id="tab-prebook"
                onClick={() => setActiveTab('prebook')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'prebook'
                    ? 'bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.05)]'
                    : 'border border-transparent text-slate-400 hover:text-[#00FF00]'
                }`}
              >
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Prebook</span>
              </button>

              <button
                id="tab-about"
                onClick={() => setActiveTab('about')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.05)]'
                    : 'border border-transparent text-slate-400 hover:text-[#00FF00]'
                }`}
              >
                <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> About Us</span>
              </button>

              <button
                id="tab-shoppc"
                onClick={() => setActiveTab('shoppc')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'shoppc'
                    ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                    : 'border border-transparent text-slate-400 hover:text-emerald-400'
                }`}
              >
                <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> Shop Client</span>
              </button>
            </nav>

            {/* Live Clock / Location Tag */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5">
              <Clock className="w-4 h-4 text-[#00FF00]" />
              <div className="text-right font-mono">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">DHAKA LOCAL TIME</span>
                <span className="text-xs font-black text-white tracking-wider">{currentTime || '--:--:--'}</span>
              </div>
            </div>

          </div>
        </header>

        {/* View Router Render Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
          
          {activeTab === 'home' && (
            <Home
              onNavigate={(tab) => setActiveTab(tab)}
              games={games}
              packages={packages}
            />
          )}

          {activeTab === 'games' && (
            <Games games={games} />
          )}

          {activeTab === 'requirements' && (
            <SystemRequirements />
          )}

          {activeTab === 'prebook' && (
            <Prebook
              bookings={bookings}
              packages={packages}
              onAddBooking={handleAddBooking}
            />
          )}

          {activeTab === 'about' && (
            <AboutUs />
          )}

          {activeTab === 'shoppc' && (
            <ShopPC
              bookings={bookings}
              activeSessions={activeSessions}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              loggedInProfile={loggedInProfile}
              onLoginProfile={handleLoginProfile}
              onLogoutProfile={handleLogoutProfile}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel
              bookings={bookings}
              games={games}
              packages={packages}
              activeSessions={activeSessions}
              onAddBooking={handleAddBooking}
              onCancelBooking={handleCancelBooking}
              onDeleteBooking={handleDeleteBooking}
              onAddGame={handleAddGame}
              onAddPackage={handleAddPackage}
              onDeletePackage={handleDeletePackage}
              onClearEndedNotifications={handleClearEndedNotifications}
              isLoggedInAdmin={isLoggedInAdmin}
              onLoginAdmin={() => setIsLoggedInAdmin(true)}
              onLogoutAdmin={() => setIsLoggedInAdmin(false)}
            />
          )}

        </main>

        {/* Footer Page Section (Mandatory: Shop pc only) */}
        <footer className="border-t border-white/10 bg-[#0a0a0a] py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Main brand footer */}
            <div className="flex flex-col text-center md:text-left gap-1">
              <span className="font-display font-black text-sm text-slate-200 tracking-wider">OTAKUS GAMING HAVEN</span>
              <span className="text-[11px] text-gray-500 font-mono font-bold uppercase">Demra Staff Quarter, West Box Nogor, Dhaka.</span>
            </div>

            {/* Mandatory requested literal text */}
            <div className="bg-[#00FF00]/10 border border-[#00FF00]/20 px-6 py-2 rounded-xl text-center">
              <span className="text-sm font-mono tracking-widest font-black text-[#00FF00] text-glow-green uppercase">
                Shop pc only
              </span>
            </div>

            {/* Hidden admin entrance button using emoji as requested */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-mono">© 2026 Rahin. All Rights Reserved.</span>
              <button
                id="hidden-admin-trigger"
                onClick={() => {
                  setActiveTab('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-1 text-slate-700 hover:text-[#00FF00] text-sm hover:scale-125 transition-all cursor-pointer"
                title="Admin Entrance"
              >
                ⚙️
              </button>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
