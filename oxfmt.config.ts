import { defineConfig } from 'oxfmt'

export default defineConfig({
  ignorePatterns: ['license-list-data', 'scancode-toolkit'],
  bracketSpacing: true,
  singleQuote: true,
  semi: false,
  sortImports: true,
  endOfLine: process.platform === 'win32' ? 'crlf' : 'lf',
})
