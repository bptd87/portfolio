import { isSupabaseStorageUrl, optimizeSupabaseImage } from "./supabase-image-optimizer";

export type ImageOptimizePreset =
  | "thumbnail"
  | "card"
  | "hero"
  | "gallery"
  | "full"
  | {
      width?: number;
      height?: number;
      quality?: number;
      format?: "auto" | "webp" | "jpeg" | "png";
      resize?: "cover" | "contain" | "fill";
    };

export type ImageSource =
  | string
  | { url?: string; src?: string; path?: string }
  | null
  | undefined;

export function resolveImageUrl(value: ImageSource): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  const candidate = value.url || value.src || value.path;
  if (typeof candidate === "string") return candidate.trim() || undefined;
  return undefined;
}

export function buildOptimizedImageUrl(
  url: string | null | undefined,
  optimize?: ImageOptimizePreset,
  focusPoint?: { x: number; y: number }
): string | undefined {
  if (!url) return undefined;
  if (!optimize) return url;
  if (!isSupabaseStorageUrl(url)) return url;

  const preset = typeof optimize === "string" ? optimize : undefined;
  const custom = typeof optimize === "object" ? optimize : undefined;

  const width = custom?.width ??
    (preset === "thumbnail"
      ? 400
      : preset === "card"
        ? 900
        : preset === "hero"
          ? 1920
          : preset === "gallery"
            ? 1600
            : preset === "full"
              ? 2400
              : 1600);

  const height = custom?.height;
  const quality = custom?.quality ?? 80;
  const format = custom?.format ?? "auto";

  const resize = custom
    ? custom.resize
    : preset === "thumbnail" || preset === "card"
      ? "cover"
      : "contain";

  return (
    optimizeSupabaseImage(url, {
      width,
      height,
      quality,
      format,
      resize,
      focus: focusPoint,
    }) || url
  );
}
