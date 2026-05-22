-- ============================================================================
-- Is That Okay? — Initial forum schema (v1)
--
-- Run this once on a fresh Supabase project before the forum routes can write.
-- Idempotent: safe to re-run; uses CREATE IF NOT EXISTS / DROP IF EXISTS guards.
--
-- Tables:
--   profiles       — public profile, one per auth user
--   subs           — sub-community catalogue (Standards / Help / News / Robots)
--   posts          — top-level post in a sub
--   comments       — one-level-deep reply on a post
--   votes          — single owner-per-target vote ledger
--   reports        — public moderation queue
--   reserved_handles — usernames nobody can claim
--
-- RLS posture:
--   profiles    : public read, owner-only write
--   subs        : public read, no client write (admin via service role)
--   posts       : public read of approved+visible, owner-only insert/update/delete
--   comments    : same shape as posts
--   votes       : public read aggregate via RPC, owner-only mutate
--   reports     : public read of open + dismissed + removed (transparency), owner-only insert
-- ============================================================================

create extension if not exists citext;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        citext unique not null,
  username_display text not null,           -- preserves user casing
  bio             text,
  karma           int not null default 0,
  role            text not null default 'member' check (role in ('member', 'mod', 'admin')),
  banned_at       timestamptz,
  created_at      timestamptz not null default now(),
  constraint username_shape check (username ~ '^[a-z0-9_]{3,20}$')
);

create index if not exists profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

drop policy if exists profiles_read_all on public.profiles;
create policy profiles_read_all
  on public.profiles for select
  using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- reserved handles + simple profanity list
-- A determined attacker can still register variants; this just blocks the
-- low-effort impersonation + slur attempts.
-- ----------------------------------------------------------------------------

create table if not exists public.reserved_handles (
  username citext primary key,
  reason   text not null
);

-- RLS enabled with NO policies — direct client reads return zero rows.
-- The handle_available + claim_handle RPCs (defined below) are security definer
-- and bypass RLS, so handle validation still works server-side.
alter table public.reserved_handles enable row level security;

insert into public.reserved_handles (username, reason) values
  ('admin',     'system'),
  ('mod',       'system'),
  ('isthatokay',  'system'),
  ('ah',        'system'),
  ('claude',    'impersonation'),
  ('openai',    'impersonation'),
  ('anthropic', 'impersonation'),
  ('gemini',    'impersonation'),
  ('chatgpt',   'impersonation'),
  ('grok',      'impersonation'),
  ('null',      'reserved'),
  ('undefined', 'reserved')
on conflict (username) do nothing;

-- ----------------------------------------------------------------------------
-- subs (the four launch communities; add more via service role)
-- ----------------------------------------------------------------------------

