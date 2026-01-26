import React from 'react';
import { WalkthroughTemplate } from './WalkthroughTemplate';

interface LysistrataWalkthroughProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function LysistrataWalkthrough({ onNavigate }: LysistrataWalkthroughProps) {
  const walkthrough = {
    slug: 'lysistrata-walkthrough',
    title: 'Lysistrata (2021) Scenic Design – Outdoor Theatre During COVID',
    description: 'An outdoor production reimagined for a pandemic era—this scenic design for Lysistrata balanced ancient ritual with contemporary safety.',
    category: 'Project Walkthroughs',
    thumbnail: 'https://img.youtube.com/vi/ZjGy_3Ipk_w/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/ZjGy_3Ipk_w',
    duration: '1:45',
    publishDate: '2025-05-21',
    content: (
      <>
        <p>
          This scenic design walkthrough features my 2021 production of <em>Lysistrata</em> at the University of Texas at El Paso, directed by Jay Stratton. Modeled in Vectorworks and rendered in Twinmotion, the design transformed the Fox Fine Arts courtyard into a responsive, immersive outdoor theatre—presented as the first live performance on campus during the COVID-19 pandemic.
        </p>

        <h2>Design Challenge: Theatre in a Pandemic</h2>

        <p>
          The challenge was to reimagine classical performance within a contemporary public health context. Drawing from ancient Greek aesthetics and protest iconography, I designed a flexible environment rooted in ritual, resilience, and rebirth. The courtyard's Brutalist architecture served as a sculptural frame, while the playing spaces layered ground-level action with balcony-height movement, creating dynamic vertical compositions.
        </p>

        <h2>Scenic Strategy and Safety</h2>

        <p>
          Scenic elements included symbolic sculptures, custom-printed banners, and modular risers that defined a performance arena while remaining visually porous. I designed socially distanced audience pods—ranging from shielded dome seating to spaced plaza arrangements—to maintain intimacy without compromising safety. These zones were mapped out and visualized through animated walkthroughs, allowing for pre-show flow studies and visibility tests.
        </p>

        <h2>Form Meets Function</h2>

        <p>
          The scenic strategy was both conceptual and technical: how to invite a shared theatrical experience while addressing physical separation. Renderings played a central role in communicating not just form and material, but function—where spectators would sit, how actors would move, and how safety and symbolism could coexist in a single spatial narrative.
        </p>

        <p>
          This project became a case study in adaptive design—how performance spaces can honor classical text while speaking urgently to the moment. The video combines renderings, movement studies, and documentation to convey how this ancient comedy became a live, contemporary act of communal gathering.
        </p>

      </>
    ),
    credits: (
      <div className="opacity-70">
        <p className="text-sm">
          <strong>Scenic Design:</strong> Brandon PT Davis<br />
          <strong>Director:</strong> Jay Stratton<br />
          <strong>Production:</strong> University of Texas at El Paso, 2021<br />
          <strong>Context:</strong> First live performance on campus during COVID-19 pandemic<br />
          <strong>Software:</strong> Vectorworks | Twinmotion
        </p>
      </div>
    ),
    resources: [
      {
        name: 'Watch on YouTube',
        description: 'See how outdoor theatre adapted to pandemic-era safety protocols',
        url: 'https://youtu.be/ZjGy_3Ipk_w'
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
        slug: 'coraline-walkthrough',
        title: 'The Coraline Experience: Twinmotion Walkthrough of the Other World',
        thumbnail: 'https://img.youtube.com/vi/fazgboSnrQc/maxresdefault.jpg',
        duration: '2:10'
      }
    ]
  };

  return <WalkthroughTemplate walkthrough={walkthrough} onNavigate={onNavigate} />;
}
