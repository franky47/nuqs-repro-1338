# nuqs #1338 — `useQueryState` update doesn't animate `<ViewTransition>`

Minimal reproduction for https://github.com/47ng/nuqs/issues/1338

Two identical toggles rendered side by side, each swapping two elements
inside React `<ViewTransition>` boundaries, updated in a `startTransition`:

- **useState**: animates as expected.
- **useQueryState** (nuqs 2.8.8, Next.js app router adapter): no visible
  animation.

## Setup

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 and click both Toggle buttons.

## What the instrumentation shows

`app/layout.tsx` wraps `document.startViewTransition` and records the
rendered text before and after the transition's update callback:

```
#1 [ON / OFF] -> [ON / OFF] ⚠️ no-op: DOM was mutated BEFORE the transition   <- useQueryState
#2 [ON / OFF] -> [OFF / OFF] ✅ DOM mutated inside the transition             <- useState
```

Interestingly, `startViewTransition` **is** called for the nuqs update
(which is why the `::view-transition` pseudo-element shows up in devtools,
as noted in the issue). But by the time it runs, the DOM has already been
committed with the new state: nuqs propagates the value synchronously
through its `useSyncExternalStore`-based store, outside the transition
lane. The transition's "old" and "new" snapshots are identical, so there
is nothing to animate.

This also explains the workarounds reported in the issue: `useOptimistic`
and `useDeferredValue` both re-introduce a transition-lane render that
React can capture inside the view transition.

## Versions

- nuqs 2.8.8
- next 16.1.6
- react / react-dom 19.2.4
- node 24
