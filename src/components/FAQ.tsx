import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  Search, 
  HelpCircle, 
  Layers, 
  Code2, 
  Server, 
  GraduationCap, 
  ArrowRight, 
  X,
  Sparkles
} from 'lucide-react';

type CategoryKey = 'all' | 'erp' | 'custom' | 'support' | 'formation';

interface FAQItem {
  id: string;
  category: 'erp' | 'custom' | 'support' | 'formation';
  question: string;
  answer: string;
}

export function FAQ() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    q1: true // First item open by default for immediate engagement
  });

  const categories: { id: CategoryKey; label: string; icon: typeof Layers }[] = [
    { id: 'all', label: t('faq.all_categories'), icon: HelpCircle },
    { id: 'erp', label: t('faq.cat_erp'), icon: Layers },
    { id: 'custom', label: t('faq.cat_custom'), icon: Code2 },
    { id: 'support', label: t('faq.cat_support'), icon: Server },
    { id: 'formation', label: t('faq.cat_formation'), icon: GraduationCap }
  ];

  const rawItems: FAQItem[] = useMemo(() => [
    {
      id: 'q1',
      category: 'erp',
      question: t('faq.items.q1.question'),
      answer: t('faq.items.q1.answer')
    },
    {
      id: 'q2',
      category: 'erp',
      question: t('faq.items.q2.question'),
      answer: t('faq.items.q2.answer')
    },
    {
      id: 'q3',
      category: 'erp',
      question: t('faq.items.q3.question'),
      answer: t('faq.items.q3.answer')
    },
    {
      id: 'q4',
      category: 'custom',
      question: t('faq.items.q4.question'),
      answer: t('faq.items.q4.answer')
    },
    {
      id: 'q5',
      category: 'formation',
      question: t('faq.items.q5.question'),
      answer: t('faq.items.q5.answer')
    },
    {
      id: 'q6',
      category: 'support',
      question: t('faq.items.q6.question'),
      answer: t('faq.items.q6.answer')
    },
    {
      id: 'q7',
      category: 'support',
      question: t('faq.items.q7.question'),
      answer: t('faq.items.q7.answer')
    },
    {
      id: 'q8',
      category: 'formation',
      question: t('faq.items.q8.question'),
      answer: t('faq.items.q8.answer')
    }
  ], [t]);

  // Filter items based on selected category & search query
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.question.toLowerCase().includes(q) || 
        item.answer.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [rawItems, activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredItems.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenIds(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenIds({});
  };

  const getCategoryBadge = (cat: FAQItem['category']) => {
    switch (cat) {
      case 'erp':
        return { label: 'ERPNext', style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' };
      case 'custom':
        return { label: 'Custom Tech', style: 'bg-blue-50 text-blue-700 ring-blue-600/20' };
      case 'support':
        return { label: 'Hosting & SLA', style: 'bg-amber-50 text-amber-700 ring-amber-600/20' };
      case 'formation':
        return { label: 'Formation & ISO', style: 'bg-teal-50 text-teal-700 ring-teal-600/20' };
    }
  };

  return (
    <section id="faq" className="relative bg-[#f8fafc] py-24 sm:py-32 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-[#44ACAB]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#1b6b6a]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#44ACAB]/10 px-3.5 py-1 text-xs font-bold text-[#1b6b6a] ring-1 ring-inset ring-[#44ACAB]/20 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-[#44ACAB]" />
              <span>{t('faq.subtitle')}</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t('faq.title1')}{' '}
              <span className="text-[#44ACAB]">{t('faq.title2')}</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
              {t('faq.desc')}
            </p>
          </motion.div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="mx-auto mt-12 max-w-4xl">
          {/* Search Input */}
          <div className="relative mb-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              id="faq-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('faq.search_placeholder')}
              className="w-full rounded-2xl bg-white py-3.5 pl-11 pr-10 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#44ACAB] transition-all"
            />
            {searchQuery && (
              <button
                id="faq-search-clear"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Tabs & Expand/Collapse All Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`faq-category-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1b6b6a] text-white shadow-sm scale-102'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#a5e0e0]' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 shrink-0">
              <button
                id="faq-expand-all"
                onClick={handleExpandAll}
                className="hover:text-[#44ACAB] transition-colors"
              >
                Expand all
              </button>
              <span>&bull;</span>
              <button
                id="faq-collapse-all"
                onClick={handleCollapseAll}
                className="hover:text-[#44ACAB] transition-colors"
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="mx-auto mt-8 max-w-4xl space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-200">
              <HelpCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-800">{t('faq.no_results_title')}</p>
              <p className="text-sm text-slate-500 mt-1">{t('faq.no_results_desc')}</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isOpen = !!openIds[item.id];
              const badge = getCategoryBadge(item.category);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                  className={`group rounded-2xl bg-white transition-all duration-200 ${
                    isOpen 
                      ? 'shadow-md shadow-slate-200/60 ring-2 ring-[#44ACAB]/40' 
                      : 'shadow-xs ring-1 ring-slate-200/80 hover:ring-slate-300'
                  }`}
                >
                  <button
                    id={`faq-trigger-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    className="flex w-full items-start justify-between gap-4 p-5 sm:p-6 text-left"
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${badge.style}`}>
                          {badge.label}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#1b6b6a] transition-colors leading-snug">
                        {item.question}
                      </h3>
                    </div>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                        isOpen
                          ? 'bg-[#1b6b6a] text-white rotate-180'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-[#44ACAB]/10 group-hover:text-[#1b6b6a]'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${item.id}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-slate-600 border-t border-slate-100 mt-1">
                          <p>{item.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Bottom Consultation Assistance Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-16 max-w-4xl rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">
              {t('faq.still_questions_title')}
            </h3>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              {t('faq.still_questions_desc')}
            </p>
          </div>
          <Link
            id="faq-book-consultation"
            to="/book"
            className="inline-flex items-center gap-2 rounded-full bg-[#44ACAB] px-6 py-3 text-sm font-bold text-white hover:bg-[#328887] transition-all shrink-0 shadow-sm hover:-translate-y-0.5"
          >
            <span>{t('faq.ask_btn')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
