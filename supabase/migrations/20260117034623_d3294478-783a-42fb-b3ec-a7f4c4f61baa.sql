-- 2. สร้าง function สำหรับกำหนด role อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_new_staff_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'doctor');
  RETURN NEW;
END;
$$;

-- 3. สร้าง trigger บน auth.users
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_staff_user();