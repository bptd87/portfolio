import React from 'react';
import { WalkthroughTemplate } from './WalkthroughTemplate';

interface CoralineWalkthroughProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function CoralineWalkthrough({ onNavigate }: CoralineWalkthroughProps) {
  const walkthrough = {
    slug: 'coraline-walkthrough',
    title: 'The Coraline Experience: Twinmotion Walkthrough of the Other World',
    description: 'Explore the Other World in this Twinmotion walkthrough of The Coraline Experience, a collaborative MFA Design project at UC Irvine that brought together scenic, lighting, costume, sound, and stage management.',
    category: 'Project Walkthroughs',
    thumbnail: 'https://img.youtube.com/vi/fazgboSnrQc/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/fazgboSnrQc',
    duration: '2:10',
    publishDate: '2025-05-21',
    content: (
      <>
        <p>
          In this Twinmotion walkthrough, I showcase the Other World environment I designed for <em>The Coraline Experience</em>, a collaborative concept created as part of the MFA Drama Design program at UC Irvine. Developed by scenic, lighting, costume, sound, and stage management students, the project reimagines Neil Gaiman's <em>Coraline</em> as an immersive, narrative-driven installation that invites guests to explore a twisted, memory-haunted version of the Jones family's home.
        </p>

        <h2>Designing the Other World</h2>

        <p>
          This walkthrough highlights the eerie architecture and environmental storytelling crafted for the "Other World" section of the experience. From the wasp maze to the decaying drawing room, each space was informed by a rich design narrative that expanded the original story and introduced new characters—BC and Thorn Jones, Coraline's adopted children.
        </p>

        <h2>Visualization as Collaboration</h2>

        <p>
          Rendered in Twinmotion (prior to its acquisition by Unreal Engine), this video serves as both a visual pitch and an artistic tool, helping to communicate mood, flow, and atmosphere across design departments. As part of a fully integrated design team, I worked closely with fellow MFA collaborators to ensure cohesion between lighting, costumes, sound cues, and scenic transitions.
        </p>

        <h2>Themed Entertainment Design</h2>

        <p>
          <em>The Coraline Experience</em> was designed as a themed entertainment concept, complete with interactive touchpoints, theatrical performances, and layered storytelling. The walkthrough allowed us to visualize how guests would move through the space, what emotions they might feel, and how design elements could guide their journey through wonder and fear.
        </p>

        <p>
          This project demonstrated how digital environments can serve as pre-visualization tools for complex, multi-departmental theatrical experiences—bridging the gap between concept art and spatial reality.
        </p>

      </>
    ),
    credits: (
      <div className="opacity-70">
        <p className="text-sm">
          <strong>Scenic Design:</strong> Brandon PT Davis<br />
          <strong>Program:</strong> UC Irvine MFA Drama Design<br />
          <strong>Collaboration:</strong> Scenic, Lighting, Costume, Sound, Stage Management<br />
          <strong>Software:</strong> Twinmotion
        </p>
      </div>
    ),
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'Experience the full walkthrough of the Other World environment',
        url: 'https://youtu.be/fazgboSnrQc'
      }
    ],
    relatedWalkthroughs: [
      {
        slug: 'footloose-walkthrough',
        title: 'Footloose (2024) Scenic Design Walkthrough – Stephens College',
        thumbnail: 'https://img.youtube.com/vi/9CgllDnbSHU/maxresdefault.jpg',
        duration: '1:20'
      },
      {
        slug: 'lysistrata-walkthrough',
        title: 'Lysistrata (2021) Scenic Design – Outdoor Theatre During COVID',
        thumbnail: 'https://img.youtube.com/vi/ZjGy_3Ipk_w/maxresdefault.jpg',
        duration: '1:45'
      }
    ]
  };

  return <WalkthroughTemplate walkthrough={walkthrough} onNavigate={onNavigate} />;
}
