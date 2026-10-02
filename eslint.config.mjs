import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // three.js/R3F refs are heavily narrowed callbacks — trust the pattern
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];

export default eslintConfig;
