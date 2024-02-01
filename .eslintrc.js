module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'simple-import-sort', 'unused-imports'],
  rules: {
    'react/prop-types': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          // Packages. `react` related packages come first.
          ['^react', '^@?\\w'],
          // Side effect imports.
          ['^\\u0000'],
          // Internal packages.
          ['^(@\\/)(.*|$)', '^(@images)(.*|$)'],
          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
        ],
      },
    ],
    'no-unused-vars': 'warn'
  },
  globals: {
    process: 'readonly',
  },
};
