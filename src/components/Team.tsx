import { motion } from 'motion/react';
import { Linkedin, Mail, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Team() {
  const { t } = useTranslation();

  const team = [
    {
      name: 'Rayan Aouf',
      role: t('team.members.rayan.role'),
      imageUrl: '/assets/team/rayan.jpg',
      bio: t('team.members.rayan.bio'),
      linkedinUrl: 'https://www.linkedin.com/in/rayan-aouf-54a878315/'
    },
    {
      name: 'Akram',
      role: t('team.members.akram.role'), // t('team.members.akram.role') is Software Architect, let's just use it
      imageUrl: '/assets/team/akram.jpg',
      bio: t('team.members.akram.bio'),
      linkedinUrl: 'https://www.linkedin.com/in/ferkioui-akram/'
    },
    {
      name: 'Abdo',
      role: t('team.members.abdo.role'), // I will use translation for role instead of hardcoding
      imageUrl: '/assets/team/abdo.jpg',
      bio: t('team.members.abdo.bio'),
      linkedinUrl: 'https://www.linkedin.com/in/chehri/'
    },
    {
      name: 'Djalil',
      role: t('team.members.djalil.role'),
      imageUrl: '/assets/team/djalil.jpg',
      bio: t('team.members.djalil.bio'),
      linkedinUrl: 'https://www.linkedin.com/in/abdeldjalil-dahmani-805b49276/'
    },
    {
      name: 'Farid',
      role: t('team.members.farid.role'),
      imageUrl: '/assets/team/farid.jpg',
      bio: t('team.members.farid.bio'),
      linkedinUrl: 'https://www.linkedin.com/in/farid-neggaz-367943295/'
    },
    {
      name: 'Sami Adel',
      role: t('team.members.sami.role'),
      imageUrl: '/assets/team/sami.jpg',
      bio: t('team.members.sami.bio'),
      linkedinUrl: 'https://www.linkedin.com/in/samidev016/'
    },
    {
      name: 'Achraf Saidi',
      role: t('team.members.achraf.role'),
      imageUrl: '/assets/team/achraf.jpg',
      bio: t('team.members.achraf.bio'),
      linkedinUrl: 'https://www.linkedin.com/in/achraf-saidi-b141b8247/'
    }
  ];

  return (
    <section id="team" className="bg-[#f4f7fb] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#44ACAB] uppercase">{t('team.subtitle')}</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t('team.title1')} <span className="text-[#44ACAB]">{t('team.title2')}</span>
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {t('team.desc')}
            </p>
          </motion.div>
        </div>
        <div className="mx-auto mt-12 sm:mt-16 grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl lg:mx-0">
          {team.map((person, index) => (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center bg-white p-4 sm:p-8 rounded-3xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="relative mb-3 sm:mb-6">
                <div className="absolute inset-0 rounded-full bg-[#44ACAB] blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img
                  className="relative h-16 w-16 sm:h-32 sm:w-32 rounded-full object-cover shadow-sm ring-2 sm:ring-4 ring-white"
                  src={person.imageUrl}
                  alt={person.name}
                />
              </div>
              <h3 className="text-sm sm:text-xl font-bold tracking-tight text-slate-900">{person.name}</h3>
              <p className="text-xs sm:text-sm font-semibold leading-normal sm:leading-6 text-[#44ACAB] mb-3 sm:mb-4">{person.role}</p>
              <p className="hidden sm:block text-sm leading-6 text-slate-600 mb-6 flex-grow">{person.bio}</p>
              
              <ul className="flex gap-x-3 sm:gap-x-4 mt-auto">
                <li>
                  <a href={person.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#44ACAB] transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-[#44ACAB] transition-colors">
                    <span className="sr-only">Twitter</span>
                    <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-[#44ACAB] transition-colors">
                    <span className="sr-only">Email</span>
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                </li>
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
