---
title: Features
description: Tasks, milestones, and focus timer in denoise.
---

## Value proposition

- For knowledge workers (and busy normies)
- Who are overwhelmed with life's small tasks and are paralyzed by it
- denoise is an app to focus your effort
- That provides a streamlined planning experience and encourages progress
- Unlike GitHub, Jira, Asana

## Features

- **Minimal interface** — Offline-first todo management
- **Focus timer** — Productivity and velocity scoring system
- **SSO** — Sign in with GitHub or Google
- **Multiplayer** — Collaborative interface for planning
- **GitHub issue synchronization** — Link milestones and sync issues

## Task management

- **Complete/Incomplete** — Click the checkmark to toggle task completion
- **Edit** — Click the edit icon to modify task text
- **Delete** — Click the trash icon to remove a task
- **Tags** — Add tags to organize tasks (tags sync to GitHub as labels)
- **Due dates** — Set due dates for tasks
- **Urgent flag** — Mark tasks as urgent for priority

### Filtering and sorting tasks

**Filter tasks by text** — Use the search input in the milestone header to
filter tasks within the current milestone. The filter searches both task titles
and descriptions (case-insensitive).

**Sort tasks** — Use the sort dropdown in the milestone header to change the
order of tasks:

- **Default order** — Tasks are shown in their original order
- **Name A-Z** — Sort tasks alphabetically (ascending)
- **Name Z-A** — Sort tasks alphabetically (descending)

**Hide completed tasks** — Click the eye icon in the milestone header to toggle
visibility of completed tasks. When enabled, only incomplete tasks are shown.

## Milestones

Milestones help you organize tasks into groups or projects:

1. Click the **+** button in the sidebar to create a milestone
2. Give your milestone a name and optional description
3. Tasks can be assigned to milestones using the move button

### Milestone persistence

Your last selected milestone is automatically saved and restored when you return
to the app. This means you can pick up right where you left off without needing
to navigate back to your working milestone.

### Filtering milestones

Use the search input in the sidebar to filter milestones by name. This is
helpful when you have many milestones and need to quickly find a specific one.

## Usage metrics (opt-in)

denoise can collect anonymous usage metrics (e.g. upgrade clicks, milestone/task
counts) to help improve the product. Metrics are **opt-in only**: in Settings,
enable “Share anonymous usage data to help us improve the product.” When
enabled, counts are stored in the same KV store as the rest of the app and are
included in the existing daily B2 backup; no separate backup configuration is
required.
