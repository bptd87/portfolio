import AgencyCategoryPageClient from "../_components/AgencyCategoryPageClient";
import { resolveMetadataFromParams } from "../seo/resolve-metadata";

export async function generateMetadata() {
  return resolveMetadataFromParams({ params: { path: ["scenic-models"] } });
}

export default function ScenicModelsPage() {
  return (
    <AgencyCategoryPageClient
      categorySlug="scenic-models"
      title="Scenic Models"
      subtitle="Hand-crafted 1:48 and 1:25 scale models exploring space, texture, and form."
      description="Physical models remain essential to how I design, test, and refine ideas."
      seoDescription="Portfolio of hand-crafted scenic models for theatre and events. Detailed 1:48 and 1:25 scale white models and full-color presentation models exploring spatial relationships."
      detailedContent={
        <>
          <p className="mb-6">
            Alongside digital workflows, I regularly build physical scenic models to
            explore proportion, structure, and material logic in a tangible way. The
            model allows me to step away from the screen and evaluate spatial
            relationships with true depth and texture—something that remains central to
            theatrical design.
          </p>
          <p>
            Whether a quick "white model" for sketching out blocking or a fully realized
            presentation model for the final pitch, these physical artifacts bridge the
            gap between concept and construction, providing a shared focal point for
            the entire creative team.
          </p>
        </>
      }
    />
  );
}
