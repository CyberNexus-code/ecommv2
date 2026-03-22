


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_order_items_from_basket"("p_basket_id" "uuid", "p_order_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$declare
v_order_total numeric;
begin

DELETE FROM public.order_items
WHERE order_id = p_order_id;

insert into public.order_items(
  id, 
  order_id, 
  item_name,
  item_id,
  quantity,
  unit_price,
  line_total,
  created_at,
  updated_at
)
select
gen_random_uuid(),
p_order_id,
i.name,
bi.item_id,
bi.quantity,
i.price,
bi.quantity * i.price,
now(),
now()
FROM public.basket_items bi
join public.items i ON bi.item_id = i.id
WHERE bi.basket_id = p_basket_id;

SELECT coalesce(sum(line_total), 0)
into v_order_total
from public.order_items
where order_id = p_order_id;

return v_order_total;

end;$$;


ALTER FUNCTION "public"."create_order_items_from_basket"("p_basket_id" "uuid", "p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_single_thumbnail_image"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.is_thumbnail = true then
  update public.item_images
  set is_thumbnail = false
  where item_id = new.item_id
  and id <> new.id;
  end if;

  return new;
  end;
  $$;


ALTER FUNCTION "public"."enforce_single_thumbnail_image"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_basket_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    v_order_id UUID;
    v_total NUMERIC;
BEGIN

    -- Only act if status changed
    IF NEW.status IS DISTINCT FROM OLD.status THEN

        -- Only create order on specific transition
        IF NEW.status = 'order_placed_pending_payment' THEN

            -- Prevent duplicate orders
            INSERT INTO public.orders (
                basket_id,
                user_id,
                status
            )
            VALUES (
                NEW.id,
                NEW.user_id,
                NEW.status
            )
            ON CONFLICT (basket_id)
            DO NOTHING
            RETURNING id INTO v_order_id;

            -- If order already existed, fetch it
            IF v_order_id IS NULL THEN
                SELECT id INTO v_order_id
                FROM public.orders
                WHERE basket_id = NEW.id;
            END IF;

            -- Copy basket items → order_items
            v_total := public.create_order_items_from_basket(
                NEW.id,
                v_order_id
            );

            -- Update order total
            UPDATE public.orders
            SET total = v_total
            WHERE id = v_order_id;

        ELSE
            -- If order already exists, only update status
            UPDATE public.orders
            SET status = NEW.status
            WHERE basket_id = NEW.id;
        END IF;

    END IF;

    RETURN NEW;

END;$$;


ALTER FUNCTION "public"."handle_basket_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data ->> 'username');
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_users"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  -- If the user is anonymous, only insert the ID and default role
  if new.is_anonymous then
    insert into public.profiles (id, role, created_at, updated_at)
    values (new.id, 'user', now(), now());
    return new;
  end if;

  -- For authenticated users, insert ID + optional app metadata (like username)
  insert into public.profiles (id, username, email, role, created_at, updated_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.email,
    'client',
    now(),
    now()
  );

  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_basket_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_basket_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_baskets_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_baskets_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_categories_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_categories_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_order_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_order_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_order_placed_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if NEW.status = 'order_placed_pending_payment'
    and OLD.status is distinct from NEW.status
  then
    NEW.order_placed_at := now();
  end if;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."set_order_placed_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_orders_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_orders_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_payments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin 
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_payments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."basket_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "basket_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."basket_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."baskets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" "uuid",
    "status" "text" DEFAULT 'open'::"text",
    "order_placed_at" timestamp with time zone,
    CONSTRAINT "baskets_owner_check" CHECK ((("user_id" IS NOT NULL) OR ("session_id" IS NOT NULL))),
    CONSTRAINT "baskets_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'order_placed_pending_payment'::"text", 'order_placed_payment_received'::"text", 'order_shipped'::"text", 'closed'::"text", 'suspended_pending_payment'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."baskets" OWNER TO "postgres";


COMMENT ON COLUMN "public"."baskets"."order_placed_at" IS 'order placed timestamp';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."item_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_thumbnail" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "storage_path" "text" NOT NULL
);


ALTER TABLE "public"."item_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "quantity" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "line_total" numeric DEFAULT 0 NOT NULL,
    "item_name" "text"
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."order_items"."item_name" IS 'Item name';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total" numeric(10,2) DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT ''::"text" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "order_number" bigint NOT NULL,
    "basket_id" "uuid" NOT NULL,
    "cancelled_by" "text",
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'order_placed_pending_payment'::"text", 'order_placed_payment_received'::"text", 'order_shipped'::"text", 'completed'::"text", 'suspended_pending_payment'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."orders"."cancelled_by" IS 'Cancelled by client or admin?';



ALTER TABLE "public"."orders" ALTER COLUMN "order_number" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."orders_order_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "method" "text" DEFAULT 'card'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "transaction_id" "text",
    "is_deleted" boolean DEFAULT false NOT NULL,
    "create_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payments_method_check" CHECK (("method" = ANY (ARRAY['card'::"text", 'paypal'::"text", 'mobile'::"text", 'bank_transfer'::"text"]))),
    CONSTRAINT "payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'user'::"text",
    "username" "text",
    "first_name" "text",
    "last_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "delivery_address" "text",
    "postal_code" numeric,
    "city" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."email" IS 'User emails';



COMMENT ON COLUMN "public"."profiles"."delivery_address" IS 'Address for delivery';



COMMENT ON COLUMN "public"."profiles"."postal_code" IS 'Delivery postal code';



COMMENT ON COLUMN "public"."profiles"."city" IS 'City';



ALTER TABLE ONLY "public"."basket_items"
    ADD CONSTRAINT "basket_item_unique" UNIQUE ("basket_id", "item_id");



