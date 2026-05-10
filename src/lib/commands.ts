export interface OutputLine {
  html: string;
  type: 'system' | 'info' | 'error' | 'success' | 'heading' | 'separator' | 'warning' | 'raw' | 'prompt';
}

interface CommandHandler {
  fn: (args: string[], context: CommandContext) => OutputLine[];
  description: string;
  usage: string;
}

interface CommandContext {
  theme: string;
}

type CommandMap = Record<string, CommandHandler>;

const FILESYSTEM: Record<string, Record<string, string>> = {
  about: {
    '.': `readme.txt  motd`,
    'readme.txt': `Backend Software Engineer specializing in building high-performance, scalable distributed systems using Java (Spring Boot), Go, and Python. Experienced in microservices architecture, performance optimization, and production-grade backend systems. Graduate with Excellent with Honors in Software Engineering from Cairo University.

When I'm not chasing down memory leaks or arguing about tabs vs spaces, you'll find me deep in the Linux rabbit hole — distro hopping, tweaking my dotfiles, or preaching the gospel of Arch to anyone who'll listen.`,
    'motd': `"If it compiles, ship it. If it breaks, git blame." — Me, probably`,
  },
  skills: {
    '.': `languages.txt  frameworks.txt  databases.txt  devops.txt  vibes.txt`,
    'languages.txt': `Java · Go · Python · C/C++ · JavaScript · TypeScript`,
    'frameworks.txt': `Spring Boot · Spring Security · Spring Data JPA · FastAPI · Gin · Fiber`,
    'databases.txt': `PostgreSQL · MySQL · MongoDB · OracleDB · Redis`,
    'devops.txt': `Docker · Kubernetes · Ansible · Jenkins · AWS (CCP Certified) · CI/CD · Linux`,
    'vibes.txt': `Arch Linux · Hyprland · Neovim > VS Code · dotfiles addict · 1254 packages (pacman) · tabs > spaces? who cares · CLI or GTFO`,
  },
  experience: {
    '.': `adres     (directory)
military  (directory)
eventec   (directory)
depi      (directory)`,
    'adres': `Software Engineer | Adres
Dec 2025 - Present | Amman, Jordan (Remote)

• Developed and maintained a production-grade real estate platform for Sharjah
• Wrote high-quality, scalable Java Spring Boot code in enterprise environment
• Led performance improvements through Spring framework upgrades and refactoring
• Integrated database migrations using Flyway for version control
• Utilized Redis for caching to enhance performance and reduce latency`,
    'military': `Software Engineer | Military Service
Dec 2024 - Oct 2025 | Cairo, Egypt

• Maintained mission-critical full-stack system (PHP Laravel + React)
• Diagnosed and resolved performance bottlenecks
• Improved system responsiveness under peak load conditions`,
    'eventec': `Backend Intern | Eventec
Aug 2024 - Oct 2024 | Cairo, Egypt

• Rebuilt company backend using Python FastAPI and MongoDB
• Re-architected multi-tenant MongoDB schema reducing query overhead
• Integrated CI/CD pipelines and API optimizations`,
    'depi': `DevOps Trainee | Digital Egypt Pioneers Initiative
Apr 2024 - Oct 2024 | Cairo, Egypt

• Designed and deployed containerized apps using Docker and Kubernetes
• Automated infrastructure provisioning with Ansible on AWS
• Built Jenkins CI/CD pipelines for automated build, test, and deployment`,
  },
  projects: {
    '.': `code-execution-system/  (dir)
e-payment-simulator/    (dir)
crunch/                 (dir)
codegen/                (dir)
envicutor/              (dir)`,
    'code-execution-system': `Code Execution System
Stack: Rust, JavaScript

Architected a sandboxed backend system for secure, isolated code execution,
handling dynamic dependency resolution at runtime without manual setup.
Designed for fault tolerance and security-first operation.

GitHub: https://github.com/envicutor/envicutor`,
    'e-payment-simulator': `E-Payment Simulator
Stack: Java, Spring Boot

Designed and implemented an e-payment backend using Java and Spring Boot.
Applied Factory and Strategy patterns for extensible payment provider logic.
Achieved high test coverage with JUnit and Mockito.

GitHub: https://github.com/sda-assignment/sda-assignment`,
    'crunch': `Crunch
Stack: Go

Command-line file compression tool using Huffman encoding for efficient,
lossless compression. Features a sleek terminal UI built with Lip Gloss.

GitHub: https://github.com/AbsoluteZero000/crunch`,
    'codegen': `Codegen
Stack: Go, OpenRouter AI

A terminal-based AI coding assistant inspired by Claude Code using Go
and OpenRouter streaming APIs. Real-time token streaming, tool invocation,
and conversational agent workflows.

GitHub: https://github.com/AbsoluteZero000/codegen`,
    'envicutor': `Envicutor
Stack: Rust, JavaScript

A sandboxed code execution environment for running untrusted code securely.
Handles dynamic dependency resolution and provides isolated execution contexts.

GitHub: https://github.com/envicutor/envicutor`,
  },
};

