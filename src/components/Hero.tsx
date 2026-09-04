import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  const { t } = useTranslation();
  return (
    <section id="hero" className="relative overflow-hidden bg-[#f4f7fb] px-6 py-32 sm:py-40 lg:px-8 pt-40">
      {/* Abstract soft background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[600px] bg-[#44ACAB]/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-40 -left-20 -z-10 w-[500px] h-[500px] bg-[#44ACAB]/10 blur-[100px] rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-20 -right-20 -z-10 w-[600px] h-[600px] bg-[#44ACAB]/15 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>
      
      {/* Floating Tech Logos */}
      <motion.div
        className="absolute top-[12%] left-[4%] lg:top-[20%] lg:left-[10%] opacity-40 lg:opacity-60 hover:opacity-100 transition-opacity z-0"
        animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bg-white p-3 lg:p-4 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <img src="https://cdn.simpleicons.org/erpnext/0089FF" alt="ERPNext" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[25%] left-[8%] lg:bottom-[40%] lg:left-[15%] opacity-40 lg:opacity-60 hover:opacity-100 transition-opacity z-0"
        animate={{ y: [0, 20, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="bg-white p-3 lg:p-4 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <img src="https://cdn.simpleicons.org/nextdotjs/000000" alt="Next.js" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[15%] right-[4%] lg:top-[30%] lg:right-[12%] opacity-40 lg:opacity-60 hover:opacity-100 transition-opacity z-0"
        animate={{ y: [0, -20, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="bg-white p-3 lg:p-4 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <img src="https://cdn.simpleicons.org/nestjs/E0234E" alt="NestJS" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[45%] left-[2%] lg:top-[55%] lg:left-[6%] opacity-40 lg:opacity-60 hover:opacity-100 transition-opacity z-0"
        animate={{ y: [0, -18, 0], rotate: [2, -3, 2] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <div className="bg-white p-3 lg:p-4 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <img src="https://cdn.simpleicons.org/apple/000000" alt="iOS" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[28%] right-[6%] lg:bottom-[35%] lg:right-[10%] opacity-40 lg:opacity-60 hover:opacity-100 transition-opacity z-0"
        animate={{ y: [0, 22, 0], rotate: [-2, 4, -2] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <div className="bg-white p-3 lg:p-4 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <img src="https://cdn.simpleicons.org/android/3DDC84" alt="Android" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
        </div>
      </motion.div>

      <div className="mx-auto max-w-5xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.2] sm:leading-[1.15]">
            {t('hero.title1')} <br className="hidden sm:block" />
            {t('hero.title2')} <span className="text-[#44ACAB]">{t('hero.title3')}</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-600 font-medium">
            {t('hero.subtitle')}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/book"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#44ACAB] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#44ACAB]/20 transition-all hover:bg-[#328887] hover:-translate-y-1"
            >
              {t('hero.book')}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#services" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:-translate-y-1 transition-all">
              {t('hero.explore')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

