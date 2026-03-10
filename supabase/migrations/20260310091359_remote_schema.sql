
  create policy "Patients can view their images"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'medical-images'::text) AND (EXISTS ( SELECT 1
   FROM public.patient_accounts pa
  WHERE ((pa.user_id = auth.uid()) AND ((pa.patient_id)::text = split_part(objects.name, '/'::text, 1)))))));



