import { motion } from 'motion/react';
import { 
  Users, 
  Package, 
  Factory, 
  Briefcase, 
  PieChart, 
  Headset, 
  ShoppingCart,
  Calculator
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Modules() {
  const { t } = useTranslation();

  const modules = [
    { name: t('modules.items.crm_title'), icon: Users, desc: t('modules.items.crm_desc') },
    { name: t('modules.items.inv_title'), icon: Package, desc: t('modules.items.inv_desc') },
    { name: t('modules.items.mfg_title'), icon: Factory, desc: t('modules.items.mfg_desc') },
    { name: t('modules.items.fin_title'), icon: Calculator, desc: t('modules.items.fin_desc') },
    { name: t('modules.items.pm_title'), icon: Briefcase, desc: t('modules.items.pm_desc') },
    { name: t('modules.items.hr_title'), icon: PieChart, desc: t('modules.items.hr_desc') },
    { name: t('modules.items.pur_title'), icon: ShoppingCart, desc: t('modules.items.pur_desc') },
    { name: t('modules.items.help_title'), icon: Headset, desc: t('modules.items.help_desc') },
  ];

  return (
    <section id="modules" className="bg-[#f0fbfb] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#44ACAB]">{t('modules.subtitle')}</h2>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t('modules.title1')} <span className="text-[#44ACAB]">{t('modules.title2')}</span>
          </p>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 font-medium">
            {t('modules.desc')}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod, index) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative flex flex-col items-start gap-4 rounded-[2rem] bg-white p-8 shadow-sm hover:shadow-xl hover:shadow-[#44ACAB]/10 transition-all hover:-translate-y-1"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f4f4] text-[#44ACAB] group-hover:bg-[#44ACAB] group-hover:text-white transition-colors duration-300">
                  <mod.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{mod.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{mod.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
