"use client";

import dynamic from "next/dynamic";
import { SkeletonProjectDetail } from "@/src/components/skeletons/SkeletonProjectDetail";

const ProjectDetailPageClient = dynamic(
    () => import("./ProjectDetailPageClient"),
    {
        ssr: false,
        loading: () => <SkeletonProjectDetail />
    }
);

export default function ClientProjectWrapper({ slug }: { slug: string }) {
    return <ProjectDetailPageClient slug={slug} />;
}
