import { Hero } from '../components/Hero';
import { Partners } from '../components/Partners';
import { Services } from '../components/Services';
import { Modules } from '../components/Modules';
import { Team } from '../components/Team';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <main>
      <Hero />
      <Partners />
      <Services />
      <Modules />
      <Team />
      <section id="contact" className="relative isolate bg-[#1b6b6a] py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Start your digital transformation</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#a5e0e0] font-medium">
              Discuss your requirements, workflows, and objectives with our ERP experts. Let's build a scalable foundation for your business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/book"
                className="rounded-full bg-white px-8 py-4 text-base font-bold text-[#44ACAB] shadow-xl hover:bg-slate-50 hover:-translate-y-1 transition-all"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
