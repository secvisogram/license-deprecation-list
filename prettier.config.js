/** @type {import('prettier').Config} */
export default {
  bracketSpacing: true,
  singleQuote: true,
  semi: false,
  endOfLine: process.platform === 'win32' ? 'auto' : 'lf',
}
