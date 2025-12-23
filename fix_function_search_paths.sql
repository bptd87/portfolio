-- Fix security warnings by setting explicit search_path for SECURITY DEFINER functions

ALTER FUNCTION public.increment_project_like(uuid) SET search_path = public;
ALTER FUNCTION public.decrement_project_like(uuid) SET search_path = public;

ALTER FUNCTION public.increment_article_like(uuid) SET search_path = public;
ALTER FUNCTION public.decrement_article_like(uuid) SET search_path = public;

ALTER FUNCTION public.increment_project_view(uuid) SET search_path = public;
ALTER FUNCTION public.increment_article_view(uuid) SET search_path = public;
