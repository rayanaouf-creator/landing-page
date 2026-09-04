import { Building2, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="JetNext Logo" className="h-11 w-11 rounded-xl shadow-sm object-cover bg-white" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">JetNext</span>
            <span className="text-[10px] font-bold tracking-wider text-[#44ACAB] uppercase mt-1">By Jethings</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 bg-white/80 backdrop-blur-md px-8 py-3 rounded-full shadow-sm ring-1 ring-slate-200/50">
          <Link to={isHome ? "#services" : "/#services"} className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">{t('nav.services')}</Link>
          <Link to={isHome ? "#modules" : "/#modules"} className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">Modules</Link>
          <Link to="/work" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">{t('nav.work')}</Link>
          <Link to={isHome ? "#team" : "/#team"} className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">{t('nav.team')}</Link>
          <Link to={isHome ? "#contact" : "/#contact"} className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-[#44ACAB] transition-colors"
          >
            <Globe className="h-4 w-4" />
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>
          <Link
            to="/book"
            className="rounded-full bg-[#44ACAB] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#328887] hover:-translate-y-0.5 shadow-lg shadow-[#44ACAB]/30"
          >
            {t('nav.book')}
          </Link>
        </div>
      </div>
    </nav>
  );
}

