-- Public-facing profiles and private, consent-based social features.
-- Apply after 20260928000000_viewer_accounts_and_comments.sql.

alter table public.app_users
  add column if not exists avatar_id text not null default 'moon'
  check (avatar_id in ('moon', 'dragon', 'fox', 'sword', 'flame', 'lotus', 'upload'));
alter table public.app_users
  add column if not exists avatar_updated_at timestamptz;
alter table public.app_users
  add column if not exists bio text not null default ''
  check (char_length(bio) <= 300);

alter table public.movie_comments
  add column if not exists parent_id bigint references public.movie_comments(id) on delete cascade;
alter table public.movie_comments
  add column if not exists like_count integer not null default 0 check (like_count >= 0);
create index if not exists movie_comments_parent_idx
  on public.movie_comments (parent_id);

create table if not exists public.movie_comment_likes (
  comment_id bigint not null references public.movie_comments(id) on delete cascade,
  user_id bigint not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
alter table public.movie_comment_likes enable row level security;
revoke all on public.movie_comment_likes from anon, authenticated;
grant all on public.movie_comment_likes to service_role;

create or replace function public.sync_comment_like_count()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.movie_comments
      set like_count = like_count + 1
      where id = new.comment_id;
    return new;
  end if;
  update public.movie_comments
    set like_count = greatest(0, like_count - 1)
    where id = old.comment_id;
  return old;
end;
$$;
drop trigger if exists movie_comment_likes_count on public.movie_comment_likes;
create trigger movie_comment_likes_count
after insert or delete on public.movie_comment_likes
for each row execute function public.sync_comment_like_count();

create table if not exists public.user_follows (
  follower_id bigint not null references public.app_users(id) on delete cascade,
  followed_id bigint not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index if not exists user_follows_followed_idx
  on public.user_follows (followed_id);
alter table public.user_follows enable row level security;
revoke all on public.user_follows from anon, authenticated;
grant all on public.user_follows to service_role;

create table if not exists public.friend_links (
  id bigint generated always as identity primary key,
  requester_id bigint not null references public.app_users(id) on delete cascade,
  recipient_id bigint not null references public.app_users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> recipient_id)
);
create unique index if not exists friend_links_pair_idx
  on public.friend_links (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id)
  );
create index if not exists friend_links_recipient_idx
  on public.friend_links (recipient_id, status);
alter table public.friend_links enable row level security;
revoke all on public.friend_links from anon, authenticated;
grant all on public.friend_links to service_role;
drop trigger if exists friend_links_set_updated_at on public.friend_links;
create trigger friend_links_set_updated_at
before update on public.friend_links
for each row execute function public.set_admin_updated_at();

create table if not exists public.direct_messages (
  id bigint generated always as identity primary key,
  sender_id bigint not null references public.app_users(id) on delete cascade,
  recipient_id bigint not null references public.app_users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);
create index if not exists direct_messages_conversation_idx
  on public.direct_messages (sender_id, recipient_id, created_at desc);
create index if not exists direct_messages_inbox_idx
  on public.direct_messages (recipient_id, read_at, created_at desc);
alter table public.direct_messages enable row level security;
revoke all on public.direct_messages from anon, authenticated;
grant all on public.direct_messages to service_role;
