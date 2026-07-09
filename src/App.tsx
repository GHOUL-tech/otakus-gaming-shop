import { useState, useEffect } from 'react';
import { Booking, Game, GamePackage, ActiveSession } from './types';
import {
  seedInitialDataIfEmpty,
  subscribeBookings,
  subscribeGames,
  subscribePackages,
  subscribeActiveSessions,
  fbAddBooking,
  fbUpdateBookingStatus,
  fbDeleteBooking,
  fbAddGame,
  fbAddPackage,
  fbDeletePackage,
  fbSaveActiveSession,
  fbDeleteActiveSession
} from './lib/firebase';

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

  // Initialize and load from Firebase Firestore (with fallback/seeding)
  useEffect(() => {
    // 1. Seed initial data to firestore if it is empty
    seedInitialDataIfEmpty();

    // 2. Setup Real-time Subscriptions
    const unsubBookings = subscribeBookings((data) => {
      setBookings(data);
    });

    const unsubGames = subscribeGames((data) => {
      setGames(data);
    });

    const unsubPackages = subscribePackages((data) => {
      setPackages(data);
    });

    const unsubSessions = subscribeActiveSessions((data) => {
      setActiveSessions(data);
    });

    // 3. Client active terminal profile (still saved in localstorage per client device)
    const storedProfile = localStorage.getItem('gaming_shop_terminal_profile');
    if (storedProfile) {
      setLoggedInProfile(storedProfile as 'PC' | 'PSP');
    }

    return () => {
      unsubBookings();
      unsubGames();
      unsubPackages();
      unsubSessions();
    };
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

  // --- Mutation Functions via Firebase ---

  // Add a booking/walk-in bill
  const handleAddBooking = async (newBooking: Booking) => {
    try {
      await fbAddBooking(newBooking);
    } catch (e) {
      console.error('Error adding booking:', e);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (id: string) => {
    try {
      await fbUpdateBookingStatus(id, 'cancelled');
    } catch (e) {
      console.error('Error cancelling booking:', e);
    }
  };

  // Delete booking record completely
  const handleDeleteBooking = async (id: string) => {
    try {
      await fbDeleteBooking(id);
    } catch (e) {
      console.error('Error deleting booking:', e);
    }
  };

  // Add dynamic game title
  const handleAddGame = async (newGame: Game) => {
    try {
      await fbAddGame(newGame);
    } catch (e) {
      console.error('Error adding game:', e);
    }
  };

  // Add dynamic package configuration
  const handleAddPackage = async (newPkg: GamePackage) => {
    try {
      await fbAddPackage(newPkg);
    } catch (e) {
      console.error('Error adding package:', e);
    }
  };

  // Delete package configuration
  const handleDeletePackage = async (id: string) => {
    try {
      await fbDeletePackage(id);
    } catch (e) {
      console.error('Error deleting package:', e);
    }
  };

  // Client terminal starts playing (activates the timer)
  const handleStartSession = async (newSession: ActiveSession) => {
    try {
      // 1. Remove any stale/ended session for same role from Firestore
      const sameSystemSessions = activeSessions.filter(s => s.system === newSession.system);
      for (const oldSession of sameSystemSessions) {
        await fbDeleteActiveSession(oldSession.id);
      }
      // 2. Add the new active session
      await fbSaveActiveSession(newSession);
    } catch (e) {
      console.error('Error starting session:', e);
    }
  };

  // Client terminal ends session or clears alarm screen
  const handleEndSession = async (code: string) => {
    try {
      const session = activeSessions.find(s => s.code === code);
      if (!session) return;

      if (session.isEnded) {
        // If it has already ended and they clicked clear/close, remove it completely from active screen
        await fbDeleteActiveSession(session.id);
      } else {
        // Mark it as ended, which launches the YouTube Alarm / buzzer overlay!
        const updated = { ...session, isActive: false, isEnded: true };
        await fbSaveActiveSession(updated);
      }
    } catch (e) {
      console.error('Error ending session:', e);
    }
  };

  // Clear ended notifications from admin alerts
  const handleClearEndedNotifications = async () => {
    try {
      const ended = activeSessions.filter(s => s.isEnded);
      for (const s of ended) {
        await fbDeleteActiveSession(s.id);
      }
    } catch (e) {
      console.error('Error clearing ended notifications:', e);
    }
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
