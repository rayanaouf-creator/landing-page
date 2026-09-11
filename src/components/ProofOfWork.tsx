import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, TrendingUp, Package, MapPin, Code, Server, Barcode, Users, Receipt, Building2, BarChart, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export function ProofOfWork() {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

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

  const projects = [
    {
      name: t('proof.projects.optilens.name'),
      industry: t('proof.projects.optilens.industry'),
      description: t('proof.projects.optilens.desc'),
      solution: t('proof.projects.optilens.solution'),
      delivered: t('proof.projects.optilens.delivered'),
      highlights: [
        { text: t('proof.projects.optilens.h1'), icon: TrendingUp },
        { text: t('proof.projects.optilens.h2'), icon: MapPin },
        { text: t('proof.projects.optilens.h3'), icon: Package },
        { text: t('proof.projects.optilens.h4'), icon: BarChart },
        { text: t('proof.projects.optilens.h5'), icon: Building2 },
      ]
    },
    {
      name: t('proof.projects.choptic.name'),
      industry: t('proof.projects.choptic.industry'),
      description: t('proof.projects.choptic.desc'),
      solution: t('proof.projects.choptic.solution'),
      delivered: t('proof.projects.choptic.delivered'),
      highlights: [
        { text: t('proof.projects.choptic.h1'), icon: Code },
        { text: t('proof.projects.choptic.h2'), icon: Server },
        { text: t('proof.projects.choptic.h3'), icon: Package },
      ]
    },
    {
      name: t('proof.projects.essilor.name'),
      industry: t('proof.projects.essilor.industry'),
      description: t('proof.projects.essilor.desc'),
      solution: t('proof.projects.essilor.solution'),
      delivered: t('proof.projects.essilor.delivered'),
      highlights: [
        { text: t('proof.projects.essilor.h1'), icon: Barcode },
        { text: t('proof.projects.essilor.h2'), icon: Users },
        { text: t('proof.projects.essilor.h3'), icon: Receipt },
      ]
    }
  ];

  return (
    <section id="proof-of-work" className="bg-white py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#44ACAB]">{t('proof.subtitle')}</h2>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t('proof.title1')} <span className="text-[#44ACAB]">{t('proof.title2')}</span>
          </p>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 font-medium">
            {t('proof.desc')}
          </p>
        </div>
        
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedProject(project)}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-slate-50 ring-1 ring-slate-100 shadow-lg shadow-slate-200/40 p-8 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:ring-[#44ACAB]/30 transition-all duration-300 h-full"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#155a59] to-[#44ACAB] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f4f4] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#44ACAB] mb-6">
                    <span>{project.industry}</span>
                  </div>
                  
                  <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-md flex items-center justify-center mb-6 ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-black text-[#44ACAB]">{project.name.charAt(0)}</span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-[#44ACAB] transition-colors">{project.name}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium line-clamp-3">
                    {project.description}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-2 text-[#44ACAB] font-bold group-hover:gap-3 transition-all">
                  See full details <ArrowRight className="h-5 w-5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 overflow-y-auto z-[101] pointer-events-none flex items-center justify-center px-4 py-8 sm:px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl ring-1 ring-slate-100 pointer-events-auto overflow-hidden relative flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 rounded-[1.25rem] bg-white shadow-sm flex items-center justify-center ring-1 ring-slate-200">
                        <span className="text-2xl font-black text-[#44ACAB]">{selectedProject.name.charAt(0)}</span>
                     </div>
                     <div>
                       <h3 className="text-2xl font-extrabold text-slate-900">{selectedProject.name}</h3>
                       <p className="text-sm font-semibold text-[#44ACAB] uppercase tracking-wider">{selectedProject.industry}</p>
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
                <div className="p-6 sm:p-10 overflow-y-auto">
                  <div className="lg:flex lg:gap-16">
                    <div className="lg:w-1/2">
                      <p className="text-lg text-slate-700 leading-relaxed font-medium mb-6">
                        {selectedProject.description}
                      </p>
                      <div className="bg-slate-50 rounded-2xl p-6 ring-1 ring-slate-100 mb-8 lg:mb-0">
                        <p className="text-slate-700 leading-relaxed font-medium">
                          <strong className="text-slate-900 font-bold block text-lg mb-2">{selectedProject.delivered}</strong>
                          {selectedProject.solution}
                        </p>
                      </div>
                    </div>
                    
                    <div className="lg:w-1/2">
                      <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[#44ACAB]" />
                        Key Implementations
                      </h4>
                      <ul className="space-y-4">
                        {selectedProject.highlights.map((highlight: any, i: number) => (
                          <li key={i} className="flex items-center gap-4 text-slate-700 font-medium bg-white p-3 rounded-xl ring-1 ring-slate-100 shadow-sm">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fbfb] text-[#44ACAB]">
                               <highlight.icon className="h-5 w-5" />
                            </div>
                            {highlight.text}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8 flex justify-end">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <img src="https://cdn.simpleicons.org/erpnext/0089FF" alt="ERPNext" className="h-4 w-4 opacity-70" />
                          ERPNext Solution
                        </div>
                      </div>
                    </div>
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
