---
title: WhatSend
description: Production-ready WhatsApp automation platform for instant, scheduled, recurring, and on-demand group messaging
tags: [Python, FastAPI, SQLAlchemy, HTMX, APScheduler, Docker, Fly.io, Whapi.Cloud]
githubUrl: https://github.com/AbsoluteZero000/whatsend
order: 0
---

Built and deployed a full-stack WhatsApp automation platform with FastAPI, async SQLAlchemy 2.0, and a Jinja2/HTMX dashboard. It supports instant, one-time, recurring, and on-demand messaging through Whapi.Cloud, backed by a user-friendly schedule builder rather than raw cron syntax.

The application includes JWT authentication, Fernet-encrypted tokens, per-user timezones, group discovery, image uploads, job cloning and skipping, searchable execution logs, and an authenticated external API. English and Arabic interfaces—including full RTL layout—make it practical for real users. Docker and Fly.io provide an always-on deployment with persistent SQLite storage and APScheduler jobs that survive restarts.
