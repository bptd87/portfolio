// Centralized project data for Brandon PT Davis scenic design portfolio

// Import card images
import mdqCardImage from "../assets/2c1c79039cfd4381f506e8c95ec032cea353ba13.png";
import muchAdoCardImage from "../assets/4e3beab39841f6cce072c59b365308d5507baf12.png";

export interface Project {
  id: string;
  title: string;
  category:
    | "Scenic Design"
    | "Experiential Design"
    | "Rendering & Visualization"
    | "Design Documentation";
  subcategory: string; // Acts as tag: Musical Theatre, Comedy, Drama, Shakespeare, Opera, etc.
  venue: string;
  location: string;
  year: number;
  month?: number;
  cardImage?: string; // Will be imported in Portfolio.tsx
  image?: string; // Used in DB sync
  slug?: string;
  featured: boolean;
  description: string;

  // Extended fields for DB sync
  galleries?: any;
  tags?: string[];
  designNotes?: string[];
  youtubeVideos?: string[];
  likes?: number;
  views?: number;
  content?: any[];

  credits: {
    director?: string;
    scenicDesigner?: string;
    coDesigner?: string;
    costumeDesigner?: string;
    lightingDesigner?: string;
    soundDesigner?: string;
    projectionDesigner?: string;
    choreographer?: string;
    musicalDirector?: string;
    [key: string]: string | undefined;
  };
}

