export interface Skill {
  category: string;
  items: string[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface ProjectEntry {
  title: string;
  stack: string;
  description: string;
  github?: string;
}

export const PORTFOLIO = {
  name: 'Ahmed Wael Wanas',
  title: 'Backend Software Engineer',
  tagline: 'Building scalable APIs, distributed systems, and cloud-native backends.',
  hostname: 'omarchy',
  location: 'Giza, Egypt',
  email: 'ahmedwaelwanas@gmail.com',
  phone: '+201009693563',
  resume: '/portfolio/resume.pdf',
  summary: `Backend Software Engineer specializing in building high-performance, scalable distributed systems using Java (Spring Boot), Go, and Python. Experienced in microservices architecture, performance optimization, and production-grade backend systems. Graduate with Excellent with Honors in Software Engineering from Cairo University.`,
  motd: `"If it compiles, ship it. If it breaks, git blame." — Me, probably`,
  whoamiExtras: `Linux enthusiast · CLI worshipper · Distro hopper (settled on Arch)

Java · Go · Python · Distributed Systems

"I break things so you don't have to."`,

  social: {
    github: 'https://github.com/AbsoluteZero000',
    linkedin: 'https://www.linkedin.com/in/ahmedwaelwanas',
    leetcode: 'https://leetcode.com/u/ahmedwaelwanas/',
  },

  skills: [
    { category: 'Languages', items: ['Java', 'Go', 'Python', 'C/C++', 'JavaScript', 'TypeScript'] },
    { category: 'Frameworks', items: ['Spring Boot', 'Spring Security', 'Spring Data JPA', 'FastAPI', 'Gin', 'Fiber'] },
    { category: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'OracleDB', 'Redis'] },
    { category: 'Cloud & DevOps', items: ['Docker', 'Kubernetes', 'Ansible', 'Jenkins', 'AWS (CCP Certified)', 'CI/CD', 'Linux'] },
    { category: 'Vibes', items: ['Arch Linux', 'Hyprland', 'Neovim > VS Code', 'dotfiles addict', '1254 packages (pacman)', 'tabs > spaces? who cares', 'CLI or GTFO'] },
  ],

  experience: [
    {
      company: 'Adres',
      role: 'Software Engineer',
      period: 'Dec 2025 - Present',
      location: 'Amman, Jordan (Remote)',
      highlights: [
        'Developed and maintained a production-grade real estate platform for Sharjah',
        'Wrote high-quality, scalable Java Spring Boot code in enterprise environment',
        'Led performance improvements through Spring framework upgrades and refactoring',
        'Integrated database migrations using Flyway for version control',
        'Utilized Redis for caching to enhance performance and reduce latency',
      ],
    },
    {
      company: 'Military Service',
      role: 'Software Engineer',
      period: 'Dec 2024 - Oct 2025',
      location: 'Cairo, Egypt',
      highlights: [
        'Maintained mission-critical full-stack system (PHP Laravel + React)',
        'Diagnosed and resolved performance bottlenecks',
        'Improved system responsiveness under peak load conditions',
      ],
    },
    {
      company: 'Eventec',
      role: 'Backend Intern',
      period: 'Aug 2024 - Oct 2024',
      location: 'Cairo, Egypt',
      highlights: [
        'Rebuilt company backend using Python FastAPI and MongoDB',
        'Re-architected multi-tenant MongoDB schema reducing query overhead',
        'Integrated CI/CD pipelines and API optimizations',
      ],
    },
    {
      company: 'Digital Egypt Pioneers Initiative',
      role: 'DevOps Trainee',
      period: 'Apr 2024 - Oct 2024',
      location: 'Cairo, Egypt',
      highlights: [
        'Designed and deployed containerized apps using Docker and Kubernetes',
        'Automated infrastructure provisioning with Ansible on AWS',
        'Built Jenkins CI/CD pipelines for automated build, test, and deployment',
      ],
    },
  ],

  projects: [
    {
      title: 'Code Execution System',
      stack: 'Rust, JavaScript',
      description: 'Architected a sandboxed backend system for secure, isolated code execution, handling dynamic dependency resolution at runtime without manual setup. Designed for fault tolerance and security-first operation.',
      github: 'https://github.com/envicutor/envicutor',
    },
    {
      title: 'E-Payment Simulator',
      stack: 'Java, Spring Boot',
      description: 'Designed and implemented an e-payment backend using Java and Spring Boot. Applied Factory and Strategy patterns for extensible payment provider logic. Achieved high test coverage with JUnit and Mockito.',
      github: 'https://github.com/sda-assignment/sda-assignment',
    },
    {
      title: 'Crunch',
      stack: 'Go',
      description: 'Command-line file compression tool using Huffman encoding for efficient, lossless compression. Features a sleek terminal UI built with Lip Gloss.',
      github: 'https://github.com/AbsoluteZero000/crunch',
    },
    {
      title: 'Codegen',
      stack: 'Go, OpenRouter AI',
      description: 'A terminal-based AI coding assistant inspired by Claude Code using Go and OpenRouter streaming APIs. Real-time token streaming, tool invocation, and conversational agent workflows.',
      github: 'https://github.com/AbsoluteZero000/codegen',
    },
    {
      title: 'Envicutor',
      stack: 'Rust, JavaScript',
      description: 'A sandboxed code execution environment for running untrusted code securely. Handles dynamic dependency resolution and provides isolated execution contexts.',
      github: 'https://github.com/envicutor/envicutor',
    },
  ],

  education: [
    {
      institution: 'Cairo University',
      faculty: 'Faculty of Computer and Artificial Intelligence',
      degree: 'BCS, Software Engineering',
      period: 'Oct 2020 - Jul 2024',
      grade: 'Excellent with honors',
    },
  ],

  certifications: [
    'ISTQB CTFL Certified',
    'AWS CCP Certified',
  ],
};

const SKILL_ITEMS = PORTFOLIO.skills
  .filter(s => s.category !== 'Vibes')
  .flatMap(s => s.items);

const STACK_ITEMS = PORTFOLIO.projects.flatMap(p =>
  p.stack.split(',').map(s => s.trim())
);

const ALL_TECH = [...new Set([...SKILL_ITEMS, ...STACK_ITEMS])]
  .sort((a, b) => b.length - a.length);

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightTech(text: string): string {
  let result = escHtml(text);
  for (const kw of ALL_TECH) {
    const escaped = escRegex(kw);
    const regex = new RegExp(`(?<=^|[^\\w])${escaped}(?=$|[^\\w])`, 'gi');
    result = result.replace(regex, '<span class="tech-highlight">$&</span>');
  }
  return result;
}
