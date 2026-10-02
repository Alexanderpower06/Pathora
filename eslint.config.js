import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'data/**', 'frontend/assets/**'] },
  js.configs.recommended,
  { files: ['frontend/**/*.js'], languageOptions: { globals: globals.browser } },
  {
    files: ['backend/**/*.js', 'scripts/**/*.js', 'e2e/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  { files: ['e2e/**/*.js'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
