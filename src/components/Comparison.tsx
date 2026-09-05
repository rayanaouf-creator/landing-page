import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

export function Comparison() {
  const { t } = useTranslation();
  const rows = t('comparison.rows', { returnObjects: true }) as any[];

  if (!Array.isArray(rows)) return null;

  return (
    <section className="bg-slate-50 py-24 sm:py-32 overflow-hidden border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
          >
            {t('comparison.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-600 font-medium"
          >
            {t('comparison.subtitle')}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative mt-8 sm:mt-12 w-full overflow-x-auto pb-8 -mx-6 px-6 lg:mx-0 lg:px-0"
        >
          <div className="min-w-[900px] grid grid-cols-5 bg-white rounded-3xl shadow-sm border border-slate-100 relative mt-4">
            
            {/* Header Row */}
            <div className="col-span-5 grid grid-cols-5 bg-[#642b8f] rounded-t-3xl items-end relative">
              <div className="p-6 flex items-center justify-start font-bold text-white text-lg h-24">
                {t('comparison.features')}
              </div>
              
              {/* ERPNext Column Header - Pop out */}
              <div className="relative p-6 flex flex-col items-center justify-center bg-slate-50 border-x-2 border-t-2 border-[#44ACAB] rounded-t-[2rem] h-[120%] -mt-6 shadow-xl shadow-[#44ACAB]/10 z-10">
                <div className="absolute -top-4 bg-[#fdf5e6] text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 border border-amber-200 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {t('comparison.best')}
                </div>
                <img src="https://cdn.simpleicons.org/erpnext/0089FF" alt="ERPNext" className="h-10 w-10 mb-2" />
                <span className="font-extrabold text-2xl text-[#44ACAB]">ERPNext</span>
              </div>

              <div className="p-6 flex flex-col items-center justify-center h-24 text-white">
                <div className="bg-white px-5 py-2 rounded-full flex items-center justify-center mb-1">
                   <img src="https://cdn.simpleicons.org/odoo/714B67" alt="Odoo" className="h-5 w-auto" />
                </div>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center h-24 text-white">
                 <div className="bg-white px-5 py-2 rounded-full flex items-center justify-center mb-1">
                   <img src="https://cdn.simpleicons.org/sap/008FD3" alt="SAP" className="h-5 w-auto" />
                 </div>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center h-24 text-white">
                 <div className="bg-white px-5 py-2 rounded-full flex items-center justify-center mb-1">
                   <img src="https://cdn.simpleicons.org/oracle/F80000" alt="Oracle" className="h-5 w-auto" />
                 </div>
              </div>
            </div>

            {/* Data Rows */}
            {rows.map((row, index) => (
              <div key={index} className="col-span-5 grid grid-cols-5 border-b border-slate-100 last:border-0 relative bg-white">
                <div className="p-6 flex items-center text-sm sm:text-base font-bold text-slate-700 bg-white z-0">
                  {row.feature}
                </div>
                
                {/* ERPNext Column */}
                <div className={`p-6 flex items-center justify-center gap-2 bg-slate-50 border-x-2 border-[#44ACAB] z-10 ${index === rows.length - 1 ? 'rounded-b-[2rem] border-b-2 shadow-[0_8px_16px_-6px_rgba(68,172,171,0.15)] mb-[-2px]' : ''}`}>
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-slate-800 text-center">{row.erpnext.text}</span>
                </div>

                {/* Odoo Column */}
                <div className="p-6 flex items-center justify-center gap-2 bg-white">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-slate-500 text-center font-medium">{row.odoo.text}</span>
                </div>

                {/* SAP Column */}
                <div className="p-6 flex items-center justify-center gap-2 bg-white">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-slate-500 text-center font-medium">{row.sap.text}</span>
                </div>

                {/* Oracle Column */}
                <div className="p-6 flex items-center justify-center gap-2 bg-white">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
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
