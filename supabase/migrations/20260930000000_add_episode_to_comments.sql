alter table public.movie_comments
  add column if not exists episode_index smallint;
