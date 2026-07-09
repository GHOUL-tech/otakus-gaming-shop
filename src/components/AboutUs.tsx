import { User, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function AboutUs() {
  const pspSetupImage = '/src/assets/images/psp_gaming_setup_1783614585093.jpg';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-white/10 text-center md:text-left">
        <h1 className="font-display text-3xl font-black text-white tracking-tighter uppercase italic">
          ABOUT <span className="text-glow-green text-[#00FF00]">OUR SHOP</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Learn about OtakuS Gaming Haven, our physical location in Demra, and operating guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Photo Visual with styled details */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-[0_0_15px_rgba(0,255,0,0.02)]">
          <img
            src={pspSetupImage}
            alt="OtakuS PSP Console TV Station"
            className="w-full h-[320px] object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=600&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-white bg-black/80 p-2.5 rounded-lg border border-white/10 backdrop-blur-sm">
            🎮 <strong>Featured Area:</strong> Station 3 with Walton 32" TV and retro PSP emulators.
          </div>
        </div>

        {/* Right Side: Information Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tight">MEET THE OWNER</h2>
          
          <div className="space-y-4">
            {/* Owner name */}
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#00FF00]/10 rounded-xl text-[#00FF00] shrink-0 border border-[#00FF00]/10">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase">OWNER / MANAGER</span>
                <span className="text-base font-bold text-white">Rahin</span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#00FF00]/10 rounded-xl text-[#00FF00] shrink-0 border border-[#00FF00]/10">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase">PHONE CONTACT</span>
                <a href="tel:01872537867" className="text-base font-bold text-[#00FF00] hover:underline font-mono">
                  01872537867
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#00FF00]/10 rounded-xl text-[#00FF00] shrink-0 border border-[#00FF00]/10">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase">EMAIL ADDRESS</span>
                <a href="mailto:rahinemployee@gmail.com" className="text-base font-bold text-slate-100 hover:text-[#00FF00] transition-colors font-mono">
                  rahinemployee@gmail.com
                </a>
              </div>
            </div>

            {/* Physical Location */}
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#00FF00]/10 rounded-xl text-[#00FF00] shrink-0 border border-[#00FF00]/10">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-mono font-bold block uppercase">SHOP ADDRESS</span>
                <span className="text-sm text-gray-300 leading-relaxed block font-sans">
                  West Box Nogor, Demra Staff Quarter,<br />
                  House Number: 44/67/16, Postal Code: 1361,<br />
                  Demra, Dhaka, Bangladesh.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Mock & Operation Timing Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
        {/* Opening hours */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-3 font-sans">
          <h3 className="font-display font-black text-white text-sm flex items-center gap-2 uppercase italic">
            <Clock className="w-4.5 h-4.5 text-[#00FF00]" /> Operational Hours
          </h3>
          <div className="text-xs text-gray-400 space-y-2 font-mono">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Monday - Thursday</span>
              <span className="text-white font-bold">10:00 AM - 10:00 PM</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Friday (Jumma Break)</span>
              <span className="text-white font-bold">03:00 PM - 11:30 PM</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Saturday - Sunday</span>
              <span className="text-white font-bold">09:00 AM - 11:00 PM</span>
            </div>
          </div>
        </div>

        {/* Security & Integrity Badging */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-3 font-sans">
          <h3 className="font-display font-black text-white text-sm flex items-center gap-2 uppercase italic">
            <ShieldCheck className="w-4.5 h-4.5 text-[#00FF00]" /> Lounge Conduct Guidelines
          </h3>
          <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
            <li>Keep food and sticky drinks away from the mechanical keyboards.</li>
            <li>Do not modify emulator directories or install system files.</li>
            <li>Report hardware bugs or slow performance to Rahin immediately.</li>
            <li>Treat fellow gamers with respect. Enjoy your lobby!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
