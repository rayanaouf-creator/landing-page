import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Database, 
  ShieldCheck, 
  Cpu, 
  X, 
  ExternalLink, 
  Sliders, 
  Boxes, 
  Activity, 
  Zap, 
  Globe2, 
  FileText, 
  Clock, 
  Sparkles,
  Server
} from 'lucide-react';

interface SaaSProduct {
  id: string;
  name: string;
  categoryKey: string;
  category: string;
  badge: string;
  tagline: string;
  description: string;
  target: string;
  impact: string;
  impactDesc: string;
  features: string[];
  tech: string;
  stats: { value: string; label: string }[];
  uiMockup: {
    accentColor: string;
    screenTitle: string;
    metric1: { label: string; val: string };
    metric2: { label: string; val: string };
    tableTitle: string;
    sampleRows: { col1: string; col2: string; col3: string; status: string }[];
  };
  architectureSteps: { title: string; desc: string }[];
}

export function SaaSSection() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<SaaSProduct | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  const products: SaaSProduct[] = [
    {
      id: 'joptic',
      name: t('saas.products.joptic.name', { defaultValue: 'Joptic-Pro' }),
      categoryKey: 'optical',
      category: t('saas.products.joptic.category', { defaultValue: 'Optical & Healthcare' }),
      badge: t('saas.products.joptic.badge', { defaultValue: 'Flagship Optical SaaS' }),
      tagline: t('saas.products.joptic.tagline', { defaultValue: 'Cloud ERP & B2B Wholesale Portal for Optical Wholesalers and Clinics' }),
      description: t('saas.products.joptic.desc', { defaultValue: 'A specialized vertical SaaS engineered to eradicate manual spreadsheet chaos for ophthalmic lens importers and optical wholesalers. Handles complex prescription matrices, multi-warehouse lens catalogs, and automated B2B clinic ordering.' }),
      target: t('saas.products.joptic.target', { defaultValue: 'Optical Wholesalers, Lens Importers & Healthcare Clinics' }),
      impact: t('saas.products.joptic.impact', { defaultValue: '-70% Order Turnaround Time' }),
      impactDesc: t('saas.products.joptic.impact_desc', { defaultValue: 'Clinics place orders digitally with instant prescription validation; wholesale depots pack and dispatch in minutes.' }),
      features: (t('saas.products.joptic.features', { returnObjects: true }) as string[]) || [
        'B2B ordering portal with live optical catalog and personalized pricing tiers',
        'Automated prescription power & cylinder matrix validation',
        'Multi-depot stock sync with barcode scanning and batch tracking',
        'Direct integration with laboratory lens edging and finishing workflows'
      ],
      tech: t('saas.products.joptic.tech', { defaultValue: 'React 19 · Frappe Engine · Python REST · PostgreSQL · Redis' }),
      stats: (t('saas.products.joptic.stats', { returnObjects: true }) as { value: string; label: string }[]) || [
        { value: '100%', label: 'Real-time stock sync' },
        { value: '-70%', label: 'Order processing time' },
        { value: '10,000+', label: 'Optical SKUs tracked' }
      ],
      uiMockup: {
        accentColor: '#44ACAB',
        screenTitle: 'Joptic-Pro — B2B Wholesale & Rx Dispatch Hub',
        metric1: { label: 'Active Clinic Orders', val: '142 Orders' },
        metric2: { label: 'Rx Verification Rate', val: '99.4%' },
        tableTitle: 'Recent B2B Prescription Orders',
        sampleRows: [
          { col1: 'RX-9821 · Dr. Mansour Clinic', col2: 'Anti-Reflective 1.67 BlueCut (OD -3.25 / OS -2.75)', col3: 'Depot Alger-Center', status: 'Ready for Dispatch' },
          { col1: 'RX-9820 · CH Optic Wholesale', col2: 'Daily Hydrogel Disposable Lenses (Pack x90)', col3: 'Central Hub Oran', status: 'In Lab Routing' },
          { col1: 'RX-9819 · OptiVision Blida', col2: 'Photochromic Transitions Gen-8 (OD -1.50)', col3: 'Depot Blida', status: 'Dispatched' }
        ]
      },
      architectureSteps: [
        { title: '1. Clinic B2B Ordering Portal', desc: 'Partner opticians & clinics enter prescription spheres, cylinders, and axes via a streamlined web matrix with instant validation against real warehouse stock.' },
        { title: '2. Frappe Automation Engine', desc: 'Orders are categorized automatically by lens power and laboratory surfacing requirements, generating pick-lists and barcode routing labels.' },
        { title: '3. Multi-Warehouse Inventory Sync', desc: 'Central stock decrements in sub-second latency across all regional depots, preventing dual-allocation of scarce optical blanks.' },
        { title: '4. Automated Fiscal Invoicing', desc: 'Generates compliant commercial invoices, tracking delivery waybills and accounts receivable balances directly inside ERPNext.' }
      ]
    },
    {
      id: 'optisync',
      name: t('saas.products.optisync.name', { defaultValue: 'OptiDistro Hub' }),
      categoryKey: 'supply_chain',
      category: t('saas.products.optisync.category', { defaultValue: 'Supply Chain & Distro' }),
      badge: t('saas.products.optisync.badge', { defaultValue: 'Multi-Wilaya Supply Chain' }),
      tagline: t('saas.products.optisync.tagline', { defaultValue: 'Centralized Multi-Wilaya Distribution & Dead-Stock Elimination Platform' }),
      description: t('saas.products.optisync.desc', { defaultValue: 'Built for companies managing nationwide distribution networks across multiple regions. Unifies inventory across regional warehouses, coordinates inter-company transfers, and prevents costly dead stock.' }),
      target: t('saas.products.optisync.target', { defaultValue: 'National Distributors, Importers & Multi-Branch Networks' }),
      impact: t('saas.products.optisync.impact', { defaultValue: '+45% Faster Delivery Fulfillment' }),
      impactDesc: t('saas.products.optisync.impact_desc', { defaultValue: 'Eliminated stock stagnation across 14 wilayas and provided executives unified real-time inventory visibility.' }),
      features: (t('saas.products.optisync.features', { returnObjects: true }) as string[]) || [
        'Multi-wilaya inventory balancing with automated inter-depot transfer orders',
        'Intelligent dead-stock detection and slow-moving item alerts',
        'Multi-company billing and consolidated financial ledger',
        'Driver mobile route execution and electronic proof-of-delivery (e-POD)'
      ],
      tech: t('saas.products.optisync.tech', { defaultValue: 'ERPNext Core · Frappe Custom App · Docker · PWA · REST API' }),
      stats: (t('saas.products.optisync.stats', { returnObjects: true }) as { value: string; label: string }[]) || [
        { value: '14', label: 'Wilayas synchronized' },
        { value: '+45%', label: 'Fulfillment speed' },
        { value: '0%', label: 'Stockout blindspots' }
      ],
      uiMockup: {
        accentColor: '#1b6b6a',
        screenTitle: 'OptiDistro — National 14-Wilaya Depot Network',
        metric1: { label: 'Cross-Depot Movement', val: '3,840 Units' },
        metric2: { label: 'Dead Stock Rescued', val: '12.4M DZD' },
        tableTitle: 'Inter-Wilaya Replenishment Stream',
        sampleRows: [
          { col1: 'TR-4102 · Algiers -> Constantine Hub', col2: 'Batch High-Index Lenses (450 pcs)', col3: 'Transit Route A1', status: 'En Route (GPS Sync)' },
          { col1: 'TR-4101 · Setif Depot -> Batna Branch', col2: 'Standard CR-39 Hard Coat (600 pcs)', col3: 'Direct Delivery', status: 'Received & Audited' },
          { col1: 'TR-4099 · Oran Hub -> Tlemcen Depot', col2: 'Specialty Contact Lenses (320 packs)', col3: 'Route O3', status: 'Completed' }
        ]
      },
      architectureSteps: [
        { title: '1. Regional Depot Synchronization', desc: 'Local depot managers utilize lightweight barcode terminals to audit incoming and outgoing logistics without complex software overhead.' },
        { title: '2. Dead-Stock Rebalancing Algorithm', desc: 'Identifies slow-moving inventory in one wilaya and suggests automated internal stock transfers to wilayas experiencing active demand.' },
        { title: '3. Inter-Company Ledger Integration', desc: 'Automatically records inter-company accounts, purchase orders, and sales receipts between regional parent and subsidiary entities.' },
        { title: '4. Executive Control Tower', desc: 'Real-time visibility into overall national stock valuation, daily dispatch velocities, and driver delivery confirmation logs.' }
      ]
    },
    {
      id: 'lutrack',
      name: t('saas.products.lutrack.name', { defaultValue: 'LuTrack GMAO' }),
      categoryKey: 'equipment',
      category: t('saas.products.lutrack.category', { defaultValue: 'Machinery & GMAO' }),
      badge: t('saas.products.lutrack.badge', { defaultValue: 'Equipment Lifecycle & GMAO' }),
      tagline: t('saas.products.lutrack.tagline', { defaultValue: 'Serialized Machinery Registry, Calibration Schedules & Maintenance SaaS' }),
      description: t('saas.products.lutrack.desc', { defaultValue: 'A robust asset-tracking and computerized maintenance management SaaS designed for high-value equipment and machinery distributors. Guarantees 100% traceability per serial number with automated maintenance billing.' }),
      target: t('saas.products.lutrack.target', { defaultValue: 'Medical Equipment Providers, Machinery Importers & Technical Services' }),
      impact: t('saas.products.lutrack.impact', { defaultValue: '100% Machine Traceability' }),
      impactDesc: t('saas.products.lutrack.impact_desc', { defaultValue: 'Tracks every device by serial number from import customs clearance through warranty lifecycle and on-site servicing.' }),
      features: (t('saas.products.lutrack.features', { returnObjects: true }) as string[]) || [
        'Unit-level serial number lifecycle tracking with full warranty status',
        'Preventive calibration scheduler with automatic client reminders',
        'Field technician digital intervention logging and customer sign-off',
        'Automated spare parts consumption tracking and recurring service billing'
      ],
      tech: t('saas.products.lutrack.tech', { defaultValue: 'Custom Frappe Framework · React Native · MariaDB · SSL Encrypted Cloud' }),
      stats: (t('saas.products.lutrack.stats', { returnObjects: true }) as { value: string; label: string }[]) || [
        { value: '100%', label: 'Equipment traceability' },
        { value: '200h+', label: 'Admin hours saved/mo' },
        { value: '99.8%', label: 'Preventive SLA compliance' }
      ],
      uiMockup: {
        accentColor: '#0d9488',
        screenTitle: 'LuTrack GMAO — Serialized Asset Registry & SLAs',
        metric1: { label: 'Serialized Units Active', val: '840 Machines' },
        metric2: { label: 'Calibration SLA', val: '100% Compliant' },
        tableTitle: 'Active Machinery Maintenance Contracts',
        sampleRows: [
          { col1: 'SN-90248 · Edger Machine Pro-X', col2: 'Clinique Ophtalmo Annaba (Warranty Valid)', col3: 'Next Calib: 15 Oct 2026', status: 'Certified Active' },
          { col1: 'SN-88120 · Auto-Refractometer RT-7', col2: 'Cabinet Dr. Benali (Annual SLA)', col3: 'Tech Assigned: Karim', status: 'Service Scheduled' },
          { col1: 'SN-77319 · Lensmeter Digital 500', col2: 'Lutech Showroom Algiers', col3: 'Full Inspection Passed', status: 'Ready for Sale' }
        ]
      },
      architectureSteps: [
        { title: '1. Customs Clearance & Serial Registry', desc: 'Every high-value device is assigned a cryptographic serial passport immediately upon arrival, binding supplier warranties and spec sheets.' },
        { title: '2. Client Delivery & Warranty Activation', desc: 'When installed at the customer clinic or laboratory, the warranty timer activates and schedules mandatory calibration cycles.' },
        { title: '3. Mobile Field Technician Dispatch', desc: 'Engineers receive dispatched tickets on mobile tablets, record replaced spare parts, and capture customer digital sign-offs.' },
        { title: '4. Automated Service Contract Invoicing', desc: 'Intervention logs instantly flow into accounting, generating recurring maintenance invoices and spare parts billing vouchers.' }
      ]
    },
    {
      id: 'jetflow',
      name: t('saas.products.jetflow.name', { defaultValue: 'JetFlow B2B' }),
      categoryKey: 'b2b',
      category: t('saas.products.jetflow.category', { defaultValue: 'B2B Self-Service' }),
      badge: t('saas.products.jetflow.badge', { defaultValue: 'Customer Self-Service SaaS' }),
      tagline: t('saas.products.jetflow.tagline', { defaultValue: 'Turnkey White-Label Customer Self-Service & Ordering Portal' }),
      description: t('saas.products.jetflow.desc', { defaultValue: 'A branded, high-performance web portal that connects directly to client ERP backends. Allows enterprise customers to place bulk orders, check real-time stock, review credit limits, and download invoices 24/7.' }),
      target: t('saas.products.jetflow.target', { defaultValue: 'B2B Manufacturers, Wholesalers & Commercial Enterprises' }),
      impact: t('saas.products.jetflow.impact', { defaultValue: '85% Reduction in Routine Calls' }),
      impactDesc: t('saas.products.jetflow.impact_desc', { defaultValue: 'Transforms manual, error-prone order reception into a sleek, automated self-service digital experience.' }),
      features: (t('saas.products.jetflow.features', { returnObjects: true }) as string[]) || [
        '24/7 client self-service ordering with instant ERPNext stock reservation',
        'Live statement-of-account, outstanding balance, and credit limit tracking',
        'Digital payment receipt submission and automated invoice generation',
        'Multi-seat corporate accounts with role-based buyer and accountant permissions'
      ],
      tech: t('saas.products.jetflow.tech', { defaultValue: 'React SPA · Webhook Middleware · Tailwind CSS · Role-Based Auth' }),
      stats: (t('saas.products.jetflow.stats', { returnObjects: true }) as { value: string; label: string }[]) || [
        { value: '85%', label: 'Fewer manual order queries' },
        { value: '24/7', label: 'Order intake availability' },
        { value: '< 1s', label: 'Instant ERP sync' }
      ],
      uiMockup: {
        accentColor: '#0f766e',
        screenTitle: 'JetFlow B2B — Customer Self-Service Portal',
        metric1: { label: 'Online Order Ingestion', val: '86% Automated' },
        metric2: { label: 'Avg Order Processing', val: '4 Minutes' },
        tableTitle: 'Client Self-Service Activity',
        sampleRows: [
          { col1: 'PO-2026-88 · MedSupply Nord', col2: 'Bulk Consumables & Reagents (12 Items)', col3: 'Direct Bank Wire (Slip Attached)', status: 'Auto-Approved' },
          { col1: 'PO-2026-87 · Atlas Distribution', col2: 'Quarterly Wholesale Order (80 Cases)', col3: 'Credit Line: 4.2M DZD Available', status: 'Packing in Depot' },
          { col1: 'INV-5510 · Pharmacie Centrale', col2: 'Fiscal Invoice & Delivery Receipt Downloaded', col3: 'Self-Service Download', status: 'Archive Synced' }
        ]
      },
      architectureSteps: [
        { title: '1. Direct ERPNext Gateway', desc: 'Secure read/write API middleware connects client ERPNext catalog items, inventory levels, and customer-specific price lists.' },
        { title: '2. Intuitive Commercial Experience', desc: 'B2B buyers browse dynamic stock, assemble multi-item purchase orders, and upload transfer slips from mobile or desktop.' },
        { title: '3. Credit Limit & Payment Safety', desc: 'Enforces business rules preventing order confirmations if customer balances exceed defined credit allowances.' },
        { title: '4. Immediate Fulfillment Trigger', desc: 'Confirmed orders instantly register as Sales Orders inside the warehouse management queue, ready for rapid packing.' }
      ]
    }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryKey === activeCategory);

  const categories = [
    { key: 'all', label: t('saas.all_filter', { defaultValue: 'All Solutions' }) },
    { key: 'optical', label: t('saas.cat_optical', { defaultValue: 'Optical & Healthcare' }) },
    { key: 'supply_chain', label: t('saas.cat_supply_chain', { defaultValue: 'Supply Chain & Distro' }) },
    { key: 'equipment', label: t('saas.cat_equipment', { defaultValue: 'Machinery & GMAO' }) },
    { key: 'b2b', label: t('saas.cat_b2b', { defaultValue: 'B2B Self-Service' }) }
  ];

  return (
    <section id="saas" className="relative bg-slate-50/70 py-24 sm:py-32 border-b border-slate-200 overflow-hidden">
      {/* Background architectural grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#44ACAB15_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#44ACAB] uppercase mb-3">
            <Boxes className="h-4 w-4" />
            <span>{t('saas.subtitle', { defaultValue: 'Proprietary Software Solutions' })}</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t('saas.title1', { defaultValue: 'SaaS Products We Have' })}{' '}
            <span className="text-[#44ACAB]">{t('saas.title2', { defaultValue: 'Created & Deployed' })}</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 font-medium">
            {t('saas.desc', { defaultValue: 'Beyond bespoke enterprise ERP consulting, JetNext designs, engineers, and operates specialized vertical SaaS platforms solving real operational bottlenecks for high-growth enterprises.' })}
          </p>

          {/* Interactive Category Filter - functional buttons with clean segmented style */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl ring-1 ring-slate-200/80 shadow-sm max-w-2xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeCategory === cat.key
                    ? 'bg-[#1b6b6a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="group relative flex flex-col justify-between bg-white rounded-3xl p-8 sm:p-10 ring-1 ring-slate-200/90 shadow-sm hover:shadow-xl hover:ring-[#44ACAB]/40 transition-all duration-300"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-[#1b6b6a] to-[#44ACAB] rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>

              <div>
                {/* Header Metadata (Zero-pill discipline: unboxed quiet inline text with dot separator) */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-semibold mb-5 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1b6b6a] font-bold">{product.badge}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{t('saas.in_production', { defaultValue: 'In Production' })}</span>
                  </div>
                </div>

                {/* Title and Tagline */}
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#1b6b6a] transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#44ACAB]">
                  {product.tagline}
                </p>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed font-medium">
                  {product.description}
                </p>

                {/* Interactive Simulated UI Mockup Preview */}
                <div className="mt-6 rounded-2xl bg-slate-900 text-white p-4.5 shadow-inner border border-slate-800 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                      </div>
                      <span className="text-[11px] font-sans font-medium text-slate-400 pl-2">
                        {product.uiMockup.screenTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-sans text-emerald-400 font-semibold flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Live Sync
                    </span>
                  </div>

                  {/* UI Quick Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/50">
                      <p className="text-[10px] text-slate-400 font-sans">{product.uiMockup.metric1.label}</p>
                      <p className="text-sm font-bold text-white font-sans mt-0.5">{product.uiMockup.metric1.val}</p>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/50">
                      <p className="text-[10px] text-slate-400 font-sans">{product.uiMockup.metric2.label}</p>
                      <p className="text-sm font-bold text-[#44ACAB] font-sans mt-0.5">{product.uiMockup.metric2.val}</p>
                    </div>
                  </div>

                  {/* Sample Data Rows */}
                  <div className="space-y-1.5">
                    {product.uiMockup.sampleRows.map((row, rIdx) => (
                      <div key={rIdx} className="bg-slate-800/50 hover:bg-slate-800 transition-colors p-2 rounded-md flex items-center justify-between text-[11px]">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-200">{row.col1}</span>
                          <span className="text-slate-400 block text-[10px] truncate">{row.col2}</span>
                        </div>
                        <span className="shrink-0 text-[10px] font-sans font-medium text-slate-300 bg-slate-700/70 px-2 py-0.5 rounded">
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Capabilities */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-[#44ACAB]" />
                    <span>{t('saas.features_title', { defaultValue: 'Core Capabilities' })}</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {product.features.slice(0, 3).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-[#44ACAB] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Measurable Field Impact */}
                <div className="mt-6 p-4 rounded-2xl bg-[#e6f4f4]/60 border border-[#44ACAB]/20 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 text-[#1b6b6a]">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-[#1b6b6a] block">
                      {product.impact}
                    </span>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {product.impactDesc}
                    </p>
                  </div>
                </div>

                {/* Clean unboxed tech stack (anti-slop rule) */}
                <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500 border-t border-slate-100 pt-4">
                  <span className="font-bold text-slate-700">{t('saas.tech_stack', { defaultValue: 'Architecture' })}:</span>
                  <span>{product.tech}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span>{t('saas.view_demo', { defaultValue: 'Explore Architecture' })}</span>
                </button>
                <Link
                  to={`/book?saas=${product.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#44ACAB] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#328887] hover:-translate-y-0.5 transition-all"
                >
                  <span>{t('saas.book_demo', { defaultValue: 'Request Live Demo' })}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom SaaS Architecture Banner */}
        <div className="mt-16 rounded-[2.5rem] bg-gradient-to-br from-[#155a59] via-[#1b6b6a] to-[#257d7c] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#44ACAB]/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#a5e0e0] uppercase mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Custom Software Engineering</span>
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                {t('saas.custom_saas_title', { defaultValue: 'Need a custom SaaS built for your industry?' })}
              </h3>
              <p className="mt-3 text-base text-[#d0f0f0] font-medium leading-relaxed">
                {t('saas.custom_saas_desc', { defaultValue: 'From business logic conception and multi-tenant database design to sleek React interfaces and cloud deployment, JetNext delivers proprietary software that gives you an unbeatable competitive moat.' })}
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/book"
                className="rounded-full bg-white px-8 py-4 text-center text-sm font-bold text-[#1b6b6a] hover:bg-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {t('saas.custom_saas_cta', { defaultValue: 'Build Your SaaS With JetNext' })}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Product Detail & Architecture Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md"
            />
            
            <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-8 sm:px-6 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span className="text-[#1b6b6a]">{selectedProduct.badge}</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedProduct.category}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
                  {/* Tagline & Target */}
                  <div>
                    <p className="text-base font-semibold text-[#1b6b6a]">
                      {selectedProduct.tagline}
                    </p>
                    <p className="mt-2 text-slate-600 leading-relaxed font-medium">
                      {selectedProduct.description}
                    </p>
                    <div className="mt-3 text-xs font-semibold text-slate-500">
                      <span className="text-slate-800">{t('saas.target_audience', { defaultValue: 'Designed for' })}:</span> {selectedProduct.target}
                    </div>
                  </div>

                  {/* Impact Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedProduct.stats.map((stat, sIdx) => (
                      <div key={sIdx} className="bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100 text-center">
                        <div className="text-2xl sm:text-3xl font-black text-[#1b6b6a]">
                          {stat.value}
                        </div>
                        <div className="text-xs font-medium text-slate-600 mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Core Features List */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#44ACAB]" />
                      <span>{t('saas.modal.features', { defaultValue: 'Platform Features & Capabilities' })}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProduct.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 ring-1 ring-slate-100/70 text-xs font-medium text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-[#44ACAB] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Architecture & Workflows */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                      <Server className="h-4 w-4 text-[#44ACAB]" />
                      <span>{t('saas.modal.workflows', { defaultValue: 'Automated Workflows & Architecture' })}</span>
                    </h4>
                    <div className="space-y-3">
                      {selectedProduct.architectureSteps.map((step, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-[#44ACAB]/40 transition-colors">
                          <h5 className="text-xs font-bold text-slate-900">{step.title}</h5>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech specs */}
                  <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Cpu className="h-4 w-4 text-[#44ACAB]" />
                      <span>{t('saas.modal.tech_specs', { defaultValue: 'Technical Stack & Deployment' })}</span>
                    </div>
                    <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                      {selectedProduct.tech} · Multi-Tenant Isolation · Automated Daily Offsite Backup · TLS 1.3 Encryption
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {t('saas.modal.close', { defaultValue: 'Close' })}
                  </button>
                  <Link
                    to={`/book?saas=${selectedProduct.id}`}
                    onClick={() => setSelectedProduct(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#44ACAB] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#328887] transition-all"
                  >
                    <span>{t('saas.modal.schedule_walkthrough', { defaultValue: 'Book Live Walkthrough' })}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
