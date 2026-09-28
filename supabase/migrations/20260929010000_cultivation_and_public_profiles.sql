-- Mã hồ sơ công khai không tiết lộ ID tăng dần trong URL.
begin;
-- Đồng bộ backfill với các request đang ghi điểm, không ghi đè điểm mới.
lock table public.movie_comments, public.viewer_history, public.app_users in share row exclusive mode;
alter table public.app_users
  add column if not exists public_id uuid not null default gen_random_uuid(),
  add column if not exists cultivation_xp integer not null default 0 check (cultivation_xp >= 0),
  add column if not exists avatar_frame_id text not null default 'none';
create unique index if not exists app_users_public_id_key on public.app_users (public_id);

create table if not exists public.cultivation_awards (
  user_id bigint not null references public.app_users(id) on delete cascade,
  source_type text not null check (source_type in ('comment', 'watch')),
  source_key text not null,
  xp integer not null check (xp > 0),
  awarded_at timestamptz not null default now(),
  primary key (user_id, source_type, source_key)
);
alter table public.cultivation_awards enable row level security;
revoke all on public.cultivation_awards from anon, authenticated;
grant all on public.cultivation_awards to service_role;

create or replace function public.award_cultivation(
  awarded_user_id bigint, award_type text, award_key text, award_xp integer
) returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.cultivation_awards (user_id, source_type, source_key, xp)
    values (awarded_user_id, award_type, award_key, award_xp)
    on conflict do nothing;
  if found then
    update public.app_users set cultivation_xp = cultivation_xp + award_xp
      where id = awarded_user_id;
  end if;
end;
$$;
revoke all on function public.award_cultivation(bigint, text, text, integer) from public, anon, authenticated;
grant execute on function public.award_cultivation(bigint, text, text, integer) to service_role;

create or replace function public.award_comment_cultivation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'visible' then
    perform public.award_cultivation(
      new.user_id, 'comment',
      new.movie_id::text || ':' || (new.created_at at time zone 'UTC')::date::text,
      10
    );
  end if;
  return new;
end;
$$;
drop trigger if exists movie_comment_cultivation on public.movie_comments;
create trigger movie_comment_cultivation after insert on public.movie_comments
for each row execute function public.award_comment_cultivation();
revoke all on function public.award_comment_cultivation() from public, anon, authenticated;

create or replace function public.award_watch_cultivation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.duration_seconds >= 120
     and new.position_seconds >= 60
     and new.position_seconds <= new.duration_seconds + 5
     and new.progress >= 50
     and abs(new.progress - round(100.0 * new.position_seconds / nullif(new.duration_seconds, 0))) <= 5 then
    perform public.award_cultivation(new.user_id, 'watch', new.movie_id::text, 20);
  end if;
  return new;
end;
$$;
drop trigger if exists viewer_history_cultivation on public.viewer_history;
create trigger viewer_history_cultivation after insert or update on public.viewer_history
for each row execute function public.award_watch_cultivation();
revoke all on function public.award_watch_cultivation() from public, anon, authenticated;

-- Ghi nhận hoạt động cũ một lần. Bình luận đã xóa/ẩn không được tính.
insert into public.cultivation_awards (user_id, source_type, source_key, xp)
select distinct user_id, 'comment', movie_id::text || ':' || (created_at at time zone 'UTC')::date::text, 10
from public.movie_comments where status = 'visible'
on conflict do nothing;
insert into public.cultivation_awards (user_id, source_type, source_key, xp)
select user_id, 'watch', movie_id::text, 20 from public.viewer_history
where duration_seconds >= 120 and position_seconds >= 60
  and position_seconds <= duration_seconds + 5 and progress >= 50
  and abs(progress - round(100.0 * position_seconds / nullif(duration_seconds, 0))) <= 5
on conflict do nothing;
update public.app_users u set cultivation_xp = coalesce((
  select sum(a.xp) from public.cultivation_awards a where a.user_id = u.id
), 0);
commit;
