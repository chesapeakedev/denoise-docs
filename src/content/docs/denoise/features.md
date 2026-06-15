---
title: Features
description: Tasks, milestones, and focus timer in denoise.
---

## Overview

Denoise is an offline-first planning app for small tasks, project milestones,
and GitHub-backed work. It keeps personal planning fast and local by default,
then adds sync, collaboration, GitHub issue integration, and dn-powered
automation when you sign in and connect a repository.

## Core features

- **Offline-first tasks** - Create and edit tasks locally, even without signing
  in.
- **Milestones** - Group tasks into projects or planning slices.
- **Focus timer** - Track focused work sessions alongside task progress.
- **Sign-in with GitHub or Google** - Enable cloud sync and identity-backed
  workflows.
- **Collaboration** - Share published milestones with collaborators.
- **GitHub issue sync** - Link milestones, import issues, and push task updates
  back to GitHub.

## Task management

- **Complete or reopen** - Toggle task completion from the task row.
- **Edit** - Update task title and description.
- **Delete** - Remove tasks you no longer need.
- **Tags** - Organize tasks; GitHub-linked tags sync as labels.
- **Due dates** - Track deadlines.
- **Urgent flag** - Mark tasks that need priority attention.

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

Denoise can collect anonymous usage metrics, such as upgrade clicks and
milestone/task counts, to help improve the product. Metrics are opt-in only. In
Settings, enable **Share anonymous usage data to help us improve the product**.

When enabled, counts are stored in the same KV store as the rest of the app and
included in the existing daily B2 backup.
