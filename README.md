# Harness Training

An interactive web presentation about how software engineering changes when writing code is no longer the bottleneck.

## Presentation concept

Working title: **Code is solved, engineering is not.**

The presentation follows the work that surrounds implementation: choosing a workspace, making parallel development practical, removing repeated setup and maintenance, and deciding whether a result is actually complete.

## Experience

- A public audience URL with a live follow-presenter mode powered by Supabase Realtime.
- A private presenter page for scene navigation, incremental reveals, and speaker notes.
- Independent audience navigation with a way to rejoin the live presentation.
- A self-guided version available after the talk.
- Purposeful 3D elements to explain workspaces, worktrees, and branching, with readable layouts on phones.

## Proposed story

1. Building a remote development client, then discovering Paseo as the polished realization of that idea.
2. Provider flexibility, conversation forks, and cross-device access changing the development workspace.
3. Worktrees multiplying both concurrency and friction: Envwire for setup, Git Nav for branch visibility and maintenance.
4. A concrete product decision: removing a redundant photo-review screen and determining what complete removal means.
5. The engineering work that remains: product judgment, scope, verification, simplification, and acceptance.

The story and visual direction are still being developed.

## Workshop prototype

A miniature workshop rendered with three.js: the camera moves between desks whose laptops, monitors and phones show each part of the story on interfaces recreated from each app’s real design (generated code piling up as pull requests, the Paseo workspace and a forked conversation, worktrees compiling their env files from committed templates, a branch graph being cleaned up, a review loop jamming work until it became one review, one fix and one confirmation, and the Eupersona review screen being removed), then pulls back to the whole workshop.

```sh
pnpm install
pnpm dev        # http://localhost:4313
```

- `/` is the audience view. It follows the presenter, can switch to independent exploration, and can rejoin the live scene.
- `/presenter.html` has previous/next, chapter selection, step reveals, speaker notes, and the next caption.

Presenter and audience tabs synchronize within one browser using `BroadcastChannel`, and the latest scene is kept in `localStorage` so late joiners land on it.

`pnpm test` covers scene navigation; `pnpm build` type-checks and builds both pages.