export const projects: Project[] = [
  {
    id: "million-dollar-quartet",
    title: "Million Dollar Quartet",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "South Coast Repertory",
    location: "Costa Mesa, CA",
    year: 2025,
    cardImage: mdqCardImage,
    featured: true,
    description:
      "Co-scenic design for the 2025 production of Million Dollar Quartet, featuring the legendary recording session of Elvis Presley, Johnny Cash, Jerry Lee Lewis, and Carl Perkins.",
    credits: {
      director: "James Moye",
      coDesigner: "Efren Delgadillo Jr",
      costumeDesigner: "Kish Finnegan",
      lightingDesigner: "Lonnie Rafael Alcaraz",
      soundDesigner: "Jeff Polunas",
    },
  },
  {
    id: "much-ado-about-nothing",
    title: "Much Ado About Nothing",
    category: "Scenic Design",
    subcategory: "Shakespeare",
    venue: "New Swan Shakespeare Festival",
    location: "Irvine, CA",
    year: 2025,
    cardImage: muchAdoCardImage,
    featured: true,
    description:
      "Scenic design for Shakespeare's romantic comedy set in the American Southwest, featuring live bluegrass music.",
    credits: {
      director: "Eli Simon",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Kathryn Poppen",
      lightingDesigner: "Karyn D. Lawrence",
      soundDesigner: "Aerik Harbert",
    },
  },
  {
    id: "alls-well-that-ends-well",
    title: "All's Well That Ends Well",
    category: "Scenic Design",
    subcategory: "Shakespeare",
    venue: "New Swan Shakespeare Festival",
    location: "Irvine, CA",
    year: 2025,
    featured: true,
    description:
      "Scenic design for Shakespeare's problem play, exploring themes of class, gender, and agency.",
    credits: {
      director: "Rob Salas",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Ayrika Johnson",
      lightingDesigner: "Nita Mendoza",
      soundDesigner: "Aerik Harbert",
    },
  },
  {
    id: "romero",
    title: "Romero",
    category: "Scenic Design",
    subcategory: "Drama",
    venue: "University of Missouri",
    location: "Columbia, MO",
    year: 2025,
    featured: true,
    description:
      "Scenic design for the world premiere exploring the life and martyrdom of Archbishop Óscar Romero.",
    credits: {
      director: "David Crespy",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Melissa Livingston",
      lightingDesigner: "Jake Bueermann",
      soundDesigner: "Michael Burke",
    },
  },
  {
    id: "guys-on-ice",
    title: "Guys on Ice",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "The Great American Melodrama",
    location: "Oceano, CA",
    year: 2025,
    featured: false,
    description:
      "Scenic design for the musical comedy about two Wisconsin fishermen on a frozen lake.",
    credits: {
      director: "Dan Klarer",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Katie Cohen",
      lightingDesigner: "Nathan Miklas",
      soundDesigner: "David Hernandez",
    },
  },
  {
    id: "urinetown",
    title: "Urinetown",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "University of Missouri",
    location: "Columbia, MO",
    year: 2024,
    featured: false,
    description:
      "Scenic design for the satirical musical comedy about a dystopian water shortage.",
    credits: {
      director: "Rachal Anne Germinario",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Hudson Waldrop",
      lightingDesigner: "Jake Bueermann",
      soundDesigner: "Michael Burke",
    },
  },
  {
    id: "barefoot-in-the-park",
    title: "Barefoot in the Park",
    category: "Scenic Design",
    subcategory: "Comedy",
    venue: "Okoboji Summer Theatre",
    location: "Okoboji, IA",
    year: 2024,
    featured: false,
    description:
      "Scenic design for Neil Simon's romantic comedy about newlyweds in a New York City walk-up.",
    credits: {
      director: "Alice Crist",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Kayla Slinger",
      lightingDesigner: "Mark W. Vial II",
      soundDesigner: "Allison Eversol",
    },
  },
  {
    id: "freaky-friday",
    title: "Freaky Friday",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "Okoboji Summer Theatre",
    location: "Okoboji, IA",
    year: 2024,
    featured: false,
    description:
      "Scenic design for the musical adaptation of the beloved body-swap story.",
    credits: {
      director: "Shannon King",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Kayla Slinger",
      lightingDesigner: "Mark W. Vial II",
      soundDesigner: "Allison Eversol",
    },
  },
  {
    id: "boeing-boeing",
    title: "Boeing, Boeing",
    category: "Scenic Design",
    subcategory: "Comedy",
    venue: "Stephens College",
    location: "Columbia, MO",
    year: 2023,
    featured: false,
    description:
      "Scenic design for Marc Camoletti's French farce about an American architect juggling three stewardess fiancées.",
    credits: {
      director: "Christopher Bowe",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Ningru Guo",
      lightingDesigner: "Vincente Williams",
      soundDesigner: "Michael Burke",
    },
  },
  {
    id: "head-over-heels",
    title: "Head Over Heels",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "Theatre SilCo",
    location: "Silverthorne, CO",
    year: 2022,
    featured: false,
    description:
      "Scenic design for the jukebox musical featuring the music of The Go-Go's.",
    credits: {
      director: "John Hemphill",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Cassie DeFile",
      lightingDesigner: "Fae Riemann-Royer",
      soundDesigner: "Cody Soper",
    },
  },
  {
    id: "the-merry-wives-of-windsor",
    title: "The Merry Wives of Windsor",
    category: "Scenic Design",
    subcategory: "Shakespeare",
    venue: "Stephens College",
    location: "Columbia, MO",
    year: 2022,
    featured: false,
    description:
      "Scenic design for Shakespeare's comedy set in Windsor, England.",
    credits: {
      director: "Timothy Fletcher",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Devin Stevenson",
      lightingDesigner: "Kenrick Fischer",
      soundDesigner: "Josh Walden",
    },
  },
  {
    id: "an-inspector-calls",
    title: "An Inspector Calls",
    category: "Scenic Design",
    subcategory: "Drama",
    venue: "Stephens College",
    location: "Columbia, MO",
    year: 2021,
    featured: false,
    description:
      "Scenic design for J.B. Priestley's moral thriller about class and responsibility.",
    credits: {
      director: "Lex Leigh",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Sara Rodriguez",
      lightingDesigner: "Garrett Gagnon",
    },
  },
  {
    id: "a-funny-thing-happened",
    title: "A Funny Thing Happened on the Way to the Forum",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "Theatre SilCo",
    location: "Silverthorne, CO",
    year: 2022,
    featured: false,
    description:
      "Scenic design for the Sondheim musical comedy set in ancient Rome.",
    credits: {
      director: "Jamey Grisham",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Emily Ehling",
      lightingDesigner: "Vincent Williams",
      soundDesigner: "Andy Hudson",
    },
  },
  {
    id: "tomas-and-the-library-lady",
    title: "Tomás and the Library Lady",
    category: "Scenic Design",
    subcategory: "Drama",
    venue: "Theatre SilCo",
    location: "Silverthorne, CO",
    year: 2021,
    featured: false,
    description:
      "Scenic design for the bilingual play celebrating the power of literacy and libraries.",
    credits: {
      director: "Jesús López Vargas",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Elizabeth Barrett",
      lightingDesigner: "Zachary Phelps",
    },
  },
  {
    id: "lysistrata",
    title: "Lysistrata",
    category: "Experiential Design",
    subcategory: "Outdoor Theatre",
    venue: "University of Texas El Paso",
    location: "El Paso, TX",
    year: 2021,
    cardImage:
      "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Lysistrata/Lyistrata%20Rendering%20-%20Vectorworks%20-%20Brandon%20PT%20Davis%20-%203.jpg",
    featured: false,
    description:
      "First live performance on campus during the pandemic, transforming a courtyard into a safe outdoor theatre with socially distanced audience pods.",
    credits: {
      director: "Jay Stratton",
      scenicDesigner: "Brandon PT Davis",
    },
  },
  {
    id: "park-and-shop",
    title: "Park & Shop",
    category: "Experiential Design",
    subcategory: "Commercial",
    venue: "Contra Costa Properties",
    location: "Concord, CA",
    year: 2021,
    cardImage:
      "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Park%20&%20Shop/Pak%20&%20Shop%20Rendering%20by%20Brandon%20PT%20Davis%20-%202.jpeg",
    featured: false,
    description:
      "Mid-century beautification initiative for a landmark retail center, celebrating heritage while reimagining future through concept renderings and visualization.",
    credits: {
      scenicDesigner: "Brandon PT Davis",
      collaborator: "Gretchen Ugalde",
      client: "Contra Costa Properties",
    },
  },
  {
    id: "southside-bethel-baptist-church",
    title: "Southside Bethel Baptist Church",
    category: "Experiential Design",
    subcategory: "Interior Design",
    venue: "Southside Bethel Baptist Church",
    location: "Los Angeles, CA",
    year: 2020,
    cardImage:
      "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/South%20Side%20Baptist%20Church/Southside%20Baptist%20Church%20-%20Vectorworks%20Rending%20by%20Brandon%20PT%20Davis%20-%204.jpeg",
    featured: false,
    description:
      "Rendering project reimagining a historic church sanctuary, balancing reverence and functionality while modernizing the space for contemporary worship in a converted vaudeville theatre.",
    credits: {
      scenicDesigner: "Brandon PT Davis",
      client: "Southside Bethel Baptist Church",
    },
  },
  {
    id: "new-swan-venue-file",
    title: "New Swan Venue File",
    category: "Rendering & Visualization",
    subcategory: "Venue Documentation",
    venue: "New Swan Shakespeare Festival",
    location: "Irvine, CA",
    year: 2024,
    cardImage:
      "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/New%20Swan%20Venue%20File/Rendering_New+Swan+Venue_1%20Large%20Large.jpeg",
    featured: false,
    description:
      "Complete Vectorworks venue file for the New Swan Theatre outdoor amphitheater.",
    credits: {
      scenicDesigner: "Brandon PT Davis",
    },
  },
  {
    id: "the-penelopiad",
    title: "The Penelopiad",
    category: "Scenic Design",
    subcategory: "Drama",
    venue: "University of California Irvine",
    location: "Irvine, CA",
    year: 2020,
    featured: false,
    description:
      "Scenic design for Margaret Atwood's retelling of The Odyssey from Penelope's perspective.",
    credits: {
      director: "Luke Shepherd",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Matthew Eckstein",
      lightingDesigner: "Sarah Monaghan",
      soundDesigner: "Emily Swenson",
    },
  },
  {
    id: "scenic-models",
    title: "Scenic Models",
    category: "Design Documentation",
    subcategory: "Models",
    venue: "Various",
    location: "Various",
    year: 2024,
    featured: false,
    description:
      "Collection of scale scenic models from various productions showcasing the design development process.",
    credits: {
      scenicDesigner: "Brandon PT Davis",
    },
  },
  {
    id: "company",
    title: "Company",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "University of California Irvine",
    location: "Irvine, CA",
    year: 2020,
    featured: false,
    description:
      "Scenic design for Sondheim's musical about marriage and relationships in New York City.",
    credits: {
      director: "Ezra Anisman",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Joy Powell",
      lightingDesigner: "Noel Nichols",
      soundDesigner: "Jordan Tani",
    },
  },
  {
    id: "the-pajama-game",
    title: "The Pajama Game",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "University of California Irvine",
    location: "Irvine, CA",
    year: 2019,
    featured: false,
    description:
      "Scenic design for the 1950s musical comedy about labor relations and romance.",
    credits: {
      director: "Michael Webb",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Lil Lamberta",
      lightingDesigner: "Ashley Harrison",
      soundDesigner: "Brett Olson",
    },
  },
  {
    id: "parliament-square",
    title: "Parliament Square",
    category: "Scenic Design",
    subcategory: "Drama",
    venue: "University of California Irvine",
    location: "Irvine, CA",
    year: 2019,
    featured: false,
    description:
      "Scenic design for the California premiere about peace activist Brian Haw.",
    credits: {
      director: "Willey DeWeese",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Lennox Emery",
      lightingDesigner: "Lamby Hedge",
    },
  },
  {
    id: "american-idiot",
    title: "American Idiot",
    category: "Scenic Design",
    subcategory: "Musical Theatre",
    venue: "University of California Irvine",
    location: "Irvine, CA",
    year: 2018,
    featured: false,
    description: "Scenic design for the Green Day rock musical.",
    credits: {
      director: "Joseph Seevers",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Jacob P. Brinkman",
      lightingDesigner: "Rachel Leigh Dolan",
      soundDesigner: "Audra Sergel",
    },
  },
  {
    id: "red-line-cafe",
    title: "Red Line Café",
    category: "Experiential Design",
    subcategory: "Case Study",
    venue: "Independent Project",
    location: "Chicago-Inspired Concept",
    year: 2018,
    cardImage:
      "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/Red%20Line%20Cafe/Red%20Line%20Cafe%20-%20Rendering%20in%20Vectorworks%20by%20Brandon%20PT%20Davis%20-%201.jpeg",
    featured: true,
    description:
      "Chicago-inspired café concept blending transit culture, architectural grit, and civic identity into a cohesive hospitality experience celebrating the city's character.",
    credits: {
      designer: "Brandon PT Davis",
    },
  },
  {
    id: "angel-street",
    title: "Angel Street",
    category: "Scenic Design",
    subcategory: "Drama",
    venue: "Stephens College",
    location: "Columbia, MO",
    year: 2012,
    featured: false,
    description:
      "Scenic design for Patrick Hamilton's Victorian thriller (also known as Gaslight).",
    credits: {
      director: "Kim Martin-Cotten",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Mark Vital",
    },
  },
  {
    id: "all-my-sons",
    title: "All My Sons",
    category: "Scenic Design",
    subcategory: "Drama",
    venue: "Stephens College",
    location: "Columbia, MO",
    year: 2010,
    featured: false,
    cardImage:
      "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/All%20My%20Sons/All%20My%20Sons_4.jpg",
    description:
      'For All My Sons, I built a scenic world that embodies the idealized postwar "American Dream": a charming home with a wide porch and a neat, expansive backyard—a warm, welcoming environment that feels safe, comfortable, and complete.',
    credits: {
      writer: "Arthur Miller",
      director: "Lamby Hedge",
      scenicDesigner: "Brandon PT Davis",
      costumeDesigner: "Kate Wood",
      lightingDesigner: "Emily Swenson",
      soundDesigner: "Michael Burke",
    },
  },
  {
    id: "scenic-design-archive",
    title: "Scenic Design Archive",
    category: "Design Documentation",
    subcategory: "Archive",
    venue: "Various",
    location: "Various",
    year: 2024,
    featured: false,
    description:
      "Archive of production photos from various scenic designs throughout my career, highlighting shows that shaped my artistic journey.",
    credits: {
      scenicDesigner: "Brandon PT Davis",
    },
  },
];

