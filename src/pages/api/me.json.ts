import type { APIRoute } from 'astro';
import { PORTFOLIO } from '../../lib/portfolio';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = {
    name: PORTFOLIO.name,
    title: PORTFOLIO.title,
    tagline: PORTFOLIO.tagline,
    location: PORTFOLIO.location,
    contact: {
      email: PORTFOLIO.email,
    },
    links: {
      website: 'https://absolutezero000.github.io/portfolio',
      ...PORTFOLIO.social,
      resume: 'https://absolutezero000.github.io/portfolio/resume.pdf',
    },
    skills: Object.fromEntries(
      PORTFOLIO.skills
        .filter(({ category }) => category !== 'Vibes')
        .map(({ category, items }) => [category, items]),
    ),
    experience: PORTFOLIO.experience.map(({ company, role, period }) => ({
      company,
      role,
      period,
    })),
    projects: PORTFOLIO.projects.map(({ title, stack, github }) => ({
      title,
      stack,
      ...(github && { github }),
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
