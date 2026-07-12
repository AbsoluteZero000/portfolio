import { PORTFOLIO, highlightTech } from './portfolio';

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

const aboutText = `${PORTFOLIO.summary}

When I'm not chasing down memory leaks or arguing about tabs vs spaces, you'll find me deep in the Linux rabbit hole — distro hopping, tweaking my dotfiles, or preaching the gospel of Arch to anyone who'll listen.

${PORTFOLIO.motd}`;

const skillsText = PORTFOLIO.skills.map(s =>
  `${s.category}:\n  ${s.items.join(' · ')}`
).join('\n\n');

const expList = PORTFOLIO.experience.map(e =>
  e.company.toLowerCase().replace(/\s+/g, '-')
);

const expEntries: Record<string, string> = {};
expList.forEach((key, i) => {
  const e = PORTFOLIO.experience[i];
  expEntries[key] = `${e.role} | ${e.company}
${e.period} | ${e.location}

${e.highlights.map(h => `• ${highlightTech(h)}`).join('\n')}`;
});

const allExperienceText = PORTFOLIO.experience.map(e =>
  `${e.role} | ${e.company}
${e.period} | ${e.location}

${e.highlights.map(h => `• ${highlightTech(h)}`).join('\n')}`
).join('\n\n─────────────────────\n\n');

const projList = PORTFOLIO.projects.map(p =>
  p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
);

const projEntries: Record<string, string> = {};
projList.forEach((key, i) => {
  const p = PORTFOLIO.projects[i];
  projEntries[key] = `${p.title}
Stack: ${p.stack}

${p.description}
${p.github ? `\nGitHub: ${p.github}` : ''}`;
});

export const FILESYSTEM: Record<string, string | Record<string, string>> = {
  about: aboutText,
  skills: skillsText,
  experience: {
    '.': allExperienceText,
    ...expEntries,
  },
  projects: {
    '.': projList.join('\n'),
    ...projEntries,
  },
};

const COMMAND_HELP: { cmd: string; desc: string }[] = [
  { cmd: 'whoami', desc: 'Display user information' },
  { cmd: 'neofetch', desc: 'System information (the cool way)' },
  { cmd: 'ls', desc: 'List files and directories' },
  { cmd: 'cat', desc: 'Display file contents' },
  { cmd: 'blog', desc: 'List blog posts' },
  { cmd: 'theme', desc: 'Show or change theme' },
  { cmd: 'email', desc: 'Show contact information' },
  { cmd: 'github', desc: 'Open GitHub profile' },
  { cmd: 'linkedin', desc: 'Open LinkedIn profile' },
  { cmd: 'clear', desc: 'Clear the terminal' },
  { cmd: 'sudo', desc: 'Escalate privileges (not really)' },
  { cmd: 'exit', desc: 'Close the connection' },
  { cmd: 'help', desc: 'Show this message' },
];

const WHOOAMI_TEXT = `${PORTFOLIO.name}
${PORTFOLIO.title}
${PORTFOLIO.whoamiExtras}

${PORTFOLIO.location}
Email: ${PORTFOLIO.email}
GitHub: ${PORTFOLIO.social.github}
LinkedIn: ${PORTFOLIO.social.linkedin}`;

const EMAIL_TEXT = `Email:   ${PORTFOLIO.email}
Phone:   ${PORTFOLIO.phone}
GitHub:  ${PORTFOLIO.social.github}
LinkedIn: ${PORTFOLIO.social.linkedin}
LeetCode: ${PORTFOLIO.social.leetcode}`;

export function getAllCompletions(): string[] {
  const items: string[] = [];

  for (const cmd of Object.keys(COMMANDS)) {
    items.push(cmd);
    items.push(`${cmd} `);
  }

  function walk(dir: Record<string, string>, prefix: string) {
    for (const key of Object.keys(dir)) {
      if (key === '.') continue;
      items.push(`cat ${prefix}/${key}`);
    }
  }

  for (const name of Object.keys(FILESYSTEM)) {
    const entry = FILESYSTEM[name];
    if (typeof entry === 'string') {
      items.push(`cat ${name}`);
    } else if (entry) {
      items.push(`ls ${name}/`);
      walk(entry, name);
    }
  }

  return [...new Set(items)].sort();
}