// Helper functions with memoization for performance
let _featuredCache: Project[] | null = null;
const _recentCache: Map<number, Project[]> = new Map();

export const getFeaturedProjects = () => {
  if (!_featuredCache) {
    _featuredCache = projects.filter((p) => p.featured);
  }
  return _featuredCache;
};

export const getProjectsByCategory = (category: Project["category"]) =>
  projects.filter((p) => p.category === category);

export const getProjectById = (id: string) => projects.find((p) => p.id === id);

export const getProjectsByYear = (year: number) =>
  projects.filter((p) => p.year === year);

export const getRecentProjects = (count: number = 3) => {
  if (!_recentCache.has(count)) {
    _recentCache.set(
      count,
      [...projects].sort((a, b) => b.year - a.year).slice(0, count),
    );
  }
  return _recentCache.get(count)!;
};

// Get all unique subcategories for a given category
export const getSubcategoriesForCategory = (category: Project["category"]) => {
  const subcategories = projects
    .filter((p) => p.category === category)
    .map((p) => p.subcategory);
  return Array.from(new Set(subcategories)).sort();
};

// Get previous and next projects in the same category, sorted by year (descending)
export const getAdjacentProjects = (currentId: string) => {
  const currentProject = getProjectById(currentId);
  if (!currentProject) return { previous: null, next: null };

  // Filter by same category and sort by year (descending), then by title for consistency
  const sameCategoryProjects = projects
    .filter((p) => p.category === currentProject.category)
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return a.title.localeCompare(b.title);
    });

  const currentIndex = sameCategoryProjects.findIndex((p) =>
    p.id === currentId
  );

  return {
    previous: currentIndex > 0 ? sameCategoryProjects[currentIndex - 1] : null,
    next: currentIndex < sameCategoryProjects.length - 1
      ? sameCategoryProjects[currentIndex + 1]
      : null,
  };
};
