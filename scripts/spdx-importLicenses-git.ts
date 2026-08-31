import { readFile } from 'node:fs/promises'
import path from 'node:path'

import exceptionsData from '../license-list-data/json/exceptions.json' with { type: 'json' }
import licensesData from '../license-list-data/json/licenses.json' with { type: 'json' }
import { git } from './git.ts'
import type { LicenseEntry } from './LicenseEntry.ts'

/**
 * Build a Map from SPDX list version string (e.g. "3.21") → ISO date string
 * (e.g. "2024-02-08") by reading git tags from the cloned repo.
 *
 * Tag format used by spdx/license-list-data is typically "v3.21".
 * We need to fetch all tags (they were included in the clone step via --tags).
 */
async function buildVersionDateMap(repoDir: string) {
  console.log('Building version → date map from git tags …')

  try {
    const tagOutput = await git(repoDir, ['tag', '-l'])
    const tags = tagOutput.split('\n').filter(Boolean)

    const map: Map<string, string> = new Map()

    for (const tag of tags) {
      // Get the date the tag points to (for annotated tags use dereferenced object)
      try {
        const dateOutput = await git(repoDir, ['show', '-s', '--format=%ci', `${tag}^{}`])
        // %ci format: "YYYY-MM-DD HH:MM:SS +ZZZZ" – extract just the date part
        const match = dateOutput.match(/(\d{4}-\d{2}-\d{2})/)
        if (match) {
          const date = match[1]
          // Normalize: strip leading "v"
          if (date) {
            const version = tag.replace(/^v/, '')
            map.set(version, date)
            map.set(`v${version}`, date)
          }
        }
      } catch {
        // skip tags that cannot be resolved
      }
    }

    console.log(`  Found ${map.size / 2} tagged releases.`)
    return map
  } catch (error: any) {
    throw new Error(`Failed to build version map: ${error.message}`)
  }
}

async function processLicenses(
  licenses: (typeof licensesData)['licenses'] | (typeof exceptionsData)['exceptions'],
  repoDir: string,
  versionDateMap: Map<string, string>,
  isException: boolean,
) {
  const results: Array<LicenseEntry> = []
  for (const license of licenses) {
    let deprecatedSince: string | null = null
    let deprecatedDate: string | null = null

    if (license.isDeprecatedLicenseId) {
      const detailsPath = isException ? 'exceptions' : 'details'
      // The detailsUrl looks like "https://spdx.org/licenses/GPL-2.0.json"
      // Map it to the local path:  json/details/GPL-2.0.json
      const filename = license.detailsUrl.split('/').pop() // e.g. "GPL-2.0.json"
      const detailPath = path.join(repoDir, 'json', detailsPath, filename ?? '')

      let deprecatedVersion: string | null = null
      try {
        const detail = (await JSON.parse(await readFile(detailPath, 'utf-8'))) as {
          deprecatedVersion?: string
        }
        deprecatedVersion = detail.deprecatedVersion ?? null
      } catch {
        throw new Error(`Failed to read JSON file: ${detailPath}`)
      }

      if (deprecatedVersion) {
        // Strip leading "< " (old format like "< v2.4")
        const key = deprecatedVersion.replace(/^<\s*/, '').trim()
        deprecatedSince = `v${key.replace(/^v/, '')}`
        deprecatedDate = versionDateMap.get(key) ?? versionDateMap.get(`v${key}`) ?? ''
      }
    }

    results.push({
      license_key: 'licenseId' in license ? license.licenseId : license.licenseExceptionId,
      is_deprecated: license.isDeprecatedLicenseId,
      source: 'spdx',
      is_exception: isException,
      deprecated_since: deprecatedSince,
      deprecated_date: deprecatedDate,
    })
  }
  return results
}

export async function readSpdxLicensesFromGit() {
  const repoDir = path.resolve(import.meta.dirname, `../license-list-data`)

  console.log('Reading licenses.json and exceptions.json …')

  const versionDateMap = await buildVersionDateMap(repoDir)

  console.log(`Processing ${licensesData.licenses.length} licenses …`)
  const licenses = await processLicenses(licensesData.licenses, repoDir, versionDateMap, false)

  // Process exceptions
  console.log(`Processing ${exceptionsData.exceptions.length} exceptions …`)
  const exceptions: Array<LicenseEntry> = await processLicenses(
    exceptionsData.exceptions,
    repoDir,
    versionDateMap,
    true,
  )

  const results = licenses.concat(exceptions)

  const deprecatedCount = results.filter((r) => r.is_deprecated).length
  const withDateCount = results.filter((r) => r.deprecated_date).length
  console.log(`\nDone! Read ${results.length} entries from spdx`)
  console.log(`  - ${deprecatedCount} deprecated entries`)
  console.log(`  - ${withDateCount} deprecated entries with a resolved date`)

  return { licenses, exceptions }
}
