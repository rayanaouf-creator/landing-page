import { motion } from 'motion/react';
import { Aperture, Hexagon, Component, Sparkles } from 'lucide-react';

const partners = [
  { 
    name: 'Optilens', 
    logo: (
      <div className="flex items-center gap-2">
        <Aperture className="h-7 w-7" />
        <span className="text-2xl font-bold tracking-tight">Optilens</span>
      </div>
    )
  },
  { 
    name: 'Halfware', 
    logo: (
      <div className="flex items-center gap-2">
        <Hexagon className="h-7 w-7" />
        <span className="text-2xl font-black uppercase tracking-widest">HALFWARE</span>
      </div>
    )
  },
  { 
    name: 'Jethings', 
    logo: (
      <div className="flex items-center gap-2">
        <Component className="h-7 w-7" />
        <span className="text-2xl font-extrabold tracking-tighter">Jethings</span>
      </div>
    )
  },
  { 
    name: 'Novalis Ai', 
    logo: (
      <div className="flex items-center gap-2">
        <Sparkles className="h-7 w-7" />
        <span className="text-2xl font-light tracking-wide">Novalis <strong className="font-bold">Ai</strong></span>
      </div>
    )
  }
];

export function Partners() {
  return (
    <section className="bg-white py-12 sm:py-16 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
          Trusted Partners & Collaborators
        </h2>
        <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-10 sm:gap-x-24">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center justify-center text-slate-400 transition-all duration-300 hover:text-[#44ACAB] cursor-pointer"
            >
              {partner.logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
