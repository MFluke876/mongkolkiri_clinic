drop extension if exists "pg_net";


  create table "public"."medical_images" (
    "id" uuid not null default gen_random_uuid(),
    "entity_type" text not null,
    "entity_id" uuid not null,
    "image_url" text not null,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."prescriptions" drop column "visit_id";

alter table "public"."procedure_orders" drop column "visit_id";

CREATE UNIQUE INDEX medical_images_pkey ON public.medical_images USING btree (id);

alter table "public"."medical_images" add constraint "medical_images_pkey" PRIMARY KEY using index "medical_images_pkey";

alter table "public"."medical_images" add constraint "medical_images_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) not valid;

alter table "public"."medical_images" validate constraint "medical_images_created_by_fkey";

grant delete on table "public"."medical_images" to "anon";

grant insert on table "public"."medical_images" to "anon";

grant references on table "public"."medical_images" to "anon";

grant select on table "public"."medical_images" to "anon";

grant trigger on table "public"."medical_images" to "anon";

grant truncate on table "public"."medical_images" to "anon";

grant update on table "public"."medical_images" to "anon";

grant delete on table "public"."medical_images" to "authenticated";

grant insert on table "public"."medical_images" to "authenticated";

grant references on table "public"."medical_images" to "authenticated";

grant select on table "public"."medical_images" to "authenticated";

grant trigger on table "public"."medical_images" to "authenticated";

grant truncate on table "public"."medical_images" to "authenticated";

grant update on table "public"."medical_images" to "authenticated";

grant delete on table "public"."medical_images" to "service_role";

grant insert on table "public"."medical_images" to "service_role";

grant references on table "public"."medical_images" to "service_role";

grant select on table "public"."medical_images" to "service_role";

grant trigger on table "public"."medical_images" to "service_role";

grant truncate on table "public"."medical_images" to "service_role";

grant update on table "public"."medical_images" to "service_role";