const HELP_TEXT = `Available commands:
  whoami       Display user information
  neofetch     System information (the cool way)
  ls           List files and directories
  cat <file>   Display file contents
  blog         List blog posts
  theme        Show current theme
  theme <name> Switch theme (green, amber, blue, matrix, dracula)
  email        Show contact information
  github       Open GitHub profile
  linkedin     Open LinkedIn profile
  clear        Clear the terminal
  sudo         Try it and see
  exit         Close the connection
  help         Show this message`;

const WHOOAMI_TEXT = `Ahmed Wael Wanas
Backend Software Engineer
Linux enthusiast · CLI Master · Distro hopper (settled on Omarchy)

Java · Go · Python · Distributed Systems

Giza, Egypt
Email: ahmedwaelwanas@gmail.com
GitHub: github.com/AbsoluteZero000
LinkedIn: linkedin.com/in/ahmedwaelwanas

"I break things so you don't have to."`;

const EMAIL_TEXT = `Email:   ahmedwaelwanas@gmail.com
Phone:   +201009693563
GitHub:  https://github.com/AbsoluteZero000
LinkedIn: https://www.linkedin.com/in/ahmedwaelwanas
LeetCode: https://leetcode.com/u/ahmedwaelwanas/`;

function ls(path: string, ctx: CommandContext): OutputLine[] {
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean);
  let dir = FILESYSTEM;

  if (parts.length === 0 || parts[0] === '' || parts[0] === '.') {
    const entries = Object.keys(FILESYSTEM);
    return entries.map(k => {
      const isDir = typeof FILESYSTEM[k] === 'object';
      const display = isDir ? `${k}/` : k;
      const cls = isDir ? '' : ' style="color: var(--fg)"';
      return {
        html: `<span${cls}>${display}</span>`,
        type: 'raw' as const,
      };
    });
  }

  const target = parts[0];
  const entry = dir[target];

  if (!entry) {
    return [{ html: `ls: cannot access '${path}': No such file or directory`, type: 'error' }];
  }

  if (typeof entry === 'string') {
    return [{ html: entry, type: 'raw' }];
  }

  if (parts.length === 1) {
    const content = entry['.'] || Object.keys(entry).filter(k => k !== '.').join('  ');
    return [{ html: content, type: 'raw' }];
  }

  const sub = entry[parts[1]];
  if (!sub) {
    return [{ html: `ls: cannot access '${path}': No such file or directory`, type: 'error' }];
  }

  return [{ html: sub, type: 'raw' }];
}

function cat(path: string, ctx: CommandContext): OutputLine[] {
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean);

  if (parts.length === 0) {
    return [{ html: 'cat: missing operand', type: 'error' }];
  }

  const dir = FILESYSTEM[parts[0]];

  if (!dir) {
    return [{ html: `cat: ${parts[0]}: No such file or directory`, type: 'error' }];
  }

  if (typeof dir === 'string') {
    return dir.split('\n').map(line => ({ html: line, type: 'raw' as const }));
  }

  if (parts.length >= 2) {
    const entry = dir[parts[1]];
    if (!entry) {
      return [{ html: `cat: ${path}: No such file or directory`, type: 'error' }];
    }
    return entry.split('\n').map(line => ({ html: line, type: 'raw' as const }));
  }

  const readme = dir['readme.txt'] || dir['README.txt'] || dir['readme'] || dir['README'];
  if (readme) {
    return readme.split('\n').map(line => ({ html: line, type: 'raw' as const }));
  }

  return [{ html: `cat: ${path}: Is a directory`, type: 'error' }];

  return entry.split('\n').map(line => ({ html: line, type: 'raw' as const }));
}

function renderNeofetch(ctx: CommandContext): OutputLine[] {
  const tux = [
    '           .--.',
    '          /    \\',
    '         / .--. \\',
    '        | |  | |',
    '        | \\  / |',
    '         \\    /',
    '          \\  /',
    '           \\/',
  ].join('\n');

  const lines: OutputLine[] = [
    {
      html: `<div class="neofetch">
<pre class="neofetch-ascii">${tux}</pre>
<ul class="neofetch-info">
<li><strong>ahmed</strong>@<strong>omarchy</strong></li>
<li><strong>OS</strong>: Arch Linux x86_64</li>
<li><strong>Host</strong>: omarchy</li>
<li><strong>Kernel</strong>: 6.19.10-arch1-1</li>
<li><strong>Shell</strong>: bash 5.3.9</li>
<li><strong>Terminal</strong>: kitty</li>
<li><strong>DE</strong>: Hyprland</li>
<li><strong>CPU</strong>: AMD Ryzen 5 3600 (6C/12T)</li>
<li><strong>GPU</strong>: NVIDIA GeForce RTX 4060</li>
<li><strong>Memory</strong>: 10240MiB / 15360MiB</li>
<li><strong>Packages</strong>: 1254 (pacman)</li>
<li><strong>Theme</strong>: ${ctx.theme}</li>
</ul></div>`,
      type: 'raw',
    },
  ];

  return lines;
}

