import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.expo/', '*.config.js', '*.config.mjs'],
  },
  {
    files: ['.detoxrc.js', 'e2e/**/*.js', 'modules/screen-time/plugin/withScreenTime.js'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/constants/appIcons.ts', 'modules/screen-time/index.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/components/ui/Button.tsx', 'src/components/ui/SelectionCard.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
  {
    files: ['src/components/urge-surfing/IntensitySlider.tsx'],
    rules: {
      'react-hooks/refs': 'off',
    },
  }
);
