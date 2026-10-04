/**
 * ============================================================
 *  PORTFOLIO CONTENT — the single place to edit everything.
 * ============================================================
 * All text, links and asset paths live here. Components never
 * hard-code content. To update the portfolio, edit this file.
 */

export const profile = {
  name: 'GOKUL KRISHANA',
  firstName: 'GOKUL',
  lastName: 'KRISHANA',
  mark: 'GK',
  roles: ['Cybersecurity Student', 'Full-Stack Developer', 'AI/ML Builder'],
  intro:
    "I'm Gokul Krishana, a Computer Science Engineering student specializing in Cybersecurity at SRM Institute of Science and Technology. I enjoy building real-world systems across software engineering, artificial intelligence, computer vision, and cybersecurity.",
  location: 'Chennai, Tamil Nadu',
  hometown: 'Ooty, Tamil Nadu',
  email: 'gokulkrishana866@gmail.com',
  phone: '8248157966',
  phoneDisplay: '+91 82481 57966',
  linkedin: 'https://www.linkedin.com/in/gokul-krishana',
  github: 'https://github.com/gokulkrishana24',
  /** LinkedIn and Instagram are linked out to, never scraped in the browser. */
  instagram: 'https://www.instagram.com/gokul_krishana2006/',
  instagramAlt: 'https://www.instagram.com/goo_coooll/',
  photo: '/images/profile.webp',
  interests: [
    'Software Development',
    'Backend Development',
    'Full-Stack Development',
    'AI/ML Engineering',
    'Data Science',
    'Cybersecurity',
    'Cloud Engineering',
    'R&D',
  ],
} as const;

/** RESUME — the cinematic loading video + the actual PDF. */
export const resumeConfig = {
  pdf: '/resume/Gokul_Krishana_Resume.pdf',
  pdfName: 'Gokul_Krishana_Resume.pdf',
  /** the cinematic clip used for the intro and the download sequence */
  video: '/video/hero.mp4',
  /**
   * Background for the resume viewer — deliberately NOT hero.mp4, which
   * belongs to the intro and the download loading experience.
   *
   * If this file is absent the viewer's CSS atmosphere layers simply
   * remain: BackgroundVideo hides a video that errors, so a missing file
   * degrades to the animated background rather than breaking anything.
   */
  viewerVideo: '/video/yacht.mp4',
} as const;

/* ------------------------------------------------------------------ */
/* ABOUT                                                              */
/* ------------------------------------------------------------------ */

export const about = {
  kicker: 'WHO AM I?',
  /** Shown under the hero name — the one-line positioning statement. */
  tagline: 'Building secure, intelligent and interactive digital experiences.',
  welcome: 'WELCOME TO MY DIGITAL UNIVERSE',
  paragraphs: [
    "I'm Gokul Krishana, a Computer Science Engineering student specializing in Cybersecurity at SRM Institute of Science and Technology.",
    'I enjoy building real-world systems at the intersection of software engineering, artificial intelligence, computer vision and cybersecurity.',
    'From real-time face recognition systems to sensitive-data protection tools, I like turning ideas into working technology.',
  ],
  educationMarker: {
    short: 'SRM IST',
    degree: 'B.Tech — Computer Science Engineering',
    specialization: 'Specialization in Cybersecurity',
    years: '2024 → 2028',
    cgpa: 'CGPA: 8.35 / 10',
  },
} as const;

/* ------------------------------------------------------------------ */
/* EDUCATION JOURNEY — the curved path between School → Career        */
/* ------------------------------------------------------------------ */

