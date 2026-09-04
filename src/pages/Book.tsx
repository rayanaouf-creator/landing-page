import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight, Building2, User, Mail, MessageSquare, Phone } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Book() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const message = formData.get('message') as string;

    const subject = `Consultation Request: ${company || name}`;
    const body = `Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}

Project Details:
${message}`;

    window.location.href = `mailto:jetnext@jethings.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 bg-[#f4f7fb] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t('book.title1')} <span className="text-[#44ACAB]">{t('book.title2')}</span>
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {t('book.desc')}
            </p>
          </motion.div>
        </div>

        <div className="mx-auto mt-16 max-w-xl sm:mt-20">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f4f4] mb-6">
                <Calendar className="h-8 w-8 text-[#44ACAB]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('book.received_title')}</h3>
              <p className="text-slate-600 mb-8">
                {t('book.received_desc')}
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-[#44ACAB] font-semibold hover:text-[#328887] transition-colors"
              >
                {t('book.submit_another')}
              </button>
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSubmit} 
              className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 ring-1 ring-slate-100"
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-semibold leading-6 text-slate-900">
                    Full Name
                  </label>
                  <div className="relative mt-2.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="block w-full rounded-xl border-0 px-3.5 py-3 pl-11 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#44ACAB] sm:text-sm sm:leading-6 transition-all"
                      placeholder={t('book.form.name_ph')}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-semibold leading-6 text-slate-900">
                    Work Email
                  </label>
                  <div className="relative mt-2.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="block w-full rounded-xl border-0 px-3.5 py-3 pl-11 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#44ACAB] sm:text-sm sm:leading-6 transition-all"
                      placeholder={t('book.form.email_ph')}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-slate-900">
                    Phone Number
                  </label>
                  <div className="relative mt-2.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      className="block w-full rounded-xl border-0 px-3.5 py-3 pl-11 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#44ACAB] sm:text-sm sm:leading-6 transition-all"
                      placeholder={t('book.form.phone_ph')}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="company" className="block text-sm font-semibold leading-6 text-slate-900">
                    Company Name
                  </label>
                  <div className="relative mt-2.5">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      className="block w-full rounded-xl border-0 px-3.5 py-3 pl-11 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#44ACAB] sm:text-sm sm:leading-6 transition-all"
                      placeholder={t('book.form.company_ph')}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-semibold leading-6 text-slate-900">
                    Project Details
                  </label>
                  <div className="relative mt-2.5">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      required
                      className="block w-full rounded-xl border-0 px-3.5 py-3 pl-11 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#44ACAB] sm:text-sm sm:leading-6 transition-all"
                      placeholder={t('book.form.details_ph')}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#44ACAB] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#44ACAB]/20 transition-all hover:bg-[#328887] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44ACAB]"
                >
                  Request Consultation
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
