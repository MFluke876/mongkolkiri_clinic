DROP POLICY "Doctors can manage roles" ON public.user_roles;

DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

CREATE TYPE public.app_role_new AS ENUM ('doctor', 'patient');

ALTER TABLE public.user_roles
ALTER COLUMN role TYPE public.app_role_new
USING role::text::public.app_role_new;

DROP TYPE public.app_role;

ALTER TYPE public.app_role_new RENAME TO app_role;

