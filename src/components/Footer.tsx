import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Linkedin, MapPin, Globe, Lock } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer id="main-footer" className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Brand & Identity */}
          <div className="flex flex-col space-y-4">
            <Link to="/" id="footer-logo-link" className="inline-block">
              <img src="/cropedlogo.png" alt="JetNext Logo" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-sm leading-6 text-slate-600 max-w-xs">
              {t('footer.desc')}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center rounded-full bg-[#e6f4f4] px-3 py-1 text-xs font-semibold text-[#328887] ring-1 ring-inset ring-[#44ACAB]/20">
                A Jethings Company
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {t('footer.navigation')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/services" id="footer-link-services" className="text-sm text-slate-600 hover:text-[#44ACAB] transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/erpnext" id="footer-link-erpnext" className="text-sm text-slate-600 hover:text-[#44ACAB] transition-colors">
                  ERPNext
                </Link>
              </li>
              <li>
                <Link to="/iso9001" id="footer-link-iso" className="text-sm text-slate-600 hover:text-[#44ACAB] transition-colors">
                  ISO 9001
                </Link>
              </li>
              <li>
                <Link to="/work" id="footer-link-work" className="text-sm text-slate-600 hover:text-[#44ACAB] transition-colors">
                  {t('nav.work')}
                </Link>
              </li>
              <li>
                <Link to="/team" id="footer-link-team" className="text-sm text-slate-600 hover:text-[#44ACAB] transition-colors">
                  {t('nav.team')}
                </Link>
              </li>
              <li>
                <a href="/#faq" id="footer-link-faq" className="text-sm text-slate-600 hover:text-[#44ACAB] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/admin" id="footer-link-admin" className="text-sm text-slate-600 hover:text-[#44ACAB] transition-colors flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#44ACAB]"></span>
                  Admin CRM
                </Link>
              </li>
              <li>
                <Link to="/book" id="footer-link-book" className="text-sm font-semibold text-[#44ACAB] hover:text-[#328887] transition-colors">
                  {t('nav.book')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CTO Column */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {t('footer.cto')}
              </h3>
              <span className="text-xs text-slate-400 font-medium">({t('footer.cto_role')})</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="font-bold text-slate-900 text-base">Rayan Aouf</p>
              
              <div>
                <a
                  id="footer-cto-email"
                  href="mailto:rayanaouf@jethings.com"
                  className="inline-flex items-center gap-2 hover:text-[#44ACAB] transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#44ACAB] shrink-0" />
                  <span>rayanaouf@jethings.com</span>
                </a>
              </div>

              <div>
                <a
                  id="footer-cto-phone"
                  href="tel:0796945134"
                  className="inline-flex items-center gap-2 hover:text-[#44ACAB] transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#44ACAB] shrink-0" />
                  <span>0796945134</span>
                </a>
              </div>

              {/* CTO Social Icons */}
              <div className="pt-2 flex items-center gap-3">
                <a
                  id="footer-cto-insta"
                  href="https://www.instagram.com/aouf_rayan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Rayan Aouf Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#e6f4f4] hover:text-[#44ACAB] transition-all"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  id="footer-cto-linkedin"
                  href="https://www.linkedin.com/in/rayan-aouf-54a878315/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Rayan Aouf LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#e6f4f4] hover:text-[#44ACAB] transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Main Company (Jethings) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {t('footer.main_company')}
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="font-bold text-slate-900 text-base">Jethings</p>

              <div>
                <a
                  id="footer-jethings-website"
                  href="https://jethings.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#44ACAB] transition-colors"
                >
                  <Globe className="h-4 w-4 text-[#44ACAB] shrink-0" />
                  <span className="font-medium underline decoration-slate-300 underline-offset-4 hover:decoration-[#44ACAB]">
                    jethings.com
                  </span>
                </a>
              </div>

              <div>
                <a
                  id="footer-jethings-maps"
                  href="https://maps.app.goo.gl/c98V7KLTuYohG2KS7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#44ACAB] transition-colors"
                >
                  <MapPin className="h-4 w-4 text-[#44ACAB] shrink-0" />
                  <span>{t('footer.location')}</span>
                </a>
              </div>

              {/* Jethings Social Icons */}
              <div className="pt-2 flex items-center gap-3">
                <a
                  id="footer-jethings-insta"
                  href="https://www.instagram.com/jethings_officiel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Jethings Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#e6f4f4] hover:text-[#44ACAB] transition-all"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  id="footer-jethings-linkedin"
                  href="https://www.linkedin.com/company/108562177/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Jethings LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-[#e6f4f4] hover:text-[#44ACAB] transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} JetNext. A Jethings Company. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Algeria</span>
            <span>&bull;</span>
            <Link 
              to="/admin" 
              id="footer-admin-lock-link" 
              className="inline-flex items-center gap-1 text-slate-400 hover:text-[#44ACAB] transition-colors"
              title="Admin Lead Portal"
            >
              <Lock className="h-3 w-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