export const COMMANDS: CommandMap = {
  help: {
    fn: () => HELP_TEXT.split('\n').map(line => ({ html: line, type: 'info' as const })),
    description: 'Show available commands',
    usage: 'help',
  },
  whoami: {
    fn: () => WHOOAMI_TEXT.split('\n').map(line => ({ html: line, type: 'raw' as const })),
    description: 'Display user information',
    usage: 'whoami',
  },
  neofetch: {
    fn: (_, ctx) => renderNeofetch(ctx),
    description: 'Display system information',
    usage: 'neofetch',
  },
  ls: {
    fn: (args, ctx) => ls(args[0] || '.', ctx),
    description: 'List files and directories',
    usage: 'ls [path]',
  },
  cat: {
    fn: (args, ctx) => cat(args.join('/'), ctx),
    description: 'Display file contents',
    usage: 'cat <path>',
  },
  blog: {
    fn: () => [
      { html: 'No blog posts yet. Coming soon!', type: 'info' },
    ],
    description: 'List blog posts',
    usage: 'blog',
  },
  email: {
    fn: () => EMAIL_TEXT.split('\n').map(line => {
      const parts = line.split(': ');
      if (parts.length === 2 && parts[1].startsWith('http')) {
        return { html: `${parts[0]}: <a href="${parts[1]}" class="terminal-link" target="_blank">${parts[1]}</a>`, type: 'raw' as const };
      }
      return { html: line, type: 'raw' as const };
    }),
    description: 'Show contact information',
    usage: 'email',
  },
  github: {
    fn: () => [
      { html: 'Opening GitHub profile...', type: 'system' },
      { html: '<a href="https://github.com/AbsoluteZero000" class="terminal-link" target="_blank">https://github.com/AbsoluteZero000</a>', type: 'raw' },
    ],
    description: 'Open GitHub profile',
    usage: 'github',
  },
  linkedin: {
    fn: () => [
      { html: 'Opening LinkedIn profile...', type: 'system' },
      { html: '<a href="https://www.linkedin.com/in/ahmedwaelwanas" class="terminal-link" target="_blank">https://www.linkedin.com/in/ahmedwaelwanas</a>', type: 'raw' },
    ],
    description: 'Open LinkedIn profile',
    usage: 'linkedin',
  },
  clear: {
    fn: () => [],
    description: 'Clear the terminal',
    usage: 'clear',
  },
  theme: {
    fn: (args) => {
      if (args.length === 0) {
        return [{ html: `Current theme: <span class="crt-glow" style="color: var(--accent)">green</span>. Use 'theme &lt;name&gt;' to change. Available: green, amber, blue, matrix, dracula`, type: 'info' }];
      }
      const theme = args[0].toLowerCase();
      const validThemes = ['green', 'amber', 'blue', 'matrix', 'dracula'];
      if (!validThemes.includes(theme)) {
        return [{ html: `theme: unknown theme '${theme}'. Available: ${validThemes.join(', ')}`, type: 'error' }];
      }
      return [{ html: `<span class="theme-switch-inline" data-theme="${theme}">Switching theme to ${theme}...</span>`, type: 'system' }];
    },
    description: 'Show or change theme',
    usage: 'theme [name]',
  },
  sudo: {
    fn: () => [
      { html: 'Permission denied. Nice try.', type: 'error' },
      { html: 'This event will be reported.', type: 'warning' },
      { html: '', type: 'raw' },
      { html: '(just kidding, you don\'t need root for this portfolio)', type: 'info' },
    ],
    description: 'Escalate privileges (not really)',
    usage: 'sudo [command]',
  },
  exit: {
    fn: () => [
      { html: 'Connection closed.', type: 'system' },
    ],
    description: 'Close the connection',
    usage: 'exit',
  },
};

export function executeCommand(input: string, ctx: CommandContext): OutputLine[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = COMMANDS[cmd];
  if (!handler) {
    return [{ html: `command not found: ${cmd}. Type 'help' for available commands.`, type: 'error' }];
  }

  return handler.fn(args, ctx);
}

export type { CommandContext };
