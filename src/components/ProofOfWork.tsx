import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  X, 
  Briefcase, 
  ExternalLink,
  Layers,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { WorkProject } from '../types';
import { workStorage } from '../services/workStorage';

export function ProofOfWork() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<WorkProject[]>(() => workStorage.getPublishedProjects());
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Real-time synchronization to live work projects managed from admin
  useEffect(() => {
    const unsub = workStorage.subscribe((allItems) => {
      const published = allItems.filter(p => p.published);
      setProjects(published);
    });
    return () => unsub();
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  // Extract dynamic categories from projects
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <section id="work" className="bg-white py-24 sm:py-32 relative scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#44ACAB] uppercase mb-3">
            <Briefcase className="h-4 w-4" />
            <span>{t('proof.subtitle', { defaultValue: 'Our Work & Case Studies' })}</span>
          </div>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t('proof.title1', { defaultValue: 'Success' })}{' '}
            <span className="text-[#44ACAB]">{t('proof.title2', { defaultValue: 'Stories & Deployments' })}</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 font-medium">
            {t('proof.desc', { defaultValue: 'Explore how we engineer, deploy, and scale enterprise ERP systems and bespoke digital platforms for leading companies across Algeria.' })}
          </p>

          {/* Dynamic Category Filter Controls (Anti-slop compliant segmented buttons) */}
          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl max-w-xl mx-auto ring-1 ring-slate-200/50">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Projects ({projects.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-[#1b6b6a] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Case Studies Grid */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id || project.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                onClick={() => setSelectedProject(project)}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-slate-50 ring-1 ring-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:ring-[#44ACAB]/40 transition-all duration-300 p-8 flex flex-col justify-between h-full"
              >
                {/* Top Gradient line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#155a59] via-[#1b6b6a] to-[#44ACAB] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  {/* Category & Industry */}
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <span className="text-xs font-bold text-[#1b6b6a] uppercase tracking-wider">
                      {project.industry}
                    </span>
                    {project.category && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {project.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Monogram Logo */}
                  <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-md flex items-center justify-center mb-6 ring-1 ring-slate-100 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-3xl font-black text-[#44ACAB]">
                      {project.logoLetter || project.name.charAt(0)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-[#1b6b6a] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-sm line-clamp-3 mb-6">
                    {project.description}
                  </p>

                  {/* Impact Metric if available */}
                  {project.metricValue && (
                    <div className="p-3.5 rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-xs flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-xl bg-[#e6f4f4] flex items-center justify-center text-[#1b6b6a] shrink-0">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#1b6b6a] block">
                          {project.metricValue}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {project.metricLabel || 'Key Measurable Impact'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Footer link */}
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#44ACAB] group-hover:text-[#1b6b6a] transition-colors">
                  <span>See full case study</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 overflow-y-auto z-[101] pointer-events-none flex items-center justify-center px-4 py-8 sm:px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl ring-1 ring-slate-200 pointer-events-auto overflow-hidden relative flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center ring-1 ring-slate-200">
                      <span className="text-3xl font-black text-[#44ACAB]">
                        {selectedProject.logoLetter || selectedProject.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        <span className="text-[#1b6b6a]">{selectedProject.industry}</span>
                        {selectedProject.category && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{selectedProject.category}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {selectedProject.name}
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-10 overflow-y-auto space-y-8">
                  {/* Context and Solution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Client Overview & Challenge
                      </h4>
                      <p className="text-base text-slate-700 leading-relaxed font-medium mb-6">
                        {selectedProject.description}
                      </p>

                      <div className="bg-[#e6f4f4]/40 rounded-2xl p-6 ring-1 ring-[#44ACAB]/20">
                        <strong className="text-[#1b6b6a] font-bold block text-sm uppercase tracking-wide mb-2">
                          {selectedProject.delivered || 'What we delivered:'}
                        </strong>
                        <p className="text-slate-700 leading-relaxed text-sm font-medium">
                          {selectedProject.solution}
                        </p>
                      </div>
                    </div>
                    
                    {/* Key Implementations List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#44ACAB]" />
                        <span>Key Implementations & Deliverables</span>
                      </h4>

                      {selectedProject.highlights && selectedProject.highlights.length > 0 ? (
                        <ul className="space-y-3">
                          {selectedProject.highlights.map((highlight: string, i: number) => (
                            <li key={i} className="flex items-start gap-3.5 text-xs text-slate-700 font-medium bg-slate-50 p-3.5 rounded-xl ring-1 ring-slate-100">
                              <CheckCircle2 className="h-4 w-4 text-[#44ACAB] shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No specific highlights listed.</p>
                      )}

                      {/* Measurable Impact Metric */}
                      {selectedProject.metricValue && (
                        <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 shadow-sm">
                          <div className="h-12 w-12 rounded-xl bg-[#e6f4f4] flex items-center justify-center text-[#1b6b6a] shrink-0">
                            <TrendingUp className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-[#1b6b6a] uppercase tracking-wide block">
                              {selectedProject.metricValue}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">
                              {selectedProject.metricLabel || 'Operational Metric Achieved'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-medium">
                    Verified Deployment by JetNext Enterprise Engineering
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Close
                    </button>
                    <Link
                      to={`/book?project=${encodeURIComponent(selectedProject.name)}`}
                      onClick={() => setSelectedProject(null)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#44ACAB] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#328887] transition-all"
                    >
                      <span>Discuss a Similar Project</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
