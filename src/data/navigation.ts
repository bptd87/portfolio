/**
 * Navigation structure for the redesigned navbar
 * Defines tabs, nested pages, and article categories
 */

export type ArticleCategory = 'all' | 'design-philosophy' | 'scenic-design-process' | 'technology-tutorials' | 'experiential-design';

export interface NavItem {
  label: string;
  page: string;
  slug?: string;
}

export interface NavTabWithSubmenu extends NavItem {
  submenu: NavItem[];
}

export interface NavigationStructure {
  tabs: (NavItem | NavTabWithSubmenu)[];
  articleCategories: Array<{
    id: ArticleCategory;
    label: string;
    page: string;
  }>;
}

export const NAVIGATION: NavigationStructure = {
  tabs: [
    {
      label: 'HOME',
      page: 'home',
    },
    {
      label: 'PORTFOLIO',
      page: 'portfolio',
      submenu: [
        {
          label: 'Scenic Design',
          page: 'portfolio',
          slug: 'scenic',
        },
        {
          label: 'Experiential',
          page: 'portfolio',
          slug: 'experiential',
        },
        {
          label: 'Renderings',
          page: 'portfolio',
          slug: 'rendering',
        },
      ],
    },
    {
      label: 'STUDIO',
      page: 'scenic-studio',
      submenu: [
        {
          label: 'Scenic Studio',
          page: 'scenic-studio',
        },
        {
          label: 'Tutorials',
          page: 'scenic-studio',
          slug: 'tutorials',
        },
        {
          label: 'Guides',
          page: 'scenic-studio',
          slug: 'guides',
        },
      ],
    },
    {
      label: 'ARTICLES',
      page: 'articles',
      submenu: [
        {
          label: 'All Articles',
          page: 'articles',
          slug: 'all',
        },
        {
          label: 'Design Philosophy',
          page: 'articles',
          slug: 'design-philosophy',
        },
        {
          label: 'Scenic Design Process',
          page: 'articles',
          slug: 'scenic-design-process',
        },
        {
          label: 'Technology & Tutorials',
          page: 'articles',
          slug: 'technology-tutorials',
        },
        {
          label: 'Experiential Design',
          page: 'articles',
          slug: 'experiential-design',
        },
      ],
    },
    {
      label: 'ABOUT',
      page: 'about',
      submenu: [
        {
          label: 'Biography',
          page: 'about',
        },
        {
          label: 'Teaching Philosophy',
          page: 'teaching-philosophy',
        },
        {
          label: 'Collaborators',
          page: 'collaborators',
        },
        {
          label: 'CV/Resume',
          page: 'cv',
        },
      ],
    },
  ],

  articleCategories: [
    {
      id: 'all',
      label: 'All Articles',
      page: 'articles',
    },
    {
      id: 'design-philosophy',
      label: 'Design Philosophy',
      page: 'articles',
    },
    {
      id: 'scenic-design-process',
      label: 'Scenic Design Process',
      page: 'articles',
    },
    {
      id: 'technology-tutorials',
      label: 'Technology & Tutorials',
      page: 'articles',
    },
    {
      id: 'experiential-design',
      label: 'Experiential Design',
      page: 'articles',
    },
  ],
};

/**
 * Check if a nav item has submenu
 */
export function hasSubmenu(item: NavItem | NavTabWithSubmenu): item is NavTabWithSubmenu {
  return 'submenu' in item && Array.isArray(item.submenu);
}