create table if not exists public.subs (
  slug         text primary key check (slug ~ '^[a-z0-9-]{2,30}$'),
  name         text not null,
  tagline      text not null,
  description  text not null,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.subs enable row level security;

drop policy if exists subs_read_all on public.subs;
create policy subs_read_all
  on public.subs for select
  using (true);

insert into public.subs (slug, name, tagline, description, sort_order) values
  ('standards',
   'Standards',
   'Proposals · the canon',
   'Where The Five gets debated, expanded, and added to. New norms get proposed here.',
   1),
  ('help',
   'Help',
   'Honest help-seeking · no judgment',
   'The questions people are too embarrassed to ask. Real situations, no performance.',
   2),
  ('news',
   'News',
   'What just happened · what it means',
   'Links and reactions to AI ethics news, industry moves, robot incidents, research.',
   3),
  ('robots',
   'Robots',
   'Humanoids · the urgent frontier',
   'Humanoid robots in the home, in service, on the street. The conversation almost nobody is having yet.',
   4)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- posts
-- ----------------------------------------------------------------------------

create table if not exists public.posts (
  id                uuid primary key default gen_random_uuid(),
  sub_slug          text not null references public.subs(slug) on delete restrict,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  post_type         text not null default 'text' check (post_type in ('text', 'link', 'question')),
  title             text not null check (char_length(title) between 6 and 280),
  body              text,                              -- markdown for text/question posts
  link_url          text,                              -- for post_type = 'link'
  upvotes           int not null default 0,
  downvotes         int not null default 0,
  comment_count     int not null default 0,
  hot_score         double precision not null default 0,
  moderation_status text not null default 'approved' check (moderation_status in ('approved', 'needs_review', 'removed')),
  moderation_reason text,
  is_locked         boolean not null default false,
  deleted_at        timestamptz,
  edited_at         timestamptz,
  created_at        timestamptz not null default now(),
  constraint posts_body_or_link
    check (
      (post_type in ('text', 'question') and body is not null and char_length(body) between 1 and 10000)
      or (post_type = 'link' and link_url is not null and link_url ~ '^https?://')
    )
);

create index if not exists posts_sub_created_idx on public.posts (sub_slug, created_at desc) where deleted_at is null and moderation_status = 'approved';
create index if not exists posts_sub_hot_idx on public.posts (sub_slug, hot_score desc) where deleted_at is null and moderation_status = 'approved';
create index if not exists posts_user_idx on public.posts (user_id, created_at desc);

alter table public.posts enable row level security;

drop policy if exists posts_read_visible on public.posts;
create policy posts_read_visible
  on public.posts for select
  using (
    deleted_at is null
    and (moderation_status = 'approved' or auth.uid() = user_id)
  );

drop policy if exists posts_insert_self on public.posts;
create policy posts_insert_self
  on public.posts for insert
  with check (
    auth.uid() = user_id
    and moderation_status = 'needs_review'    -- clients can only insert as needs_review
  );

drop policy if exists posts_update_self on public.posts;
create policy posts_update_self
  on public.posts for update
  using (auth.uid() = user_id and is_locked = false)
  with check (auth.uid() = user_id);

-- Soft delete only (set deleted_at). Hard delete via service role for admin needs.
drop policy if exists posts_delete_self on public.posts;
create policy posts_delete_self
  on public.posts for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- comments (one-level-deep replies; no nested threads)
-- ----------------------------------------------------------------------------

create table if not exists public.comments (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.posts(id) on delete cascade,
  parent_id         uuid references public.comments(id) on delete cascade,  -- null = top-level
  user_id           uuid not null references public.profiles(id) on delete cascade,
  body              text not null check (char_length(body) between 1 and 5000),
  upvotes           int not null default 0,
  downvotes         int not null default 0,
  moderation_status text not null default 'approved' check (moderation_status in ('approved', 'needs_review', 'removed')),
  moderation_reason text,
  deleted_at        timestamptz,
  edited_at         timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id, created_at) where deleted_at is null and moderation_status = 'approved';
create index if not exists comments_user_idx on public.comments (user_id, created_at desc);

alter table public.comments enable row level security;

drop policy if exists comments_read_visible on public.comments;
create policy comments_read_visible
  on public.comments for select
  using (
    deleted_at is null
    and (moderation_status = 'approved' or auth.uid() = user_id)
  );

drop policy if exists comments_insert_self on public.comments;
create policy comments_insert_self
  on public.comments for insert
  with check (
    auth.uid() = user_id
    and moderation_status = 'needs_review'
  );

drop policy if exists comments_update_self on public.comments;
create policy comments_update_self
  on public.comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists comments_delete_self on public.comments;
create policy comments_delete_self
  on public.comments for delete
  using (auth.uid() = user_id);

-- Enforce one-level-deep: parent_id must point to a top-level (parent_id = null) comment.
create or replace function public.enforce_comment_depth()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is not null then
    if exists (select 1 from public.comments c where c.id = new.parent_id and c.parent_id is not null) then
      raise exception 'comment_depth_exceeded';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists comments_depth_guard on public.comments;
create trigger comments_depth_guard
  before insert or update on public.comments
  for each row execute function public.enforce_comment_depth();

-- ----------------------------------------------------------------------------
-- votes (one row per (user, target). target is either a post or a comment.)
-- ----------------------------------------------------------------------------

create table if not exists public.votes (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  target_type  text not null check (target_type in ('post', 'comment')),
  target_id    uuid not null,
  vote         int not null check (vote in (-1, 1)),
  created_at   timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create index if not exists votes_target_idx on public.votes (target_type, target_id);

alter table public.votes enable row level security;

drop policy if exists votes_read_self on public.votes;
create policy votes_read_self
  on public.votes for select
  using (auth.uid() = user_id);

drop policy if exists votes_write_self on public.votes;
create policy votes_write_self
  on public.votes for insert
  with check (auth.uid() = user_id);

drop policy if exists votes_update_self on public.votes;
create policy votes_update_self
  on public.votes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists votes_delete_self on public.votes;
create policy votes_delete_self
  on public.votes for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- reports (public moderation queue, transparency by design)
-- ----------------------------------------------------------------------------

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  target_type  text not null check (target_type in ('post', 'comment')),
  target_id    uuid not null,
  reason       text not null check (char_length(reason) between 4 and 500),
  status       text not null default 'open' check (status in ('open', 'dismissed', 'removed')),
  mod_note     text,
  resolved_by  uuid references public.profiles(id),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists reports_target_idx on public.reports (target_type, target_id);
create index if not exists reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

-- Anyone signed in can read all reports (transparency). No mod actions in the dark.
drop policy if exists reports_read_all on public.reports;
create policy reports_read_all
  on public.reports for select
  using (auth.uid() is not null);

drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self
  on public.reports for insert
  with check (auth.uid() = reporter_id and status = 'open');

-- Update only by mods/admins via service role; no client UPDATE policy.

-- ----------------------------------------------------------------------------
-- vote toggle RPC — owner-only, single round-trip, recomputes counts.
-- ----------------------------------------------------------------------------

create or replace function public.toggle_vote(
  p_target_type text,
  p_target_id   uuid,
  p_vote        int                          -- 1, -1, or 0 to clear
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing int;
  v_karma_owner uuid;
  v_karma_delta int := 0;
  v_up int;
  v_down int;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'reason', 'not_signed_in');
  end if;
  if p_target_type not in ('post', 'comment') then
    return json_build_object('ok', false, 'reason', 'bad_target_type');
  end if;
  if p_vote not in (-1, 0, 1) then
    return json_build_object('ok', false, 'reason', 'bad_vote');
  end if;

  -- Downvote karma gate: need ≥ 50 net karma to downvote.
  if p_vote = -1 then
    if (select karma from public.profiles where id = v_uid) < 50 then
      return json_build_object('ok', false, 'reason', 'karma_too_low_for_downvote');
    end if;
  end if;

  -- Resolve target author for karma adjustments.
  if p_target_type = 'post' then
    select user_id into v_karma_owner from public.posts where id = p_target_id;
  else
    select user_id into v_karma_owner from public.comments where id = p_target_id;
  end if;
  if v_karma_owner is null then
    return json_build_object('ok', false, 'reason', 'target_not_found');
  end if;
  if v_karma_owner = v_uid then
    return json_build_object('ok', false, 'reason', 'cant_vote_own');
  end if;

  -- Pull any existing vote.
  select vote into v_existing from public.votes
    where user_id = v_uid and target_type = p_target_type and target_id = p_target_id;

  if v_existing is null then
    if p_vote <> 0 then
      insert into public.votes (user_id, target_type, target_id, vote)
        values (v_uid, p_target_type, p_target_id, p_vote);
      v_karma_delta := p_vote;
    end if;
  else
    if p_vote = 0 then
      delete from public.votes
        where user_id = v_uid and target_type = p_target_type and target_id = p_target_id;
      v_karma_delta := -v_existing;
    elsif p_vote <> v_existing then
      update public.votes set vote = p_vote, created_at = now()
        where user_id = v_uid and target_type = p_target_type and target_id = p_target_id;
      v_karma_delta := p_vote - v_existing;
    end if;
  end if;

  -- Recount upvotes + downvotes for the target.
  select
    count(*) filter (where vote = 1),
    count(*) filter (where vote = -1)
  into v_up, v_down
  from public.votes
  where target_type = p_target_type and target_id = p_target_id;

  if p_target_type = 'post' then
    update public.posts
      set upvotes = v_up,
          downvotes = v_down,
          hot_score = compute_hot_score(v_up, v_down, created_at)
      where id = p_target_id;
  else
    update public.comments
      set upvotes = v_up,
          downvotes = v_down
      where id = p_target_id;
  end if;

  if v_karma_delta <> 0 then
    update public.profiles
      set karma = karma + v_karma_delta
      where id = v_karma_owner;
  end if;

  return json_build_object(
    'ok', true,
    'upvotes', v_up,
    'downvotes', v_down,
    'your_vote', coalesce(p_vote, 0)
  );
end;
$$;

-- Reddit-style hot algorithm (sign * order + age decay).
create or replace function public.compute_hot_score(p_up int, p_down int, p_ts timestamptz)
returns double precision
language sql
immutable
as $$
  select
    sign((p_up - p_down)::int)::double precision
    * log(greatest(abs(p_up - p_down), 1))
    + (extract(epoch from p_ts) - 1577836800) / 45000.0;
$$;

-- ----------------------------------------------------------------------------
-- comment count maintenance
-- ----------------------------------------------------------------------------

create or replace function public.bump_comment_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists comments_count_trigger on public.comments;
create trigger comments_count_trigger
  after insert or delete on public.comments
  for each row execute function public.bump_comment_count();

-- ----------------------------------------------------------------------------
-- new-user bootstrap: auth.users row → profiles row (created by handle picker)
-- Note: we DON'T auto-create a profile here because username pick happens
-- post-auth in the UI. The profile row is created by the user via /signup/handle
-- once they've chosen a unique username.
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- handle availability + claim helpers
-- ----------------------------------------------------------------------------

create or replace function public.handle_available(p_username citext)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_username !~ '^[a-zA-Z0-9_]{3,20}$' then
    return false;
  end if;
  if exists (select 1 from public.reserved_handles where username = lower(p_username)) then
    return false;
  end if;
  if exists (select 1 from public.profiles where username = lower(p_username)) then
    return false;
  end if;
  return true;
end;
$$;

create or replace function public.claim_handle(p_username text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_norm citext := lower(p_username);
begin
  if v_uid is null then
    return json_build_object('ok', false, 'reason', 'not_signed_in');
  end if;
  if not public.handle_available(v_norm) then
    return json_build_object('ok', false, 'reason', 'unavailable');
  end if;
  if exists (select 1 from public.profiles where id = v_uid) then
    return json_build_object('ok', false, 'reason', 'already_claimed');
  end if;

  insert into public.profiles (id, username, username_display)
    values (v_uid, v_norm, p_username);

  return json_build_object('ok', true, 'username', p_username);
end;
$$;
