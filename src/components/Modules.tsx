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

const modules = [
  { name: 'CRM & Sales', icon: Users, desc: 'Track leads, opportunities, and manage customer relationships.' },
  { name: 'Inventory & Stock', icon: Package, desc: 'Real-time stock tracking, multi-warehouse management.' },
  { name: 'Manufacturing', icon: Factory, desc: 'Bill of materials, production planning, and quality control.' },
  { name: 'Finance & Accounting', icon: Calculator, desc: 'General ledger, accounts payable/receivable, and reporting.' },
  { name: 'Project Management', icon: Briefcase, desc: 'Task tracking, timesheets, and project profitability.' },
  { name: 'HR & Payroll', icon: PieChart, desc: 'Employee lifecycle, attendance, leaves, and salary processing.' },
  { name: 'Purchasing', icon: ShoppingCart, desc: 'Supplier management, purchase orders, and material requests.' },
  { name: 'Helpdesk & Support', icon: Headset, desc: 'Ticketing system, SLAs, and customer issue resolution.' },
];

export function Modules() {
  return (
    <section id="modules" className="bg-[#f0fbfb] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#44ACAB]">Comprehensive Ecosystem</h2>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Everything your <span className="text-[#44ACAB]">business needs</span>
          </p>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 font-medium">
            Powered by Frappe and ERPNext, we provide a unified platform to manage every aspect of your operations, eliminating data silos.
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
