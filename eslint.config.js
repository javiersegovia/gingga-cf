// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
// @ts-expect-error "importPlugin" is not typed
import importPlugin from 'eslint-plugin-import'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    ignores: [
      'build/',
      'node_modules/',
      'worker-configuration.d.ts',
      '.wrangler',
      '.dev.vars',
      '.wrangler.toml',
      'public/',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  prettierRecommended,

  reactPlugin.configs.flat?.recommended,
  reactPlugin.configs.flat?.['jsx-runtime'],

  {
    plugins: {
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
    },
  },

  {
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
  },

  {
    rules: {
      'no-console': 'off',
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // enforces consistent type specifier style for named imports
      'import/consistent-type-specifier-style': 'error',
      // disallow non-import statements appearing before import statements
      'import/first': 'error',
      // Require a newline after the last import/require in a group
      'import/newline-after-import': 'error',
      // Forbid import of modules using absolute paths
      'import/no-absolute-path': 'error',
      // disallow AMD require/define
      'import/no-amd': 'error',

      // disallow imports from duplicate paths
      'import/no-duplicates': 'error',
      // Forbid the use of extraneous packages
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          peerDependencies: true,
          projectDependencies: false,
          optionalDependencies: true,
          packageDir: './',
        },
      ],
      // Forbid mutable exports
      'import/no-mutable-exports': 'error',
      // Prevent importing the default as if it were named
      'import/no-named-default': 'error',
      // Prohibit named exports
      'import/no-named-export': 'off', // we want everything to be a named export
      // Forbid a module from importing itself
      'import/no-self-import': 'error',

      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
]
