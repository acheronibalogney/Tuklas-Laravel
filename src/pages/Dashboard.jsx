import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
import AiScanner from './AiScanner';
import BrandLogo from '../components/BrandLogo';
import { PANGASINAN_LOCATIONS, fetchPangasinanBarangays } from '../pangasinanLocations';
import { scanFiles } from '../scan';

const TESDA_APPLY_URL = 'https://bsrs.tesda.gov.ph/';
const TESDA_PROGRAM_DIRECTORY_URL = 'https://www.tesda.gov.ph/TVI';
const TARGET_ROLE_SUGGESTIONS = [
  'Web Developer',
  'Software Developer',
  'UI/UX Designer',
  'Data Analyst',
  'Digital Marketer',
  'Administrative Assistant',
  'Customer Service Representative',
  'Electrician',
  'Caregiver',
  'Automotive Service Technician',
  'Accountant',
  'Bookkeeper',
  'Financial Analyst',
  'Sales Representative',
  'Human Resources Officer',
  'Project Coordinator',
  'Entrepreneur',
  'Teacher',
  'Trainer / Facilitator',
  'Social Worker',
  'Nurse',
  'Medical Assistant',
  'Pharmacy Assistant',
  'Agricultural Technician',
  'Fisheries Technician',
  'Aquaculture Technician',
  'Chef / Cook',
  'Baker / Pastry Chef',
  'Food and Beverage Service Staff',
  'Hotel Front Office Staff',
  'Housekeeping Staff',
  'Tour Guide',
  'Construction Worker',
  'Carpenter',
  'Mason',
  'Plumber',
  'Welder',
  'Motorcycle Mechanic',
  'Machine Operator',
  'Driver / Delivery Rider',
  'Logistics Coordinator',
  'Fashion Designer',
  'Dressmaker / Tailor',
  'Hairdresser / Barber',
  'Beauty Care Specialist',
  'Graphic Designer',
  'Photographer / Videographer',
  'Writer / Content Creator',
  'Research Assistant',
  'Environmental Technician',
  'Government Service Officer',
  'Security Officer',
];

const toRoleList = (value) => Array.isArray(value)
  ? value.filter(Boolean)
  : String(value || '').split(',').map(role => role.trim()).filter(Boolean);

const toDisplayList = (value) => Array.isArray(value)
  ? value.filter(Boolean).map(item => typeof item === 'object' ? (item.name || item.title || JSON.stringify(item)) : String(item))
  : value ? [typeof value === 'object' ? (value.name || value.title || JSON.stringify(value)) : String(value)] : [];

const LEARNING_SITES = [
  { name: 'e-TESDA Online', url: 'https://e-tesda.gov.ph/', keywords: ['tesda', 'weld', 'electr', 'plumb', 'cook', 'bake', 'care', 'automotive', 'farm', 'agri', 'hospital', 'beauty'] },
  { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', keywords: ['web', 'program', 'software', 'code', 'javascript', 'python', 'data', 'sql'] },
  { name: 'Canva Design School', url: 'https://www.canva.com/learn/', keywords: ['design', 'creative', 'graphic', 'marketing', 'social media', 'content'] },
  { name: 'Coursera', url: 'https://www.coursera.org/', keywords: ['business', 'account', 'finance', 'sales', 'management', 'project', 'health', 'customer', 'logistics'] },
  { name: 'Khan Academy', url: 'https://www.khanacademy.org/', keywords: ['math', 'science', 'english', 'teach', 'education', 'entrepreneur'] },
  { name: 'OpenLearn', url: 'https://www.open.edu/openlearn/', keywords: [] },
];

const getLearningSite = (recommendation) => {
  if (recommendation.type === 'TESDA') return LEARNING_SITES[0];
  const haystack = `${recommendation.learningSite || ''} ${recommendation.title || ''} ${recommendation.searchTerms || ''}`.toLowerCase();
  const namedSite = LEARNING_SITES.find(site => haystack.includes(site.name.toLowerCase()));
  return namedSite || LEARNING_SITES.find(site => site.keywords.some(keyword => haystack.includes(keyword))) || LEARNING_SITES.at(-1);
};

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
};

const joinName = (firstName = '', lastName = '') => [firstName, lastName].map(value => value.trim()).filter(Boolean).join(' ');

