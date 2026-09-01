import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { format } from 'oxfmt'

import oxfmtConfig from '../oxfmt.config.ts'
import { readAboutcodeLicensesFromGit } from './aboutcode-importLicenses-git.ts'
import { readSpdxLicensesFromGit } from './spdx-importLicenses-git.ts'

async function main() {
  const today = new Date().toISOString().slice(0, 10)

  const aboutCode = await readAboutcodeLicensesFromGit()
  console.log()
  const spdx = await readSpdxLicensesFromGit()

  const licenses = [...aboutCode.licenses, ...spdx.licenses]
  const exceptions = [...aboutCode.exceptions, ...spdx.exceptions]

  await writeFormattedFile(
    resolve(fileURLToPath(new URL('.', import.meta.url)), '../lib/licenses.js'),
    `
      /**
       * Map of all licenses from spdx and aboutcode.
       *
       * Last verified: ${today}
       */

      export const licenses = new Map([
        ${licenses.map((id) => `[${JSON.stringify(id.license_key)}, ${JSON.stringify(id)}]`).join(',')}
      ]);
    `,
  )

  await writeFormattedFile(
    resolve(fileURLToPath(new URL('.', import.meta.url)), '../lib/exceptions.js'),
    `
      /**
       * Map of all exceptions from spdx and aboutcode.
       *
       * Last verified: ${today}
       */

      export const exceptions = new Map([
        ${exceptions.map((id) => `[${JSON.stringify(id.license_key)}, ${JSON.stringify(id)}]`).join(',')}
      ]);
    `,
  )
}

async function writeFormattedFile(outPath: string, content: string) {
  const formatted = await format(outPath, content, oxfmtConfig)

  if (formatted.errors.length) {
    throw new SyntaxError(formatted.errors.map((e) => e.message).join('\n'))
  }
  await writeFile(outPath, formatted.code, 'utf-8')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
