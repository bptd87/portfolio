import React from 'react';
import { WalkthroughTemplate } from './WalkthroughTemplate';

interface FootlooseWalkthroughProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function FootlooseWalkthrough({ onNavigate }: FootlooseWalkthroughProps) {
  const walkthrough = {
    slug: 'footloose-walkthrough',
    title: 'Footloose (2024) Scenic Design Walkthrough – Stephens College | Vectorworks + Twinmotion',
    description: 'Go behind the scenes of my 2024 scenic design for Footloose at Stephens College. Built in Vectorworks and rendered in Twinmotion, this walkthrough explores how movement and energy informed each design choice.',
    category: 'Project Walkthroughs',
    thumbnail: 'https://img.youtube.com/vi/9CgllDnbSHU/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/9CgllDnbSHU',
    duration: '1:20',
    publishDate: '2025-05-21',
    content: (
      <>
        <p>
          This scenic design walkthrough features my 2024 production of <em>Footloose</em> at Stephens College. The set was modeled in Vectorworks and rendered in Twinmotion, with visual research images interwoven throughout to illustrate the design's evolution from concept to execution.
        </p>

        <p>
          When I began working with director Jamey Grisham, we made an early decision to set the musical in the present day—2024. This opened up the opportunity to reimagine the show through a contemporary lens, tapping into themes of repression, rebellion, and identity that resonate with today's audiences. I drew visual inspiration from the HBO series <em>Euphoria</em>, particularly its heightened realism and saturated color palette, aiming to mirror that emotional intensity onstage.
        </p>

        <h2>Design Philosophy: Movement and Modularity</h2>

        <p>
          The design relied on modular, flexible scenic units that could pivot and roll, supporting rapid transitions between scenes without losing atmosphere. From gymnasium to church to railroad bridge, each location emerged through shifting light, layered materials, and spatial gestures that echoed the narrative's underlying tensions—confinement and release, tradition and change.
        </p>

        <h2>Technical Approach</h2>

        <p>
          Technically, the process was both experimental and intentional. I created clean 3D models in Vectorworks and developed animated walkthroughs in Twinmotion, using them to test composition, rhythm, and lighting in motion. This allowed for real-time visual storytelling decisions well before construction began.
        </p>

        <p>
          As a video project, this was also a personal experiment in design documentation. The intercutting of musical excerpts, visual references, and animated renderings was a way to convey not just what the set looked like—but how it felt, moved, and responded to the pulse of the production.
        </p>

      </>
    ),
    credits: (
      <div className="opacity-70">
        <p className="text-sm">
          <strong>Scenic Design:</strong> Brandon PT Davis<br />
          <strong>Director:</strong> Jamey Grisham<br />
          <strong>Production:</strong> Stephens College, 2024<br />
          <strong>Software:</strong> Vectorworks | Twinmotion
        </p>
      </div>
    ),
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'View the full walkthrough video with audio commentary and visual research',
        url: 'https://youtu.be/9CgllDnbSHU'
      }
    ],
    relatedWalkthroughs: [
      {
        slug: 'coraline-walkthrough',
        title: 'The Coraline Experience: Twinmotion Walkthrough of the Other World',
        thumbnail: 'https://img.youtube.com/vi/fazgboSnrQc/maxresdefault.jpg',
        duration: '2:10'
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