/* ── ICONS ── */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);
const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const FolderIcon = ({ color = 'var(--accent)' }) => (
  <svg viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function DashboardSelect({ value, onChange, options, placeholder, disabled = false }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  const selected = options.find(option => option.value === value);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!selectRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  return (
    <div className={`dashboard-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`} ref={selectRef}>
      <button type="button" className="dashboard-select-trigger" disabled={disabled} onClick={() => setOpen(current => !current)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{selected?.label || placeholder}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && <div className="dashboard-select-menu" role="listbox" aria-label={placeholder}>{options.map(option => <button key={option.value} type="button" role="option" aria-selected={option.value === value} className={option.value === value ? 'is-selected' : ''} onClick={() => { onChange(option.value); setOpen(false); }}>{option.label}</button>)}</div>}
    </div>
  );
}

function DashboardMultiSelect({ values = [], onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  const selectedLabels = options.filter(option => values.includes(option.value)).map(option => option.label);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!selectRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const toggleOption = (value) => {
    onChange(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  };

  return (
    <div className={`dashboard-select${open ? ' is-open' : ''}`} ref={selectRef}>
      <button type="button" className="dashboard-select-trigger" onClick={() => setOpen(current => !current)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{selectedLabels.length ? selectedLabels.join(', ') : placeholder}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && <div className="dashboard-select-menu dashboard-multi-select-menu" role="listbox" aria-label={placeholder} aria-multiselectable="true">
        {options.map(option => {
          const selected = values.includes(option.value);
          return <button key={option.value} type="button" role="option" aria-selected={selected} className={selected ? 'is-selected' : ''} onClick={() => toggleOption(option.value)}><span>{option.label}</span>{selected && <span aria-hidden="true">✓</span>}</button>;
        })}
      </div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TESDA PROGRAMS DATA
   ══════════════════════════════════════════════════════════════ */
const TESDA_PROGRAMS = [
  // ── ICT (Information and Communications Technology) ──
  { name: 'Programming NC IV', sector: 'ICT', level: 'College', duration: '1,298 hrs', type: 'NC IV' },
  { name: 'Illustration NC II', sector: 'ICT', level: 'College', duration: '356 hrs', type: 'NC II' },
  { name: 'Web Development NC III', sector: 'ICT', level: 'College', duration: '486 hrs', type: 'NC III' },
  { name: 'Animation NC II', sector: 'ICT', level: 'College', duration: '1,150 hrs', type: 'NC II' },
  { name: 'Computer Systems Servicing NC II', sector: 'ICT', level: 'SHS', duration: '280 hrs', type: 'NC II' },
  { name: 'Contact Center Services NC II', sector: 'ICT', level: 'SHS', duration: '240 hrs', type: 'NC II' },
  { name: 'Medical Transcription NC II', sector: 'ICT', level: 'College', duration: '720 hrs', type: 'NC II' },
  { name: 'Telecom OSP and Subscriber Line Installation NC II', sector: 'ICT', level: 'SHS', duration: '162 hrs', type: 'NC II' },
  { name: 'Broadband Installation (Fixed Wireless Systems) NC II', sector: 'ICT', level: 'SHS', duration: '198 hrs', type: 'NC II' },
  { name: '2D Animation NC III', sector: 'ICT', level: 'College', duration: '596 hrs', type: 'NC III' },
  { name: '3D Animation NC III', sector: 'ICT', level: 'College', duration: '596 hrs', type: 'NC III' },
  { name: 'Visual Graphic Design NC III', sector: 'ICT', level: 'College', duration: '486 hrs', type: 'NC III' },
  { name: 'Game Development NC III', sector: 'ICT', level: 'College', duration: '486 hrs', type: 'NC III' },

  // ── Electronics ──
  { name: 'Electronics Products Assembly and Servicing NC II', sector: 'Electronics', level: 'SHS', duration: '260 hrs', type: 'NC II' },
  { name: 'Electronic/Computer Assembly and Servicing NC II', sector: 'Electronics', level: 'SHS', duration: '240 hrs', type: 'NC II' },
  { name: 'Mechatronics Servicing NC II', sector: 'Electronics', level: 'College', duration: '560 hrs', type: 'NC II' },
  { name: 'Instrumentation and Control Servicing NC II', sector: 'Electronics', level: 'College', duration: '480 hrs', type: 'NC II' },
  { name: 'Mechatronics Servicing NC III', sector: 'Electronics', level: 'College', duration: '360 hrs', type: 'NC III' },
  { name: 'Mechatronics Servicing NC IV', sector: 'Electronics', level: 'College', duration: '240 hrs', type: 'NC IV' },

  // ── Electrical and Power ──
  { name: 'Electrical Installation and Maintenance NC II', sector: 'Electrical', level: 'SHS', duration: '320 hrs', type: 'NC II' },
  { name: 'Electrical Installation and Maintenance NC III', sector: 'Electrical', level: 'College', duration: '240 hrs', type: 'NC III' },
  { name: 'Electrical Installation and Maintenance NC IV', sector: 'Electrical', level: 'College', duration: '120 hrs', type: 'NC IV' },
  { name: 'Photovoltaic Systems Installation NC II', sector: 'Electrical', level: 'College', duration: '116 hrs', type: 'NC II' },

  // ── Automotive ──
  { name: 'Automotive Servicing NC I', sector: 'Automotive', level: 'SHS', duration: '324 hrs', type: 'NC I' },
  { name: 'Automotive Servicing NC II', sector: 'Automotive', level: 'SHS', duration: '468 hrs', type: 'NC II' },
  { name: 'Automotive Servicing NC III', sector: 'Automotive', level: 'College', duration: '360 hrs', type: 'NC III' },
  { name: 'Automotive Servicing NC IV', sector: 'Automotive', level: 'College', duration: '240 hrs', type: 'NC IV' },
  { name: 'Motorcycle/Small Engine Servicing NC II', sector: 'Automotive', level: 'SHS', duration: '280 hrs', type: 'NC II' },
  { name: 'Driving NC II', sector: 'Automotive', level: 'SHS', duration: '118 hrs', type: 'NC II' },
  { name: 'Heavy Equipment Servicing NC II', sector: 'Automotive', level: 'College', duration: '480 hrs', type: 'NC II' },

  // ── Tourism ──
  { name: 'Food and Beverage Services NC II', sector: 'Tourism', level: 'SHS', duration: '356 hrs', type: 'NC II' },
  { name: 'Housekeeping NC II', sector: 'Tourism', level: 'SHS', duration: '436 hrs', type: 'NC II' },
  { name: 'Cookery NC II', sector: 'Tourism', level: 'SHS', duration: '316 hrs', type: 'NC II' },
  { name: 'Bread and Pastry Production NC II', sector: 'Tourism', level: 'SHS', duration: '141 hrs', type: 'NC II' },
  { name: 'Bartending NC II', sector: 'Tourism', level: 'SHS', duration: '226 hrs', type: 'NC II' },
  { name: 'Tour Guiding Services NC II', sector: 'Tourism', level: 'College', duration: '320 hrs', type: 'NC II' },
  { name: 'Travel Services NC II', sector: 'Tourism', level: 'College', duration: '320 hrs', type: 'NC II' },
  { name: 'Events Management Services NC III', sector: 'Tourism', level: 'College', duration: '320 hrs', type: 'NC III' },
  { name: 'Food and Beverage Services NC III', sector: 'Tourism', level: 'College', duration: '244 hrs', type: 'NC III' },
  { name: 'Commercial Cooking NC III', sector: 'Tourism', level: 'College', duration: '600 hrs', type: 'NC III' },

  // ── Health, Social, and Other Community Development ──
  { name: 'Hilot (Wellness Massage) NC II', sector: 'Health', level: 'SHS', duration: '120 hrs', type: 'NC II' },
  { name: 'Caregiving NC II', sector: 'Health', level: 'College', duration: '786 hrs', type: 'NC II' },
  { name: 'Health Care Services NC II', sector: 'Health', level: 'College', duration: '996 hrs', type: 'NC II' },
  { name: 'Barangay Health Services NC II', sector: 'Health', level: 'SHS', duration: '120 hrs', type: 'NC II' },
  { name: 'Emergency Medical Services NC II', sector: 'Health', level: 'College', duration: '240 hrs', type: 'NC II' },
  { name: 'Pharmacy Services NC III', sector: 'Health', level: 'College', duration: '600 hrs', type: 'NC III' },
  { name: 'Dental Hygiene NC IV', sector: 'Health', level: 'College', duration: '1,200 hrs', type: 'NC IV' },

  // ── Construction ──
  { name: 'Masonry NC II', sector: 'Construction', level: 'SHS', duration: '258 hrs', type: 'NC II' },
  { name: 'Carpentry NC II', sector: 'Construction', level: 'SHS', duration: '258 hrs', type: 'NC II' },
  { name: 'Plumbing NC II', sector: 'Construction', level: 'SHS', duration: '258 hrs', type: 'NC II' },
  { name: 'Tile Setting NC II', sector: 'Construction', level: 'SHS', duration: '166 hrs', type: 'NC II' },
  { name: 'Scaffold Erecting NC II', sector: 'Construction', level: 'SHS', duration: '82 hrs', type: 'NC II' },
  { name: 'Pipefitting NC II', sector: 'Construction', level: 'College', duration: '258 hrs', type: 'NC II' },
  { name: 'Heavy Equipment Operation NC II', sector: 'Construction', level: 'College', duration: '312 hrs', type: 'NC II' },
  { name: 'Construction Painting NC II', sector: 'Construction', level: 'SHS', duration: '194 hrs', type: 'NC II' },

  // ── TVET (Trainers Methodology) ──
  { name: 'Trainers Methodology I', sector: 'TVET', level: 'College', duration: '264 hrs', type: 'TM I' },
  { name: 'Trainers Methodology II', sector: 'TVET', level: 'College', duration: '196 hrs', type: 'TM II' },

  // ── Agriculture and Fishery ──
  { name: 'Agricultural Crops Production NC II', sector: 'Agriculture', level: 'SHS', duration: '320 hrs', type: 'NC II' },
  { name: 'Animal Production (Poultry-Chicken) NC II', sector: 'Agriculture', level: 'SHS', duration: '316 hrs', type: 'NC II' },
  { name: 'Animal Production (Swine) NC II', sector: 'Agriculture', level: 'SHS', duration: '316 hrs', type: 'NC II' },
  { name: 'Aquaculture NC II', sector: 'Agriculture', level: 'SHS', duration: '316 hrs', type: 'NC II' },
  { name: 'Landscape Installation and Maintenance NC II', sector: 'Agriculture', level: 'SHS', duration: '244 hrs', type: 'NC II' },
  { name: 'Organic Agriculture Production NC II', sector: 'Agriculture', level: 'College', duration: '232 hrs', type: 'NC II' },
  { name: 'Rice Machinery Operations NC II', sector: 'Agriculture', level: 'SHS', duration: '156 hrs', type: 'NC II' },
  { name: 'Horticulture NC III', sector: 'Agriculture', level: 'College', duration: '480 hrs', type: 'NC III' },
  { name: 'Agricultural Crops Production NC III', sector: 'Agriculture', level: 'College', duration: '232 hrs', type: 'NC III' },

  // ── Garments and Textile ──
  { name: 'Dressmaking NC II', sector: 'Garments', level: 'SHS', duration: '396 hrs', type: 'NC II' },
  { name: 'Tailoring NC II', sector: 'Garments', level: 'SHS', duration: '280 hrs', type: 'NC II' },
  { name: 'Fashion Design NC III', sector: 'Garments', level: 'College', duration: '480 hrs', type: 'NC III' },

  // ── Metals and Engineering ──
  { name: 'Shielded Metal Arc Welding (SMAW) NC I', sector: 'Metals', level: 'SHS', duration: '268 hrs', type: 'NC I' },
  { name: 'Shielded Metal Arc Welding (SMAW) NC II', sector: 'Metals', level: 'SHS', duration: '268 hrs', type: 'NC II' },
  { name: 'Gas Metal Arc Welding (GMAW) NC II', sector: 'Metals', level: 'College', duration: '268 hrs', type: 'NC II' },
  { name: 'Gas Tungsten Arc Welding (GTAW) NC II', sector: 'Metals', level: 'College', duration: '268 hrs', type: 'NC II' },
  { name: 'Machining NC II', sector: 'Metals', level: 'College', duration: '480 hrs', type: 'NC II' },
  { name: 'CNC Lathe Machine Operation NC II', sector: 'Metals', level: 'College', duration: '200 hrs', type: 'NC II' },
  { name: 'CNC Milling Machine Operation NC II', sector: 'Metals', level: 'College', duration: '200 hrs', type: 'NC II' },

  // ── Maritime ──
  { name: 'Ship Catering Services NC I', sector: 'Maritime', level: 'SHS', duration: '356 hrs', type: 'NC I' },
  { name: 'Marine Diesel Plant Maintenance NC I', sector: 'Maritime', level: 'College', duration: '480 hrs', type: 'NC I' },
  { name: 'Seafaring Ratings NC I', sector: 'Maritime', level: 'College', duration: '480 hrs', type: 'NC I' },

  // ── Processed Food and Beverages ──
  { name: 'Food Processing NC II', sector: 'Food Processing', level: 'SHS', duration: '356 hrs', type: 'NC II' },
  { name: 'Slaughtering Operations NC II', sector: 'Food Processing', level: 'College', duration: '160 hrs', type: 'NC II' },
  { name: 'Meat Processing NC II', sector: 'Food Processing', level: 'College', duration: '200 hrs', type: 'NC II' },

  // ── Social and Other Services ──
  { name: 'Beauty Care (Nail Care) Services NC II', sector: 'Services', level: 'SHS', duration: '120 hrs', type: 'NC II' },
  { name: 'Hairdressing NC II', sector: 'Services', level: 'SHS', duration: '356 hrs', type: 'NC II' },
  { name: 'Beauty Care Services NC III', sector: 'Services', level: 'College', duration: '600 hrs', type: 'NC III' },
  { name: 'Bookkeeping NC III', sector: 'Services', level: 'College', duration: '292 hrs', type: 'NC III' },
  { name: 'Security Services NC I', sector: 'Services', level: 'SHS', duration: '240 hrs', type: 'NC I' },
  { name: 'Security Services NC II', sector: 'Services', level: 'College', duration: '480 hrs', type: 'NC II' },

  // ── HVAC/R and Utilities ──
  { name: 'Refrigeration and Air-Conditioning NC II', sector: 'HVAC', level: 'SHS', duration: '264 hrs', type: 'NC II' },
  { name: 'Refrigeration and Air-Conditioning NC III', sector: 'HVAC', level: 'College', duration: '240 hrs', type: 'NC III' },
  { name: 'Gas (LPG and CNG) Installation and Maintenance NC II', sector: 'HVAC', level: 'SHS', duration: '160 hrs', type: 'NC II' },

  // ── Land Transportation ──
  { name: 'Transit and Bus Driving NC II', sector: 'Land Transportation', level: 'SHS', duration: '118 hrs', type: 'NC II' },
  { name: 'Trucking Services NC II', sector: 'Land Transportation', level: 'SHS', duration: '112 hrs', type: 'NC II' },
  { name: 'Forklift Operation NC II', sector: 'Land Transportation', level: 'SHS', duration: '72 hrs', type: 'NC II' },

  // ── Furniture and Woodworking ──
  { name: 'Carpentry NC III', sector: 'Furniture', level: 'College', duration: '320 hrs', type: 'NC III' },
  { name: 'Furniture Making NC II', sector: 'Furniture', level: 'SHS', duration: '280 hrs', type: 'NC II' },
  { name: 'Cabinet Making NC II', sector: 'Furniture', level: 'SHS', duration: '240 hrs', type: 'NC II' },

  // ── Footwear and Leather Goods ──
  { name: 'Shoemaking NC II', sector: 'Footwear', level: 'SHS', duration: '280 hrs', type: 'NC II' },
  { name: 'Leathergoods Making NC II', sector: 'Footwear', level: 'SHS', duration: '232 hrs', type: 'NC II' },

  // ── Mining and Quarrying ──
  { name: 'Surface Mining Operation NC II', sector: 'Mining', level: 'College', duration: '480 hrs', type: 'NC II' },
  { name: 'Underground Mining Operation NC II', sector: 'Mining', level: 'College', duration: '480 hrs', type: 'NC II' },

  // ── Decorative Crafts and Arts ──
  { name: 'Handicraft Making NC II', sector: 'Crafts', level: 'SHS', duration: '160 hrs', type: 'NC II' },
  { name: 'Bamboo Craft NC II', sector: 'Crafts', level: 'SHS', duration: '120 hrs', type: 'NC II' },
  { name: 'Pottery Making NC II', sector: 'Crafts', level: 'SHS', duration: '160 hrs', type: 'NC II' },

  // ── Language / Business Processes ──
  { name: 'Business English Communication (BPO) NC II', sector: 'BPO', level: 'College', duration: '240 hrs', type: 'NC II' },
  { name: 'Customer Service NC II', sector: 'BPO', level: 'SHS', duration: '200 hrs', type: 'NC II' },
  { name: 'Data Encoding NC II', sector: 'BPO', level: 'SHS', duration: '120 hrs', type: 'NC II' },

  // ── Social Services / Community ──
  { name: 'Early Childhood Care and Development NC III', sector: 'Social Services', level: 'College', duration: '610 hrs', type: 'NC III' },
  { name: 'Community Health Care NC II', sector: 'Social Services', level: 'SHS', duration: '320 hrs', type: 'NC II' },
  { name: 'Social Work Facilitation NC III', sector: 'Social Services', level: 'College', duration: '320 hrs', type: 'NC III' },
];

const SECTORS = [...new Set(TESDA_PROGRAMS.map(p => p.sector))].sort();

/* ── CAREER DATA ── */
const careerRows = [
  { name: 'Software Engineer', type: 'folder', match: '94%', status: 'Strong Match', skills: 3, modified: 'Today', sharing: [{ i: 'JD', c: '#2b726b' }, { i: 'MS', c: '#b9583f' }], tags: ['ICT', 'TESDA'], skillsList: ['React.js', 'Node.js', 'SQL'], trainings: ['Programming NC IV', 'Web Development NC III'] },
  { name: 'Web Developer', type: 'folder', match: '81%', status: 'Good Match', skills: 5, modified: 'Yesterday', sharing: [{ i: 'JD', c: '#2b726b' }], tags: ['ICT', 'TESDA'], skillsList: ['React.js', 'Node.js', 'SQL', 'REST APIs', 'TypeScript'], trainings: ['Web Development NC III', 'Programming NC IV', 'Visual Graphic Design NC III'] },
  { name: 'Bookkeeper', type: 'folder', match: '73%', status: 'Partial Match', skills: 8, modified: 'Apr 10', sharing: [], tags: ['Services', 'TESDA'], skillsList: ['Accounting', 'Excel', 'QuickBooks', 'Tax Filing', 'Payroll', 'Auditing', 'Financial Reports', 'Data Entry'], trainings: ['Bookkeeping NC III'] },
  { name: 'Graphic Designer', type: 'file', match: '68%', status: 'Partial Match', skills: 6, modified: 'Apr 2', sharing: [{ i: 'AM', c: '#b9583f' }, { i: 'JD', c: '#2b726b' }, { i: 'MS', c: '#b9583f' }], tags: ['ICT', 'Creative'], skillsList: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Typography', 'Branding', 'UI Design'], trainings: ['Illustration NC II', 'Visual Graphic Design NC III', '2D Animation NC III'] },
  { name: 'Electrician', type: 'file', match: '61%', status: 'Partial Match', skills: 9, modified: 'Mar 15', sharing: [{ i: 'JD', c: '#2b726b' }], tags: ['Electrical', 'TESDA'], skillsList: ['Wiring', 'Circuit Design', 'Safety Protocols', 'PLC', 'Motor Control', 'Troubleshooting', 'Blueprint Reading', 'Grounding', 'Panel Installation'], trainings: ['Electrical Installation and Maintenance NC II', 'Electrical Installation and Maintenance NC III', 'Photovoltaic Systems Installation NC II'] },
  { name: 'Automotive Mechanic', type: 'file', match: '58%', status: 'Partial Match', skills: 10, modified: 'Mar 10', sharing: [], tags: ['Automotive', 'TESDA'], skillsList: ['Engine Repair', 'Brake Systems', 'Transmission', 'Diagnostics', 'Electrical Systems', 'Suspension', 'AC Systems', 'Fuel Injection', 'Welding', 'Hydraulics'], trainings: ['Automotive Servicing NC II', 'Automotive Servicing NC III', 'Motorcycle/Small Engine Servicing NC II'] },
  { name: 'Chef / Cook', type: 'file', match: '76%', status: 'Good Match', skills: 4, modified: 'Feb 28', sharing: [], tags: ['Tourism', 'TESDA'], skillsList: ['Knife Skills', 'Menu Planning', 'Food Safety', 'Plating'], trainings: ['Cookery NC II', 'Commercial Cooking NC III', 'Bread and Pastry Production NC II'] },
  { name: 'Healthcare Worker', type: 'file', match: '55%', status: 'Low Match', skills: 12, modified: 'Feb 22', sharing: [], tags: ['Health', 'TESDA'], skillsList: ['Patient Care', 'Vital Signs', 'First Aid', 'CPR', 'Medical Records', 'Infection Control', 'Medication Admin', 'Wound Care', 'Communication', 'Anatomy', 'Pharmacology', 'Ethics'], trainings: ['Caregiving NC II', 'Health Care Services NC II', 'Emergency Medical Services NC II', 'Barangay Health Services NC II'] },
  { name: 'Welder', type: 'file', match: '64%', status: 'Partial Match', skills: 7, modified: 'Feb 15', sharing: [], tags: ['Metals', 'TESDA'], skillsList: ['SMAW', 'GMAW', 'GTAW', 'Blueprint Reading', 'Metal Cutting', 'Safety', 'Quality Inspection'], trainings: ['Shielded Metal Arc Welding (SMAW) NC II', 'Gas Metal Arc Welding (GMAW) NC II', 'Gas Tungsten Arc Welding (GTAW) NC II'] },
  { name: 'TESDA Trainer', type: 'file', match: '79%', status: 'Good Match', skills: 4, modified: 'Feb 10', sharing: [], tags: ['TVET', 'Education'], skillsList: ['Curriculum Design', 'Assessment', 'Facilitation', 'CBT Methodology'], trainings: ['Trainers Methodology I', 'Trainers Methodology II'] },
];

const quickAccessCards = [
  { name: 'Software Engineer', meta: '94% match · 3 skills to go', color: '#2b726b' },
  { name: 'Web Developer', meta: '81% match · 5 skills to go', color: '#b9583f' },
  { name: 'Chef / Cook', meta: '76% match · 4 skills to go', color: '#c49328' },
  { name: 'AI Scanner', meta: 'Scan files and photos securely', color: '#b9583f', tab: 'AI Scanner' },
];

function CareerPathChat({ messages, prompt, loading, error, isExpanded, onPromptChange, onRequest, onToggleExpand, onClose }) {
  const messagesRef = useRef(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  const renderMessageContent = (content) => String(content || '').split(/(https?:\/\/[^\s<]+)/g).map((part, index) => {
    if (!/^https?:\/\//i.test(part)) return <span key={index}>{part}</span>;
    const cleanUrl = part.replace(/[),.;!?]+$/, '');
    const trailingText = part.slice(cleanUrl.length);
    return (
      <span key={index}>
        <a href={cleanUrl} target="_blank" rel="noreferrer" className="career-path-chat-source">{cleanUrl}</a>
        {trailingText}
      </span>
    );
  });

  return (
    <section className={`career-path-prompt career-path-chat-window${isExpanded ? ' is-expanded' : ''}`}>
      <div className="field-section-label"><span>CAREER PATH AI</span><span>CONVERSATION MODE</span></div>
      <div className="career-path-chat-header">
        <div className="career-path-chat-avatar">AI</div>
        <div><strong>TuklasAI</strong><span>Career intelligence, on demand</span></div>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Minimize Career Path AI chat' : 'Expand Career Path AI chat'}
          title={isExpanded ? 'Minimize chat' : 'Expand chat'}
          className="career-path-chat-expand"
        >{isExpanded ? '−' : '□'}</button>
        <button type="button" onClick={onClose} aria-label="Close Career Path AI chat">x</button>
      </div>
      <div className="career-path-chat-messages" ref={messagesRef}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`career-path-chat-message career-path-chat-message--${message.role}`}>
            <div className="career-path-chat-role">{message.role === 'user' ? 'You' : 'TuklasAI'}</div>
            <div className="career-path-chat-content">{renderMessageContent(message.content)}</div>
            {message.role === 'assistant' && message.analysis && (
              <div className="career-path-chat-tags">
                {(message.analysis.careerMatches || []).slice(0, 5).map((career, careerIndex) => <span className="badge badge-green" key={`${career.name}-${careerIndex}`}>{career.name} {career.match || ''}</span>)}
                {(message.analysis.learningRecommendations || []).slice(0, 6).map((item, itemIndex) => (
                  <a href={item.directUrl || `https://www.google.com/search?q=${encodeURIComponent(item.searchTerms || item.title)}`} target="_blank" rel="noreferrer" key={`${item.title}-${itemIndex}`} className="career-path-chat-source">Learn: {item.title} ({item.learningSite || item.type})</a>
                ))}
                {(message.analysis.jobRecommendations || []).slice(0, 3).map((job, jobIndex) => <a href={`https://www.google.com/search?q=${encodeURIComponent(`${job.title} Philippines jobs`)}`} target="_blank" rel="noreferrer" className="badge badge-blue career-path-chat-reference" key={`${job.title}-${jobIndex}`}>Job context: {job.title}</a>)}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="career-path-chat-thinking" role="status" aria-live="polite">
            <span className="career-path-chat-loader" aria-hidden="true" />
            <span>Generating your response</span>
            <span className="career-path-chat-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
        )}
      </div>
      {error && <div className="scanner-error" role="alert">{error}</div>}
      <div className="career-path-prompt-row">
        <textarea value={prompt} onChange={onPromptChange} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onRequest(); } }} placeholder="Ask about a career, skill, course, or next step..." rows={2} />
        <button className="btn-primary" onClick={onRequest} disabled={!prompt.trim() || loading}>{loading ? 'Thinking...' : 'Send'}</button>
      </div>
      <div className="career-path-chat-note">Gemini is AI and can do mistakes. Chat guidance is temporary. Scan your documents to create saved skills and career matches.</div>
    </section>
  );
}

function DashboardViewHero({ label, count, children, description }) {
  return (
    <section className="dashboard-view-hero">
      <div className="field-section-label"><span>{label}</span>{count && <span>{count}</span>}</div>
      <h1>{children}</h1>
      {description && <p>{description}</p>}
    </section>
  );
}

function LoginActivity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/login-logs', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(response => response.ok ? response.json() : null)
      .then(data => setLogs(Array.isArray(data?.logs) ? data.logs : []))
      .catch(() => setLogs([]));
  }, []);

  return <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Login activity</div>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 10px' }}>Recent successful sign-ins to your Tuklas account.</div>
    {logs.length === 0 ? <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No login activity yet.</div> : logs.map(log => <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: '1px solid var(--border)', fontSize: 11 }}><span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{log.provider} sign-in</span><span style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{new Date(log.logged_in_at).toLocaleString()}</span></div>)}
  </div>;
}