ALTER TABLE ONLY "public"."basket_items"
    ADD CONSTRAINT "basket_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."baskets"
    ADD CONSTRAINT "baskets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_images"
    ADD CONSTRAINT "item_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_basket_unique" UNIQUE ("basket_id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_unique" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "basket_items_basket_idx" ON "public"."basket_items" USING "btree" ("basket_id");



CREATE INDEX "basket_items_item_idx" ON "public"."basket_items" USING "btree" ("item_id");



CREATE INDEX "baskets_user_idx" ON "public"."baskets" USING "btree" ("user_id");



CREATE INDEX "categories_active_idx" ON "public"."categories" USING "btree" ("is_active");



CREATE INDEX "idx_baskets_session_id" ON "public"."baskets" USING "btree" ("session_id");



CREATE INDEX "idx_baskets_user_id" ON "public"."baskets" USING "btree" ("user_id");



CREATE INDEX "idx_item_images_item_id" ON "public"."item_images" USING "btree" ("item_id");



CREATE INDEX "idx_item_images_sort_order" ON "public"."item_images" USING "btree" ("item_id", "sort_order");



CREATE INDEX "items_active_idx" ON "public"."items" USING "btree" ("is_active");



CREATE INDEX "items_category_idx" ON "public"."items" USING "btree" ("category_id");



CREATE INDEX "order_items_item_idx" ON "public"."order_items" USING "btree" ("item_id");



CREATE INDEX "order_items_order_idx" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "orders_status_idx" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "orders_user_idx" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "payments_order_idx" ON "public"."payments" USING "btree" ("order_id");



CREATE INDEX "payments_status_idx" ON "public"."payments" USING "btree" ("status");



CREATE UNIQUE INDEX "ux_item_images_one_thumbnail" ON "public"."item_images" USING "btree" ("item_id") WHERE ("is_thumbnail" = true);



CREATE OR REPLACE TRIGGER "basket_status_trigger" AFTER UPDATE ON "public"."baskets" FOR EACH ROW EXECUTE FUNCTION "public"."handle_basket_status_change"();



CREATE OR REPLACE TRIGGER "set_basket_items_updated_at" BEFORE UPDATE ON "public"."basket_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_basket_items_updated_at"();



CREATE OR REPLACE TRIGGER "set_baskets_updated_at" BEFORE UPDATE ON "public"."baskets" FOR EACH ROW EXECUTE FUNCTION "public"."set_baskets_updated_at"();



CREATE OR REPLACE TRIGGER "set_categories_updated_at" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_categories_updated_at"();



CREATE OR REPLACE TRIGGER "set_items_updated_at" BEFORE UPDATE ON "public"."items" FOR EACH ROW EXECUTE FUNCTION "public"."set_items_updated_at"();



CREATE OR REPLACE TRIGGER "set_order_items_updated_at" BEFORE UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_order_items_updated_at"();



CREATE OR REPLACE TRIGGER "set_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_orders_updated_at"();



CREATE OR REPLACE TRIGGER "set_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."set_payments_updated_at"();



CREATE OR REPLACE TRIGGER "trf_enforce_single_thumbnail_image" BEFORE INSERT OR UPDATE OF "is_thumbnail" ON "public"."item_images" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_single_thumbnail_image"();



CREATE OR REPLACE TRIGGER "trigger_set_order_placed_timestamp" BEFORE UPDATE ON "public"."baskets" FOR EACH ROW EXECUTE FUNCTION "public"."set_order_placed_timestamp"();



ALTER TABLE ONLY "public"."basket_items"
    ADD CONSTRAINT "basket_items_basket_id_fkey" FOREIGN KEY ("basket_id") REFERENCES "public"."baskets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."basket_items"
    ADD CONSTRAINT "basket_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."baskets"
    ADD CONSTRAINT "baskets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."baskets"
    ADD CONSTRAINT "fk_baskets_user" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."item_images"
    ADD CONSTRAINT "item_images_product_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_basket_fkey" FOREIGN KEY ("basket_id") REFERENCES "public"."baskets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_profile_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Prevent assigning deleted categories" ON "public"."items" FOR INSERT WITH CHECK ((("category_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."categories"
  WHERE (("categories"."id" = "items"."category_id") AND ("categories"."is_deleted" = false))))));



CREATE POLICY "Public read" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Public read" ON "public"."items" FOR SELECT USING (true);



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_order_items_from_basket"("p_basket_id" "uuid", "p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order_items_from_basket"("p_basket_id" "uuid", "p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order_items_from_basket"("p_basket_id" "uuid", "p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_single_thumbnail_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_single_thumbnail_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_single_thumbnail_image"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_basket_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_basket_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_basket_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_users"() TO "service_role";






GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_basket_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_basket_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_basket_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_baskets_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_baskets_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_baskets_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_categories_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_categories_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_categories_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_order_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_order_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_order_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_order_placed_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_order_placed_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_order_placed_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_orders_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_orders_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_orders_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_payments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_payments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_payments_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."basket_items" TO "anon";
GRANT ALL ON TABLE "public"."basket_items" TO "authenticated";
GRANT ALL ON TABLE "public"."basket_items" TO "service_role";



GRANT ALL ON TABLE "public"."baskets" TO "anon";
GRANT ALL ON TABLE "public"."baskets" TO "authenticated";
GRANT ALL ON TABLE "public"."baskets" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."item_images" TO "anon";
GRANT ALL ON TABLE "public"."item_images" TO "authenticated";
GRANT ALL ON TABLE "public"."item_images" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON SEQUENCE "public"."orders_order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."orders_order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."orders_order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";




























