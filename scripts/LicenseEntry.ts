export type LicenseEntry = {
  license_key: string
  is_deprecated: boolean
  is_exception: boolean
  source: 'aboutCode' | 'spdx'
  deprecated_since: string | null
  deprecated_date: string | null
}
