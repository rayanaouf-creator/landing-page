import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp, Package, MapPin, Code, Server, Barcode, Users, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ProofOfWork() {
  const { t } = useTranslation();

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
    <section id="proof-of-work" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#44ACAB]">{t('proof.subtitle')}</h2>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t('proof.title1')} <span className="text-[#44ACAB]">{t('proof.title2')}</span>
          </p>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 font-medium">
            {t('proof.desc')}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 ring-1 ring-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-12 lg:flex lg:items-center lg:gap-16"
              >
                <div className="lg:w-1/2 z-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f4f4] px-4 py-1.5 text-sm font-semibold text-[#44ACAB]">
                    <span>{project.industry}</span>
                  </div>
                  <h3 className="mt-6 text-3xl font-extrabold text-slate-900 sm:text-4xl">{project.name}</h3>
                  <p className="mt-4 text-lg text-slate-600 leading-relaxed font-medium">
                    {project.description}
                  </p>
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    <strong className="text-slate-900 font-bold">{project.delivered}</strong>
                    {project.solution}
                  </p>
                  
                  <ul className="mt-8 space-y-4">
                    {project.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-4 text-slate-700 font-medium">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 text-[#44ACAB]">
                           <highlight.icon className="h-5 w-5" />
                        </div>
                        {highlight.text}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-12 lg:mt-0 lg:w-1/2 lg:flex-shrink-0 z-10">
                  <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-white shadow-md ring-1 ring-slate-100 p-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f0fbfb] to-[#e6f4f4] opacity-50" />
                    
                    {/* Abstract decorative elements */}
                    <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#44ACAB]/5 blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#44ACAB]/10 blur-2xl" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                       <div className="h-28 w-28 rounded-[2rem] bg-white shadow-xl shadow-[#44ACAB]/20 flex items-center justify-center mb-6 ring-1 ring-slate-100 rotate-3 transition-transform hover:rotate-0">
                           <span className="text-5xl font-black text-[#44ACAB]">{project.name.charAt(0)}</span>
                       </div>
                       <div className="text-3xl font-black tracking-tight text-slate-900">{project.name}</div>
                       <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                         <img src="https://cdn.simpleicons.org/erpnext/0089FF" alt="ERPNext" className="h-4 w-4 opacity-70" />
                         ERPNext
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
