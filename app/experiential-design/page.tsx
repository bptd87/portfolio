import AgencyCategoryPageClient from "../_components/AgencyCategoryPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata() {
  return resolveMetadataFromParams({ params: { path: ["experiential-design"] } });
}

export default function ExperientialDesignPage() {
  return (
    <AgencyCategoryPageClient
      categorySlug="experiential-design"
      title="Experiential Design"
      subtitle="Immersive environments and brand activations that bridge the physical and digital worlds."
      description="Creating moments of connection through space and story."
      seoDescription="Experiential design portfolio by Brandon PT Davis. Featuring immersive brand activations, pop-up environments, and interactive installations that engage audiences through spatial storytelling."
      detailedContent={
        <>
          <p className="mb-6">
            I come to experiential design through a background in theatre, where space
            is active, temporal, and inseparable from narrative. I design environments
            as sequences of moments—shaped by movement, atmosphere, and audience
            behavior—using technology only where it strengthens clarity and emotional
            connection.
          </p>
          <p>
            The work balances theatrical intuition with contemporary tools to create
            spaces that are felt as much as they are seen. Whether for a brand activation,
            a museum installation, or a live event, my goal is to create a unified world
            that invites the audience to step inside and become part of the story.
          </p>
        </>
      }
    />
  );
}
