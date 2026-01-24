import { createContext, useContext } from "react";

export type Theme = "dark" | "light";

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Provide a default value for SSR contexts
const defaultThemeContext: ThemeContextType = {
    theme: "dark",
    toggleTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined,
);

/**
 * Hook to access theme and toggle function
 * Returns default values during SSR or if used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
    // Try-catch to handle cases where React context might be from a different React instance
    try {
        const context = useContext(ThemeContext);
        if (context === undefined) {
            // During SSR or outside provider, return defaults instead of throwing
            if (typeof window === 'undefined') {
                return defaultThemeContext;
            }
            // On client, still throw to catch misuse
            throw new Error("useTheme must be used within a ThemeProvider");
        }
        return context;
    } catch (error) {
        // If useContext fails (e.g., different React instance), return defaults
        if (typeof window === 'undefined') {
            return defaultThemeContext;
        }
        throw error;
    }
}