function cmdSpan(cmd: string, label?: string): string {
  const text = label || cmd;
  return `<span class="terminal-link" data-cmd="${cmd}">${text}</span>`;
}

function lsDir(
  dirName: string,
  dir: Record<string, string>,
  parentPath: string,
): OutputLine[] {
  const keys = Object.keys(dir).filter(k => k !== '.');
  if (keys.length === 0) {
    return [{ html: '(empty directory)', type: 'info' }];
  }
  return keys.map(k => {
    const isDir = typeof dir[k] === 'object' && dir[k] !== null;
    const fullPath = `${parentPath}/${k}`;
    const action = isDir ? `ls ${fullPath}/` : `cat ${fullPath}`;
    const display = isDir ? `${k}/` : k;
    return { html: cmdSpan(action, display), type: 'raw' as const };
  });
}

function ls(path: string, ctx: CommandContext): OutputLine[] {
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === '' || parts[0] === '.') {
    return Object.keys(FILESYSTEM).map(k => {
      const entry = FILESYSTEM[k];
      const isDir = typeof entry === 'object';
      // Keep the interface approachable: labels look like sections, not
      // directories that imply unsupported `cd` navigation.
      const display = k;
      const action = isDir ? `ls ${k}/` : `cat ${k}`;
      return {
        html: cmdSpan(action, display),
        type: 'raw' as const,
      };
    });
  }

  const target = parts[0];
  const entry = FILESYSTEM[target];

  if (!entry) {
    return [{ html: `ls: cannot access '${path}': No such file or directory`, type: 'error' }];
  }

  if (typeof entry === 'string') {
    return [{ html: entry, type: 'raw' }];
  }

  if (parts.length === 1) {
    if (target === 'projects') {
      return renderProjectCards();
    }
    return lsDir(target, entry, target);
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
    return dir.split('\n').map(line => ({ html: line, type: detectLineType(line) }));
  }

  if (parts.length >= 2) {
    const entry = dir[parts[1]];
    if (!entry) {
      return [{ html: `cat: ${path}: No such file or directory`, type: 'error' }];
    }
    return entry.split('\n').map(line => ({ html: line, type: detectLineType(line) }));
  }

  const readme = dir['readme.txt'] || dir['README.txt'] || dir['readme'] || dir['README'];
  if (readme) {
    return readme.split('\n').map(line => ({ html: line, type: 'raw' as const }));
  }

  const listing = dir['.'];
  if (listing) {
    return listing.split('\n').map(line => ({ html: line, type: detectLineType(line) }));
  }

  return [{ html: `cat: ${path}: Is a directory`, type: 'error' }];
}

