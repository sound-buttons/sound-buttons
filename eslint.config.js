// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['projects/**/*', 'proxy.conf.mjs'],
  },
  {
    // Preserve the pre-flat-config behaviour: the legacy .eslintrc setup did not
    // report unused eslint-disable directives, whereas ESLint 9+ enables this by
    // default. Keep it off so the existing (dormant) directives stay no-ops.
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'app',
          style: 'kebab-case',
          type: 'element',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'app',
          style: 'camelCase',
          type: 'attribute',
        },
      ],
      '@angular-eslint/no-empty-lifecycle-method': ['off'],
      '@angular-eslint/prefer-standalone': ['off'],
      '@angular-eslint/prefer-inject': ['off'],
      // Angular 22 defaults new components to OnPush; this zone.js-based app
      // deliberately keeps the pre-v22 default (Eager) behaviour, so the
      // explicit `ChangeDetectionStrategy.Eager` entries must stay lint-clean.
      '@angular-eslint/prefer-on-push-component-change-detection': ['off'],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, prettier],
    rules: {},
  }
);
