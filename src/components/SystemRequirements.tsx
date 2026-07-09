import { Cpu, Server, Database, HardDrive, Tv, Zap, Monitor } from 'lucide-react';

export default function SystemRequirements() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="font-display text-3xl font-black text-white tracking-tighter uppercase italic">
          SYSTEM <span className="text-glow-green text-[#00FF00]">REQUIREMENTS</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Check out our hardware power levels. We don't hide our specs - here is exactly what drives your games.
        </p>
      </div>

      {/* Grid containing both PC setups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Setup 1: High Power Gaming PC */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_0_15px_rgba(0,255,0,0.05)]">
          {/* Neon accent bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-[#00FF00]" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF00]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-display font-black text-white tracking-tight uppercase italic">HIGH POWERED PC RIGS</h2>
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/20">
                100Hz Gaming
              </span>
            </div>

            <p className="text-sm text-gray-400 font-sans">
              Configured specifically for heavy modern titles like GTA 5 (Enhanced/Legacy) and FIFA 22 at stable, smooth framerates.
            </p>

            {/* Specs list */}
            <div className="space-y-4 pt-2 font-mono text-sm">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Cpu className="w-5 h-5 text-[#00FF00] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">PROCESSOR</div>
                  <div className="text-slate-200">Ryzen 5 1500x</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Server className="w-5 h-5 text-[#00FF00] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">MOTHERBOARD</div>
                  <div className="text-slate-200">Asrock Steel Legend B450M</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Database className="w-5 h-5 text-[#00FF00] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">SYSTEM MEMORY</div>
                  <div className="text-slate-200">16 GB DDR4 RAM</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <HardDrive className="w-5 h-5 text-[#00FF00] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">GRAPHICS CARD</div>
                  <div className="text-slate-200">Rx580 8GB GDDR5 (2048 SP)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Database className="w-5 h-5 text-[#00FF00] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">STORAGE VOLUME</div>
                  <div className="text-slate-200">1.69 TB High-Speed Space</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Zap className="w-5 h-5 text-[#00FF00] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">POWER UNIT</div>
                  <div className="text-slate-200">550W Premium PSU</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-[#00FF00] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">PRIMARY SCREEN</div>
                  <div className="text-slate-200">Samsung 22F 100Hz display</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup 2: PSP PC / Console System */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_0_15px_rgba(255,255,255,0.03)]">
          {/* Neon accent bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-display font-black text-white tracking-tight uppercase italic">PSP EMULATOR STATIONS</h2>
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded bg-white/5 text-white border border-white/10">
                Retro Lounge
              </span>
            </div>

            <p className="text-sm text-gray-400 font-sans">
              Optimized emulator configurations to play retro handheld PSP titles on a gorgeous large living-room styled TV screen.
            </p>

            {/* Specs list */}
            <div className="space-y-4 pt-2 font-mono text-sm">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Cpu className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">PROCESSOR</div>
                  <div className="text-slate-200">Intel Core i3 (3rd Generation)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Server className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">MOTHERBOARD</div>
                  <div className="text-slate-200">Gigabyte H61 Motherboard</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Database className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">SYSTEM MEMORY</div>
                  <div className="text-slate-200">4 GB DDR3 RAM</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <HardDrive className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">SYSTEM STORAGE</div>
                  <div className="text-slate-200">128 GB Solid-State Drive (SSD)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Zap className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">POWER UNIT</div>
                  <div className="text-slate-200">200W Output Power Supply</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tv className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">DISPLAY MONITOR</div>
                  <div className="text-slate-200">Walton 32 inch TV with PSP Controller</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
