export type Scene = { chapter: string; title: string; steps: [caption: string, note: string][] }

export const scenes: Scene[] = [
  {
    chapter: 'Output',
    title: 'Code is solved.',
    steps: [
      ['Ask, and the code appears.', 'For programmers, one of our main jobs is maintaining code: we create, edit and delete files inside a folder we call a code base. Now we can ask for code, and agents create, edit and delete those files for us. Producing code is the cheap part now; the rest of this talk is everything around it.'],
    ],
  },
  {
    chapter: 'Workspace',
    title: 'From one editor to many agents',
    steps: [
      ['I used to write code myself.', 'Let’s go back a few years, before AI was part of the editor. Every programmer knows this setup: an editor where we changed the files ourselves, our own hands on our own keyboard.'],
      ['2021: autocomplete.', 'GitHub Copilot’s technical preview, June 2021: a context-aware autocomplete that suggests the rest of the line, or a whole function.'],
      ['2022 to 2023: chat.', 'ChatGPT, end of 2022: we googled less, copied less from Stack Overflow, and asked AI instead. GitHub Copilot Chat, generally available in December 2023: the same, but inside the editor, next to the code.'],
      ['2025: agents.', 'Early 2025: agentic tools like Claude Code, Codex and GitHub Copilot’s agent mode. The single largest change: the agent edits the files itself. Writing code was solved.'],
      ['One task at a time.', 'But other parts of my flow started breaking. The bottleneck: one agent, one task, and me waiting for it.'],
      ['More agents, same folder.', 'So I opened several agents with different tasks. They all changed the same files in the same code base and got in each other’s way. When they finished, I had a pile of unrelated changes: split them into commits, the save points that each describe one change, or make one big commit mixing everything.'],
      ['Worktrees: a copy of the folder per task.', 'Git worktrees duplicate the code base elsewhere on my computer, so a second agent works on another task in its own copy while the first keeps working in the original.'],
      ['In VS Code, a window per copy.', 'In VS Code that meant ten or more windows: heavy on my machine, and hard to find the right project and worktree.'],
      ['So I built my own: every copy in one window.', 'code, my remote development client, put every project, worktree and agent session in one window, and ran sessions in worktrees within its first days. npx remote-coding started a daemon that ran Claude or Codex on my existing login, and served a web client to any browser: chat, files, terminals, diffs.'],
      ['Then I found Paseo.', 'Surreal and bittersweet: a far more polished future of my own project, so I stopped building code. The same idea, every project and worktree in one window, done far better; VS Code now opens less than once a week. It also runs as installed iOS and Android apps and in a browser served by the desktop. The same idea changed my browser: Chromium profiles meant a window each, while Zen keeps separate logins as workspaces with their own containers in one window.'],
      ['Any provider, my own folders.', 'GPT through my Codex subscription, then fork the same chat into Claude on my Anthropic subscription, not API billing. Why not the Codex or Claude apps, or their cloud agents? One interface for every provider, and agents working in my local folders instead of on remote servers, including a gitignored docs.local/ folder of meeting notes and emails they can read.'],
    ],
  },
  {
    chapter: 'Upkeep',
    title: 'Parallel work multiplies upkeep',
    steps: [
      ['Every copy needs its environment again.', 'Paseo made worktrees practical, and every worktree starts without .env files because they are not committed: copy and edit one per app, by hand. Repeated setup becomes repeated friction, for people and for AI.'],
      ['Declared once. One command per copy.', 'Envwire: every variable is declared once in a committed root .env.template, each app’s template picks what it needs under its own names, and envwire compiles the real .env files. A fresh worktree runs one command, or the dev script runs it, for people and agents alike.'],
      ['Branches pile up.', 'Every parallel copy leaves branches behind. I used to read them in VS Code’s Git Graph; Git Nav replaced it, and the desktop serves it to the browser, like Paseo.'],
      ['Two clicks each: clean up, bring forward.', 'Squash-merged branches look unmerged to Git; Git Nav matches them by content. Eligible branches fast-forward to the default branch. Orchestrator worktrees often stay aligned with the default branch.'],
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
      ['Deciding what should exist, what done means, and when to stop.', 'That is what still needed me: removing the screen instead of patching around it, counting dead code as unfinished work, and cutting the review loop down to one pass. Close, thank the room, take questions.'],
    ],
  },
]

export const answers: [question: string, answer: string][] = [
  ['Why not the Codex or Claude Code apps?', 'I wanted one interface for every provider, where a conversation can move between them, instead of one app per vendor.'],
  ['Why not their cloud agents?', 'I prefer agents working in my local folders: my machine, my local services, and a gitignored docs.local/ folder of meeting notes and emails that never goes to git.'],
  ['What does it cost?', 'Subscriptions, not API billing: GPT through my Codex plan and Claude through my Anthropic plan. Paseo itself is open source.'],
  ['Do you hit usage limits?', 'Yes. Long review loops were a big part of it, and my orchestration instructions account for which provider has usage left.'],
  ['Is it safe to let agents run with full permissions?', 'They work in separate worktrees. Before any push, a hook makes the agent confirm the push was requested, checks pass, and the review approved it.'],
  ['Why build Git Nav and Envwire instead of using existing tools?', 'Git Nav: squash-merged cleanup matched by content, bulk fast-forward, and browser access from the desktop. Envwire: every variable declared once, each app picks what it needs under its own names, plus a CI check for variables an app reads but never wires in.'],
  ['What is an orchestrator agent?', 'An agent that plans the work and delegates it to other agents in their own worktrees, then checks the results. Its own worktree usually stays on the default branch.'],
  ['How do you review this much code?', 'One review with two reviewers, one fix pass, one confirmation; leftovers become an issue. I still change 26 to 30% of approved work, which is why the final call stays with me.'],
  ['Did it make you faster?', 'The only thing I measured is the review loop. The rest is my experience, not data.'],
  ['Do you still write code?', 'Rarely. VS Code opens less than once a week, mostly to read a file.'],
]

// Seconds per step, chapter by chapter; about 35 minutes in total.
export const budgets: number[][] = [
  [90],
  [60, 50, 60, 70, 50, 80, 70, 60, 120, 120, 120],
  [70, 80, 60, 90],
  [80, 90, 100, 80],
  [60, 70, 90, 70, 100],
  [40, 80],
]
