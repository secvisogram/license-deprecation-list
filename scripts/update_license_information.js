import { read_aboutcode_licenses_from_git } from './aboutcode-importLicenses-git.js'
import { read_spdx_licenses_from_git } from './spdx-importLicenses-git.js'
import { format, resolveConfig } from 'prettier'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @typedef {import('./aboutcode-importLicenses-git.js').LicenseEntry} LicenseEntry */

async function main() {
  const today = new Date().toISOString().slice(0, 10)

  /** @type {Array<LicenseEntry>} */
  const licenses = [
    ...(await read_spdx_licenses_from_git()),
    ...(await read_aboutcode_licenses_from_git()),
  ]

  /** @type {string} */
  const licenseEntries = licenses
    .map((id) => `    ${JSON.stringify(id)}`)
    .join(',\n')

  /** @type {string} */
  const content = `\
/**
 * Array of all licenses from spdx and aboutcode.
 *
 * Last verified: ${today}
 *
 */
 
 /**
 * @typedef {Object} LicenseInfo
 * @property {string} license_key
 * @property {boolean} is_deprecated
 * @property {boolean} is_exception
 * @property {'aboutCode' | 'spdx'} source
 * @property {string} deprecated_since
 * @property {string} deprecated_date
 */

/** @type {Array<LicenseInfo>} */
// @ts-ignore
export const licenses = [
${licenseEntries}
];
`

  const outPath = resolve(
    fileURLToPath(new URL('.', import.meta.url)),
    '../lib/license_information.js',
  )

  const formatted = await format(content, {
    ...(await resolveConfig(outPath)),
    filepath: outPath,
  })

  await writeFile(outPath, formatted, 'utf-8')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
