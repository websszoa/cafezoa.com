-- =============================================================================
-- Cafezoa 프로필 함수, 트리거 및 관리자 RLS 정책
--
-- 반드시 아래 순서로 마지막에 실행하세요.
--   1. supabase-profile.sql
--   2. supabase-profile-info.sql
--   3. supabase-function.sql (현재 파일)
--
-- 포함 기능
--   - Google/OAuth 신규 가입 시 public.profiles 자동 생성
--   - 기존 Auth 사용자 프로필 백필(backfill)
--   - updated_at 자동 갱신
--   - 로그인/방문 횟수의 안전한 증가
--   - RLS 재귀 없이 관리자 여부 확인
--   - 관리자의 profiles/profile_info 전체 조회
-- =============================================================================

begin;

-- 보안 함수는 Data API에 직접 노출되지 않는 private 스키마에 둡니다.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- -----------------------------------------------------------------------------
-- 1. updated_at 자동 갱신
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

-- profile_info는 수정 없는 로그 테이블이라 updated_at 트리거가 필요 없습니다.

-- 방문 횟수는 현재 값에서 정확히 1만 증가할 수 있습니다.
-- SECURITY INVOKER RPC에 필요한 컬럼 권한을 부여하면서도 임의 조작을 막습니다.
create or replace function private.validate_profile_visit_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- SQL Editor/service role 작업은 auth.uid()가 없으므로 이 검증의 대상이 아닙니다.
  if (select auth.uid()) is not null then
    if new.visit_count is distinct from old.visit_count then
      if new.visit_count <> old.visit_count + 1 then
        raise exception 'visit_count can only be incremented by 1.'
          using errcode = '22023';
      end if;

      -- 클라이언트가 전달한 시간이 아니라 DB 시간을 기록합니다.
      new.last_visited_at := now();
    elsif new.last_visited_at is distinct from old.last_visited_at then
      raise exception 'last_visited_at cannot be changed directly.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.validate_profile_visit_update()
  from public, anon, authenticated;

drop trigger if exists profiles_validate_visit_update on public.profiles;
create trigger profiles_validate_visit_update
before update on public.profiles
for each row
execute function private.validate_profile_visit_update();

-- -----------------------------------------------------------------------------
-- 2. 신규 Auth 사용자 프로필 자동 생성 및 재로그인 시 동기화
--    Google은 일반적으로 full_name/name, avatar_url/picture 메타데이터를 제공합니다.
--    역할은 외부 메타데이터를 신뢰하지 않고 항상 user로 생성합니다.
--    email, name, avatar_url, last_sign_in_at은 매 로그인마다 Google의 최신
--    값으로 덮어씁니다(사용자가 앱에서 별도로 수정하는 필드가 아니므로 항상 동기화).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    name,
    role,
    avatar_url,
    auth_provider,
    last_sign_in_at
  )
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data ->> 'email', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'user_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    'user'::public.app_role,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    ),
    coalesce(new.raw_app_meta_data ->> 'provider', 'google'),
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    auth_provider = excluded.auth_provider,
    last_sign_in_at = excluded.last_sign_in_at;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- 재로그인 또는 Google 프로필 변경 시 이메일, 이미지, 로그인 시간을 동기화합니다.
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, last_sign_in_at, raw_user_meta_data, raw_app_meta_data
on auth.users
for each row
execute function public.handle_new_auth_user();

-- 이 SQL을 적용하기 전에 가입한 Auth 사용자도 프로필을 생성합니다.
insert into public.profiles (
  id,
  email,
  name,
  role,
  avatar_url,
  auth_provider,
  last_sign_in_at,
  created_at
)
select
  users.id,
  coalesce(users.email, users.raw_user_meta_data ->> 'email', ''),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    nullif(users.raw_user_meta_data ->> 'name', ''),
    nullif(users.raw_user_meta_data ->> 'user_name', ''),
    split_part(coalesce(users.email, ''), '@', 1)
  ),
  'user'::public.app_role,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(users.raw_user_meta_data ->> 'picture', '')
  ),
  coalesce(users.raw_app_meta_data ->> 'provider', 'google'),
  users.last_sign_in_at,
  users.created_at
from auth.users as users
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 3. 관리자 판별
--    profiles의 RLS 정책 안에서 profiles를 직접 조회하면 무한 재귀가 생기므로,
--    private SECURITY DEFINER 함수로 분리합니다.
-- -----------------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'::public.app_role
      and is_withdrawn = false
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- 본인 조회와 관리자 전체 조회를 하나의 정책으로 합칩니다.
-- 같은 역할/동작에 permissive 정책이 여러 개 생기는 Advisor 경고를 방지합니다.
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or (select private.is_admin())
  );

drop policy if exists "profile_info_select_admin" on public.profile_info;
drop policy if exists "profile_info_select_own" on public.profile_info;
drop policy if exists "profile_info_select_own_or_admin" on public.profile_info;
create policy "profile_info_select_own_or_admin"
  on public.profile_info
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select private.is_admin())
  );

-- -----------------------------------------------------------------------------
-- 4. 방문 횟수 증가 RPC
--    호출자의 RLS와 컬럼 권한으로 실행하여 SECURITY DEFINER 경고를 없앱니다.
--    검증 트리거가 visit_count의 1 증가만 허용합니다.
-- -----------------------------------------------------------------------------
create or replace function public.record_profile_visit()
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_visit_count bigint;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  update public.profiles
  set
    visit_count = visit_count + 1,
    last_visited_at = now()
  where id = current_user_id
    and is_withdrawn = false
  returning visit_count into new_visit_count;

  if new_visit_count is null then
    raise exception 'Active profile not found.' using errcode = 'P0002';
  end if;

  return new_visit_count;
end;
$$;

revoke all on function public.record_profile_visit() from public, anon;
grant execute on function public.record_profile_visit() to authenticated;

comment on function public.record_profile_visit() is
  '현재 로그인 사용자의 방문 횟수를 1 증가시키고 누적 횟수를 반환';

commit;

-- =============================================================================
-- 운영 참고
-- =============================================================================
-- 1. 첫 관리자는 SQL Editor 또는 안전한 서버 환경에서만 지정하세요.
--      update public.profiles set role = 'admin' where email = '관리자 이메일';
--
-- 2. service_role/secret key는 RLS를 우회하므로 브라우저에 절대 노출하지 마세요.
--
-- 3. IP는 브라우저가 보내는 값을 신뢰하지 말고, 서버 Route Handler 또는
--    Supabase Edge Function에서 요청 헤더를 검증한 뒤 저장하세요.
--
-- 4. 위치/IP 접속 이력에는 보유 기간을 정하고 정기 삭제 작업을 추가하세요.
