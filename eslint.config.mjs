import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
// astro-eslint-parser 3.x 起只提供具名导出（parseForESLint 等），作为解析器对象整体引入
import * as astroParser from 'astro-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', '.astro/**', '.wrangler/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['astro.config.mjs', 'tests/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
    },
  },
  {
    files: ['src/**/*.astro'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
