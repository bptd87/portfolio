import AgencyCategoryPageClient from "../_components/AgencyCategoryPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return resolveMetadataFromParams({ params: { path: ["rendering"] } });
}

export default function RenderingPage() {
  return (
    <AgencyCategoryPageClient
      categorySlug="rendering"
      title="Rendering & Visualization"
      subtitle="Photo-realistic 3D visualization and conceptual illustration for theatre, events, and architecture."
      description="Rendering is how I think through space, communicate ideas, and collaborate in real time."
      seoDescription="High-fidelity 3D rendering and architectural visualization portfolio. Expert in Vectorworks, Cinema 4D, and Redshift for theatrical design, event planning, and spatial concepts."
      detailedContent={
        <>
          <p className="mb-6">
            I use rendering as an active design tool throughout the process—not just as
            a final deliverable. Working primarily in Vectorworks and Twinmotion, I
            build environments to test scale, lighting, composition, and audience
            perspective early and often.
          </p>
          <p>
            These images serve as the primary language for collaboration with directors,
            producers, and production teams, ensuring artistic intent is aligned long
            before construction begins. The emphasis is on clarity, atmosphere, and
            architectural precision over empty spectacle.
          </p>
        </>
      }
    />
  );
}
