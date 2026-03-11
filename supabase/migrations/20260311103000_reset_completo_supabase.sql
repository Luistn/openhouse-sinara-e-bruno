-- Reset completo do schema usado pela aplicacao
-- Objetivo: recriar do zero as tabelas, tipos, funcoes, gatilhos e politicas

BEGIN;

-- Garante geracao de UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove da publicacao realtime para evitar erro ao recriar tabela
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.gifts;

-- Remove objetos existentes (ordem importa)
DROP TRIGGER IF EXISTS update_gifts_updated_at ON public.gifts;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

DROP TABLE IF EXISTS public.gifts;
DROP TABLE IF EXISTS public.user_roles;

DROP TYPE IF EXISTS public.gift_category;
DROP TYPE IF EXISTS public.app_role;

-- Tipos
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.gift_category AS ENUM (
  'cozinha',
  'decoracao',
  'eletronicos',
  'banheiro',
  'quarto',
  'sala',
  'outros'
);

-- Tabela de papeis de usuario
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tabela principal de presentes
CREATE TABLE public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price numeric(10, 2),
  image_url text,
  purchase_url text NOT NULL,
  category public.gift_category NOT NULL DEFAULT 'outros',
  is_available boolean NOT NULL DEFAULT true,
  guest_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indices uteis
CREATE INDEX gifts_created_at_idx ON public.gifts (created_at);
CREATE INDEX gifts_is_available_idx ON public.gifts (is_available);
CREATE INDEX gifts_category_idx ON public.gifts (category);

-- Funcao de verificacao de papel (admin, etc)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Atualizacao automatica de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_gifts_updated_at
BEFORE UPDATE ON public.gifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Remove politicas antigas por seguranca
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can view gifts" ON public.gifts;
DROP POLICY IF EXISTS "Anyone can reserve a gift" ON public.gifts;
DROP POLICY IF EXISTS "Admins can insert gifts" ON public.gifts;
DROP POLICY IF EXISTS "Admins can update any gift" ON public.gifts;
DROP POLICY IF EXISTS "Admins can delete gifts" ON public.gifts;

-- user_roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- gifts
CREATE POLICY "Anyone can view gifts"
ON public.gifts
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can reserve a gift"
ON public.gifts
FOR UPDATE
TO anon, authenticated
USING (is_available = true)
WITH CHECK (is_available = false AND guest_name IS NOT NULL);

CREATE POLICY "Admins can insert gifts"
ON public.gifts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any gift"
ON public.gifts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gifts"
ON public.gifts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Reativa realtime para gifts
ALTER PUBLICATION supabase_realtime ADD TABLE public.gifts;

COMMIT;
