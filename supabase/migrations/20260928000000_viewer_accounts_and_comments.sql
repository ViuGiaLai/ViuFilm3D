-- Viewer identities belong to Supabase Auth. Public clients cannot write
-- profiles, comments or personal lists directly; the Next.js API verifies
-- each Auth session before using the service-role database client.

create sequence if not exists public.app_user_ids_seq;
select setval(
  'public.app_user_ids_seq',
  coalesce((select max(id) + 1 from public.app_users), 1),
  false
);
alter table public.app_users
  alter column id set default nextval('public.app_user_ids_seq');
alter table public.app_users
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
create index if not exists app_users_auth_user_id_idx
  on public.app_users (auth_user_id);

create or replace function public.create_viewer_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  if new.email is null then
    return new;
  end if;

  if not coalesce((select allow_registration from public.site_settings where id = 1), false) then
    raise exception 'Registration is disabled';
  end if;

  display_name := left(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), 100);
  if char_length(display_name) < 2 then
    display_name := left(split_part(new.email, '@', 1), 100);
  end if;

  insert into public.app_users (
    auth_user_id, name, email, role, status, plan,
    joined_at, last_active, watches
  ) values (
    new.id, display_name, lower(new.email), 'user', 'Đang hoạt động',
    'Miễn phí', current_date, now(), 0
  )
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id
    where public.app_users.role = 'user'
      and public.app_users.auth_user_id is null;

  return new;
end;
$$;

drop trigger if exists on_viewer_signup on auth.users;
create trigger on_viewer_signup
after insert on auth.users
for each row execute function public.create_viewer_profile();

create table if not exists public.movie_comments (
  id bigint generated always as identity primary key,
  movie_id bigint not null references public.movies(id) on delete cascade,
  user_id bigint not null references public.app_users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 2 and 1000),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists movie_comments_movie_created_idx
  on public.movie_comments (movie_id, created_at desc);
create index if not exists movie_comments_user_idx
  on public.movie_comments (user_id, created_at desc);
alter table public.movie_comments enable row level security;
revoke all on public.movie_comments from anon, authenticated;
grant all on public.movie_comments to service_role;

drop trigger if exists movie_comments_set_updated_at on public.movie_comments;
create trigger movie_comments_set_updated_at
before update on public.movie_comments
for each row execute function public.set_admin_updated_at();

create table if not exists public.viewer_favorites (
  user_id bigint not null references public.app_users(id) on delete cascade,
  movie_id bigint not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);
alter table public.viewer_favorites enable row level security;
revoke all on public.viewer_favorites from anon, authenticated;
grant all on public.viewer_favorites to service_role;

create table if not exists public.viewer_history (
  user_id bigint not null references public.app_users(id) on delete cascade,
  movie_id bigint not null references public.movies(id) on delete cascade,
  episode integer not null check (episode > 0),
  progress integer not null default 0 check (progress between 0 and 100),
  position_seconds integer not null default 0 check (position_seconds >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  watched_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);
create index if not exists viewer_history_recent_idx
  on public.viewer_history (user_id, watched_at desc);
alter table public.viewer_history enable row level security;
revoke all on public.viewer_history from anon, authenticated;
grant all on public.viewer_history to service_role;
