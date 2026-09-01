import assert from 'node:assert'
import { glob, readFile } from 'node:fs/promises'
import path, { resolve } from 'node:path'

import { git } from './git.ts'
import type { LicenseEntry } from './LicenseEntry.ts'
import { parse } from './licenseParser.js'

const LICENSES_PATH = 'src/licensedcode/data/licenses/'

/**
 * Build a Map from ScanCode version string → ISO date string by reading git
 * tags from the cloned repo.
 */
async function buildVersionDateMap(repoDir: string) {
  console.log('Building version → date map from git tags …')

  try {
    const tagOutput = await git(repoDir, ['tag', '-l'])
    const tags = tagOutput.split('\n').filter(Boolean)

    const map: Map<string, string> = new Map()

    for (const tag of tags) {
      try {
        const dateOutput = await git(repoDir, ['show', '-s', '--format=%ci', `${tag}^{}`])
        const match = dateOutput.match(/(\d{4}-\d{2}-\d{2})/)
        if (match && match[1]) {
          const date = match[1]
          const version = tag.replace(/^v/, '')
          map.set(version, date)
          map.set(`v${version}`, date)
        }
      } catch {
        // Ignore tags that don't have the expected format
      }
    }

    console.log(`  Found ${map.size / 2} tagged releases.`)
    return map
  } catch (error: any) {
    throw new Error(`Failed to build version map: ${error.message}`)
  }
}

/**
 * Given a deprecation commit date, find the earliest release tag whose date
 * is >= that date (i.e. the first release that shipped with the license
 * already deprecated).
 *
 * @param deprecatedDate  ISO date string (YYYY-MM-DD)
 * @param versionDateMap  version → date
 * @returns  version string like "v32.0", or "" if not found
 */
function findDeprecatedSince(deprecatedDate: string, versionDateMap: Map<string, string>): string {
  if (deprecatedDate) {
    // Collect unique entries (only "vX.Y" keys to avoid duplicates)
    const entries = []
    const seenVersions = new Set()
    for (const [key, date] of versionDateMap) {
      if (key.startsWith('v') && !seenVersions.has(key)) {
        entries.push({ version: key, date })
        seenVersions.add(key)
      }
    }

    // Sort by date ascending
    entries.sort((a, b) => a.date.localeCompare(b.date))

    // Find the first release on or after the deprecation commit date
    const found = entries.find((e) => e.date >= deprecatedDate)
    return found ? found.version : ''
  } else {
    return ''
  }
}

/**
 * Find the date when `is_deprecated: yes` was first added to a .LICENSE file
 * by scanning the git log for commits that introduced that string.
 *
 * @returns  ISO date string (YYYY-MM-DD) or empty string
 */
async function findDeprecationCommitDate(repoDir: string, licenseKey: string): Promise<string> {
  const filePath = `${LICENSES_PATH}${licenseKey}.LICENSE`

  try {
    const output = await git(repoDir, [
      'log',
      '--format=%ci',
      '-S',
      'is_deprecated: yes',
      '--',
      filePath,
    ])

    const lines = output
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length > 0) {
      // The oldest commit is the last line
      const oldest = lines[lines.length - 1]
      if (oldest) {
        const match = oldest.match(/^(\d{4}-\d{2}-\d{2})/)
        return match && match[1] ? match[1] : ''
      } else {
        return ''
      }
    } else {
      return ''
    }
  } catch {
    return ''
  }
}

export async function readAboutcodeLicensesFromGit() {
  const repoDir = path.resolve(import.meta.dirname, '../scancode-toolkit')
  const versionDateMap = await buildVersionDateMap(repoDir)

  const licenses: Array<LicenseEntry> = []
  const exceptions: Array<LicenseEntry> = []

  for await (const file of glob(
    resolve(import.meta.dirname, `../scancode-toolkit/${LICENSES_PATH}*.LICENSE`),
  )) {
    const txt = await readFile(file, 'utf-8')
    const frontMatter = parse(txt)
    assert('key' in frontMatter && typeof frontMatter.key === 'string')

    const key = frontMatter.key
    const isDeprecated =
      'is_deprecated' in frontMatter ? frontMatter.is_deprecated === 'yes' : false
    const isException = 'is_exception' in frontMatter ? frontMatter.is_exception === 'yes' : false

    let deprecatedDate: string | null = null
    let deprecatedSince: string | null = null
    if (isDeprecated) {
      deprecatedDate = await findDeprecationCommitDate(repoDir, key)
      deprecatedSince = findDeprecatedSince(deprecatedDate, versionDateMap)
    }

    const entry: LicenseEntry = {
      license_key: key,
      is_deprecated: isDeprecated,
      is_exception: isException,
      source: 'aboutCode',
      deprecated_since: deprecatedSince,
      deprecated_date: deprecatedDate,
    }

    if (isException) {
      exceptions.push(entry)
    } else {
      licenses.push(entry)
    }
  }

  const all = licenses.concat(exceptions)
  const deprecatedCount = all.filter((r) => r.is_deprecated).length
  const withDateCount = all.filter((r) => r.deprecated_date).length
  console.log(`\nRead ${all.length} entries from scancode`)
  console.log(`  - ${deprecatedCount} deprecated entries`)
  console.log(`  - ${withDateCount} deprecated entries with a resolved date`)

  return { licenses, exceptions }
}
