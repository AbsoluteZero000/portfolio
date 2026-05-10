import { executeCommand, type OutputLine } from './commands';
import { getCurrentTheme, applyTheme, getNextTheme, THEMES } from './themes';

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

  function handleCommand(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;

    state.history.push({ cmd: trimmed, output: [] });
    state.historyIndex = state.history.length;
    state.inputBuffer.push('');

    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line terminal-line--prompt';
    const theme = getCurrentTheme();
    promptLine.innerHTML = `<span class="crt-glow">ahmed@portfolio:~$</span> ${escHtml(trimmed)}`;
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

  inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const value = inputEl.value;
      inputEl.value = '';
      handleCommand(value);
      return;
    }

    if (e.key === 'ArrowUp') {
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

    if (e.key === 'Tab') {
      e.preventDefault();
    }
  });

  inputEl.addEventListener('focus', () => {
    outputEl.scrollTop = outputEl.scrollHeight;
  });

  document.addEventListener('click', () => {
    setTimeout(() => inputEl.focus(), 0);
  });

  setTimeout(() => inputEl.focus(), 100);
}

export function updateThemeIndicator(el: HTMLElement) {
  const theme = getCurrentTheme();
  const t = THEMES.find(t => t.id === theme);
  if (t) {
    el.innerHTML = `<span class="terminal-theme-dot" style="background:${t.dot}"></span> ${t.label}`;
  }
}