export const journey = {
  title: 'MY JOURNEY',
  sub: 'The route from Ooty to what comes next',
  stops: [
    { index: '01', label: 'SCHOOL', target: 'school', at: 0, place: 'Ooty' },
    { index: '02', label: 'COLLEGE', target: 'college', at: 0.1667, place: 'Chennai' },
    { index: '03', label: 'DEVELOPMENT', target: 'tech', at: 0.3333, place: 'Build' },
    { index: '04', label: 'AI / ML', target: 'projects', at: 0.5, place: 'Intelligence' },
    { index: '05', label: 'CYBERSECURITY', target: 'projects', at: 0.6667, place: 'Defense' },
    { index: '06', label: 'PROJECTS', target: 'projects', at: 0.8333, place: 'Ship' },
    { index: '07', label: 'FUTURE', target: 'experience', at: 1, place: 'Beyond' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* SCHOOL                                                             */
/* ------------------------------------------------------------------ */

export const school = {
  kicker: '01 · SCHOOL',
  heading: 'WHERE IT STARTED',
  name: 'CRESCENT CASTLE PUBLIC SCHOOL',
  location: 'Ooty, Tamil Nadu',
  website: 'https://crescentschoolooty.com/',
  websiteLabel: 'DISCOVER MY SCHOOL',
  photos: [
    { src: '/images/school-stairs.webp', alt: 'Crescent Castle Public School — entrance staircase' },
    { src: '/images/school-courtyard.webp', alt: 'Crescent Castle Public School — courtyard and garden' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* COLLEGE                                                            */
/* ------------------------------------------------------------------ */

export const college = {
  kicker: '02 · COLLEGE',
  heading: 'COLLEGE JOURNEY',
  name: 'SRM INSTITUTE OF SCIENCE AND TECHNOLOGY',
  shortName: 'SRM IST',
  location: 'Vadapalani, Chennai',
  website: 'https://www.srmist.edu.in/',
  websiteLabel: 'DISCOVER SRM',
  degree: 'B.Tech — Computer Science Engineering',
  specialization: 'Cybersecurity',
  years: '2024 → 2028',
  cgpa: '8.35 / 10',
  photos: [
    { src: '/images/college.jpg', alt: 'SRM Institute of Science and Technology — campus building' },
  ],
  logo: '/images/srm-logo.png',
} as const;

/** The Ooty → Chennai move, told as a chapter rather than a resume line. */
export const relocation = {
  from: 'OOTY',
  to: 'CHENNAI',
  caption: 'From the hills of the Nilgiris to the city — the move that turned curiosity into direction.',
} as const;

/* ------------------------------------------------------------------ */
/* TECHNICAL UNIVERSE                                                 */
/* ------------------------------------------------------------------ */

export interface SkillCategory {
  id: string;
  title: string;
  accent: 'blue' | 'yellow' | 'red';
  items: string[];
}

export const skills: SkillCategory[] = [
  {
    id: 'core',
    title: 'CORE',
    accent: 'blue',
    items: ['Python', 'Java', 'C', 'C++', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    id: 'ai',
    title: 'AI / COMPUTER VISION',
    accent: 'yellow',
    items: ['YOLO11', 'RetinaFace', 'ArcFace', 'FAISS', 'ByteTrack', 'OpenCV', 'PyTorch', 'ONNX Runtime', 'CNN'],
  },
  {
    id: 'dev',
    title: 'DEVELOPMENT',
    accent: 'blue',
    items: ['FastAPI', 'Node.js', 'Streamlit', 'Docker', 'Docker Compose', 'SQLAlchemy'],
  },
  {
    id: 'security',
    title: 'SECURITY',
    accent: 'red',
    items: ['Linux', 'Wireshark', 'Cisco Packet Tracer', 'Regex', 'Security Analysis'],
  },
  {
    id: 'databases',
    title: 'DATABASES',
    accent: 'blue',
    items: ['MySQL', 'Oracle', 'SQLite', 'PostgreSQL'],
  },
  {
    id: 'tools',
    title: 'TOOLS',
    accent: 'yellow',
    items: ['Git', 'GitHub', 'VS Code'],
  },
];

/* ------------------------------------------------------------------ */
/* MARQUEE                                                            */
/* ------------------------------------------------------------------ */

export const marquee = [
  'CYBERSECURITY',
  'FULL-STACK DEVELOPMENT',
  'AI / ML',
  'COMPUTER VISION',
  'INTERACTIVE EXPERIENCES',
  'SOFTWARE ENGINEERING',
] as const;

/* ------------------------------------------------------------------ */
/* PROJECTS                                                           */
/* ------------------------------------------------------------------ */

export interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  technologies: string[];
  pipeline?: string[];
  metrics?: { value: string; label: string }[];
  note?: string;
  focus?: string[];
  hero?: boolean;
  /** 'scan' | 'security' | 'map' | 'database' — drives the bespoke visual */
  visual: 'scan' | 'security' | 'map' | 'database';
  /** Only the two flagship projects expose a VIEW PROJECT link. */
  viewProject?: boolean;
  github: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    id: 'facerecognition',
    index: '01',
    title: 'FACERECOGNITION AI',
    subtitle: 'AI-Powered Real-Time Automatic Attendance System',
    description:
      'A real-time AI-powered attendance system that automatically detects, tracks and identifies people from live camera feeds and records verified attendance.',
    pipeline: ['CAMERA', 'YOLO11', 'ByteTrack', 'RetinaFace', 'ArcFace', '512D EMBEDDING', 'FAISS', 'RECOGNITION', 'ATTENDANCE'],
    metrics: [
      { value: '29 FPS', label: 'Camera Capture' },
      { value: '19–20 FPS', label: 'Live Display' },
      { value: '2.5–3 FPS', label: 'CPU AI Inference' },
      { value: '500K', label: 'Synthetic 512D Embedding Test' },
    ],
    note: 'Current target: ~95% recognition accuracy following formal dataset-based evaluation.',
    technologies: ['Python', 'OpenCV', 'YOLO11', 'RetinaFace', 'ArcFace', 'FAISS', 'ByteTrack', 'PyTorch', 'FastAPI', 'Streamlit', 'Docker', 'SQLAlchemy'],
    hero: true,
    visual: 'scan',
    viewProject: true,
    github: 'https://github.com/gokulkrishana24',
  },
  {
    id: 'secureclip',
    index: '02',
    title: 'SECURECLIP',
    subtitle: 'Sensitive Data Clipboard Monitor',
    description:
      'A lightweight Data Loss Prevention tool that monitors clipboard activity and detects potentially sensitive information such as passwords, email addresses, phone numbers, payment-card patterns and identification data.',
    pipeline: ['CLIPBOARD', 'PATTERN DETECTION', 'RISK CLASSIFICATION', 'SECURITY ALERT', 'AUTOMATIC CLEARING'],
    technologies: ['Python', 'Tkinter / CustomTkinter', 'Regex', 'Pyperclip', 'SQLite'],
    note: 'Encryption is a planned future enhancement — not a claim of this build.',
    visual: 'security',
    viewProject: true,
    github: 'https://github.com/gokulkrishana24',
  },
  {
    id: 'smart-tourist',
    index: '03',
    title: 'SMART TOURIST',
    subtitle: 'Technology × Public Safety',
    description:
      'A smart tourism and public-safety solution developed in collaboration with the Nilgiris District Police — focused on tourist support, safety, monitoring and information accessibility.',
    focus: ['Tourist Support', 'Safety', 'Monitoring', 'Information Accessibility'],
    technologies: [],
    visual: 'map',
    github: 'https://github.com/gokulkrishana24',
  },
  {
    id: 'house-rental',
    index: '04',
    title: 'HOUSE RENTAL MANAGEMENT',
    subtitle: 'Database-Driven Rental Management System',
    description:
      'A database-driven rental management system built on structured relational data — managing property, tenant and rental information end to end.',
    focus: ['Property Information', 'Tenant Information', 'Rental Information', 'Structured Relational Data'],
    technologies: ['MySQL', 'SQL', 'Database Management'],
    visual: 'database',
    github: 'https://github.com/gokulkrishana24',
  },
];

/* ------------------------------------------------------------------ */
/* EXPERIENCE & HACKATHONS                                            */
/* ------------------------------------------------------------------ */

export const experience = {
  years: '2024 → 2028',
  roles: [
    {
      year: '2024',
      org: 'SRM INSTITUTE OF SCIENCE AND TECHNOLOGY',
      role: 'B.Tech — Computer Science Engineering (Cybersecurity)',
      duration: '2024 → 2028',
      points: ['Specialization in Cybersecurity', 'CGPA 8.35 / 10', 'Core computer science coursework'],
    },
    {
      year: '2025',
      org: 'ZING BIZZ',
      role: 'Frontend Developer Intern',
      duration: '1 Month',
      points: ['Web development', 'Frontend implementation', 'HTML · CSS · JavaScript', 'Team collaboration'],
    },
    {
      year: '2025',
      org: 'LAMS AUTOMATION',
      role: 'Software Developer Intern',
      duration: '1 Month',
      points: ['AI/ML', 'Software development', 'Security analysis'],
      contributed: 'Technical development, integration, and software/security workflows.',
    },
  ],
} as const;

export const hackathons = [
  {
    title: 'SMART INDIA HACKATHON 2026',
    role: 'Backend & Data Developer',
    points: ['Backend development', 'Data handling', 'Technical implementation', 'Team collaboration', 'Solution development', 'Presentation'],
  },
  {
    title: 'COLLEGE INTERNAL HACKATHON',
    badge: 'TOP 10 TEAM',
    points: ['Technical implementation', 'Problem solving', 'Team collaboration', 'Time-constrained development'],
  },
] as const;

/* ------------------------------------------------------------------ */
/* CERTIFICATIONS — credential wall                                   */
/* ------------------------------------------------------------------ */

export const certifications = [
  { issuer: 'NPTEL', detail: 'Design Thinking / Design Analysis' },
  { issuer: 'CISCO', detail: 'Cisco Packet Tracer' },
  { issuer: 'COURSERA', detail: 'Introduction to Encryption' },
  { issuer: 'UDEMY', detail: 'Artificial Intelligence' },
] as const;

/* ------------------------------------------------------------------ */
/* BEYOND CODE                                                        */
/* ------------------------------------------------------------------ */

export const beyond = {
  kicker: 'BEYOND THE TERMINAL',
  heading: 'BEYOND THE TERMINAL',
  intro: "Technology isn't the only thing I build.",
  groups: [
    { name: 'NIC CLUB — SRM', roles: ['Hospitality Head', 'Logistics Team Member', 'Event Coordinator'] },
    { name: 'SRM V-MUN', roles: ['Hospitality & Logistics'] },
    { name: 'SYMRNA FELLOWSHIP TRUST', roles: ['Volunteer'] },
  ],
  photo: '/images/events/speaking.jpg',
} as const;

/* ------------------------------------------------------------------ */
/* HOW I THINK + PHILOSOPHY                                           */
/* ------------------------------------------------------------------ */

export const mindset = {
  kicker: 'HOW I THINK',
  heading: 'HOW I THINK',
  words: ['CURIOUS', 'CREATIVE', 'PROBLEM SOLVER', 'ADAPTABLE', 'TEAM PLAYER', 'HARDWORKING', 'RECEPTIVE TO FEEDBACK'],
  loop: ['LEARN', 'BUILD', 'BREAK', 'UNDERSTAND', 'IMPROVE'],
  quote: 'I like turning ideas into working technology.',
  mantra: ['BUILD.', 'LEARN.', 'GROW.', 'REPEAT.'],
} as const;

/* ------------------------------------------------------------------ */
/* CONTACT                                                            */
/* ------------------------------------------------------------------ */

export const contact = {
  terminal: {
    title: 'CONNECTION_REQUEST',
    target: 'TARGET: GOKUL KRISHANA',
    status: 'STATUS: AVAILABLE',
    prompt: 'WHAT SHOULD WE BUILD NEXT?',
  },
  heading: "LET'S BUILD IT.",
  headingLead: 'HAVE AN IDEA?',
  support:
    "Whether you're looking for a premium website, an interactive digital experience or a custom software solution, let's create something people remember.",
  finalCta: {
    heading: "YOUR NEXT DIGITAL EXPERIENCE COULD LOOK LIKE THIS.",
    subheading: "LET'S BUILD IT.",
    primary: 'START A PROJECT →',
    secondary: "LET'S CONNECT",
  },
  form: {
    // Kept in sync with PROJECT_TYPES in src/lib/contact.ts, which is
    // the allowlist the API enforces server-side.
    types: ['Software Project', 'AI / ML Project', 'Security Work', 'Collaboration', 'Other'],
  },
  footer: {
    name: 'GOKUL KRISHANA',
    line: 'Built with curiosity + code.',
    copyright: '© 2026',
  },
} as const;

/* ------------------------------------------------------------------ */
/* NAVIGATION                                                         */
/* ------------------------------------------------------------------ */

export const NAV = [
  { label: 'HOME', target: 'hero' },
  { label: 'ABOUT', target: 'about' },
  { label: 'EDUCATION', target: 'school' },
  { label: 'SKILLS', target: 'tech' },
  { label: 'PROJECTS', target: 'projects' },
  { label: 'EXPERIENCE', target: 'experience' },
  { label: 'ACHIEVEMENTS', target: 'achievements' },
  { label: 'BEYOND CODE', target: 'beyond' },
  { label: 'CONTACT', target: 'contact' },
] as const;

/** Section ids used by nav, journey stops, and scroll helpers. */
export const SECTION_IDS = [
  'about', 'journey-map', 'school', 'college', 'tech', 'projects',
  'experience', 'achievements', 'beyond', 'how-i-think', 'philosophy', 'contact', 'final-cta',
] as const;

/** Dome gallery — uses the real uploaded assets. */
export const domeGallery = [
  { src: '/images/school-stairs.webp', alt: 'Crescent Castle Public School' },
  { src: '/images/college.jpg', alt: 'SRM Institute campus' },
  { src: '/images/srm-logo.png', alt: 'SRM Institute of Science and Technology' },
  { src: '/images/events/speaking.jpg', alt: 'Speaking at a campus event' },
  { src: '/images/school-courtyard.webp', alt: 'School courtyard' },
  { src: '/images/profile.webp', alt: 'Gokul Krishana' },
] as const;
