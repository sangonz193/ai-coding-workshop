export type Scene = { chapter: string; title: string; steps: [caption: string, note: string][] }

export const scenes: Scene[] = [
  {
    chapter: 'The machine',
    title: 'Code is solved.',
    steps: [
      ['Ask, and this machine writes code. All day, without getting tired.', 'Let the machine run for a beat before speaking. Producing code is the cheap part now.'],
      ['Crates pile up at the dock. Output is easy. Delivery isn’t.', 'The bottleneck moved from writing code to everything around it: where the work happens, setup, upkeep, and deciding what is actually done.'],
    ],
  },
  {
    chapter: 'The control desk',
    title: 'The workspace I almost built',
    steps: [
      ['I was building my own remote development client. I called it code.', 'Keep this personal: a side project that was turning into something real.'],
      ['Then I found Paseo. It felt like seeing a far more polished future of my own project.', 'Surreal and bittersweet. Say it plainly: I stopped building code.'],
      ['I was looking for provider flexibility: GPT through my Codex subscription, and forking a conversation into Anthropic, also on a subscription instead of API billing.', 'The fork is the point: one conversation, continued with another provider, without switching to pay-per-token.'],
      ['One workspace on every screen: the desktop app, installed iOS and Android apps, and a browser served by the desktop.', 'Same agents and projects whether I am at the desk or holding a phone.'],
    ],
  },
  {
    chapter: 'The setup station',
    title: 'More benches, more friction',
    steps: [
      ['Paseo unlocked worktrees for me: parallel copies of a project, each on its own bench.', 'More benches means more work in flight at the same time.'],
      ['Every new bench needs the same local setup. Repeated setup becomes repeated friction, every single time.', 'Environment files, ports, installs, local services. Multiply by every worktree.'],
      ['Envwire does that setup for every bench, for people and for AI alike.', 'Nobody, human or agent, should redo the wiring by hand.'],
    ],
  },
  {
    chapter: 'The branch bench',
    title: 'Keeping the rack in order',
    steps: [
      ['Branches pile up on the rack. I used to read them in VS Code’s Git Graph.', 'Every parallel bench leaves branches behind.'],
      ['Git Nav replaces it, and the desktop serves it to the browser too.', 'Same idea as Paseo: open it from any device.'],
      ['Two clicks clear the branches that were already squash-merged.', 'Pure upkeep that used to be a chore.'],
      ['Two more clicks move eligible branches forward. Orchestrator worktrees often stay aligned with the default branch.', 'The rack stays readable, so the next decision is easy.'],
    ],
  },
  {
    chapter: 'The inspection table',
    title: 'What does removing a screen mean?',
    steps: [
      ['In Eupersona, a photo-review screen sat in front of a form that was already editable.', 'A real product case. The review step offered nothing the form did not already do.'],
      ['Patch the navigation around it, or remove the screen? I asked to remove it.', 'Product judgment first: not how to fix the screen, but whether it should exist.'],
      ['It left the flow, but 454 obsolete lines stayed underneath. A reviewer noticed the dead code and approved anyway.', 'Paraphrase, not a quote. From the outside the work looked finished.'],
      ['So I asked: why did removing a screen add code?', 'Pause here. This question is the talk.'],
      ['The final change removed 334 lines net. Then the instructions changed: size limits count additions, and removing obsolete code is part of finishing.', 'Final pull request: github.com/secondsponsor/eupersona/pull/665'],
    ],
  },
  {
    chapter: 'The workshop',
    title: 'Code is solved. Engineering is not.',
    steps: [
      ['Step back. The machine is one station in a larger workshop.', 'Let the camera finish pulling back before speaking.'],
      ['Engineering is designing the whole workshop, and judging what is allowed to leave it.', 'Close, thank the room, take questions.'],
    ],
  },
]
