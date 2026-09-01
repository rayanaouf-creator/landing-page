import { motion } from 'motion/react';
import { Layers, Server, Code, Settings } from 'lucide-react';

const services = [
  {
    name: 'ERP Implementation',
    description: 'End-to-end ERPNext setup tailored to your workflows. We analyze, configure, and deploy the perfect system for your business.',
    icon: Settings,
  },
  {
    name: 'Custom Development',
    description: 'Need something unique? We build custom web, mobile, and desktop applications that integrate seamlessly with your core systems.',
    icon: Code,
  },
  {
    name: 'Cloud Hosting',
    description: 'Reliable, secure, and fast hosting solutions for your ERP platform, ensuring maximum uptime and data integrity.',
    icon: Server,
  },
  {
    name: 'System Integration',
    description: 'Connect ERPNext with your existing tools. We build robust APIs and middleware for seamless data flow.',
    icon: Layers,
  },
];

export function Services() {
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
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#44ACAB]">Our Expertise</h2>
            <p className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              Tailored solutions for your <span className="text-[#44ACAB]">digital journey</span>
            </p>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 font-medium">
              We don't just install software. We partner with you to understand your exact requirements, adapt the systems to your operations, and provide ongoing support to fuel your growth.
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
                className="relative flex flex-col gap-5 rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 hover:-translate-y-1 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f4f4] text-[#44ACAB]">
                  <service.icon className="h-7 w-7" />
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
