import { Globe, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          <Link to="/services" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">{t('nav.services')}</Link>
          <Link to="/erpnext" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">ERPNext</Link>
          <Link to="/iso9001" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">ISO 9001</Link>
          <Link to="/work" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">{t('nav.work')}</Link>
          <Link to="/team" className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">{t('nav.team')}</Link>
          <Link to={isHome ? "#contact" : "/#contact"} className="text-sm font-semibold text-slate-600 hover:text-[#44ACAB] transition-colors">Contact</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
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
        <div className="flex md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white px-6 py-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/logo.jpg" alt="JetNext Logo" className="h-10 w-10 rounded-xl shadow-sm object-cover bg-white" />
                  <div className="flex flex-col">
                    <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">JetNext</span>
                    <span className="text-[9px] font-bold tracking-wider text-[#44ACAB] uppercase mt-1">By Jethings</span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-slate-700 hover:text-slate-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-7 w-7" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-slate-100">
                  <div className="space-y-4 py-6 flex flex-col">
                    <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">{t('nav.services')}</Link>
                    <Link to="/erpnext" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">ERPNext</Link>
                    <Link to="/iso9001" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">ISO 9001</Link>
                    <Link to="/work" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">{t('nav.work')}</Link>
                    <Link to="/team" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">{t('nav.team')}</Link>
                    <Link to={isHome ? "#contact" : "/#contact"} onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">Contact</Link>
                  </div>
                  <div className="py-6 flex flex-col gap-4">
                    <button 
                      onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-2 -mx-3 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
                    >
                      <Globe className="h-5 w-5" />
                      {i18n.language === 'fr' ? 'English' : 'Français'}
                    </button>
                    <Link
                      to="/book"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-full bg-[#44ACAB] px-6 py-4 text-center text-base font-bold text-white shadow-md hover:bg-[#328887] transition-colors mt-2"
                    >
                      {t('nav.book')}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
