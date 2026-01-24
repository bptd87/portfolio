import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/client";
import { SOCIAL_LINKS, SocialLink } from "../data/social-links";

export function useSocialLinks() {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>(SOCIAL_LINKS); // Default to static links
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const { data, error } = await supabase
                    .from("bio_links")
                    .select("*")
                    .eq("enabled", true)
                    .order("order", { ascending: true });

                if (error) {
                    console.error("Error fetching social links:", error);
                    // Keep fallback to static links
                    return;
                }

                if (data && data.length > 0) {
                    // Map DB structure to SocialLink interface
                    const mappedLinks: SocialLink[] = data.map((link: any) => ({
                        platform: link.platform || link.title, // Fallback to title if platform missing
                        url: link.url,
                        label: link.label || link.title,
                        icon: link.icon || "Link",
                    }));
                    setSocialLinks(mappedLinks);
                } else {
                    // Database is empty, use static fallback
                    console.log(
                        "No social links in database, using static fallback",
                    );
                    setSocialLinks(SOCIAL_LINKS);
                }
            } catch (err) {
                console.error("Failed to fetch social links:", err);
                // Keep fallback to static links
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, []);

    return { socialLinks, loading };
}
