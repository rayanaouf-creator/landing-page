import { useState, useEffect, useRef, useCallback, type KeyboardEvent, type TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  TrendingUp, 
  Play, 
  Pause,
  Building2,
  ArrowRight
} from 'lucide-react';

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  service: string;
  metric: string;
  quote: string;
  initials: string;
  color: string;
}

export function Testimonials() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const testimonials: TestimonialData[] = [
    {
      id: 'optilens',
      name: t('testimonials.items.optilens.client_name'),
      role: t('testimonials.items.optilens.client_role'),
      company: t('testimonials.items.optilens.company'),
      industry: t('testimonials.items.optilens.industry'),
      service: t('testimonials.items.optilens.service'),
      metric: t('testimonials.items.optilens.metric'),
      quote: t('testimonials.items.optilens.quote'),
      initials: 'LO',
      color: 'bg-emerald-600'
    },
    {
      id: 'choptic',
      name: t('testimonials.items.choptic.client_name'),
      role: t('testimonials.items.choptic.client_role'),
      company: t('testimonials.items.choptic.company'),
      industry: t('testimonials.items.choptic.industry'),
      service: t('testimonials.items.choptic.service'),
      metric: t('testimonials.items.choptic.metric'),
      quote: t('testimonials.items.choptic.quote'),
      initials: 'Y',
      color: 'bg-blue-600'
    },
    {
      id: 'lutech',
      name: t('testimonials.items.lutech.client_name'),
      role: t('testimonials.items.lutech.client_role'),
      company: t('testimonials.items.lutech.company'),
      industry: t('testimonials.items.lutech.industry'),
      service: t('testimonials.items.lutech.service'),
      metric: t('testimonials.items.lutech.metric'),
      quote: t('testimonials.items.lutech.quote'),
      initials: 'SH',
      color: 'bg-teal-600'
    },
    {
      id: 'industria',
      name: t('testimonials.items.industria.client_name'),
      role: t('testimonials.items.industria.client_role'),
      company: t('testimonials.items.industria.company'),
      industry: t('testimonials.items.industria.industry'),
      service: t('testimonials.items.industria.service'),
      metric: t('testimonials.items.industria.metric'),
      quote: t('testimonials.items.industria.quote'),
      initials: 'AB',
      color: 'bg-indigo-600'
    }
  ];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const handleSelect = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-play timer (paused on hover or when user paused)
  useEffect(() => {
    if (!isAutoPlay || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6500);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  // Touch gesture support
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const current = testimonials[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <section 
      id="testimonials"
      className="relative bg-white py-24 sm:py-32 overflow-hidden border-t border-slate-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Client Testimonials"
    >
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 right-10 w-96 h-96 bg-[#44ACAB]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#1b6b6a]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#44ACAB] uppercase">
              {t('testimonials.subtitle')}
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t('testimonials.title1')}{' '}
              <span className="text-[#44ACAB]">{t('testimonials.title2')}</span>
            </p>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
              {t('testimonials.desc')}
            </p>
          </motion.div>
        </div>

        {/* Company Quick-Selection Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {testimonials.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={item.id}
                id={`testimonial-tab-${item.id}`}
                onClick={() => handleSelect(idx)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1b6b6a] text-white shadow-md shadow-[#1b6b6a]/20 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
                aria-label={`View testimonial from ${item.company}`}
              >
                <Building2 className={`h-3.5 w-3.5 ${isActive ? 'text-[#a5e0e0]' : 'text-slate-400'}`} />
                <span>{item.company}</span>
              </button>
            );
          })}
        </div>

        {/* Testimonial Stage / Carousel Box */}
        <div 
          className="mt-8 relative mx-auto max-w-4xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative min-h-[380px] sm:min-h-[340px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full rounded-[2rem] bg-gradient-to-br from-white via-slate-50/70 to-slate-100/50 p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/80"
              >
                {/* Card Top Row: Ratings & Impact Metric Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-6">
                  {/* Star Rating & Verified Badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {t('testimonials.verified_client')}
                    </span>
                  </div>

                  {/* Impact Highlight Pill */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4f4] px-3.5 py-1 text-xs font-bold text-[#1b6b6a] ring-1 ring-inset ring-[#44ACAB]/30">
                    <TrendingUp className="h-3.5 w-3.5 text-[#44ACAB]" />
                    <span>{current.metric}</span>
                  </div>
                </div>

                {/* Quote Content */}
                <div className="relative mt-8">
                  <Quote className="absolute -top-3 -left-2 h-10 w-10 text-[#44ACAB]/15 -scale-x-100 pointer-events-none" />
                  <blockquote className="relative text-lg sm:text-xl md:text-2xl font-medium leading-relaxed text-slate-800">
                    &ldquo;{current.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Service Tag & Author Info */}
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200/70">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-bold text-base shadow-sm ${current.color}`}>
                      {current.initials}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">
                        {current.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {current.role} &bull; <span className="font-semibold text-slate-700">{current.company}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {current.industry}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-2xs">
                      {current.service}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {/* Play/Pause Autoplay toggle button */}
            <button
              id="testimonial-autoplay-toggle"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100"
              title={isAutoPlay ? 'Pause carousel rotation' : 'Resume carousel rotation'}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-[#44ACAB]" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-[#44ACAB]" />
                  <span>Auto-play</span>
                </>
              )}
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  id={`testimonial-dot-${idx}`}
                  onClick={() => handleSelect(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 bg-[#44ACAB]'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Prev Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="testimonial-prev-btn"
                onClick={handlePrev}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-[#44ACAB] transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                id="testimonial-next-btn"
                onClick={handleNext}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-[#44ACAB] transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Social Proof Summary Banner */}
          <div className="mt-12 rounded-2xl bg-[#f4f7fb] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-200/60">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-slate-900">
                {t('testimonials.banner_title')}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('testimonials.banner_desc')}
              </p>
            </div>
            <Link
              id="testimonial-consultation-link"
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-[#44ACAB] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#328887] transition-all shrink-0 hover:-translate-y-0.5 shadow-sm"
            >
              <span>{t('nav.book')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
