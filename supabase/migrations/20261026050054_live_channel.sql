create policy "anyone can follow the talk"
on realtime.messages for select
to anon, authenticated
using (
  (select realtime.topic()) = 'ai-coding-workshop'
  and realtime.messages.extension in ('broadcast', 'presence')
);

-- Signups are disabled, so the only authenticated users are presenters created with `pnpm presenter`.
create policy "presenters drive the talk"
on realtime.messages for insert
to authenticated
with check (
  (select realtime.topic()) = 'ai-coding-workshop'
  and realtime.messages.extension in ('broadcast', 'presence')
);
