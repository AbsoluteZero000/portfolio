import type { APIRoute } from 'astro';
import { PORTFOLIO } from '../../lib/portfolio';

export const prerender = true;

const ESC = '\u001b[';
const reset = `${ESC}0m`;
const bold = `${ESC}1m`;
const dim = `${ESC}2m`;
const cyan = `${ESC}38;5;51m`;
const blue = `${ESC}38;5;75m`;
const green = `${ESC}38;5;84m`;
const yellow = `${ESC}38;5;221m`;
const white = `${ESC}38;5;255m`;

const lineWidth = 62;
const horizontal = '─'.repeat(lineWidth);
const visibleLength = (text: string) =>
  text.replace(/\u001b\[[0-9;]*m/g, '').length;
const row = (text: string) =>
  `│  ${text}${' '.repeat(Math.max(0, lineWidth - 2 - visibleLength(text)))}│`;

const skills = PORTFOLIO.skills
  .filter(({ category }) => category !== 'Vibes')
  .flatMap(({ items }) => items)
  .slice(0, 10)
  .join(' · ');

const card = `
${cyan}${bold}╭${horizontal}╮
${row(`${white}${PORTFOLIO.name}${cyan}`)}
${row(`${blue}${PORTFOLIO.title}${cyan}`)}
├${horizontal}┤
${row(`${yellow}⌂${cyan}  ${white}${PORTFOLIO.location}${cyan}`)}
${row(`${green}@${cyan}  ${white}${PORTFOLIO.email}${cyan}`)}
${row(`${blue}⌘${cyan}  ${white}${PORTFOLIO.social.github.replace('https://', '')}${cyan}`)}
├${horizontal}┤
${row(`${white}Building scalable APIs, distributed systems, and${cyan}`)}
${row(`${white}cloud-native backends.${cyan}`)}
╰${horizontal}╯${reset}

${bold}${white}stack${reset}  ${skills}

${dim}JSON → https://absolutezero000.github.io/portfolio/api/me.json${reset}
`.trimStart();

export const GET: APIRoute = () =>
  new Response(card, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
