// Centralized news/updates data for Brandon PT Davis

// Block types for flexible news article content
export type NewsBlock = 
  | { type: 'text'; content: string }
  | { type: 'gallery'; images: { url: string; caption?: string }[] }
  | { type: 'team'; title: string; members: { role: string; name: string }[] }
  | { type: 'details'; title: string; items: { label: string; value: string }[] }
  | { type: 'link'; url: string; label: string }
  | { type: 'quote'; text: string; author?: string; source?: string };

export interface NewsItem {
  id: string;
  slug?: string;
  title: string;
  date: string; // YYYY-MM-DD format
  lastModified: string;
  category: 'Project Launch' | 'Career Milestone' | 'Publication/Feature' | 'Collaboration' | 'Award/Recognition' | 'Teaching/Speaking' | 'Other';
  excerpt: string;
  content?: string; // Full article body (optional)
  blocks?: NewsBlock[]; // Dynamic content blocks
  link?: string; // External URL (optional)
  location?: string; // Venue, company, city, etc. (optional)
  coverImage?: string;
  images?: { url: string; caption?: string }[]; // Deprecated - use blocks instead
  tags: string[];
}

export const newsItems: NewsItem[] = [
  {
    id: 'million-dollar-quartet-scr-debut',
    title: 'Making My SCR Debut: Million Dollar Quartet (2025)',
    date: '2025-08-29',
    lastModified: '2025-08-29',
    category: 'Project Launch',
    excerpt: 'Co-designing my first production at South Coast Repertory, one of the nation\'s leading regional theaters.',
    // Example: Gallery can have any number of images (0 to many)
    blocks: [
      { type: 'gallery', images: [
        { url: '', caption: 'Sun Records Recording Studio' },
        { url: '', caption: 'Full Stage View' },
        { url: '', caption: 'Detail: Vintage Recording Equipment' }
      ] }
    ],
    tags: ['SCR', 'South Coast Rep', 'Million Dollar Quartet', 'Co-Design Debut', 'Musical Theatre']
  },
  {
    id: 'assisting-the-play-that-goes-wrong',
    title: 'Assisting Tom Buderwitz on The Play That Goes Wrong at Seattle Rep',
    date: '2025-08-28',
    lastModified: '2025-08-28',
    category: 'Collaboration',
    excerpt: 'Working with Tom Buderwitz on this hilarious comedy at Seattle Repertory Theatre.',
    tags: ['Seattle Rep', 'The Play That Goes Wrong', 'Tom Buderwitz', 'Assistant Scenic Design']
  },
  {
    id: '40-productions-at-okoboji-summer-theatre',
    title: '40 Productions at Okoboji Summer Theatre',
    date: '2025-08-06',
    lastModified: '2025-08-06',
    category: 'Career Milestone',
    excerpt: 'Celebrating a milestone: my 40th scenic design for Okoboji Summer Theatre.',
    tags: ['Okoboji Summer Theatre', 'Career Milestone', 'Summer Stock']
  },
  {
    id: 'deathtrap-opening-ost',
    title: 'Opening Night: Deathtrap at Okoboji Summer Theatre',
    date: '2025-08-01',
    lastModified: '2025-08-01',
    category: 'Project Launch',
    excerpt: 'Ira Levin\'s clever thriller opens at OST.',
    tags: ['Okoboji Summer Theatre', 'Deathtrap', 'Thriller']
  },
  {
    id: 'fifth-season-utah-shakespeare-festival',
    title: 'Fifth Season Assisting Jo Winiarski — Utah Shakespeare Festival',
    date: '2025-06-27',
    lastModified: '2025-06-27',
    category: 'Collaboration',
    excerpt: 'Returning for my fifth season as assistant scenic designer at Utah Shakespeare Festival.',
    tags: ['Utah Shakespeare Festival', 'Jo Winiarski', 'Assistant Scenic Design']
  },
  {
    id: 'new-swan-season-2025',
    title: 'My Season as Scenic Designer for New Swan Shakespeare Festival (2025)',
    date: '2025-06-01',
    lastModified: '2025-06-01',
    category: 'Project Launch',
    excerpt: 'Designing two Shakespeare productions for New Swan\'s outdoor amphitheater.',
    tags: ['New Swan Shakespeare Festival', 'Shakespeare', 'Outdoor Theatre', 'Much Ado About Nothing', 'All\'s Well That Ends Well']
  },
  {
    id: 'romero-opening-university-of-missouri',
    title: 'Opening Night: Romero at University of Missouri',
    date: '2025-04-23',
    lastModified: '2025-04-23',
    category: 'Project Launch',
    excerpt: 'World premiere production exploring the life and martyrdom of Archbishop Óscar Romero.',
    tags: ['University of Missouri', 'Romero', 'World Premiere']
  },
  {
    id: 'okoboji-summer-2025-season',
    title: 'Scenic Design for Okoboji Summer Theatre — Summer 2025 Season',
    date: '2025-04-16',
    lastModified: '2025-04-16',
    category: 'Project Launch',
    excerpt: 'Announcing my designs for the 2025 summer season at Okoboji Summer Theatre.',
    tags: ['Okoboji Summer Theatre', 'Production Announcements']
  },
  {
    id: 'shut-up-sherlock-praised',
    title: 'Shut Up, Sherlock Praised in SLO Review',
    date: '2025-04-16',
    lastModified: '2025-04-16',
    category: 'Publication/Feature',
    excerpt: 'The Great American Melodrama\'s production receives positive review.',
    tags: ['Reviews', 'SLO Review', 'The Great American Melodrama', 'Shut Up Sherlock']
  },
  {
    id: 'how-to-succeed-opening-ost',
    title: 'Opening Night: How to Succeed in Business Without Really Trying at OST',
    date: '2025-04-07',
    lastModified: '2025-04-07',
    category: 'Project Launch',
    excerpt: 'The classic Pulitzer Prize-winning musical opens at Okoboji Summer Theatre.',
    tags: ['Okoboji Summer Theatre', 'How to Succeed in Business Without Really Trying', 'Musical Theatre']
  },
  {
    id: 'guys-on-ice-slo-review',
    title: 'Guys on Ice Receives Praise in SLO Review',
    date: '2025-02-19',
    lastModified: '2025-02-19',
    category: 'Publication/Feature',
    excerpt: 'Production at The Great American Melodrama highlighted in local press.',
    tags: ['Reviews', 'SLO Review', 'The Great American Melodrama', 'Guys on Ice']
  },
  {
    id: 'freaky-friday-review',
    title: 'Freaky Friday at Okoboji Summer Theatre Receives Praise',
    date: '2024-06-14',
    lastModified: '2024-06-14',
    category: 'Publication/Feature',
    excerpt: 'Local critics praise the inventive scenic design for this family musical.',
    tags: ['Reviews', 'Freaky Friday', 'Okoboji Summer Theatre', 'Spencer Daily Reporter']
  },
  {
    id: 'united-scenic-artists-local-usa-829',
    title: 'Joining United Scenic Artists, Local USA 829',
    date: '2024-04-30',
    lastModified: '2024-04-30',
    category: 'Career Milestone',
    excerpt: 'Officially joining the union for professional scenic, lighting, and costume designers.',
    tags: ['United Scenic Artists', 'Professional Milestones', 'Career']
  },
  {
    id: 'forum-review',
    title: 'Forum at Theatre SilCo Featured in Summit Daily',
    date: '2023-06-06',
    lastModified: '2023-06-06',
    category: 'Publication/Feature',
    excerpt: 'A Funny Thing Happened on the Way to the Forum receives local press coverage.',
    tags: ['Reviews', 'Summit Daily', 'Theatre SilCo', 'A Funny Thing Happened on the way to the Forum']
  },
  {
    id: 'okoboji-summer-2024-season',
    title: '2024 Okoboji Summer Theatre Season – Scenic Designs Announced',
    date: '2023-06-02',
    lastModified: '2023-06-02',
    category: 'Project Launch',
    excerpt: 'Season announcement for summer 2024 at Okoboji Summer Theatre.',
    tags: ['Okoboji Summer Theatre', 'Production Announcements']
  },
  {
    id: 'loteria-theatre-silco',
    title: 'Scenic Design for ¡Lotería: Game On! at Theatre SilCo',
    date: '2023-05-25',
    lastModified: '2023-05-25',
    category: 'Project Launch',
    excerpt: 'Immersive bilingual production blending theatre and game show elements.',
    tags: ['Theatre SilCo', '¡Lotería: Game On!', 'Immersive Theatre']
  },
  {
    id: 'assisting-the-fears',
    title: 'Assisting My First Off-Broadway Show — The Fears (April–May 2023)',
    date: '2023-04-15',
    lastModified: '2023-04-15',
    category: 'Collaboration',
    excerpt: 'Assistant scenic designer for The Fears at Pershing Square Signature Center in New York.',
    tags: ['Off-Broadway', 'The Fears', 'Assistant Scenic Design', 'Chicago Move']
  },
  {
    id: 'stephens-college-update-spring-2022',
    title: 'Stephens College Update: Looking Ahead to Spring 2022',
    date: '2022-03-15',
    lastModified: '2022-03-15',
    category: 'Career Milestone',
    excerpt: 'Updates on teaching and productions at Stephens College.',
    tags: ['Stephens College', 'Academia', 'Teaching']
  },
  {
    id: 'returning-to-stephens-college',
    title: 'Returning to Stephens College as Assistant Professor of Scenic Design',
    date: '2021-07-09',
    lastModified: '2021-07-09',
    category: 'Career Milestone',
    excerpt: 'Joining the faculty at Stephens College to teach scenic design.',
    tags: ['Stephens College', 'Academia', 'Teaching', 'Career']
  },
  {
    id: 'lysistrata-utep-spring-2021',
    title: 'Scenic Design for Lysistrata at UTEP — Spring 2021',
    date: '2021-04-15',
    lastModified: '2021-04-15',
    category: 'Project Launch',
    excerpt: 'Immersive scenic design for Aristophanes\' Greek comedy.',
    tags: ['UTEP', 'Lysistrata', 'Immersive Theatre']
  },
  {
    id: 'graduating-from-uci-pandemic',
    title: 'Graduating from UCI in the Middle of a Pandemic',
    date: '2020-06-17',
    lastModified: '2020-06-17',
    category: 'Career Milestone',
    excerpt: 'Completing my MFA during the COVID-19 pandemic.',
    tags: ['UC Irvine', 'MFA Graduation', 'Covid-19', 'UC Irvine Alumni']
  },
  {
    id: 'new-role-utep',
    title: 'New Role at UTEP — Assistant Professor of Scenic Design & Technology',
    date: '2020-05-12',
    lastModified: '2020-05-12',
    category: 'Career Milestone',
    excerpt: 'Starting a new position at University of Texas El Paso.',
    tags: ['UTEP', 'Academia', 'Teaching', 'Career']
  },
  {
    id: 'company-review',
    title: 'Company at UC Irvine Highlighted in StageSceneLA',
    date: '2019-11-13',
    lastModified: '2019-11-13',
    category: 'Publication/Feature',
    excerpt: 'Production receives critical acclaim from Los Angeles theatre critics.',
    tags: ['Reviews', 'StageSceneLA', 'UC Irvine', 'Company']
  },
  {
    id: 'the-pajama-game-stagescenela',
    title: 'The Pajama Game Receives Praise from StageSceneLA',
    date: '2019-06-13',
    lastModified: '2019-06-13',
    category: 'Publication/Feature',
    excerpt: 'Critics praise the nostalgic 1950s factory setting.',
    tags: ['Reviews', 'StageSceneLA', 'UC Irvine', 'The Pajama Game']
  },
  {
    id: 'parliament-square-california-premiere',
    title: 'Scenic Design for Parliament Square — California Premiere at UCI',
    date: '2019-03-09',
    lastModified: '2019-03-09',
    category: 'Project Launch',
    excerpt: 'California premiere of James Fritz\'s play about peace activist Brian Haw.',
    tags: ['UC Irvine', 'Parliament Square', 'Premiere']
  },
  {
    id: 'american-idiot-review',
    title: 'American Idiot at UC Irvine Reviewed in The Show Report',
    date: '2018-06-11',
    lastModified: '2018-06-11',
    category: 'Publication/Feature',
    excerpt: 'Green Day rock musical receives positive reviews.',
    tags: ['Reviews', 'UC Irvine', 'American Idiot']
  },
  {
    id: 'heading-to-uc-irvine',
    title: 'Heading to UC Irvine for My MFA',
    date: '2017-04-21',
    lastModified: '2017-04-21',
    category: 'Career Milestone',
    excerpt: 'Starting graduate school in scenic design at UC Irvine.',
    tags: ['UC Irvine', 'MFA', 'Graduate School', 'Education']
  },
  {
    id: 'the-foreigner-review',
    title: 'The Foreigner Praised in The Tribune',
    date: '2017-02-23',
    lastModified: '2017-02-23',
    category: 'Publication/Feature',
    excerpt: 'Production at The Great American Melodrama receives acclaim.',
    tags: ['Reviews', 'The Tribune', 'The Great American Melodrama', 'The Foreigner']
  }
];

// Helper functions with memoization for performance
let _sortedNews: NewsItem[] | null = null;
const _recentNewsCache: Map<number, NewsItem[]> = new Map();

const getSortedNews = () => {
  if (!_sortedNews) {
    _sortedNews = [...newsItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return _sortedNews;
};

export const getRecentNews = (count: number = 5) => {
  if (!_recentNewsCache.has(count)) {
    _recentNewsCache.set(count, getSortedNews().slice(0, count));
  }
  return _recentNewsCache.get(count)!;
};

export const getNewsByCategory = (category: NewsItem['category']) => 
  newsItems.filter(n => n.category === category);

export const getNewsById = (id: string) => newsItems.find(n => n.id === id);

export const getAllNews = () => getSortedNews();