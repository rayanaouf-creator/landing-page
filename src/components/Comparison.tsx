import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Check, X, Star } from 'lucide-react';

export function Comparison() {
  const { t } = useTranslation();
  const rows = t('comparison.rows', { returnObjects: true }) as any[];

  if (!Array.isArray(rows)) return null;

  return (
    <section className="bg-slate-50 py-24 sm:py-32 overflow-hidden border-b border-slate-100 relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#44ACAB]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#1b6b6a]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            {t('comparison.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl text-slate-600 font-medium leading-relaxed"
          >
            {t('comparison.subtitle')}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative w-full overflow-x-auto pb-12 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide"
        >
          <div className="min-w-[960px] grid grid-cols-5 bg-white rounded-3xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 relative mt-8">
            
            {/* Header Row */}
            <div className="col-span-5 grid grid-cols-5 bg-gradient-to-r from-[#155a59] to-[#1b6b6a] rounded-t-3xl items-end relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:12px_12px] opacity-20"></div>
              
              <div className="p-8 flex items-center justify-start font-bold text-white text-xl h-28 relative z-10">
                {t('comparison.features')}
              </div>
              
              {/* ERPNext Column Header - Pop out */}
              <div className="relative p-6 flex flex-col items-center justify-center bg-white border-t-4 border-[#44ACAB] rounded-t-[2rem] h-[130%] -mt-8 shadow-[0_-12px_30px_-10px_rgba(68,172,171,0.25)] z-20">
                <div className="absolute -top-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span className="tracking-wide uppercase">{t('comparison.best')}</span>
                </div>
                <img src="https://cdn.simpleicons.org/erpnext/0089FF" alt="ERPNext" className="h-12 w-12 mb-3 drop-shadow-sm" />
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">ERPNext</span>
              </div>

              <div className="p-8 flex flex-col items-center justify-center h-28 relative z-10">
                <div className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-2xl flex items-center justify-center shadow-sm border border-white/10">
                   <img src="https://cdn.simpleicons.org/odoo/FFFFFF" alt="Odoo" className="h-6 w-auto opacity-90" />
                </div>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center h-28 relative z-10">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-2xl flex items-center justify-center shadow-sm border border-white/10">
                   <img src="https://cdn.simpleicons.org/sap/FFFFFF" alt="SAP" className="h-6 w-auto opacity-90" />
                 </div>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center h-28 relative z-10">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-2xl flex items-center justify-center shadow-sm border border-white/10">
                   <img src="https://cdn.simpleicons.org/oracle/FFFFFF" alt="Oracle" className="h-4 w-auto opacity-90" />
                 </div>
              </div>
            </div>

            {/* Data Rows */}
            {rows.map((row, index) => (
              <div key={index} className="col-span-5 grid grid-cols-5 border-b border-slate-100 last:border-0 relative group bg-white hover:bg-slate-50/50 transition-colors">
                <div className="p-6 px-8 flex items-center text-sm sm:text-base font-semibold text-slate-700 z-0">
                  {row.feature}
                </div>
                
                {/* ERPNext Column */}
                <div className={`p-6 flex items-center justify-center gap-3 bg-white shadow-[0_0_30px_rgba(68,172,171,0.06)] z-20 relative transition-transform ${index === rows.length - 1 ? 'rounded-b-[2rem] border-b-4 border-[#44ACAB] shadow-[0_12px_30px_rgba(68,172,171,0.15)] pb-8' : ''}`}>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-slate-900 text-center">{row.erpnext.text}</span>
                </div>

                {/* Odoo Column */}
                <div className="p-6 flex items-center justify-center gap-2.5 z-0">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100">
                    <X className="w-3 h-3 text-slate-400 stroke-[3]" />
                  </div>
                  <span className="text-sm text-slate-500 text-center font-medium">{row.odoo.text}</span>
                </div>

                {/* SAP Column */}
                <div className="p-6 flex items-center justify-center gap-2.5 z-0">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100">
                    <X className="w-3 h-3 text-slate-400 stroke-[3]" />
                  </div>
                  <span className="text-sm text-slate-500 text-center font-medium">{row.sap.text}</span>
                </div>

                {/* Oracle Column */}
                <div className="p-6 flex items-center justify-center gap-2.5 z-0">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100">
                    <X className="w-3 h-3 text-slate-400 stroke-[3]" />
                  </div>
                  <span className="text-sm text-slate-500 text-center font-medium">{row.oracle.text}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
