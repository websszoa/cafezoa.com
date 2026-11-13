-- =============================================================================
-- Cafezoa 사용자 프로필 스키마
--
-- 실행 순서
--   1. supabase-profile.sql
--   2. supabase-profile-info.sql
--   3. supabase-function.sql
--
-- 보안 원칙
--   - RLS(Row Level Security)를 항상 활성화합니다.
--   - 일반 사용자는 자신의 프로필만 조회/수정할 수 있습니다.
--   - role, visit_count, 탈퇴 정보는 클라이언트가 직접 수정할 수 없습니다.
--   - 관리자 전체 조회 정책은 supabase-function.sql에서 추가합니다.
-- =============================================================================

begin;

-- 애플리케이션 역할입니다. 새 사용자는 항상 user로 생성됩니다.
do $$
begin
  create type public.app_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  -- auth.users.id와 1:1로 연결합니다.
  id uuid primary key references auth.users (id) on delete cascade,

  email text not null,
  name text,
  role public.app_role not null default 'user',
  visit_count bigint not null default 0 check (visit_count >= 0),

  -- 소프트 탈퇴용 필드입니다. 실제 Auth 계정 삭제는 서버에서 처리합니다.
  is_withdrawn boolean not null default false,
  withdrawn_at timestamptz,

  avatar_url text,
  phone text,
  bio text,
  auth_provider text not null default 'google',

  -- 사용자가 '내 위치 사용하기'로 저장한 위치입니다. (로그인 사용자 위치 저장)
  -- 위도·경도는 함께 저장하거나 함께 비웁니다.
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),

  last_sign_in_at timestamptz,
  last_visited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_withdrawn_at_check check (
    (is_withdrawn = true and withdrawn_at is not null)
    or (is_withdrawn = false and withdrawn_at is null)
  ),
  constraint profiles_location_pair_check check (
    (latitude is null) = (longitude is null)
  )
);

-- 이미 profiles 테이블이 있는 프로젝트에 위도·경도 컬럼을 추가합니다.
-- (create table if not exists는 기존 테이블을 바꾸지 않으므로 별도로 실행합니다)
alter table public.profiles
  add column if not exists latitude numeric(9, 6)
    check (latitude between -90 and 90),
  add column if not exists longitude numeric(9, 6)
    check (longitude between -180 and 180);

alter table public.profiles
  drop constraint if exists profiles_location_pair_check;
alter table public.profiles
  add constraint profiles_location_pair_check check (
    (latitude is null) = (longitude is null)
  );

comment on table public.profiles is
  'Supabase Auth 사용자와 1:1로 연결되는 Cafezoa 기본 프로필';
comment on column public.profiles.id is 'auth.users.id와 동일한 사용자 UUID';
comment on column public.profiles.role is 'user 또는 admin. 클라이언트 직접 변경 금지';
comment on column public.profiles.visit_count is 'record_profile_visit()로 증가하는 누적 방문 횟수';
comment on column public.profiles.is_withdrawn is '소프트 탈퇴 여부';
comment on column public.profiles.auth_provider is '최초 가입 OAuth 공급자(예: google)';
comment on column public.profiles.latitude is
  '사용자가 저장한 내 위치 위도(WGS84). 경도와 함께 저장하거나 함께 비움';
comment on column public.profiles.longitude is
  '사용자가 저장한 내 위치 경도(WGS84). 위도와 함께 저장하거나 함께 비움';

-- 초기 단계에서는 사용되지 않는 보조 인덱스를 만들지 않습니다.
-- id 기본 키 인덱스로 본인 조회와 관리자 판별 쿼리를 처리할 수 있습니다.
-- 실제 관리자 검색 쿼리가 확정되면 EXPLAIN ANALYZE 결과에 따라 추가하세요.
drop index if exists public.profiles_email_lower_idx;
drop index if exists public.profiles_role_idx;
drop index if exists public.profiles_active_idx;

alter table public.profiles enable row level security;

-- Supabase 프로젝트의 기본 권한 상태와 관계없이 명시적으로 최소 권한만 부여합니다.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
-- 방문 관련 컬럼은 SECURITY INVOKER RPC가 갱신할 때 필요합니다.
-- 임의 값 변경은 supabase-function.sql의 검증 트리거가 차단합니다.
-- latitude/longitude는 사용자가 자기 위치를 저장·삭제할 때 필요합니다. (본인 행만: profiles_update_own 정책)
grant update (
  name,
  avatar_url,
  phone,
  bio,
  latitude,
  longitude,
  visit_count,
  last_visited_at
) on table public.profiles to authenticated;

-- 함수 SQL을 재적용하기 전에는 본인 조회 정책만 유지합니다.
-- 기존 통합 정책이 있으면 제거하여 SELECT 정책 중복을 방지합니다.
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

commit;

-- 관리자 지정 예시(이메일을 실제 관리자 이메일로 변경 후 SQL Editor에서 실행):
-- update public.profiles
-- set role = 'admin'
-- where email = 'admin@example.com';
