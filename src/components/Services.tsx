import { motion } from 'motion/react';
import { Layers, Server, Code, Settings, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ServiceItem = {
  name: string;
  description: string;
  icon?: any;
  customIcon?: string;
  customIcons?: string[];
};

export function Services() {
  const { t } = useTranslation();

  const services: ServiceItem[] = [
    {
      name: t('services.items.erp_title'),
      description: t('services.items.erp_desc'),
      customIcon: 'https://cdn.simpleicons.org/erpnext/0089FF',
    },
    {
      name: t('services.items.custom_title'),
      description: t('services.items.custom_desc'),
      customIcon: 'https://cdn.simpleicons.org/nestjs/E0234E',
    },
    {
      name: t('services.items.mobile_title'),
      description: t('services.items.mobile_desc'),
      customIcons: [
        'https://cdn.simpleicons.org/android/3DDC84',
        'https://cdn.simpleicons.org/apple/000000'
      ],
    },
    {
      name: t('services.items.desktop_title'),
      description: t('services.items.desktop_desc'),
      customIcon: 'https://cdn.simpleicons.org/flutter/02569B',
    },
    {
      name: t('services.items.cloud_title'),
      description: t('services.items.cloud_desc'),
      customIcon: 'https://cdn.simpleicons.org/googlecloud/4285F4',
    },
    {
      name: t('services.items.integration_title'),
      description: t('services.items.integration_desc'),
      icon: Layers,
    },
  ];

  return (
    <section id="services" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-16 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#44ACAB]">{t('services.subtitle')}</h2>
            <p className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              {t('services.title')}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 font-medium">
              {t('services.desc')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col gap-5 rounded-[2rem] bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 hover:-translate-y-1 transition-all"
              >
                <div className={`flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#e6f4f4] text-[#44ACAB] self-start ${service.customIcons ? 'px-4' : 'w-14'}`}>
                  {service.customIcons ? (
                    service.customIcons.map((iconUrl, i) => (
                      <img key={i} src={iconUrl} alt={`${service.name} icon ${i + 1}`} className="h-7 w-7 object-contain" />
                    ))
                  ) : service.customIcon ? (
                    <img src={service.customIcon} alt={`${service.name} icon`} className="h-7 w-7 object-contain" />
                  ) : service.icon ? (
                    <service.icon className="h-7 w-7" />
                  ) : null}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
