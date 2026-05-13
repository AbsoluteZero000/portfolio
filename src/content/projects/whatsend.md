---
title: WhatSend
description: WhatsApp message scheduler with a browser dashboard — send now or schedule recurring messages via Whapi.Cloud
tags: [Python, FastAPI, SQLAlchemy, HTMX, APScheduler, Whapi.Cloud]
githubUrl: https://github.com/AbsoluteZero000/whatsend
order: 0
---

Built a full-stack WhatsApp scheduling application with FastAPI and SQLAlchemy 2.0, featuring a Jinja2/HTMX dashboard. Supports one-time and recurring scheduling with a user-friendly cron builder (Daily, Weekdays, Weekly with multi-day selection, Monthly). Integrates with Whapi.Cloud API for message sending, with group fetching, image upload (JPEG/PNG/GIF/WebP), per-user timezone support, Fernet-encrypted token storage, and expandable execution logs. Deployed on Fly.io with persistent SQLite storage and always-on APScheduler.
