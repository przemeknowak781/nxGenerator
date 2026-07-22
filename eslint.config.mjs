import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/out-tsc',
      '**/test-output',
    ],
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      // The architectural backbone of the ecosystem: which layer/scope may
      // depend on which. Violations fail `nx lint`, so a new configurator
      // physically cannot reach into another product's code, and shared libs
      // cannot accidentally depend on a specific product.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          // Libraries are consumed as source (bundler resolution via package
          // exports), so the buildable-only restriction does not apply here.
          enforceBuildableLibDependency: false,
          // Allow the shared shell stylesheet secondary entry point.
          allow: ['@nxgen/ui-kit/styles.css'],
          depConstraints: [
            // --- Layer constraints (type:*) ---
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:util',
                'type:domain',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:util',
                'type:domain',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:domain'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util', 'type:domain'],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain'],
            },
            { sourceTag: 'type:plugin', onlyDependOnLibsWithTags: ['*'] },

            // --- Scope constraints (scope:*) ---
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:stair',
              onlyDependOnLibsWithTags: ['scope:stair', 'scope:shared'],
            },
            {
              sourceTag: 'scope:planter',
              onlyDependOnLibsWithTags: ['scope:planter', 'scope:shared'],
            },
            { sourceTag: 'scope:tooling', onlyDependOnLibsWithTags: ['*'] },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Local pragmatics: three.js math and geometry code favours short names.
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
