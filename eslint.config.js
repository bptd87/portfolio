
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
    { ignores: ['dist', 'src/supabase/**', 'v2-next/**', '.next/**', 'build/**'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'react-hooks/preserve-manual-memoization': 'off', // Disabled for now as it flags valid useMemo usage
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-unused-vars': 'off',
            'prefer-const': 'warn',
            '@typescript-eslint/ban-ts-comment': 'off',
            // Disable strict rules causing noise
            'no-case-declarations': 'off',
            'no-empty': 'off',
            'no-useless-escape': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-hooks/rules-of-hooks': 'off',
            'react-hooks/set-state-in-effect': 'off', // Explicitly disable this
            'react-hooks/immutability': 'off', // Disable for React 19/Hooks 7.x strictness
            'react-hooks/purity': 'off', // Disable strictly pure rendering checks (Math.random etc)
            // 'react/no-unescaped-entities': 'off',
            // 'react/display-name': 'off',
            // 'react/prop-types': 'off',
        },
    },
);
