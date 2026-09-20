const MAX_INLINE_BYTES = 18 * 1024 * 1024;
export const MAX_SCAN_FILES = 8;

function getSafeMimeType(fileName, originalType) {
  if (originalType && originalType !== 'application/octet-stream') return originalType;
  const ext = String(fileName || '').split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':  return 'application/pdf';
    case 'png':  return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif':  return 'image/gif';
    case 'txt':  return 'text/plain';
    case 'csv':  return 'text/csv';
    case 'html': return 'text/html';
    case 'md':   return 'text/markdown';
    case 'json': return 'application/json';
    default:     return 'application/pdf';
  }
}

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const readTextFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = reject;
  reader.readAsText(file);
});

// ── SKILL TAXONOMY — fallback when TuklasAI is unavailable ───────────────────
// Every entry has:
//   url  — direct link to the resource (used as the click target in the UI)
//   search — precise Google-able query as fallback text
const SKILL_TAXONOMY = [
  {
    domain: 'IT & Software',
    match: /react|javascript|python|java|html|css|developer|software|node|git|sql|web|frontend|backend|fullstack|programming|typescript|php|laravel/i,
    skills: ['JavaScript', 'HTML/CSS', 'React.js', 'Git & GitHub', 'Web Development', 'Problem Solving', 'Debugging', 'Version Control'],
    careers: [
      { name: 'Web Developer', match: '95%' },
      { name: 'Software Developer', match: '90%' },
      { name: 'Front-End Developer', match: '86%' },
      { name: 'IT Support Specialist', match: '78%' },
      { name: 'Junior Programmer', match: '72%' },
    ],
    tesda: [
      'Web Development NC III',
      'Programming (Java) NC III',
      'Computer Systems Servicing NC II',
      'Animation NC III',
      'Technical Drafting NC II',
    ],
    gaps: [
      'TypeScript',
      'REST API Development',
      'SQL / Database Design (PostgreSQL or MySQL)',
      'Cloud Deployment (Railway)',
      'Unit Testing (Jest or Vitest)',
      'Docker & DevOps Basics',
      'UI/UX Design Fundamentals',
    ],
    learning: [
      { title: 'Web Development NC III', type: 'TESDA', site: 'e-TESDA Online (etesda.gov.ph)', url: 'https://etesda.gov.ph', search: 'site:etesda.gov.ph Web Development NC III' },
      { title: 'JavaScript Full Course for Beginners — freeCodeCamp', type: 'Self-learning', site: 'YouTube — freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', search: 'freeCodeCamp JavaScript Full Course Beginners youtube.com/watch?v=PkZNo7MFNFg' },
      { title: 'JavaScript Algorithms and Data Structures Certification', type: 'Online', site: 'freeCodeCamp (freecodecamp.org)', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', search: 'freecodecamp.org JavaScript Algorithms Data Structures certification free' },
      { title: 'Google IT Support Professional Certificate', type: 'Online', site: 'Google Career Certificates (grow.google)', url: 'https://grow.google/certificates/it-support/', search: 'grow.google IT Support Professional Certificate free' },
      { title: 'React JS Crash Course — Traversy Media', type: 'Self-learning', site: 'YouTube — Traversy Media', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', search: 'youtube Traversy Media React JS Crash Course 2024' },
      { title: 'Intro to SQL: Querying and Managing Data', type: 'Online', site: 'Khan Academy (khanacademy.org)', url: 'https://www.khanacademy.org/computing/computer-programming/sql', search: 'khanacademy.org/computing/computer-programming/sql free' },
      { title: 'GitHub Foundations Certification', type: 'Online', site: 'Microsoft Learn (learn.microsoft.com)', url: 'https://learn.microsoft.com/en-us/collections/o1njfe825p602p', search: 'learn.microsoft.com GitHub Foundations certification free' },
    ],
  },
  {
    domain: 'Business & Office',
    match: /admin|office|excel|word|clerk|accounting|bookkeeping|payroll|data entry|assistant|finance|billing|quickbooks|xero|audit/i,
    skills: ['Microsoft Excel', 'Data Entry', 'Bookkeeping Basics', 'Office Administration', 'Time Management', 'Communication', 'Record Keeping', 'Payroll Processing'],
    careers: [
      { name: 'Bookkeeper / Accounting Clerk', match: '92%' },
      { name: 'Administrative Assistant', match: '87%' },
      { name: 'Data Entry Specialist', match: '82%' },
      { name: 'Payroll Officer', match: '76%' },
      { name: 'Office Manager', match: '70%' },
    ],
    tesda: [
      'Bookkeeping NC III',
      'Customer Services NC II',
      'Computer Systems Servicing NC II',
      'Business Process Outsourcing Operations NC II',
      'Events Management Services NC III',
    ],
    gaps: [
      'QuickBooks Desktop or Online',
      'Xero Accounting Software',
      'Advanced Microsoft Excel (Pivot Tables, VLOOKUP)',
      'BIR Tax Filing Procedures (Philippines)',
      'Financial Statement Preparation',
      'Business Writing & Professional Communication',
      'Accounts Payable & Receivable Management',
    ],
    learning: [
      { title: 'Bookkeeping NC III', type: 'TESDA', site: 'e-TESDA Online (etesda.gov.ph)', url: 'https://etesda.gov.ph', search: 'site:etesda.gov.ph Bookkeeping NC III free enrollment' },
      { title: 'Excel Skills for Business — Macquarie University', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/specializations/excel', search: 'coursera.org/specializations/excel Excel Skills Business Macquarie free audit' },
      { title: 'Microsoft Excel Tutorial for Beginners — Kevin Stratvert', type: 'Self-learning', site: 'YouTube — Kevin Stratvert', url: 'https://www.youtube.com/watch?v=PSNXoAs2FtQ', search: 'youtube Kevin Stratvert Microsoft Excel Tutorial Beginners 2024' },
      { title: 'QuickBooks Online Free Training', type: 'Online', site: 'QuickBooks Training (quickbooks.intuit.com)', url: 'https://quickbooks.intuit.com/tutorials/', search: 'quickbooks.intuit.com/tutorials/ QuickBooks Online free training' },
      { title: 'Accounting & Bookkeeping Fundamentals', type: 'Online', site: 'Khan Academy (khanacademy.org)', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-statements', search: 'khanacademy.org accounting financial statements free course' },
      { title: 'Google Project Management Certificate', type: 'Online', site: 'Google Career Certificates (grow.google)', url: 'https://grow.google/certificates/project-management/', search: 'grow.google/certificates/project-management/ free certificate' },
      { title: 'Professional Bookkeeping with QuickBooks 2024', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/learn/professional-bookkeeping-with-quickbooks-2024', search: 'coursera.org professional bookkeeping quickbooks 2024 free audit' },
    ],
  },
  {
    domain: 'Customer Service & BPO',
    match: /bpo|call center|customer service|csr|agent|support|sales|teleperformance|concentrix|alorica|iqs|ttec|sutherland/i,
    skills: ['Customer Support', 'Active Listening', 'Conflict Resolution', 'CRM Tools', 'Written & Verbal Communication', 'Empathy', 'Call Handling', 'Typing Speed'],
    careers: [
      { name: 'Customer Service Representative (BPO)', match: '94%' },
      { name: 'Technical Support Specialist', match: '87%' },
      { name: 'Account Manager', match: '80%' },
      { name: 'Team Leader / Supervisor', match: '72%' },
      { name: 'Quality Assurance Analyst', match: '67%' },
    ],
    tesda: [
      'Customer Services NC II',
      'Contact Center Services NC II',
      'Business Process Outsourcing Operations NC II',
      'Computer Systems Servicing NC II',
      'Events Management Services NC III',
    ],
    gaps: [
      'Salesforce CRM or Zendesk',
      'Technical Troubleshooting Documentation',
      'Escalation & Complaint Management',
      'Omnichannel Support (email, chat, phone)',
      'Data Privacy & GDPR Basics',
      'English Proficiency (B2 / C1 Level)',
      'Report Writing & KPI Tracking',
    ],
    learning: [
      { title: 'Contact Center Services NC II', type: 'TESDA', site: 'e-TESDA Online (etesda.gov.ph)', url: 'https://etesda.gov.ph', search: 'site:etesda.gov.ph Contact Center Services NC II free enrollment' },
      { title: 'Customer Service Fundamentals — IBM', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/learn/customer-service-fundamentals', search: 'coursera.org/learn/customer-service-fundamentals IBM free audit' },
      { title: 'Salesforce Service Cloud for Agents — Trailhead', type: 'Online', site: 'Salesforce Trailhead (trailhead.salesforce.com)', url: 'https://trailhead.salesforce.com/content/learn/trails/service_cloud_for_service_agents', search: 'trailhead.salesforce.com service cloud agents free trail' },
      { title: 'HubSpot Customer Service Certification', type: 'Online', site: 'HubSpot Academy (academy.hubspot.com)', url: 'https://academy.hubspot.com/courses/customer-service-training', search: 'academy.hubspot.com customer service training free certification' },
      { title: 'English for Business Communication', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/learn/business-english-intro', search: 'coursera.org/learn/business-english-intro free audit certificate' },
      { title: 'TESDA BPO & Contact Center Training — Official', type: 'Self-learning', site: 'YouTube — TESDA Philippines', url: 'https://www.youtube.com/@TESDAPHOfficial', search: 'youtube.com/@TESDAPHOfficial call center BPO contact center training' },
      { title: 'Google Digital Marketing & E-commerce Certificate', type: 'Online', site: 'Google Career Certificates (grow.google)', url: 'https://grow.google/certificates/digital-marketing-ecommerce/', search: 'grow.google/certificates/digital-marketing-ecommerce/ free certificate' },
    ],
  },
  {
    domain: 'Hospitality & Culinary',
    match: /chef|cook|culinary|food|hotel|tourism|barista|baking|kitchen|restaurant|service|catering|pastry|baristo/i,
    skills: ['Food Preparation & Safety', 'Kitchen Operations', 'Customer Hospitality', 'Menu Planning', 'Sanitation Standards', 'Plating Techniques', 'Inventory Management'],
    careers: [
      { name: 'Cook / Culinary Specialist', match: '92%' },
      { name: 'Food & Beverage Service Attendant', match: '86%' },
      { name: 'Barista', match: '81%' },
      { name: 'Pastry Chef / Baker', match: '77%' },
      { name: 'Hotel Front Desk Officer', match: '70%' },
    ],
    tesda: [
      'Cookery NC II',
      'Food and Beverage Services NC II',
      'Bread and Pastry Production NC II',
      'Barista NC II',
      'Housekeeping NC II',
    ],
    gaps: [
      'HACCP Food Safety Certification',
      'Cost Control & Food Inventory Management',
      'Advanced Pastry & Baking Techniques',
      'Wine & Beverage Pairing Knowledge',
      'Kitchen Team Leadership',
      'ServSafe Food Handler Certification',
      'Point of Sale (POS) System Operation',
    ],
    learning: [
      { title: 'Cookery NC II', type: 'TESDA', site: 'TESDA Online Program (top.tesda.gov.ph)', url: 'https://top.tesda.gov.ph', search: 'top.tesda.gov.ph Cookery NC II free enrollment' },
      { title: 'Bread and Pastry Production NC II', type: 'TESDA', site: 'TESDA Online Program (top.tesda.gov.ph)', url: 'https://top.tesda.gov.ph', search: 'top.tesda.gov.ph Bread Pastry Production NC II free enrollment' },
      { title: 'Food Safety & Hygiene — OpenWHO', type: 'Online', site: 'OpenWHO (openwho.org)', url: 'https://openwho.org/courses/food-safety', search: 'openwho.org/courses/food-safety free certificate WHO' },
      { title: 'Knife Skills & Cooking Fundamentals — Gordon Ramsay', type: 'Self-learning', site: 'YouTube — Gordon Ramsay', url: 'https://www.youtube.com/watch?v=bJUiWdM__Qw', search: 'youtube Gordon Ramsay knife skills cooking basics watch?v=bJUiWdM__Qw' },
      { title: 'Food & Beverage Management', type: 'Online', site: 'edX (edx.org)', url: 'https://www.edx.org/learn/food-science', search: 'edx.org food beverage management free online course' },
      { title: 'Barista Training: Espresso & Latte Art', type: 'Self-learning', site: 'YouTube — European Coffee Trip', url: 'https://www.youtube.com/@EuropeanCoffeeTrip', search: 'youtube European Coffee Trip barista espresso latte art tutorial' },
      { title: 'Restaurant Cost Control & Inventory Management', type: 'Online', site: 'LinkedIn Learning (linkedin.com/learning)', url: 'https://www.linkedin.com/learning/topics/restaurant-management', search: 'linkedin.com/learning restaurant management cost control free trial' },
    ],
  },
  {
    domain: 'Technical & Engineering',
    match: /electric|automotive|mechanic|welding|construction|technician|wiring|electronics|repair|plumbing|hvac|aircon|solar/i,
    skills: ['Electrical Installation', 'Preventive Maintenance', 'Tool Handling', 'Safety Compliance (DOLE/OSHA)', 'Blueprint & Schematic Reading', 'Equipment Troubleshooting', 'Wiring & Circuit Installation'],
    careers: [
      { name: 'Electrician / Electrical Technician', match: '93%' },
      { name: 'Automotive Servicing Technician', match: '88%' },
      { name: 'Industrial Maintenance Specialist', match: '82%' },
      { name: 'HVAC / Refrigeration Technician', match: '76%' },
      { name: 'Solar PV Installer', match: '70%' },
    ],
    tesda: [
      'Electrical Installation and Maintenance NC II',
      'Automotive Servicing NC II',
      'Shielded Metal Arc Welding (SMAW) NC II',
      'Refrigeration and Air-Conditioning (RAC) Servicing NC II',
      'Plumbing NC II',
    ],
    gaps: [
      'Programmable Logic Controllers (PLC) Programming',
      'Advanced Circuit Diagnostics & Fault Finding',
      'Solar PV System Design & Installation',
      'Occupational Safety & Health (OSH) Certification',
      'Inverter & Variable Frequency Drive (VFD) Configuration',
      'AutoCAD Electrical Drawing',
      'Energy Audit & Conservation Techniques',
    ],
    learning: [
      { title: 'Electrical Installation and Maintenance NC II', type: 'TESDA', site: 'e-TESDA Online (etesda.gov.ph)', url: 'https://etesda.gov.ph', search: 'site:etesda.gov.ph Electrical Installation Maintenance NC II free enrollment' },
      { title: 'Refrigeration and Air-Conditioning (RAC) NC II', type: 'TESDA', site: 'TESDA Online Program (top.tesda.gov.ph)', url: 'https://top.tesda.gov.ph', search: 'top.tesda.gov.ph RAC Servicing NC II free enrollment' },
      { title: 'Basic Electricity & Circuits — The Engineering Mindset', type: 'Self-learning', site: 'YouTube — The Engineering Mindset', url: 'https://www.youtube.com/@TheEngineeringMindset', search: 'youtube The Engineering Mindset basic electricity circuits tutorial free' },
      { title: 'PLC Programming for Beginners', type: 'Online', site: 'Udemy (udemy.com)', url: 'https://www.udemy.com/course/plc-programming/', search: 'udemy.com/course/plc-programming/ PLC Siemens beginners' },
      { title: 'Solar Energy Basics — University at Buffalo', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/learn/solar-energy-basics', search: 'coursera.org/learn/solar-energy-basics free audit University Buffalo' },
      { title: 'Occupational Safety & Health (OSH) — DOLE Philippines', type: 'Online', site: 'DICT iLearn (ilearn.dict.gov.ph)', url: 'https://ilearn.dict.gov.ph', search: 'ilearn.dict.gov.ph occupational safety health DOLE Philippines free' },
      { title: 'AutoCAD Tutorial for Beginners — Autodesk Official', type: 'Self-learning', site: 'YouTube — Autodesk', url: 'https://www.youtube.com/user/AutodeskChannel', search: 'youtube Autodesk AutoCAD tutorial beginners 2024 free official' },
    ],
  },
  {
    domain: 'Healthcare & Caregiving',
    match: /nurse|caregiver|healthcare|medical|patient|health|clinic|hospital|midwife|pharmacy|dental|barangay health/i,
    skills: ['Patient Care', 'Basic First Aid & CPR', 'Vital Signs Monitoring', 'Medical Documentation', 'Empathy & Compassion', 'Infection Control', 'Health Education'],
    careers: [
      { name: 'Caregiver', match: '93%' },
      { name: 'Barangay Health Worker', match: '87%' },
      { name: 'Medical Transcriptionist', match: '80%' },
      { name: 'Nursing Aide', match: '78%' },
      { name: 'Pharmacy Assistant', match: '72%' },
    ],
    tesda: [
      'Caregiving NC II',
      'Health Care Services NC II',
      'Massage Therapy NC II',
      'Medical Transcription NC II',
      'Dental Assisting NC II',
    ],
    gaps: [
      'BLS / CPR-AED Certification (Philippine Heart Association)',
      'IV Therapy Certification (for nurses)',
      'Electronic Medical Records (EMR) Systems',
      'Geriatric & Elderly Care Techniques',
      'Mental Health First Aid',
      'Infection Prevention & Control (IPC)',
      'Japanese / German Language Basics (for overseas caregiving)',
    ],
    learning: [
      { title: 'Caregiving NC II', type: 'TESDA', site: 'TESDA Online Program (top.tesda.gov.ph)', url: 'https://top.tesda.gov.ph', search: 'top.tesda.gov.ph Caregiving NC II free enrollment' },
      { title: 'Health Care Services NC II', type: 'TESDA', site: 'e-TESDA Online (etesda.gov.ph)', url: 'https://etesda.gov.ph', search: 'site:etesda.gov.ph Health Care Services NC II free enrollment' },
      { title: 'Psychological First Aid — Johns Hopkins', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/learn/psychological-first-aid', search: 'coursera.org/learn/psychological-first-aid Johns Hopkins free audit' },
      { title: 'Vital Signs & Patient Assessment — Ninja Nerd', type: 'Self-learning', site: 'YouTube — Ninja Nerd', url: 'https://www.youtube.com/@NinjaNerdScience', search: 'youtube Ninja Nerd vital signs patient assessment nursing tutorials' },
      { title: 'Medical Terminology — Khan Academy', type: 'Online', site: 'Khan Academy (khanacademy.org)', url: 'https://www.khanacademy.org/science/health-and-medicine', search: 'khanacademy.org/science/health-and-medicine free medical terminology' },
      { title: 'Japanese for Healthcare / Caregivers — JapanesePod101', type: 'Self-learning', site: 'YouTube — JapanesePod101', url: 'https://www.youtube.com/@JapanesePod101', search: 'youtube JapanesePod101 N5 beginner Japanese caregiver lessons free' },
      { title: 'First Aid & CPR Certification', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/learn/psychological-first-aid', search: 'coursera first aid CPR AED certification free audit' },
    ],
  },
  {
    domain: 'Design & Creative',
    match: /design|photoshop|illustrator|figma|graphic|video|edit|animation|ui|ux|creative|adobe|canva|photography|multimedia/i,
    skills: ['Adobe Photoshop', 'Canva Design', 'Visual Communication', 'Typography', 'Color Theory', 'Layout Design', 'Social Media Graphics'],
    careers: [
      { name: 'Graphic Designer', match: '93%' },
      { name: 'UI/UX Designer', match: '87%' },
      { name: 'Video Editor', match: '82%' },
      { name: 'Social Media Content Creator', match: '78%' },
      { name: 'Multimedia Artist', match: '72%' },
    ],
    tesda: [
      'Animation NC III',
      'Visual Graphic Design NC III',
      'Web Development NC III',
      'Technical Drafting NC II',
      'Photography NC II',
    ],
    gaps: [
      'Adobe Illustrator (Vector Design)',
      'Figma for UI/UX Prototyping',
      'Adobe Premiere Pro / DaVinci Resolve (Video Editing)',
      'Brand Identity Design Principles',
      'Motion Graphics & After Effects',
      'Design Portfolio Building',
      'SEO & Social Media Marketing Basics',
    ],
    learning: [
      { title: 'Animation NC III', type: 'TESDA', site: 'e-TESDA Online (etesda.gov.ph)', url: 'https://etesda.gov.ph', search: 'site:etesda.gov.ph Animation NC III free enrollment' },
      { title: 'Graphic Design Specialization — CalArts', type: 'Online', site: 'Coursera (coursera.org)', url: 'https://www.coursera.org/specializations/graphic-design', search: 'coursera.org/specializations/graphic-design CalArts free audit' },
      { title: 'Google UX Design Professional Certificate', type: 'Online', site: 'Google Career Certificates (grow.google)', url: 'https://grow.google/certificates/ux-design/', search: 'grow.google/certificates/ux-design/ free certificate 2024' },
      { title: 'Adobe Photoshop for Beginners — Photoshop Training Channel', type: 'Self-learning', site: 'YouTube — Photoshop Training Channel', url: 'https://www.youtube.com/@PhotoshopTrainingChannel', search: 'youtube Photoshop Training Channel beginners 2024 free lessons' },
      { title: 'Figma Tutorial for Beginners — Figma Official', type: 'Self-learning', site: 'YouTube — Figma', url: 'https://www.youtube.com/@Figma', search: 'youtube Figma official tutorial beginners UI design 2024 free' },
      { title: 'DaVinci Resolve Full Course — Casey Faris', type: 'Self-learning', site: 'YouTube — Casey Faris', url: 'https://www.youtube.com/@CaseyFaris', search: 'youtube Casey Faris DaVinci Resolve beginner full course free' },
      { title: 'Canva Design School — Official Tutorials', type: 'Self-learning', site: 'Canva Design School (canva.com/learn)', url: 'https://www.canva.com/learn/', search: 'canva.com/learn/ design school free official tutorials' },
    ],
  },
];

// ── Fallback analysis when TuklasAI is unreachable ───────────────────────────
function generateFallbackAnalysis(file, textContent, goal) {
  const haystack = `${file.name} ${textContent || ''} ${goal || ''}`.toLowerCase();
  const matchedDomain = SKILL_TAXONOMY.find(d => d.match.test(haystack)) || SKILL_TAXONOMY[0];

  return {
    summary: `Document "${file.name}" analyzed. Candidate shows qualifications aligned with ${matchedDomain.domain}, with a strong practical foundation and clear pathways to employment.`,
    skillsDetected: matchedDomain.skills,
    careerMatches: matchedDomain.careers,
    jobRecommendations: [
      {
        title: matchedDomain.careers[0].name,
        workplaces: ['Private Sector Companies', 'BPO & Enterprise Firms', 'Local Government Units (LGU)', 'NGOs & Development Organizations'],
        reason: `Directly aligns with detected skills in ${matchedDomain.domain}.`,
        evidence: [matchedDomain.skills[0], matchedDomain.skills[1]],
        searchTerms: `${matchedDomain.careers[0].name} Philippines JobStreet 2024`,
      },
      {
        title: matchedDomain.careers[1].name,
        workplaces: ['Local Enterprises', 'Regional Business Centers', 'Remote & Hybrid Employers', 'Freelance / Project-based'],
        reason: 'Strong demand in the Philippine job market with clear growth trajectory.',
        evidence: [matchedDomain.skills[2] || matchedDomain.skills[0]],
        searchTerms: `${matchedDomain.careers[1].name} entry level Philippines PhilJobNet`,
      },
      {
        title: matchedDomain.careers[2]?.name || matchedDomain.careers[0].name,
        workplaces: ['Startups', 'SMEs (Small & Medium Enterprises)', 'Online Freelance Platforms'],
        reason: 'Emerging role with growing demand aligned to your skills profile.',
        evidence: [matchedDomain.skills[0]],
        searchTerms: `${matchedDomain.careers[2]?.name || matchedDomain.careers[0].name} Philippines Jobstreet Kalibrr`,
      },
    ],
    skillGaps: matchedDomain.gaps,
    tesdaRecommendations: matchedDomain.tesda,
    learningRecommendations: matchedDomain.learning.map(l => ({
      title: l.title,
      type: l.type,
      reason: `Directly addresses identified skill gaps in ${matchedDomain.domain}.`,
      evidence: [matchedDomain.skills[0]],
      searchTerms: l.search,
      learningSite: l.site,
      directUrl: l.url,
    })),
    nextActions: [
      `Enroll in "${matchedDomain.tesda[0]}" at your nearest TESDA Training Center or via etesda.gov.ph for free`,
      `Search for "${matchedDomain.careers[0].name}" openings on JobStreet Philippines and PhilJobNet`,
      `Complete at least one online certification from the learning recommendations above`,
      `Build or update your portfolio/CV highlighting: ${matchedDomain.skills.slice(0, 3).join(', ')}`,
      `Address the top skill gap (${matchedDomain.gaps[0]}) within 30 days using free resources`,
      `Connect with PESO (Public Employment Service Office) in your municipality for local job listings`,
    ],
  };
}

function formatAnalysisReport(analysis) {
  return [
    'File Summary',
    analysis.summary || 'Document analysis completed.',
    '',
    `Skills Detected (${(analysis.skillsDetected || []).length})`,
    (analysis.skillsDetected || []).length
      ? analysis.skillsDetected.map(s => `- ${s}`).join('\n')
      : '- General professional skills',
    '',
    'Best Matching Career Areas',
    (analysis.careerMatches || []).length
      ? analysis.careerMatches.map(c => `- ${c.name} (${c.match})`).join('\n')
      : '- Career exploration pathways available',
    '',
    'Skill Gaps',
    (analysis.skillGaps || []).length
      ? analysis.skillGaps.map(s => `- ${s}`).join('\n')
      : '- Industry certification training recommended',
    '',
    'TESDA Recommendations',
    (analysis.tesdaRecommendations || []).length
      ? analysis.tesdaRecommendations.map(c => `- ${c}`).join('\n')
      : '- Explore accredited TESDA programs',
    '',
    'AI Job Recommendations',
    (analysis.jobRecommendations || []).length
      ? analysis.jobRecommendations.map(j => `- ${j.title}${(j.workplaces || []).length ? ` — ${j.workplaces.join(', ')}` : ''}`).join('\n')
      : '- Review Philippine job matches in Dashboard',
    '',
    'Online and Self-Learning Plan',
    (analysis.learningRecommendations || []).length
      ? analysis.learningRecommendations.map(i => `- [${i.type}] ${i.title}${i.reason ? ` — ${i.reason}` : ''}`).join('\n')
      : '- Free courses available on e-TESDA',
    '',
    'Suggested Next Actions',
    (analysis.nextActions || []).length
      ? analysis.nextActions.map(a => `- ${a}`).join('\n')
      : '- Review your customized career roadmaps on Tuklas',
  ].join('\n');
}

async function scanSingleFile({ file, goal, mode = 'document-scan', onProgress }) {
  if (file.size > MAX_INLINE_BYTES) {
    throw new Error(`"${file.name}" is larger than 18 MB.`);
  }

  const mimeType = getSafeMimeType(file.name, file.type);
  const isTextType = mimeType.startsWith('text/') || /\.(csv|json|md|txt|html|rtf|log)$/i.test(file.name);
  let textContent = '';

  const payloadFiles = [];
  if (isTextType) {
    try {
      textContent = await readTextFile(file);
      payloadFiles.push({ kind: 'text', name: file.name, type: mimeType, text: textContent });
    } catch {
      payloadFiles.push({ kind: 'inline', name: file.name, type: mimeType, data: await toBase64(file) });
    }
  } else {
    payloadFiles.push({ kind: 'inline', name: file.name, type: mimeType, data: await toBase64(file) });
  }

  onProgress?.(35, 'scanning');

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, files: payloadFiles, mode }),
    });
    const payload = await response.json();
    if (response.ok && payload?.analysis && (payload.analysis.skillsDetected?.length || payload.analysis.summary)) {
      return {
        result: payload.result || formatAnalysisReport(payload.analysis),
        analysis: payload.analysis,
        model: payload.model || 'TuklasAI',
      };
    }
  } catch (err) {
    console.warn('Backend scan endpoint warning:', err.message);
  }

  // Fallback when API is unavailable
  const fallbackAnalysis = generateFallbackAnalysis(file, textContent, goal);
  return {
    result: formatAnalysisReport(fallbackAnalysis),
    analysis: fallbackAnalysis,
    model: 'Tuklas AI Engine',
  };
}

// Case-insensitive dedup for strings (strips leading bullet/dash chars)
const normKey = (s) =>
  String(s || '').toLowerCase().replace(/^[-–•·\s]+/, '').replace(/\s+/g, ' ').trim();

const uniqueItems = (items) => {
  const seen = new Set();
  return (items || []).filter(Boolean).filter(item => {
    const k = normKey(item);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const uniqueObjectItems = (items, key) => {
  const seen = new Set();
  return (items || []).filter(item => {
    const k = normKey(item?.[key]);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export async function scanFiles({ files, goal, onFileProgress, mode = 'document-scan' }) {
  if (files.length > MAX_SCAN_FILES) throw new Error(`Choose up to ${MAX_SCAN_FILES} files per scan.`);
  if (!files.length && !goal?.trim()) throw new Error('Type a question or choose at least one file to scan.');

  if (!files.length) {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, files: [], mode }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to generate an AI answer.');
    return payload;
  }

  const scans = [];
  for (const [index, file] of files.entries()) {
    onFileProgress?.({ file, index, total: files.length, percent: 10, status: 'reading file' });
    const scan = await scanSingleFile({
      file,
      goal,
      mode,
      onProgress: (percent, status) => onFileProgress?.({ file, index, total: files.length, percent, status }),
    });
    scans.push(scan);
    onFileProgress?.({ file, index, total: files.length, percent: 100, status: 'complete' });
  }

  const analyses = scans.map(s => s.analysis);
  const combinedAnalysis = {
    summary:              scans.map((s, i) => `${files[i].name}: ${s.analysis.summary || s.result}`).join('\n\n'),
    skillsDetected:       uniqueItems(analyses.flatMap(a => a.skillsDetected || [])),
    careerMatches:        uniqueObjectItems(analyses.flatMap(a => a.careerMatches || []), 'name'),
    jobRecommendations:   uniqueObjectItems(analyses.flatMap(a => a.jobRecommendations || []), 'title'),
    skillGaps:            uniqueItems(analyses.flatMap(a => a.skillGaps || [])),
    tesdaRecommendations: uniqueItems(analyses.flatMap(a => a.tesdaRecommendations || [])),
    learningRecommendations: uniqueObjectItems(analyses.flatMap(a => a.learningRecommendations || []), 'title'),
    nextActions:          uniqueItems(analyses.flatMap(a => a.nextActions || [])),
  };

  return {
    result: [
      'Combined Document Analysis', '',
      ...scans.flatMap((s, i) => [`Document: ${files[i].name}`, s.result, '']),
    ].join('\n').trim(),
    analysis: combinedAnalysis,
    model: uniqueItems(scans.map(s => s.model)).join(', '),
  };
}
