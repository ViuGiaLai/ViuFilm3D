-- Deduplicated, atomic view counter used by the public playback API.
-- A view is unique per movie/playback/browser within each six-hour window.

create table if not exists public.movie_view_events (
  id bigint generated always as identity primary key,
  movie_id bigint not null references public.movies(id) on delete cascade,
  playback_key text not null check (
    playback_key = 'trailer' or playback_key ~ '^episode-[1-9][0-9]*$'
  ),
  viewer_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists movie_view_events_created_at_idx
  on public.movie_view_events (created_at);
create index if not exists movie_view_events_lookup_idx
  on public.movie_view_events (movie_id, playback_key, viewer_id, created_at desc);

alter table public.movie_view_events enable row level security;
revoke all on public.movie_view_events from anon, authenticated;
grant all on public.movie_view_events to service_role;

create or replace function public.record_movie_view(
  p_movie_id bigint,
  p_playback_key text,
  p_viewer_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  has_recent_view boolean := false;
  was_inserted boolean := false;
  next_views bigint := 0;
begin
  -- Serialize requests for the same viewer/playback to prevent two tabs from
  -- passing the duplicate check at exactly the same time.
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_movie_id::text || ':' || p_playback_key || ':' || p_viewer_id::text,
      0
    )
  );

  select exists (
    select 1
    from public.movie_view_events
    where movie_id = p_movie_id
      and playback_key = p_playback_key
      and viewer_id = p_viewer_id
      and created_at >= now() - interval '6 hours'
  ) into has_recent_view;

  if not has_recent_view then
    insert into public.movie_view_events (movie_id, playback_key, viewer_id)
    values (p_movie_id, p_playback_key, p_viewer_id);
    was_inserted := true;

    update public.movies
    set
      views = views + 1,
      updated_at = now()
    where id = p_movie_id
    returning views into next_views;
  else
    select views into next_views
    from public.movies
    where id = p_movie_id;
  end if;

  if next_views is null then
    raise exception 'Movie % not found', p_movie_id;
  end if;

  -- View events only serve the six-hour deduplication window.
  delete from public.movie_view_events
  where created_at < now() - interval '7 days';

  return jsonb_build_object(
    'views', next_views,
    'counted', was_inserted
  );
end;
$$;

revoke all on function public.record_movie_view(bigint, text, uuid) from public;
revoke all on function public.record_movie_view(bigint, text, uuid) from anon;
revoke all on function public.record_movie_view(bigint, text, uuid) from authenticated;
grant execute on function public.record_movie_view(bigint, text, uuid)
  to service_role;
