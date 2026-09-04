import { motion } from 'motion/react';
import { Award, Target, Activity, FileCheck, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Iso9001Page() {
  const { t } = useTranslation();

  const benefits = [
    {
      title: t('iso9001Page.benefits.b1.title'),
      desc: t('iso9001Page.benefits.b1.desc'),
      icon: Activity
    },
    {
      title: t('iso9001Page.benefits.b2.title'),
      desc: t('iso9001Page.benefits.b2.desc'),
      icon: Target
    },
    {
      title: t('iso9001Page.benefits.b3.title'),
      desc: t('iso9001Page.benefits.b3.desc'),
      icon: Award
    },
    {
      title: t('iso9001Page.benefits.b4.title'),
      desc: t('iso9001Page.benefits.b4.desc'),
      icon: FileCheck
    }
  ];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#44ACAB] text-sm font-bold tracking-wide mb-6"
          >
            <CheckCircle2 className="w-4 h-4" />
            Quality Management Expertise
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6"
          >
            {t('iso9001Page.hero_title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl leading-relaxed text-slate-600 font-medium"
          >
            {t('iso9001Page.hero_subtitle')}
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow"
              >
                <dt className="flex items-center gap-x-4 text-xl font-bold leading-7 text-slate-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#44ACAB]/10 text-[#44ACAB]">
                    <benefit.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  {benefit.title}
                </dt>
                <dd className="mt-6 flex flex-auto flex-col text-base leading-7 text-slate-600 font-medium">
                  <p className="flex-auto">{benefit.desc}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 rounded-3xl bg-[#1b6b6a] px-6 py-16 sm:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            Ready to achieve ISO 9001 excellence?
          </h2>
          <div className="flex justify-center gap-4 mt-8">
            <Link
              to="/book"
              className="rounded-full bg-white px-8 py-4 text-base font-bold text-[#44ACAB] shadow-xl hover:bg-slate-50 hover:-translate-y-1 transition-all"
            >
              {t('home.contact_btn')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