function JetstreamSecurityPanel() {
  const [security, setSecurity] = useState(null);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const request = async (url, options = {}) => {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf || '', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { const requestError = new Error(data.message || data.error || 'Jetstream security request failed.'); requestError.status = response.status; throw requestError; }
    return data;
  };
  const refresh = async () => { const response = await fetch('/api/auth', { credentials: 'same-origin', headers: { Accept: 'application/json' } }); if (response.ok) setSecurity((await response.json()).jetstream || {}); };
  useEffect(() => { refresh().catch(() => {}); }, []);
  const enable = async () => {
    setLoading(true); setError(''); setMessage('');
    try { await request('/user/two-factor-authentication', { method: 'POST', body: JSON.stringify({}) }); const [qr, key, codes] = await Promise.all([request('/user/two-factor-qr-code'), request('/user/two-factor-secret-key'), request('/user/two-factor-recovery-codes')]); setSetup({ qr: qr.svg, secret: key.secretKey, codes }); setMessage('Scan the QR code, then enter the authenticator code.'); await refresh(); } catch (requestError) { if (requestError.status === 423) setNeedsPassword(true); else setError(requestError.message); } finally { setLoading(false); }
  };
  const confirmPassword = async () => {
    setLoading(true); setError('');
    try { await request('/user/confirm-password', { method: 'POST', body: JSON.stringify({ password }) }); setPassword(''); setNeedsPassword(false); await enable(); }
    catch (requestError) { setError(requestError.message); setLoading(false); }
  };
  const confirm = async () => { setLoading(true); setError(''); try { await request('/user/confirmed-two-factor-authentication', { method: 'POST', body: JSON.stringify({ code }) }); setCode(''); setMessage('Two-factor authentication is enabled.'); await refresh(); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } };
  const disable = async () => { setLoading(true); setError(''); try { await request('/user/two-factor-authentication', { method: 'DELETE' }); setSetup(null); setMessage('Two-factor authentication is disabled.'); await refresh(); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } };
  const savePassword = async () => { setLoading(true); setError(''); setPasswordMessage(''); try { await request('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'update-password', currentPassword, newPassword, newPassword_confirmation: passwordConfirmation }) }); setCurrentPassword(''); setNewPassword(''); setPasswordConfirmation(''); setPasswordMessage('Password updated successfully.'); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } };
  const buttonStyle = { padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
  return <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Security · Jetstream</div><div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}><div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Two-factor authentication</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{security?.twoFactorEnabled ? 'Enabled · authenticator verification is active.' : 'Protect your account with an authenticator app and recovery codes.'}</div></div>{security?.twoFactorEnabled ? <button type="button" onClick={disable} style={buttonStyle} disabled={loading}>Disable</button> : <button type="button" onClick={enable} style={buttonStyle} disabled={loading}>{loading ? 'Working…' : 'Set up 2FA'}</button>}</div>{needsPassword && <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 7 }}>Confirm your password to continue.</div><input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Current password" autoComplete="current-password" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} /><button type="button" onClick={confirmPassword} disabled={loading || !password} style={{ ...buttonStyle, marginTop: 8 }}>Confirm password</button></div>}{setup?.qr && <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}><div style={{ width: 192, background: '#fff', padding: 8, borderRadius: 8 }} dangerouslySetInnerHTML={{ __html: setup.qr }} /><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Manual key: <code>{setup.secret}</code></div><input value={code} onChange={event => setCode(event.target.value)} placeholder="6-digit authenticator code" inputMode="numeric" maxLength={6} style={{ width: '100%', marginTop: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} /><button type="button" onClick={confirm} disabled={loading || code.length !== 6} style={{ ...buttonStyle, marginTop: 8 }}>Confirm 2FA</button>{setup.codes?.length > 0 && <details style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}><summary>View recovery codes</summary><code style={{ display: 'block', marginTop: 6, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{setup.codes.join('\n')}</code></details>}</div>}<div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Change or create password</div><div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 10px' }}>Social-login users can create a password here; existing password users must confirm the current one.</div><input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} placeholder="Current password (optional for Google/Facebook setup)" autoComplete="current-password" style={{ width: '100%', marginBottom: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} /><input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="New password" autoComplete="new-password" style={{ width: '100%', marginBottom: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} /><input type="password" value={passwordConfirmation} onChange={event => setPasswordConfirmation(event.target.value)} placeholder="Confirm new password" autoComplete="new-password" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} /><button type="button" onClick={savePassword} disabled={loading || newPassword.length < 8 || newPassword !== passwordConfirmation} style={{ ...buttonStyle, marginTop: 8 }}>Save password</button>{passwordMessage && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent)' }}>{passwordMessage}</div>}</div>{message && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--accent)' }}>{message}</div>}{error && <div style={{ marginTop: 10, fontSize: 11, color: '#b9583f' }}>{error}</div>}</div></div>;
}


export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, authReady, logout, notifications, markNotificationRead, clearAllNotifications, analyzeFiles, saveDocuments, analysisResult, isAdmin, profileSettings, updateProfileSettings } = useUser();
  const [activeRow, setActiveRow] = useState(0);
  const [activeTab, setActiveTab] = useState('Activity');
  const [sidebarActive, setSidebarActive] = useState('AI Scanner');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [trainingSector, setTrainingSector] = useState('All');
  const [trainingLevel, setTrainingLevel] = useState('All');
  const [trainingSearch, setTrainingSearch] = useState('');
  const [careerPathPrompt, setCareerPathPrompt] = useState('');
  const [careerPathResult, setCareerPathResult] = useState(null);
  const [careerChatOpen, setCareerChatOpen] = useState(false);
  const [careerChatExpanded, setCareerChatExpanded] = useState(false);
  const [careerPathMessages, setCareerPathMessages] = useState([
    { role: 'assistant', content: 'Tell me what career, skill, or learning direction you are thinking about. I can explain your options and suggest practical next steps.' },
  ]);
  const [careerPathLoading, setCareerPathLoading] = useState(false);
  const [careerPathError, setCareerPathError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [barangays, setBarangays] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [settings, setSettings] = useState(() => ({
      displayName: '',
      firstName: '',
      lastName: '',
      bio: '',
      location: '',
      municipality: '',
      barangay: '',
      streetAddress: '',
      targetRole: [],
      emailNotifications: true,
      pushNotifications: true,
      careerAlerts: true,
      trainingReminders: true,
      profileVisibility: 'public',
      language: 'en',
    }));
  const resumeInputRef = useRef();
  const certInputRef = useRef();
  const profilePhotoInputRef = useRef();

  const requestCareerPath = async () => {
    const goal = careerPathPrompt.trim();
    if (!goal || careerPathLoading) return;
    const conversation = careerPathMessages
      .slice(-8)
      .map(message => `${message.role === 'user' ? 'User' : 'Career AI'}: ${message.content}`)
      .join('\n');
    setCareerPathMessages(messages => [...messages, { role: 'user', content: goal }]);
    setCareerPathPrompt('');
    setCareerPathLoading(true);
    setCareerPathError('');
    try {
      const result = await scanFiles({ files: [], goal: conversation ? `${conversation}\nUser: ${goal}` : goal, mode: 'career-path' });
      setCareerPathResult(result.analysis || null);
      setCareerPathMessages(messages => [...messages, { role: 'assistant', content: result.analysis?.summary || 'I could not generate a detailed answer for that question.', analysis: result.analysis }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to get an AI career recommendation.';
      setCareerPathError(message);
      setCareerPathMessages(messages => [...messages, { role: 'assistant', content: message }]);
    } finally {
      setCareerPathLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/users?email=${encodeURIComponent(user.email)}`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Users API unavailable')))
      .then(record => {
        if (record?.settings) setSettings(previous => ({ ...previous, ...record.settings }));
      })
      .catch(() => {});
  }, [user?.email]);

  const persistDashboardSettings = (nextSettings) => {
    if (user?.email) {
      fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, settings: nextSettings }),
      }).catch(() => {});
    }
  };

  const profileName = joinName(profileSettings?.firstName, profileSettings?.lastName);
  const userName = profileName || profileSettings?.displayName || user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const userEmail = profileSettings?.email || user?.email || '';
  const userPicture = profileSettings?.picture || user?.picture || '';
  const unreadCount = notifications.filter(n => !n.read).length;
  const profileAddress = [
    profileSettings?.streetAddress || settings.streetAddress,
    profileSettings?.barangay || settings.barangay,
    profileSettings?.municipality || settings.municipality,
  ].filter(Boolean).join(', ') || profileSettings?.location || settings.location || 'Not set';

  useEffect(() => {
    const fallbackName = splitName(profileSettings?.displayName || user?.name || '');
    setSettings(prev => ({
      ...prev,
      displayName: profileSettings?.displayName || user?.name || '',
      firstName: profileSettings?.firstName || fallbackName.firstName,
      lastName: profileSettings?.lastName || fallbackName.lastName,
      bio: profileSettings?.bio || '',
      location: profileSettings?.location || '',
      municipality: profileSettings?.municipality || '',
      barangay: profileSettings?.barangay || '',
      streetAddress: profileSettings?.streetAddress || '',
      targetRole: toRoleList(profileSettings?.targetRole),
    }));
  }, [profileSettings?.displayName, profileSettings?.firstName, profileSettings?.lastName, profileSettings?.bio, profileSettings?.location, profileSettings?.municipality, profileSettings?.barangay, profileSettings?.streetAddress, profileSettings?.targetRole, user?.name]);

  useEffect(() => {
    const location = PANGASINAN_LOCATIONS.find(item => item.name === settings.municipality);
    if (!location) { setBarangays([]); return; }
    let active = true;
    fetchPangasinanBarangays(location.code).then(items => { if (active) setBarangays(items); }).catch(() => { if (active) setBarangays([]); });
    return () => { active = false; };
  }, [settings.municipality]);

  const renderAvatar = (size = 32, fontSize = 12, extraStyle = {}) => (
    <div className="avatar" style={{ width: size, height: size, fontSize, overflow: 'hidden', ...extraStyle }}>
      {userPicture ? <img src={userPicture} alt={userName} /> : userInitials}
    </div>
  );

  // Redirect if not logged in
  if (!authReady) return null;

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleFilesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    event.target.value = '';
    setAnalyzing(true);
    setUploadQueue(files.map(file => ({ name: file.name, progress: 0, status: 'Waiting' })));
    for (let index = 0; index < files.length; index += 1) {
      setUploadQueue(queue => queue.map((item, itemIndex) => itemIndex === index ? { ...item, status: 'AI scanning', progress: 15 } : item));
      await new Promise(resolve => window.setTimeout(resolve, 420));
      setUploadQueue(queue => queue.map((item, itemIndex) => itemIndex === index ? { ...item, status: 'Extracting skills', progress: 65 } : item));
      await new Promise(resolve => window.setTimeout(resolve, 420));
      setUploadQueue(queue => queue.map((item, itemIndex) => itemIndex === index ? { ...item, status: 'Complete', progress: 100 } : item));
    }
    analyzeFiles(files);
    await saveDocuments?.(files, event.target.dataset.category || 'dashboard-upload');
    setSidebarActive('Skills Gap');
    setAnalyzing(false);
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateProfileSettings?.({ picture: String(reader.result) });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveProfileSettings = () => {
    const displayName = joinName(settings.firstName, settings.lastName) || settings.displayName || user.name || '';
    persistDashboardSettings(settings);
    updateProfileSettings?.({
      displayName,
      firstName: settings.firstName?.trim() || '',
      lastName: settings.lastName?.trim() || '',
      email: user.email || '',
      bio: settings.bio || '',
      location: settings.location || '',
      municipality: settings.municipality || '',
      barangay: settings.barangay || '',
      streetAddress: settings.streetAddress || '',
      targetRole: toRoleList(settings.targetRole),
    });
    setShowSettings(false);
  };

  const persistProfileChanges = (updates) => {
    setSettings(previous => ({ ...previous, ...updates }));
  };

  const scannedCareerRows = analysisResult?.source === 'AI Scanner'
    ? (analysisResult.recommendedCareers || []).map((career, index) => ({
      name: career.name,
      type: 'folder',
      match: career.match || `${Math.max(55, 88 - index * 7)}%`,
      status: index === 0 ? 'Best Scan Match' : 'Scan Match',
      skills: analysisResult.skillGaps?.length || Math.max(1, 6 - (analysisResult.extractedSkills?.length || 0)),
      modified: 'Just now',
      sharing: [],
      tags: ['AI Scan', 'TESDA'],
      skillsList: analysisResult.skillGaps?.length ? analysisResult.skillGaps : ['Career exploration', 'Digital literacy', 'Communication', 'Portfolio building'],
      trainings: analysisResult.tesdaRecommendations?.length
        ? analysisResult.tesdaRecommendations
        : ['Computer Systems Servicing NC II', 'Bookkeeping NC III', 'Contact Center Services NC II'],
    }))
    : [];
  const careerDisplayRows = scannedCareerRows;
  const selectedRow = careerDisplayRows[Math.min(activeRow, careerDisplayRows.length - 1)];

  const renderNotificationsMenu = (mobile = false) => {
    const menuStyle = {
      position: 'absolute',
      top: mobile ? 56 : 44,
      right: mobile ? 16 : 0,
      left: mobile ? 16 : 'auto',
      width: mobile ? 'auto' : 340,
      maxWidth: mobile ? 'calc(100vw - 32px)' : 340,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
      zIndex: 120,
      overflow: 'hidden',
    };

    return (
      <div className="dashboard-popover" style={menuStyle}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
          {notifications.length > 0 && (
            <button onClick={clearAllNotifications} style={{ background: 'transparent', border: 'none', fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              Clear All
            </button>
          )}
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'var(--border)' : 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>{n.time}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }} style={{ background: 'transparent', border: 'none', fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer', padding: '0 4px' }} title="Dismiss">×</button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderProfileMenu = (mobile = false) => {
    const menuStyle = {
      position: 'absolute',
      top: mobile ? 56 : 44,
      right: mobile ? 16 : 0,
      left: mobile ? 16 : 'auto',
      width: mobile ? 'auto' : 260,
      maxWidth: mobile ? 'calc(100vw - 32px)' : 260,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
      zIndex: 120,
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
    };

    return (
      <div className="dashboard-popover" style={menuStyle}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {renderAvatar(40, 14)}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{userName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{userEmail}</div>
          </div>
        </div>
        <div style={{ padding: '6px 0' }}>
          {[
            { label: 'My Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, action: () => setSidebarActive('Profile') },
            { label: 'Settings', icon: <SettingsIcon />, action: () => setShowSettings(true) },
            ...(isAdmin ? [{ label: 'Admin', icon: <SettingsIcon />, action: () => navigate('/admin') }] : []),
          ].map(item => (
            <button key={item.label} onClick={() => { item.action(); setShowProfile(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'left', transition: 'background 0.15s, color 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
          <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#b9583f', textAlign: 'left', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ display: 'flex', alignItems: 'center' }}><LogOutIcon /></span>
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  const sidebarItems = [
    { label: 'AI Scanner', icon: <SearchIcon /> },
    { label: 'Career Paths', icon: <TargetIcon /> },
    { label: 'Skills Gap', icon: <StarIcon /> },
    { label: 'Training', icon: <BookIcon /> },
    { label: 'Jobs (PESO)', icon: <BriefcaseIcon /> },
    ...(isAdmin ? [{ label: 'Admin', icon: <SettingsIcon />, action: () => navigate('/admin') }] : []),
  ];

  const filteredRows = careerDisplayRows.filter(row =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrograms = TESDA_PROGRAMS.filter(p => {
    const matchSector = trainingSector === 'All' || p.sector === trainingSector;
    const matchLevel = trainingLevel === 'All' || p.level === trainingLevel;
    const matchSearch = p.name.toLowerCase().includes(trainingSearch.toLowerCase());
    return matchSector && matchLevel && matchSearch;
  });

  /* ── RENDER MAIN CONTENT BASED ON SIDEBAR ── */
  const renderContent = () => {
    switch (sidebarActive) {
      case 'AI Scanner':
        return <AiScanner embedded />;
      case 'Profile':
        return renderProfileView();
      case 'Career Paths':
        return renderCareerPathsView();
      case 'Skills Gap':
        return renderSkillsGapView();
      case 'Training':
        return renderTrainingView();
      case 'Jobs (PESO)':
        return renderJobsView();
      default:
        return <AiScanner embedded />;
    }
  };

  const renderDashboardView = () => (
    <>
      {/* Analyzing overlay */}
      {analyzing && (
        <div style={{ background: 'var(--grad-soft)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 20, height: 20, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>AI is scanning files one at a time</div>
          </div>
          {uploadQueue.map(file => (
            <div key={file.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 88px 76px', gap: 10, alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 7 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${file.progress}%`, height: '100%', background: 'var(--accent)', borderRadius: 99 }} /></div>
              <span style={{ textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{file.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Welcome banner */}
      <div style={{ background: 'var(--grad-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Welcome{analysisResult ? ' back' : ''}, {userName.split(' ')[0]}!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {analysisResult
              ? <>Your career readiness score is <strong style={{ color: 'var(--accent)' }}>{analysisResult.readinessScore}/100</strong>. Keep going!</>
              : 'Upload your resume and certificates to get started with AI career analysis.'
            }
          </div>
        </div>
        {analysisResult && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700 }} className="grad-text">{analysisResult.readinessScore}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>/100</span>
          </div>
        )}
      </div>

      {/* Empty state — no analysis yet */}
      {!analysisResult && !analyzing && (
        <div style={{ background: 'var(--bg-surface)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Get Started with AI Analysis
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Upload your resume or TESDA certificates and our AI will extract your skills, calculate your career readiness score, and recommend the best career paths for you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ height: 44, padding: '0 20px', fontSize: 14 }} onClick={() => resumeInputRef.current?.click()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
              Upload Resume
            </button>
            <button className="btn-secondary" style={{ height: 44, padding: '0 20px', fontSize: 14 }} onClick={() => certInputRef.current?.click()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
              Upload Certificate
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 16 }}>
            Supported: PDF, DOCX, JPG, PNG · Max 5MB
          </div>
        </div>
      )}

      {/* AI Analysis Result — only shown after upload */}
      {analysisResult && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div className="section-header"><span className="section-title">AI Analysis Result</span></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Analyzed: {analysisResult.fileName} · {analysisResult.analyzedAt}</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extracted Skills ({analysisResult.extractedSkills.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {analysisResult.extractedSkills.map(s => <span key={s} className="badge badge-green">{s}</span>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommended Careers</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {analysisResult.recommendedCareers.map(c => (
                <div key={c.name} style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setSidebarActive('Career Paths')}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</span>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>{c.match}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Access — only show after analysis */}
      {analysisResult && (
        <div>
          <div className="section-header">
            <span className="section-title">Quick Access</span>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><MoreIcon /></button>
          </div>
          <div className="quick-access-grid">
            {quickAccessCards.map(c => (
              <div key={c.name} className="quick-card" onClick={() => { if (c.route) navigate(c.route); else setSidebarActive(c.tab || 'Career Paths'); }}>
                <div className="quick-card-icon"><FolderIcon color={c.color} /></div>
                <div className="quick-card-name">{c.name}</div>
                <div className="quick-card-meta">{c.meta}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity — synced to user's actual notifications */}
      {notifications.length > 0 && (
        <div>
          <div className="section-header">
            <span className="section-title">Recent Activity</span>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div className="activity-list">
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="activity-item">
                  <div className={`activity-dot${!n.read ? ' active' : ''}`} />
                  <div>
                    <div className="activity-date">{n.time}</div>
                    <div className="activity-text">{n.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderProfileView = () => (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {renderAvatar(76, 26)}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{userName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{userEmail}</div>
              {isAdmin && <span className="badge badge-blue" style={{ marginTop: 8, display: 'inline-block' }}>Admin</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="profile-dashboard-grid">
        <div className="profile-dashboard-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Career readiness</div>
          <div style={{ marginTop: 8, fontSize: 34, fontWeight: 700 }} className="grad-text">{analysisResult?.readinessScore || '—'}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/100</span></div>
        </div>
        <div className="profile-dashboard-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {analysisResult?.extractedSkills?.length ? analysisResult.extractedSkills.map(skill => <span key={skill} className="badge badge-green">{skill}</span>) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Upload a resume or certificate to see your skills.</span>}
          </div>
        </div>
      </section>

      <section className="profile-dashboard-grid">
        <div className="profile-dashboard-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>About</div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{settings.bio || 'Add a short bio to help personalize your career recommendations.'}</p>
        </div>
        <div className="profile-dashboard-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Profile overview</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div><span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>Target roles</span><strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{toRoleList(settings.targetRole).join(', ') || 'Not set'}</strong></div>
            <div><span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>Location</span><strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{profileAddress}</strong></div>
            <div><span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>Member since</span><strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</strong></div>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div className="section-header"><span className="section-title">Career matches</span></div>
        {analysisResult?.recommendedCareers?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
            {analysisResult.recommendedCareers.map(career => <div key={career.name} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{career.name}</span><span className="badge badge-green">{career.match}</span></div>)}
          </div>
        ) : <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your AI career matches will appear here after a scan.</div>}
      </section>

      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div className="section-header"><span className="section-title">Profile details</span></div>
        <div className="profile-dashboard-grid">
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>First name<input value={settings.firstName || ''} onChange={e => persistProfileChanges({ firstName: e.target.value })} autoComplete="given-name" style={{ width: '100%', marginTop: 7, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} /></label>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Last name<input value={settings.lastName || ''} onChange={e => persistProfileChanges({ lastName: e.target.value })} autoComplete="family-name" style={{ width: '100%', marginTop: 7, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} /></label>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Target roles<div style={{ marginTop: 7 }}><DashboardMultiSelect values={toRoleList(settings.targetRole)} onChange={value => persistProfileChanges({ targetRole: value })} placeholder="Select one or more roles" options={TARGET_ROLE_SUGGESTIONS.map(role => ({ value: role, label: role }))} /></div><span style={{ display: 'block', marginTop: 5, fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>Choose as many roles as apply.</span></label>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Municipality / City<div style={{ marginTop: 7 }}><DashboardSelect value={settings.municipality || ''} onChange={value => persistProfileChanges({ municipality: value, barangay: '' })} placeholder="Select municipality or city" options={PANGASINAN_LOCATIONS.map(item => ({ value: item.name, label: item.name }))} /></div></label>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Barangay<div style={{ marginTop: 7 }}><DashboardSelect value={settings.barangay || ''} onChange={value => persistProfileChanges({ barangay: value })} placeholder={settings.municipality ? 'Select barangay' : 'Choose municipality first'} disabled={!settings.municipality} options={barangays.map(name => ({ value: name, label: name }))} /></div></label>
          <label className="profile-dashboard-span" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Street, No., Blk., Lot<input value={settings.streetAddress || ''} onChange={e => persistProfileChanges({ streetAddress: e.target.value })} placeholder="House no., street, block and lot" style={{ width: '100%', marginTop: 7, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} /></label>
          <label className="profile-dashboard-span" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Bio<textarea value={settings.bio || ''} onChange={e => persistProfileChanges({ bio: e.target.value })} placeholder="Tell us about yourself..." rows={4} style={{ width: '100%', marginTop: 7, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', resize: 'vertical' }} /></label>
        </div>
        <datalist id="target-role-suggestions">{TARGET_ROLE_SUGGESTIONS.map(role => <option key={role} value={role} />)}</datalist>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}><button className="btn-primary" style={{ height: 42, padding: '0 20px', fontSize: 13 }} onClick={saveProfileSettings}>Save profile</button></div>
      </section>
    </div>
  );

  const renderCareerPathsView = () => {
    if (!analysisResult && !careerPathResult) {
      return (
        <div className="career-path-view">
          <div style={{ background: 'var(--bg-surface)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Career Matches Yet</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Upload your resume or certificates so our AI can analyze your skills and recommend career paths with match percentages.
          </p>
          <button className="btn-primary" style={{ height: 44, padding: '0 20px', fontSize: 14 }} onClick={() => resumeInputRef.current?.click()}>
            <PlusIcon /> Upload Resume to Get Matches
          </button>
          </div>
        </div>
      );
    }

    return (
      <div className="career-path-view">
        <DashboardViewHero label="YOUR CAREER PATH" count={`${careerDisplayRows.length} MATCHES`} description={(analysisResult || careerPathResult).summary || 'Compare career directions from your uploaded evidence, then choose the skills and learning steps that move you forward.'}>
          Make the next <em>useful move.</em>
        </DashboardViewHero>
        {/* Career Table */}
        <div className="table-container">
          <div className="table-toolbar">
            <div className="breadcrumb">
              <span>Home</span><ChevronRight />
              <span className="breadcrumb-sep">Career Analysis</span><ChevronRight />
              <span className="breadcrumb-current">All Matches</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Career Name</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Skills Gap</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const realIndex = careerDisplayRows.indexOf(row);
                return (
                  <tr key={row.name} className={activeRow === realIndex ? 'active-row' : ''} onClick={() => { setActiveRow(realIndex); setShowRightPanel(true); }}>
                    <td>
                      <div className="td-name">
                        <div className="td-icon" style={{ background: row.type === 'folder' ? 'var(--accent-light)' : 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          {row.type === 'folder' ? <FolderIcon color="var(--accent)" /> : <FileIcon />}
                        </div>
                        {row.name}
                      </div>
                    </td>
                    <td><span className={`badge ${row.match >= '80%' ? 'badge-green' : row.match >= '65%' ? 'badge-blue' : 'badge-muted'}`}>{row.match}</span></td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.status}</span></td>
                    <td>{row.skills} skills</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.modified}</td>
                    <td><button className="row-menu-btn"><MoreIcon /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSkillsGapView = () => {
    if (!analysisResult) {
      return (
        <div style={{ background: 'var(--bg-surface)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Skills Data Yet</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Upload your resume so our AI can identify your current skills and show you exactly what you need to learn for your target career.
          </p>
          <button className="btn-primary" style={{ height: 44, padding: '0 20px', fontSize: 14 }} onClick={() => resumeInputRef.current?.click()}>
            Upload Resume to Analyze Skills
          </button>
        </div>
      );
    }

    // Map a skill name to YouTube channels & free platforms
    const getSkillResources = (skill) => {
      const s = skill.toLowerCase();
      if (s.includes('react') || s.includes('web') || s.includes('html') || s.includes('css') || s.includes('javascript') || s.includes('frontend')) {
        return { category: 'technology', channels: ['Traversy Media', 'Web Dev Simplified', 'Kevin Powell'], platform: 'freeCodeCamp', platformUrl: 'https://www.freecodecamp.org', ytQuery: skill + ' tutorial for beginners' };
      }
      if (s.includes('python') || s.includes('node') || s.includes('programming') || s.includes('backend') || s.includes('sql') || s.includes('database')) {
        return { category: 'technology', channels: ['Programming with Mosh', 'freeCodeCamp', 'Tech With Tim'], platform: 'CS50 (Harvard Free)', platformUrl: 'https://cs50.harvard.edu/x', ytQuery: skill + ' full course' };
      }
      if (s.includes('account') || s.includes('bookkeep') || s.includes('finance') || s.includes('tax') || s.includes('audit') || s.includes('payroll')) {
        return { category: 'business', channels: ['Accounting Stuff', 'Edspira', 'The Financial Controller'], platform: 'Coursera (Audit Free)', platformUrl: 'https://www.coursera.org', ytQuery: skill + ' tutorial Philippines' };
      }
      if (s.includes('design') || s.includes('figma') || s.includes('photoshop') || s.includes('illustrat') || s.includes('ui') || s.includes('ux')) {
        return { category: 'creative', channels: ['DesignCourse', 'Flux Academy', 'AJ&Smart'], platform: 'Canva Design School (Free)', platformUrl: 'https://www.canva.com/learn', ytQuery: skill + ' tutorial 2024' };
      }
      if (s.includes('weld') || s.includes('electrical') || s.includes('plumb') || s.includes('mason') || s.includes('carpent') || s.includes('hvac') || s.includes('refriger')) {
        return { category: 'trades', channels: ['The Engineering Mindset', 'Sparky Channel', 'HVAC School'], platform: 'e-TESDA Online (Free)', platformUrl: 'https://e-tesda.gov.ph', ytQuery: skill + ' step by step guide' };
      }
      if (s.includes('cook') || s.includes('baking') || s.includes('pastry') || s.includes('bartend') || s.includes('food')) {
        return { category: 'hospitality', channels: ['Joshua Weissman', 'Chef John', 'Nino\'s Home'], platform: 'e-TESDA Online (Free)', platformUrl: 'https://e-tesda.gov.ph', ytQuery: skill + ' tutorial for beginners' };
      }
      if (s.includes('care') || s.includes('health') || s.includes('medical') || s.includes('nursing') || s.includes('first aid') || s.includes('pharmac') || s.includes('infection') || s.includes('clinical') || s.includes('patient') || s.includes('vital') || s.includes('medicat') || s.includes('anatom')) {
        return { category: 'healthcare', channels: ['RegisteredNurseRN', 'Ninja Nerd', 'Osmosis'], platform: 'OpenLearn Health', platformUrl: 'https://www.open.edu/openlearn/health-sports-psychology/free-courses', ytQuery: skill + ' nursing healthcare tutorial' };
      }
      if (s.includes('farm') || s.includes('agri') || s.includes('crop') || s.includes('livestock') || s.includes('fish') || s.includes('food processing')) {
        return { category: 'agriculture', channels: ['Agriculture Academy', 'Farm Learning'], platform: 'TESDA Online (Free)', platformUrl: 'https://e-tesda.gov.ph', ytQuery: skill + ' training Philippines' };
      }
      if (s.includes('tour') || s.includes('travel') || s.includes('hotel') || s.includes('housekeep') || s.includes('front office')) {
        return { category: 'hospitality', channels: ['Hospitality School', 'Tourism Academy'], platform: 'TESDA Online (Free)', platformUrl: 'https://e-tesda.gov.ph', ytQuery: skill + ' hospitality training' };
      }
      if (s.includes('beauty') || s.includes('hair') || s.includes('nail') || s.includes('makeup') || s.includes('wellness')) {
        return { category: 'beauty', channels: ['Sam Villa Hair Tutorials', 'Nail Career Education'], platform: 'TESDA Online (Free)', platformUrl: 'https://e-tesda.gov.ph', ytQuery: skill + ' tutorial for beginners' };
      }
      if (s.includes('sales') || s.includes('entrepreneur') || s.includes('business') || s.includes('market') || s.includes('customer service')) {
        return { category: 'business', channels: ['HubSpot Academy', 'Google Career Certificates'], platform: 'Coursera (Audit Free)', platformUrl: 'https://www.coursera.org', ytQuery: skill + ' course for beginners' };
      }
      return { category: 'general', channels: ['Khan Academy', 'TED-Ed'], platform: 'OpenLearn (Free)', platformUrl: 'https://www.open.edu/openlearn/', ytQuery: skill + ' course for beginners' };
    };

    const onlineLearningChannels = [
      { name: 'freeCodeCamp', category: 'technology', handle: '@freecodecamp', subscribers: '9.5M subs', tag: 'Web & Programming', badge: 'Free', url: 'https://www.youtube.com/@freecodecamp', desc: 'Full-length courses on HTML, CSS, JavaScript, Python, React, SQL and more — completely free.' },
      { name: 'Traversy Media', category: 'technology', handle: '@TraversyMedia', subscribers: '2.2M subs', tag: 'Web Dev', badge: 'Free', url: 'https://www.youtube.com/@TraversyMedia', desc: 'Practical web development tutorials covering modern frameworks, APIs, and full-stack projects.' },
      { name: 'Programming with Mosh', category: 'technology', handle: '@programmingwithmosh', subscribers: '4.2M subs', tag: 'Programming', badge: 'Free', url: 'https://www.youtube.com/@programmingwithmosh', desc: 'High-quality tutorials on Python, JavaScript, C#, React, Node.js and backend development.' },
      { name: 'Accounting Stuff', category: 'business', handle: '@AccountingStuff', subscribers: '800K subs', tag: 'Finance & Accounting', badge: 'Free', url: 'https://www.youtube.com/@AccountingStuff', desc: 'Clear, concise accounting and bookkeeping lessons — perfect for TESDA Bookkeeping NC III learners.' },
      { name: 'The Engineering Mindset', category: 'trades', handle: '@TheEngineeringMindset', subscribers: '3.2M subs', tag: 'Electrical & HVAC', badge: 'Free', url: 'https://www.youtube.com/@TheEngineeringMindset', desc: 'Electrical, HVAC, and plumbing engineering concepts explained visually for technicians.' },
      { name: 'DesignCourse', category: 'creative', handle: '@DesignCourse', subscribers: '1.1M subs', tag: 'UI/UX & Design', badge: 'Free', url: 'https://www.youtube.com/@DesignCourse', desc: 'Graphic design, UI/UX, and Figma tutorials covering portfolio-ready skills for creatives.' },
      { name: 'Joshua Weissman', category: 'hospitality', handle: '@JoshuaWeissman', subscribers: '9.7M subs', tag: 'Cooking & Food', badge: 'Free', url: 'https://www.youtube.com/@JoshuaWeissman', desc: 'Professional cooking techniques, plating, and culinary skills — great for Cookery NC II learners.' },
      { name: 'ChrisFix', category: 'trades', handle: '@ChrisFix', subscribers: '10M subs', tag: 'Automotive', badge: 'Free', url: 'https://www.youtube.com/@ChrisFix', desc: 'Step-by-step automotive repair and maintenance tutorials ideal for Automotive Servicing NC learners.' },
      { name: 'RegisteredNurseRN', category: 'healthcare', handle: '@RegisteredNurseRN', subscribers: '1.5M subs', tag: 'Healthcare', badge: 'Free', url: 'https://www.youtube.com/@RegisteredNurseRN', desc: 'Nursing and healthcare skills, NCLEX prep, and patient care — supports Caregiving NC II learners.' },
      { name: 'Ninja Nerd', category: 'healthcare', handle: '@NinjaNerdOfficial', subscribers: 'Healthcare lessons', tag: 'Clinical Foundations', badge: 'Free', url: 'https://www.youtube.com/@NinjaNerdOfficial', desc: 'Detailed lessons on anatomy, pharmacology, infection control, and clinical concepts.' },
      { name: 'Osmosis', category: 'healthcare', handle: '@osmosis', subscribers: 'Healthcare lessons', tag: 'Medical Learning', badge: 'Free', url: 'https://www.youtube.com/@osmosis', desc: 'Short medical and nursing learning videos for pharmacology and patient-care concepts.' },
    ];

    const activeLearningCategories = new Set(selectedRow.skillsList.map(skill => getSkillResources(skill).category));
    const relevantLearningChannels = onlineLearningChannels.filter(channel => activeLearningCategories.has(channel.category));

    const freePlatforms = [...new Map(selectedRow.skillsList.map((skill) => {
      const resource = getSkillResources(skill);
      return [resource.platform, {
        name: resource.platform,
        desc: `Learning resources matched to ${skill}.`,
        url: resource.platformUrl,
        badge: 'Matched',
        highlight: true,
      }];
    })).values()];

    return (
      <div className="skills-gap-view">
        <DashboardViewHero label="SKILLS GAP" description="Compare the skills you already have with the skills needed for your recommended career direction." >
          Build the skills <em>that move you forward.</em>
        </DashboardViewHero>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Skills You Have */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Skills You Have ({analysisResult.extractedSkills.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysisResult.extractedSkills.length === 0 && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                  No clear skills detected yet. Start with TESDA recommendations below.
                </div>
              )}
              {analysisResult.extractedSkills.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--accent-light)', borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Skills with YouTube resources */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#b9583f', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              Recommended Next Skills ({selectedRow.skillsList.length}) · 📺 With Online Resources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedRow.skillsList.map(s => {
                const res = getSkillResources(s);
                const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(res.ytQuery)}`;
                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#b9583f', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{res.category} learning</span>
                    </div>
                    <div style={{ paddingTop: 6, borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span>📺</span>
                        {res.channels.slice(0, 2).map(ch => (
                          <a key={ch} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ch + ' ' + s)}`} target="_blank" rel="noreferrer"
                            style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', textDecoration: 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#FF0000'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}>
                            {ch}
                          </a>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a href={ytUrl} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FF0000'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#FF0000'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                          ▶ Watch
                        </a>
                        <a href={res.platformUrl} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                          🌐 {res.platform}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── ONLINE & SELF-LEARNING HUB ── */}
        <div style={{ marginTop: 24, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📺</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Resources matched to your recommended skills</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Only learning resources related to the skills detected from this user’s résumé and certificates are shown.</div>
              </div>
            </div>
            <a href={getSkillResources(selectedRow.skillsList[0] || '').platformUrl} target="_blank" rel="noreferrer" className="btn-primary"
              style={{ height: 32, padding: '0 14px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              🌐 Open matched learning site
            </a>
          </div>

          {/* YouTube Channels — 3-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {relevantLearningChannels.map(ch => (
              <div key={ch.name}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF0000'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-blue" style={{ fontSize: 10 }}>{ch.tag}</span>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>{ch.badge}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>📺 {ch.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{ch.handle} · {ch.subscribers}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ch.desc}</div>
                </div>
                <a href={ch.url} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FF0000'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                  ▶ Open Channel
                </a>
              </div>
            ))}
          </div>

          {/* Free Platforms strip */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Free Self-Study Platforms</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {freePlatforms.map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noreferrer"
                  style={{ background: p.highlight ? 'var(--accent-light)' : 'var(--bg-card)', border: p.highlight ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4, transition: 'transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</span>
                    <span className={`badge ${p.highlight ? 'badge-green' : 'badge-muted'}`} style={{ fontSize: 9 }}>{p.badge}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{p.desc}</div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {analysisResult.learningRecommendations?.length > 0 && (
          <section className="ai-learning-plan">
            <div className="section-header"><span className="section-title">Your AI Learning Plan</span></div>
            <p>Built from your résumé and certificates. We only show a recommendation when the AI can point to supporting evidence found in your uploaded files.</p>
            <div className="ai-learning-grid">
              {analysisResult.learningRecommendations.map((recommendation, index) => {
                const isTesda = recommendation.type === 'TESDA';
                const isSelfLearning = recommendation.type === 'Self-learning';
                const site = getLearningSite(recommendation);
                const searchTerms = recommendation.searchTerms || recommendation.title;
                const destination = isTesda
                  ? TESDA_PROGRAM_DIRECTORY_URL
                  : isSelfLearning
                    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`
                    : `${site.url}${site.name === 'Coursera' ? `search?query=${encodeURIComponent(searchTerms)}` : ''}`;
                const label = isTesda ? 'Find a TESDA offering' : isSelfLearning ? 'Search self-learning resources' : `Explore on ${site.name}`;
                return <article key={`${recommendation.title}-${index}`} className="ai-learning-card">
                  <span className={`badge ${isTesda ? 'badge-green' : isSelfLearning ? 'badge-muted' : 'badge-blue'}`}>{recommendation.type}</span>
                  <h3>{recommendation.title}</h3>
                  <p>{recommendation.reason || 'Recommended from your uploaded career evidence.'}</p>
                  <span className="ai-learning-evidence">Based on: {toDisplayList(recommendation.evidence).join(', ') || 'uploaded résumé or certificate evidence'}</span>
                  <span className="ai-learning-site">Recommended site: {isSelfLearning ? 'YouTube search' : site.name}</span>
                  <a href={destination} target="_blank" rel="noreferrer">{label} ↗</a>
                </article>;
              })}
            </div>
          </section>
        )}

        {/* AI Recommended Career + Trainings */}
        <div style={{ marginTop: 20 }}>
          <div className="section-header"><span className="section-title">AI Recommended Careers & Trainings</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {analysisResult.recommendedCareers.map(c => (
              <div key={c.name} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', flex: '1 1 200px', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-green">{c.match} match</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Recommended for you</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {selectedRow.trainings.map(t => {
              const program = TESDA_PROGRAMS.find(p => p.name === t);
              return (
                <div key={t} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', flex: '1 1 280px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{t}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {program && <span className="badge badge-green">{program.type}</span>}
                    {program && <span className="badge badge-blue">{program.level}</span>}
                    {program && <span className="badge badge-muted">{program.duration}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTrainingView = () => (
    <div className="training-view">
      <div className="training-controls">
        <DashboardViewHero label="TRAINING" count={`${TESDA_PROGRAMS.length} PROGRAMS`} description="Browse TESDA qualifications across all sectors. Use the official directory to confirm current schools and offerings.">
          Learn something <em>useful next.</em>
        </DashboardViewHero>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <a href={TESDA_APPLY_URL} target="_blank" rel="noreferrer" className="btn-primary" style={{ height: 38, padding: '0 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>How to apply through TESDA</a>
          <a href={TESDA_PROGRAM_DIRECTORY_URL} target="_blank" rel="noreferrer" className="btn-secondary" style={{ height: 38, padding: '0 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>Find a registered school</a>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', flex: '1 1 200px', maxWidth: 320 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0, opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search programs..." value={trainingSearch} onChange={e => setTrainingSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', width: '100%' }} />
          </div>
          <select value={trainingSector} onChange={e => setTrainingSector(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-body)', height: 36 }}>
            <option value="All">All Sectors</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={trainingLevel} onChange={e => setTrainingLevel(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-body)', height: 36 }}>
            <option value="All">All Levels</option>
            <option value="SHS">SHS (Senior High)</option>
            <option value="College">College</option>
          </select>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          Showing {filteredPrograms.length} of {TESDA_PROGRAMS.length} programs
        </div>
      </div>

      {/* Programs Table */}
      <div className="table-container training-table-container">
        <table>
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Type</th>
              <th>Sector</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Apply</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((p, i) => (
              <tr key={i}>
                <td><span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span></td>
                <td><span className={`badge ${p.type.includes('IV') ? 'badge-green' : p.type.includes('III') ? 'badge-blue' : 'badge-muted'}`}>{p.type}</span></td>
                <td style={{ fontSize: 12 }}>{p.sector}</td>
                <td><span className={`badge ${p.level === 'College' ? 'badge-blue' : 'badge-green'}`}>{p.level}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.duration}</td>
                <td><a href={TESDA_APPLY_URL} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>Apply ↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderJobsView = () => {
    const targetRole = settings.targetRole || analysisResult?.recommendedCareers?.[0]?.name || 'your preferred role';
    const skills = analysisResult?.extractedSkills?.slice(0, 4) || [];
    const aiJobRecommendations = analysisResult?.jobRecommendations || [];
    const placementSteps = [
      { title: 'Get your AI job direction', detail: `Your search is focused on ${targetRole}. ${skills.length ? `Use your ${skills.join(', ')} skills when you create your jobseeker profile.` : 'Complete an AI scan to make the recommendation more specific.'}`, action: 'Update job direction', onClick: () => setSidebarActive('Profile') },
      { title: 'Find verified openings on PhilJobNet', detail: 'Search the official DOLE job-matching portal and apply to verified openings that fit your profile.', action: 'Browse PhilJobNet', href: 'https://philjobnet.gov.ph/job-vacancies/' },
      { title: 'Request a PESO job match', detail: 'Visit your nearest PESO for free career coaching, referral and placement support, and job-fair information.', action: 'Open PESO services', href: 'https://peis.philjobnet.gov.ph/register.aspx' },
    ];

    return (
      <>
        <DashboardViewHero label="PESO JOBS" description="Explore job directions from your uploaded evidence and connect with official PESO and PhilJobNet services.">
          Find your next <em>opening.</em>
        </DashboardViewHero>
        {aiJobRecommendations.length > 0 && (
          <section className="ai-job-plan">
            <div className="section-header"><span className="section-title">AI Job Matches for You</span></div>
            <p>These are job directions, not claimed vacancies. Search the official services below to see currently available work.</p>
            <div className="ai-job-grid">
              {aiJobRecommendations.map((job, index) => (
                <article key={`${job.title}-${index}`} className="ai-job-card">
                  <span className="badge badge-blue">AI job match</span>
                  <h3>{job.title}</h3>
                  <span className="ai-job-salary">Expected monthly salary: {job.expectedMonthlySalary || 'Not available for this role yet'}</span>
                  <p>{job.reason || 'Matched from your uploaded skills and qualifications.'}</p>
                  {toDisplayList(job.workplaces).length > 0 && <span className="ai-job-workplaces">Where to look: {toDisplayList(job.workplaces).join(', ')}</span>}
                  <span className="ai-job-evidence">Based on: {toDisplayList(job.evidence).join(', ')}</span>
                  <span className="ai-job-search">Search: {job.searchTerms || job.title}</span>
                  <a href="https://philjobnet.gov.ph/job-vacancies/" target="_blank" rel="noreferrer">Search PhilJobNet ↗</a>
                </article>
              ))}
            </div>
          </section>
        )}
        <div className="peso-placement-grid">
          {placementSteps.map(step => (
            <article key={step.title} className="peso-placement-card">
              <span className="badge badge-green">PESO pathway</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
              {step.href ? <a href={step.href} target="_blank" rel="noreferrer" className="btn-primary">{step.action} ↗</a> : <button className="btn-primary" onClick={step.onClick}>{step.action}</button>}
            </article>
          ))}
        </div>
      </>
    );
  };

  if (sidebarActive === 'Profile') {
    return (
      <div className="dashboard-profile-shell" style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
        <header className="field-header dashboard-profile-header" style={{ height: 68, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <BrandLogo className="navbar-brand-logo" />
          <button type="button" className="btn-secondary" style={{ height: 38, padding: '0 14px', fontSize: 13 }} onClick={() => setSidebarActive('AI Scanner')}>← Go back to dashboard</button>
        </header>
        <main style={{ width: 'min(100% - 32px, 1040px)', margin: '0 auto', padding: '32px 0 56px' }}>
          {renderProfileView()}
          <input ref={profilePhotoInputRef} type="file" accept="image/*" hidden onChange={handleProfilePhotoUpload} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell field-guide field-guide--landing">
      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-topbar" style={{ position: 'relative' }}>
        <BrandLogo className="navbar-brand-logo" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="topbar-icon-btn" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} style={{ position: 'relative', width: 36, height: 36 }}>
            <BellIcon />
            {unreadCount > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#b9583f' }} />}
          </button>
          <button style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}>
            {renderAvatar(32, 11)}
          </button>
        </div>
        {showNotifications && renderNotificationsMenu(true)}
        {showProfile && renderProfileMenu(true)}
      </div>
      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* Top bar */}
        <header className="topbar field-header dashboard-header">
          <BrandLogo className="navbar-brand-logo navbar-brand-logo--topbar" />
          <div className="field-header-note dashboard-header-note">CAREER INTELLIGENCE / PH</div>
          <div className="topbar-nav">
            {sidebarItems.map(t => (
              <button key={t.label} className={`topbar-nav-item${sidebarActive === (t.tab || t.label) ? ' active' : ''}`} onClick={() => t.action ? t.action() : setSidebarActive(t.tab || t.label)}>
                {sidebarActive === (t.tab || t.label) && t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="topbar-search dashboard-header-search">
            <SearchIcon />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', width: '100%' }} />
          </div>
          <div className="topbar-actions" style={{ position: 'relative' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button className="topbar-icon-btn" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} style={{ position: 'relative' }}>
                <BellIcon />
                {unreadCount > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#b9583f' }} />}
              </button>
              {showNotifications && renderNotificationsMenu()}
            </div>

            <button className="theme-toggle" onClick={toggle} style={{ width: 32, height: 32 }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Profile Avatar + Dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="dashboard-profile-trigger" title={userName} onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}>
                <span>{userName} / OPEN DASHBOARD</span>
              </button>
              {showProfile && renderProfileMenu()}
            </div>

            {/* Hidden file inputs */}
            <input ref={resumeInputRef} data-category="resume" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple hidden onChange={handleFilesUpload} />
            <input ref={certInputRef} data-category="certificate" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple hidden onChange={handleFilesUpload} />
            <input ref={profilePhotoInputRef} type="file" accept="image/*" hidden onChange={handleProfilePhotoUpload} />
          </div>
        </header>

        {/* Content */}
        <div className="content-scroll">
          {renderContent()}
        </div>
      </div>

      {careerChatOpen && createPortal(<CareerPathChat messages={careerPathMessages} prompt={careerPathPrompt} loading={careerPathLoading} error={careerPathError} isExpanded={careerChatExpanded} onPromptChange={event => setCareerPathPrompt(event.target.value)} onRequest={requestCareerPath} onToggleExpand={() => setCareerChatExpanded(current => !current)} onClose={() => { setCareerChatOpen(false); setCareerChatExpanded(false); }} />, document.body)}
      {!careerChatExpanded && <button type="button" className="career-path-launcher" onClick={() => setCareerChatOpen(true)} aria-label="Open Career Path AI chat" title="Open Career Path AI chat" style={{ position: 'fixed', right: 24, bottom: 24, width: 58, height: 58, borderRadius: '50%', border: '2px solid var(--bg-page)', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', zIndex: 150, cursor: 'pointer', boxShadow: '0 10px 28px rgba(0, 0, 0, 0.3)', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>AI</button>}

      {/* ── RIGHT PANEL (Career Paths view only, after analysis) ── */}
      {false && showRightPanel && sidebarActive === 'Career Paths' && analysisResult && (
        <div className="right-panel">
          <div className="right-panel-header">
            <div>
              <div className="right-panel-title">{selectedRow.name}</div>
              <div className="detail-meta">{selectedRow.match} match · {selectedRow.skills} skills gap</div>
            </div>
            <button className="right-panel-close" onClick={() => setShowRightPanel(false)}>✕</button>
          </div>

          <div className="detail-tabs">
            {['Activity', 'Skills', 'Training'].map(t => (
              <button key={t} className={`detail-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          <div className="right-panel-body">
            {activeTab === 'Activity' && (
              <>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tags</div>
                  <div className="detail-tags">
                    {selectedRow.tags.map(tag => (
                      <span key={tag} className={`badge ${tag === 'TESDA' ? 'badge-green' : 'badge-blue'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Career Readiness</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700 }} className="grad-text">{parseInt(selectedRow.match)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: selectedRow.match, background: 'var(--grad-primary)', borderRadius: 3 }} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Skills' && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Missing Skills ({selectedRow.skillsList.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedRow.skillsList.map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#b9583f' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Training' && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommended Trainings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedRow.trainings.map(t => {
                    const prog = TESDA_PROGRAMS.find(p => p.name === t);
                    return (
                      <div key={t} style={{ padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{t}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {prog && <span className="badge badge-green" style={{ fontSize: 9 }}>{prog.type}</span>}
                          {prog && <span className="badge badge-muted" style={{ fontSize: 9 }}>{prog.duration}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* PROFILE VIEW MODAL */}
      {showProfileView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowProfileView(false)}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>My Profile</div>
              <button onClick={() => setShowProfileView(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Content */}
            <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Avatar + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {renderAvatar(64, 22)}
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{userName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{userEmail}</div>
                  {isAdmin && <span className="badge badge-blue" style={{ marginTop: 6, display: 'inline-block' }}>Admin</span>}
                  <button onClick={() => profilePhotoInputRef.current?.click()} style={{ marginTop: 10, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Change Profile Picture</button>
                </div>
              </div>

              {/* Bio */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Bio</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {profileSettings?.bio || settings.bio || 'No bio yet. Go to Settings to add one.'}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Location</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{profileAddress}</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Member Since</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Readiness Score</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }} className="grad-text">{analysisResult?.readinessScore || '—'}/100</div>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Skills Found</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{analysisResult?.extractedSkills?.length || 0}</div>
                </div>
              </div>

              {/* Skills */}
              {analysisResult?.extractedSkills?.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>My Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysisResult.extractedSkills.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Recommended Careers */}
              {analysisResult?.recommendedCareers?.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Top Career Matches</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analysisResult.recommendedCareers.map(c => (
                      <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
                        <span className="badge badge-green">{c.match}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!analysisResult && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Upload your resume to see your skills and career matches here.</div>
                  <button className="btn-primary" style={{ height: 40, padding: '0 20px', fontSize: 13 }} onClick={() => { setShowProfileView(false); resumeInputRef.current?.click(); }}>Upload Resume</button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setShowProfileView(false); setShowSettings(true); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Edit Profile</button>
              <button onClick={() => setShowProfileView(false)} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13 }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10050 }} onClick={() => setShowSettings(false)}>
          <div style={{ background: 'color-mix(in srgb, var(--bg-surface) 94%, transparent)', border: '1px solid var(--border)', borderRadius: 20, width: 'min(620px, calc(100vw - 32px))', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</div>
              <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Jetstream profile information */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Profile</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="profile-settings-name-grid">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>First Name</label>
                      <input type="text" value={settings.firstName || ''} onChange={e => setSettings(prev => ({ ...prev, firstName: e.target.value }))} autoComplete="given-name" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Last Name</label>
                      <input type="text" value={settings.lastName || ''} onChange={e => setSettings(prev => ({ ...prev, lastName: e.target.value }))} autoComplete="family-name" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Bio</label>
                    <textarea value={settings.bio} onChange={e => setSettings(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Municipality / City</label>
                    <select value={settings.municipality || ''} onChange={e => setSettings(prev => ({ ...prev, municipality: e.target.value, barangay: '' }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}>
                      <option value="">Select municipality or city</option>
                      {PANGASINAN_LOCATIONS.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Barangay</label>
                    <select value={settings.barangay || ''} onChange={e => setSettings(prev => ({ ...prev, barangay: e.target.value }))} disabled={!settings.municipality} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}>
                      <option value="">{settings.municipality ? 'Select barangay' : 'Choose municipality first'}</option>
                      {barangays.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Street, No., Blk., Lot</label>
                    <input type="text" value={settings.streetAddress || ''} onChange={e => setSettings(prev => ({ ...prev, streetAddress: e.target.value }))} placeholder="House no., street, block and lot" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Target Role</label>
                    <DashboardMultiSelect values={toRoleList(settings.targetRole)} onChange={value => setSettings(prev => ({ ...prev, targetRole: value }))} placeholder="Select one or more roles" options={TARGET_ROLE_SUGGESTIONS.map(role => ({ value: role, label: role }))} />
                  </div>
                </div>
                <datalist id="target-role-suggestions-settings">{TARGET_ROLE_SUGGESTIONS.map(role => <option key={role} value={role} />)}</datalist>
              </div>

              {/* Notifications Section */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Notifications</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                    { key: 'careerAlerts', label: 'Career Match Alerts', desc: 'Get notified of new career matches' },
                    { key: 'trainingReminders', label: 'Training Reminders', desc: 'Reminders for TESDA courses' },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                      <button onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: settings[item.key] ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings[item.key] ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Section */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Privacy</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Profile Visibility</label>
                    <select value={settings.profileVisibility} onChange={e => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}>
                      <option value="public">Public — Anyone can see your profile</option>
                      <option value="connections">Connections Only</option>
                      <option value="private">Private — Only you</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Language</label>
                    <select value={settings.language} onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}>
                      <option value="en">English</option>
                      <option value="fil">Filipino (Tagalog)</option>
                      <option value="ceb">Cebuano</option>
                      <option value="ilo">Ilocano</option>
                    </select>
                  </div>
                </div>
              </div>

              <JetstreamSecurityPanel />
              <LoginActivity />

              {/* Appearance */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Appearance</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { if (theme === 'dark') toggle(); }} style={{ flex: 1, padding: '12px', borderRadius: 10, border: theme === 'light' ? '2px solid var(--accent)' : '1px solid var(--border)', background: '#F0FAF7', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>☀️</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#080F1A' }}>Light</div>
                  </button>
                  <button onClick={() => { if (theme === 'light') toggle(); }} style={{ flex: 1, padding: '12px', borderRadius: 10, border: theme === 'dark' ? '2px solid var(--accent)' : '1px solid var(--border)', background: '#0C1A1C', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🌙</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#E8F8F4' }}>Dark</div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#b9583f', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Danger Zone</div>
                <div style={{ padding: '14px 16px', background: 'rgba(232,93,36,0.05)', border: '1px solid rgba(232,93,36,0.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Delete Account</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Permanently delete your account and all associated data. This action cannot be undone.</div>
                  <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #b9583f', background: 'transparent', color: '#b9583f', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete My Account</button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowSettings(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveProfileSettings} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <div className="mobile-bottom-nav">
        {sidebarItems.map(item => (
          <button
            key={item.label}
            className={`mobile-bottom-nav-item${sidebarActive === item.label ? ' active' : ''}`}
            onClick={() => item.action ? item.action() : setSidebarActive(item.label)}
            title={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}



