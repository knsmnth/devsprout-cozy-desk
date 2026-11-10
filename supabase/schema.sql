-- ==============================================================================
-- DevSprout Cozy Desk - Supabase Database Schema
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Create table for storing user workspace JSON snapshots
create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_workspaces enable row level security;

-- 3. Row Level Security Policies (Idempotent: drop if exists then create)
-- Allow users to view their own workspace snapshot
drop policy if exists "Users can view own workspace" on public.user_workspaces;
create policy "Users can view own workspace"
  on public.user_workspaces for select
  using (auth.uid() = user_id);

-- Allow users to insert their own workspace snapshot
drop policy if exists "Users can insert own workspace" on public.user_workspaces;
create policy "Users can insert own workspace"
  on public.user_workspaces for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own workspace snapshot
drop policy if exists "Users can update own workspace" on public.user_workspaces;
create policy "Users can update own workspace"
  on public.user_workspaces for update
  using (auth.uid() = user_id);

-- 4. Helpful index for performance on updated_at
create index if not exists idx_user_workspaces_updated_at on public.user_workspaces(updated_at);

