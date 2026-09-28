begin;
create table if not exists public.world_messages (
  id bigint generated always as identity primary key,
  sender_id bigint not null references public.app_users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);
create index if not exists world_messages_feed_idx on public.world_messages (id desc) where status = 'visible';
create index if not exists world_messages_sender_idx on public.world_messages (sender_id, created_at desc);
alter table public.world_messages enable row level security;
revoke all on public.world_messages from anon, authenticated;
grant all on public.world_messages to service_role;
grant usage, select on sequence public.world_messages_id_seq to service_role;

-- Serialize per sender, so concurrent requests cannot bypass the cooldown.
create or replace function public.send_world_message(p_sender_id bigint, p_body text)
returns public.world_messages
language plpgsql security definer set search_path = public
as $$
declare result public.world_messages;
begin
  perform 1 from public.app_users where id = p_sender_id and status = 'Đang hoạt động' for update;
  if not found then raise exception 'Account unavailable' using errcode = '42501'; end if;
  if exists (select 1 from public.world_messages where sender_id = p_sender_id and created_at > now() - interval '2 seconds') then
    raise exception 'Please wait before sending again' using errcode = 'P0001';
  end if;
  insert into public.world_messages(sender_id, body) values(p_sender_id, trim(p_body)) returning * into result;
  return result;
end;
$$;
revoke all on function public.send_world_message(bigint, text) from public, anon, authenticated;
grant execute on function public.send_world_message(bigint, text) to service_role;
commit;
