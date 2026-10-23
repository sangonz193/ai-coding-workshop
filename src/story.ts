export type Scene = { chapter: string; title: string; steps: [caption: string, note: string][] }

export const scenes: Scene[] = [
  {
    chapter: 'Output',
    title: 'Code is solved.',
    steps: [
      ['Ask, and the code appears.', 'Let the editor stream for a beat. Producing code is the cheap part now.'],
      ['Output is easy. Delivery isn’t.', 'Pull requests pile up. The bottleneck moved to everything around the code: where work happens, setup, upkeep, and deciding what is actually done.'],
    ],
  },
  {
    chapter: 'Workspace',
    title: 'The workspace I almost built',
    steps: [
      ['I’d built my own: one command, any browser.', 'code, my remote development client. npx remote-coding started a daemon on the dev box that ran Claude or Codex on my existing login, and served a web client to any browser: chat, files, terminals, diffs.'],
      ['Then I found Paseo.', 'Surreal and bittersweet: a far more polished future of my own project. I stopped building code.'],
      ['One conversation, two providers.', 'I came for provider flexibility: GPT through my Codex subscription, then fork the same conversation into Claude on my Anthropic subscription, not API billing. Both continue from the shared history.'],
      ['Same conversation, every screen.', 'Desktop app, installed iOS and Android apps, and a browser served by the desktop.'],
    ],
  },
  {
    chapter: 'Setup',
    title: 'Many copies, same setup',
    steps: [
      ['Parallel copies of one project.', 'Paseo unlocked worktrees for me: several working copies of the same project at once.'],
      ['Every copy needs its environment again.', '.env files are not committed, so each new worktree starts without them: copy and edit one per app, by hand. Repeated setup becomes repeated friction, for people and for AI.'],
      ['Declared once. One command per copy.', 'Envwire: every variable is declared once in a committed root .env.template, each app’s template picks what it needs under its own names, and envwire compiles the real .env files. A fresh worktree runs one command, or the dev script runs it, for people and agents alike.'],
    ],
  },
  {
    chapter: 'Branches',
    title: 'Keeping branches in order',
    steps: [
      ['Branches pile up.', 'I used to read them in VS Code’s Git Graph.'],
      ['Git Nav, in the browser.', 'It replaced Git Graph for me, and the desktop serves it to the browser, like Paseo.'],
      ['Two clicks: merged branches gone.', 'Squash-merged branches look unmerged to Git. Cleaning them up used to be a chore.'],
      ['Two clicks: branches brought forward.', 'Eligible branches move forward. Orchestrator worktrees often stay aligned with the default branch.'],
    ],
  },
  {
    chapter: 'Review',
    title: 'More review, more jams',
    steps: [
      ['I built a review loop.', 'June: /loop-review. Build, have another provider review, and loop until approved. In August I raised the cap to six rounds.'],
      ['It always found something.', 'Each fix gave the next round something new to review, and other work queued behind it. My October assessment of my own loops: round 1 caught real bugs, later rounds mostly did not, and about 40% of later-round blockers came from the loop’s own fixes. Exploratory numbers, not a controlled study.'],
      ['“You already do this work now, just later and angrier.”', 'An AI reviewing my chats, Oct 16. I still changed 26 to 30% of approved loops, and long loops were where my “status?” messages and complaints piled up. Two days earlier another analysis counted about 340 frustrated messages across roughly 100 chats.'],
      ['One review. One fix. One confirmation.', 'Oct 16: /loop-review became /review-fix. Whatever is left goes to an issue instead of another round.'],
    ],
  },
  {
    chapter: 'Judgment',
    title: 'Removing a screen',
    steps: [
      ['A review screen before a form that was already editable.', 'Eupersona. The photo-review step offered nothing the form did not already do.'],
      ['Remove it, don’t patch around it.', 'I asked whether to remove it instead of fixing its navigation.'],
      ['Gone from the flow. Still in the code.', 'The first implementation left 454 obsolete lines. A reviewer noticed the dead code and approved anyway. Paraphrase, not a quote.'],
      ['Why did removing a screen add code?', 'Pause here. This question is the talk.'],
      ['Removed for real.', 'The final change removed 334 lines net. Then the instructions changed: size limits count additions, and removing obsolete code is part of finishing. github.com/secondsponsor/eupersona/pull/665'],
    ],
  },
  {
    chapter: 'Engineering',
    title: 'Code is solved. Engineering is not.',
    steps: [
      ['Step back.', 'Let the camera finish pulling back before speaking.'],
      ['Engineering is the whole system, and judging what ships.', 'Close, thank the room, take questions.'],
    ],
  },
]
