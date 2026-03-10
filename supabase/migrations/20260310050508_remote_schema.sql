revoke delete on table "public"."medical_images" from "anon";

revoke insert on table "public"."medical_images" from "anon";

revoke references on table "public"."medical_images" from "anon";

revoke select on table "public"."medical_images" from "anon";

revoke trigger on table "public"."medical_images" from "anon";

revoke truncate on table "public"."medical_images" from "anon";

revoke update on table "public"."medical_images" from "anon";

revoke delete on table "public"."medical_images" from "authenticated";

revoke insert on table "public"."medical_images" from "authenticated";

revoke references on table "public"."medical_images" from "authenticated";

revoke select on table "public"."medical_images" from "authenticated";

revoke trigger on table "public"."medical_images" from "authenticated";

revoke truncate on table "public"."medical_images" from "authenticated";

revoke update on table "public"."medical_images" from "authenticated";

revoke delete on table "public"."medical_images" from "service_role";

revoke insert on table "public"."medical_images" from "service_role";

revoke references on table "public"."medical_images" from "service_role";

revoke select on table "public"."medical_images" from "service_role";

revoke trigger on table "public"."medical_images" from "service_role";

revoke truncate on table "public"."medical_images" from "service_role";

revoke update on table "public"."medical_images" from "service_role";

alter table "public"."medical_images" drop constraint "medical_images_created_by_fkey";

alter table "public"."medical_images" drop constraint "medical_images_pkey";

drop index if exists "public"."medical_images_pkey";

drop table "public"."medical_images";

alter table "public"."patient_consultations" add column "has_images" boolean not null default false;

alter table "public"."patient_diagnoses" add column "has_images" boolean not null default false;

alter table "public"."procedure_orders" add column "has_images" boolean not null default false;


  create policy "Staff can delete medical images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'medical-images'::text) AND public.is_staff(auth.uid())));



  create policy "Staff can upload medical images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'medical-images'::text) AND public.is_staff(auth.uid())));



  create policy "Staff can view medical images"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'medical-images'::text) AND public.is_staff(auth.uid())));



