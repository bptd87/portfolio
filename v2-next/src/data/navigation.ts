/**
 * Navigation structure for the redesigned navbar
 * Defines tabs, nested pages, and article categories
 */

export type ArticleCategory =
  | "all"
  | "design-philosophy"
  | "scenic-design-process"
  | "technology-tutorials"
  | "experiential-design";

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
      label: "PORTFOLIO",
      page: "portfolio",
      slug: "scenic-design", // Default to Scenic Design
      submenu: [
        {
          label: "Scenic Design",
          page: "portfolio",
          slug: "scenic-design",
        },
        {
          label: "Experiential Design",
          page: "experiential-design",
        },
        {
          label: "Renderings",
          page: "rendering",
        },
        {
          label: "Scenic Models",
          page: "scenic-models",
        },
      ],
    },
    {
      label: "NEWS",
      page: "news",
    },
    {
      label: "ABOUT",
      page: "about",
      submenu: [
        {
          label: "Biography",
          page: "about",
          slug: "biography",
        },
        {
          label: "Creative Statement",
          page: "creative-statement",
        },
        {
          label: "Teaching Philosophy",
          page: "teaching-philosophy",
        },
        {
          label: "Collaborators",
          page: "collaborators",
        },
        {
          label: "CV / Resume",
          page: "cv",
        },
        {
          label: "Contact",
          page: "contact",
        },
      ],
    },
    {
      label: "ARTICLES",
      page: "articles",
      submenu: [
        {
          label: "Design Philosophy",
          page: "articles",
          slug: "design-philosophy",
        },
        {
          label: "Scenic Design Process",
          page: "articles",
          slug: "scenic-design-process",
        },
        {
          label: "Technology & Tutorials",
          page: "articles",
          slug: "technology-tutorials",
        },
        {
          label: "Experiential Design",
          page: "articles",
          slug: "experiential-design",
        },
      ],
    },
    {
      label: "STUDIO",
      page: "studio",
      submenu: [
        {
          label: "Tutorials",
          page: "scenic-studio",
        },
        {
          label: "App Studio",
          page: "app-studio",
          slug: "app-studio",
        },
        {
          label: "Vault",
          page: "scenic-vault",
        },
        {
          label: "Scenic Directory",
          page: "directory",
          slug: "directory",
        },
      ],
    },
  ],

  articleCategories: [
    {
      id: "all",
      label: "All Articles",
      page: "articles",
    },
    {
      id: "design-philosophy",
      label: "Design Philosophy",
      page: "articles",
    },
    {
      id: "scenic-design-process",
      label: "Scenic Design Process",
      page: "articles",
    },
    {
      id: "technology-tutorials",
      label: "Technology & Tutorials",
      page: "articles",
    },
    {
      id: "experiential-design",
      label: "Experiential Design",
      page: "articles",
    },
  ],
};

/**
 * Check if a nav item has submenu
 */
export function hasSubmenu(
  item: NavItem | NavTabWithSubmenu,
): item is NavTabWithSubmenu {
  return "submenu" in item && Array.isArray(item.submenu);
}
