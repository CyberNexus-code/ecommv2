# Auth Postmortem

## Why the Original Auth Setup Was Buggy

The original auth issues were architectural, not just isolated API mistakes. The app mixed guest-session bootstrapping, logged-in session handling, route protection, and password recovery in overlapping places. That created race conditions and brittle behavior across normal login, logout, and recovery flows.

## Root Causes

### 1. Competing auth lifecycle logic

Auth state was being resolved in more than one place, which meant the app could react to the same session change multiple times. In practice this led to duplicate redirects, stale UI state, and cases where login appeared to require more than one attempt.

### 2. Guest bootstrap interfering with real auth flows

The app correctly needed anonymous users for baskets, but the guest bootstrap logic was not isolated from recovery and sign-in flows. That allowed anonymous session creation or refresh work to collide with password reset and authenticated transitions.

### 3. Auth routes were not isolated from the main app shell

Login, signup, reset-password, and confirmation flows were still coupled to the main shell and global auth behavior. That made it easy for navigation, shared providers, or route-level effects to fight the intended auth flow.

### 4. Browser auth client lifecycle was unstable

When the browser Supabase client is recreated too often, event listeners and session reads become inconsistent. That can produce missed auth updates, duplicate listeners, and confusing client-side state after redirects.

### 5. Password recovery flow was incomplete

Recovery links require a predictable callback and session exchange path. The original setup did not consistently handle the recovery redirect lifecycle, which is why reset-password links failed or aborted in the browser.

### 6. Order ownership relied on email instead of identity

Guest order access based on email was functionally convenient but structurally wrong. Email is mutable and not a secure ownership boundary. This created confusion around account history and introduced security risk around order visibility.

## What Changed in the Current Setup

- Auth state is centralized in one provider.
- Guest bootstrap is preserved, but it is controlled so it does not hijack recovery or authenticated transitions.
- Auth pages are separated from the main app shell.
- The browser Supabase client is treated as a stable singleton.
- Recovery and confirmation routes now exchange sessions and redirect predictably.
- Orders and baskets are owned by `user_id`, not by email.
- Guest data can merge into a permanent account after login or signup.

## Why the Current Setup Is More Reliable

The current architecture makes one part of the app responsible for session truth, one part responsible for route transitions, and one part responsible for guest merge behavior. That separation removes the race conditions that caused the original bugs.

## Remaining Auth Risk Areas

- Auth correctness still depends on keeping service-role access server-only.
- Recovery and callback URLs must stay aligned with Supabase project settings.
- Any future guest-flow changes should preserve `user_id`-based ownership and avoid reintroducing email-based lookups.