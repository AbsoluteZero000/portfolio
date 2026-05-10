import { executeCommand, getAllCompletions, type OutputLine } from './commands';
import { getCurrentTheme, applyTheme, THEMES } from './themes';

interface TerminalState {
  history: Array<{ cmd: string; output: OutputLine[] }>;
  historyIndex: number;
  inputBuffer: string[];
  currentInput: string;
}

export function initTerminal(
  outputEl: HTMLElement,
  inputEl: HTMLInputElement,
  onThemeChange?: (theme: string) => void,
) {
  applyTheme(getCurrentTheme());

  const state: TerminalState = {
    history: [],
    historyIndex: -1,
    inputBuffer: [''],
    currentInput: '',
  };

  let completions: string[] = [];
  let completionIndex = -1;

  function loadCompletions() {
    try {
      completions = getAllCompletions();
    } catch {
      completions = [];
    }
  }
  loadCompletions();

  function appendOutput(lines: OutputLine[]) {
    for (const line of lines) {
      const div = document.createElement('div');
      div.className = `terminal-line terminal-line--${line.type}`;
      div.innerHTML = line.html;
      outputEl.appendChild(div);
    }
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function processThemeSwitch() {
    const themeEl = outputEl.querySelector('.theme-switch-inline');
    if (themeEl) {
      const theme = themeEl.getAttribute('data-theme');
      if (theme) {
        applyTheme(theme);
        if (onThemeChange) onThemeChange(theme);
      }
    }
  }

  function submitCommand(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;

    state.history.push({ cmd: trimmed, output: [] });
    state.historyIndex = state.history.length;
    state.inputBuffer.push('');

    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line terminal-line--prompt';
    promptLine.innerHTML = `<span class="crt-glow-strong">ahmed@portfolio:~$</span> ${escHtml(trimmed)}`;
    outputEl.appendChild(promptLine);

    if (trimmed.toLowerCase() === 'clear') {
      outputEl.innerHTML = '';
      return;
    }

    const ctx = { theme: getCurrentTheme() };
    const result = executeCommand(trimmed, ctx);

    const lastEntry = state.history[state.history.length - 1];
    lastEntry.output = result;

    appendOutput(result);
    processThemeSwitch();
  }

  function escHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function findCompletions(prefix: string): string[] {
    if (!prefix) return completions;
    const lower = prefix.toLowerCase();
    return completions.filter(c => c.toLowerCase().startsWith(lower));
  }

  function handleTab(e: KeyboardEvent) {
    const value = inputEl.value;

    if (completionIndex >= 0) {
      const fullList = findCompletions(value);
      if (fullList.length > 0) {
        completionIndex = (completionIndex + 1) % fullList.length;
        inputEl.value = fullList[completionIndex];
        return;
      }
    }

    const matches = findCompletions(value);

    if (matches.length === 0) return;

    if (matches.length === 1) {
      inputEl.value = matches[0] + ' ';
      completionIndex = -1;
      return;
    }

    const commonPrefix = getCommonPrefix(matches);
    if (commonPrefix.length > value.length) {
      inputEl.value = commonPrefix;
      completionIndex = -1;
      return;
    }

    completionIndex = -1;
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line terminal-line--raw';
    promptLine.style.color = 'var(--fg-dim)';
    promptLine.textContent = matches.join('  ');
    outputEl.appendChild(promptLine);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function getCommonPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.slice(0, -1);
        if (prefix === '') return '';
      }
    }
    return prefix;
  }

  inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      completionIndex = -1;
      const value = inputEl.value;
      inputEl.value = '';
      submitCommand(value);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      handleTab(e);
      return;
    }

    if (e.key === 'ArrowUp') {
      completionIndex = -1;
      e.preventDefault();
      if (state.historyIndex > 0) {
        if (state.historyIndex === state.history.length) {
          state.currentInput = inputEl.value;
        }
        state.historyIndex--;
        inputEl.value = state.history[state.historyIndex].cmd;
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      completionIndex = -1;
      e.preventDefault();
      if (state.historyIndex < state.history.length) {
        state.historyIndex++;
        if (state.historyIndex === state.history.length) {
          inputEl.value = state.currentInput;
        } else {
          inputEl.value = state.history[state.historyIndex].cmd;
        }
      }
      return;
    }

    completionIndex = -1;
  });

  inputEl.addEventListener('focus', () => {
    outputEl.scrollTop = outputEl.scrollHeight;
  });

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cmdEl = target.closest('[data-cmd]') as HTMLElement | null;
    if (cmdEl) {
      e.stopPropagation();
      const cmd = cmdEl.getAttribute('data-cmd');
      if (!cmd) return;
      inputEl.value = '';
      completionIndex = -1;
      submitCommand(cmd);
      return;
    }
    setTimeout(() => inputEl.focus(), 0);
  });

  const visited = localStorage.getItem('portfolio-visited');
  if (!visited) {
    setTimeout(() => submitCommand('whoami'), 400);
    localStorage.setItem('portfolio-visited', 'true');
  }

  setTimeout(() => inputEl.focus(), 100);
}

export function updateThemeIndicator(el: HTMLElement) {
  const theme = getCurrentTheme();
  const t = THEMES.find(t => t.id === theme);
  if (t) {
    el.innerHTML = `<span class="terminal-theme-dot" style="background:${t.dot}"></span> ${t.label}`;
  }
}
