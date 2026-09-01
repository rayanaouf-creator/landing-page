import { Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="JetNext Logo" className="h-10 w-auto rounded-xl shadow-sm object-contain bg-white" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">JetNext</span>
            <span className="text-[10px] font-bold tracking-wider text-[#44ACAB] uppercase mt-1">By Jethings</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 bg-white/80 backdrop-blur-md px-8 py-3 rounded-full shadow-sm ring-1 ring-slate-200/50">
          <a href="#services" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">Services</a>
          <a href="#modules" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">Modules</a>
          <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">Contact</a>
        </div>
        <div className="flex items-center">
          <a
            href="#contact"
            className="rounded-full bg-[#44ACAB] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#328887] hover:-translate-y-0.5 shadow-lg shadow-[#44ACAB]/30"
          >
            Get an Estimate
          </a>
        </div>
      </div>
    </nav>
  );
}
