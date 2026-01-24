/** @type {import('tailwindcss').Config} */
// Force rebuild
export default {
    content: [
        './index.html',
        './src/App.tsx',
        './src/pages/**/*.{ts,tsx}',
        './src/components/**/*.{ts,tsx}',
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Ensure extended palette is available
                emerald: {
                  400: '#34d399',
                  500: '#10b981',
                },
                amber: {
                  400: '#fbbf24',
                  500: '#f59e0b',
                },
                pink: {
                  400: '#f472b6',
                },
                purple: {
                  400: '#c084fc',
                },
                blue: {
                  400: '#60a5fa',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                'studio-gold': {
                    DEFAULT: 'var(--studio-gold)',
                    foreground: 'var(--studio-gold-foreground)',
                },
                'forest-green': {
                    DEFAULT: 'var(--forest-green)',
                    foreground: 'var(--forest-green-foreground)',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                serif: ['var(--font-serif)', 'Georgia', 'serif'],
                display: ['Playfair Display', 'serif'],
                pixel: ['VT323', 'monospace'],
            },
        },
    },
    plugins: [],
}
