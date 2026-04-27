---
title: Getting started
description: Sign in and create your first task in denoise.
---

## Authentication

The app supports authentication via GitHub or Google. To get started:

1. Click the **Sign In** button
2. Choose your preferred authentication method (GitHub or Google)
3. Complete the OAuth flow
4. You'll be redirected back to the app, now authenticated

**Note:** GitHub authentication is required for GitHub milestone and issue
integration features. For how sign-in works and how it interacts with the
offline/online toggle, see [Authentication](/denoise/authentication/).

**Billing and organizations:** Subscription status, Stripe checkout, the
customer portal, and organization APIs (`/api/subscription/*`,
`/api/organizations/*`) are provided by the **main denoise app** (the same
origin as the product UI). This documentation site is static-only and does not
expose those routes; integrate or test billing against the app deployment, not
the docs host.

## Creating your first task

1. Type your task in the input field at the top
2. Press **Enter** or click the add button
3. Your task appears in the list below