function detectLineType(line: string): OutputLine['type'] {
  const t = line.trim();
  if (!t) return 'raw';
  if (t.startsWith('─')) return 'separator';
  if (t.includes('•') || t.startsWith('•')) return 'raw';
  if (t.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s/)) return 'info';
  if (t.includes('|')) {
    if (t.match(/^\w+\s\d{4}/) || t.match(/^\d{4}/)) return 'info';
    return 'heading';
  }
  return 'raw';
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

  return [{
    html: `<div class="neofetch">
<pre class="neofetch-ascii">${tux}</pre>
<ul class="neofetch-info">
<li><strong>${PORTFOLIO.name.split(' ')[0].toLowerCase()}</strong>@<strong>${PORTFOLIO.hostname}</strong></li>
<li><strong>OS</strong>: Arch Linux x86_64</li>
<li><strong>Host</strong>: ${PORTFOLIO.hostname}</li>
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
  }];
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= width) {
      current += (current ? ' ' : '') + word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function renderProjectCards(): OutputLine[] {
  const lines: OutputLine[] = [];
  const boxWidth = 62;
  const innerWidth = boxWidth - 4;

  for (const p of PORTFOLIO.projects) {
    const slug = p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const namePart = ` ${slug} `;
    const dashes = '─'.repeat(Math.max(0, boxWidth - 3 - namePart.length));
    lines.push({ html: `┌─${namePart}${dashes}┐`, type: 'heading' });

    const descLines = wrapText(p.description, innerWidth);
    for (const dl of descLines) {
      const highlighted = highlightTech(dl);
      const padding = ' '.repeat(Math.max(0, innerWidth - dl.length));
      lines.push({ html: `│ ${highlighted}${padding} │`, type: 'raw' });
    }

    lines.push({ html: `│ ${''.padEnd(innerWidth)} │`, type: 'raw' });

    const stack = `Stack: ${p.stack}`;
    lines.push({ html: `│ ${stack.padEnd(innerWidth)} │`, type: 'info' });

    if (p.github) {
      const linkHtml = `<a href="${p.github}" class="terminal-link" target="_blank">GitHub ↗</a>`;
      const linkLabel = ' GitHub ↗';
      const pad = ' '.repeat(innerWidth - linkLabel.length);
      lines.push({ html: `│ ${linkHtml}${pad} │`, type: 'raw' });
    }

    lines.push({ html: `└${'─'.repeat(boxWidth - 2)}┘`, type: 'separator' });
    lines.push({ html: '', type: 'raw' });
  }

  return lines;
}

export const COMMANDS: CommandMap = {
  help: {
    fn: () => {
      const lines: OutputLine[] = [
        { html: 'Available commands:', type: 'info' },
      ];
      for (const { cmd, desc } of COMMAND_HELP) {
        const padding = ' '.repeat(Math.max(1, 16 - cmd.length));
        lines.push({
          html: `&nbsp;&nbsp;${cmdSpan(cmd)}${padding}${desc}`,
          type: 'raw' as const,
        });
      }
      return lines;
    },
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
    description: 'System information (the cool way)',
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
      { html: `<a href="${PORTFOLIO.social.github}" class="terminal-link" target="_blank">${PORTFOLIO.social.github}</a>`, type: 'raw' },
    ],
    description: 'Open GitHub profile',
    usage: 'github',
  },
  linkedin: {
    fn: () => [
      { html: 'Opening LinkedIn profile...', type: 'system' },
      { html: `<a href="${PORTFOLIO.social.linkedin}" class="terminal-link" target="_blank">${PORTFOLIO.social.linkedin}</a>`, type: 'raw' },
    ],
    description: 'Open LinkedIn profile',
    usage: 'linkedin',
  },
  contact: {
    fn: () => EMAIL_TEXT.split('\n').map(line => {
      const parts = line.split(': ');
      if (parts.length === 2 && parts[1].startsWith('http')) {
        return { html: `${parts[0]}: <a href="${parts[1]}" class="terminal-link" target="_blank">${parts[1]}</a>`, type: 'raw' as const };
      }
      return { html: line, type: 'raw' as const };
    }),
    description: 'Show contact information',
    usage: 'contact',
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
  invaders: {
    fn: () => [
      { html: '<span class="game-launch" data-game="invaders">Booting CHICKEN.EXE...</span>', type: 'system' },
      { html: 'Arrow keys / A D to move · Space to fire · Esc to quit', type: 'info' },
    ],
    description: 'Definitely not a hidden game',
    usage: 'invaders',
  },
  coffee: {
    fn: () => [
      { html: 'Compiling coffee...', type: 'system' },
      { html: 'Error: developer already at maximum caffeine capacity ☕', type: 'warning' },
    ],
    description: 'Compile some motivation',
    usage: 'coffee',
  },
  fortune: {
    fn: () => {
      const fortunes = [
        'There are only two hard things in Computer Science: cache invalidation, naming things, and off-by-one errors.',
        'A clean API is worth a thousand meetings.',
        'It works on my machine — so we are shipping my machine.',
        'The best distributed system is the one you did not need to distribute.',
      ];
      return [{ html: `“${fortunes[Math.floor(Math.random() * fortunes.length)]}”`, type: 'info' }];
    },
    description: 'Print questionable engineering wisdom',
    usage: 'fortune',
  },
  hack: {
    fn: () => [
      { html: 'Connecting to mainframe...', type: 'system' },
      { html: '[████████████████████] 100%', type: 'success' },
      { html: 'Access granted. Just kidding — nice try, operator.', type: 'warning' },
    ],
    description: 'Hack the planet',
    usage: 'hack',
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
