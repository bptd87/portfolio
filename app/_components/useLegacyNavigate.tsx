"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useLegacyNavigate() {
  const router = useRouter();

  return useCallback(
    (page: string, slug?: string) => {
      // Guard against object being passed as page
      if (typeof page !== "string") {
        console.error("[useLegacyNavigate] Invalid page type:", typeof page, page);
        return;
      }
      // Guard against [object Object] string (accidental stringified object)
      if (page.includes("[object") || page === "undefined" || page === "null") {
        console.error("[useLegacyNavigate] Invalid page value:", page);
        return;
      }
      let targetPath = page;

      if (page === "home") {
        targetPath = "/";
      } else if (page === "portfolio" && slug && !page.includes("?")) {
        targetPath = `/portfolio?filter=${slug}`;
      } else if ((page === "articles" || page === "scenic-insights") && slug && !page.includes("?")) {
        targetPath = `/articles?category=${slug}`;
      } else if (page === "search" && slug && !page.includes("?")) {
        targetPath = `/search?q=${encodeURIComponent(slug)}`;
      } else if (page === "news" && slug && !page.includes("?")) {
        targetPath = `/news/${slug}`;
      } else if (["experiential-design", "rendering", "scenic-models"].includes(page) && slug) {
        targetPath = `/${page}/${slug}`;
      } else if (!targetPath.startsWith("/")) {
        targetPath = `/${targetPath}`;
      }

      router.push(targetPath);
    },
    [router],
  );
}
